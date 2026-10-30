# Ota Ticketing

Browse upcoming Ōta TOKYO events, book 1–4 tickets, and show each ticket as a QR code.
Staff scan the QR code at the gate to check the ticket in, once.

**Stack:** Express · Prisma 7 · MySQL 8 · TypeScript · Expo SDK 58 (React Native)

## Requirements

- Node.js 22, Docker
- Expo Go (SDK 58) on an iPhone or Android phone, on the same Wi-Fi as your computer

## Run it

```bash
git clone https://github.com/Rohitpr05/ota-ticketing.git
cd ota-ticketing
docker compose up -d
```

**Terminal 1: API**

```bash
cd api
cp .env.example .env
npm install
npm run setup      # creates the tables and seed data
npm run dev        # http://localhost:3000
```

**Terminal 2: app**

```bash
cd app
npm install
# point the app at your computer's local IP (phone and computer must be on the same Wi-Fi)
echo "EXPO_PUBLIC_API_URL=http://$(hostname -I | awk '{print $1}'):3000" > .env   # Linux
# echo "EXPO_PUBLIC_API_URL=http://$(ipconfig getifaddr en0):3000" > .env        # macOS
npx expo start
```

Scan the QR code in the terminal with the iPhone Camera, or from inside Expo Go on Android. On iOS, allow **Local Network** access when asked.

## Try it

1. **Events:** "Ōta TOKYO Idol Live" has 2 tickets left. Book 2 and it shows _Sold out_.
2. **My Tickets:** each ticket is a QR code.
3. **Scan:** open a ticket's QR on another screen (for example, screenshot it and open it on your computer), then scan it. The first scan checks it in. A second scan shows _Already checked in_ with the original time.
4. Tap the avatar to switch between the 3 seeded users, and **EN / 日本語** to switch language.

**Start over:** `cd api && npm run db:seed`, then pull down to refresh in the app.

## API

All requests need an `X-User-Id` header (seeded users: 1, 2, 3).

```bash
curl localhost:3000/events -H "X-User-Id: 1"
curl -X POST localhost:3000/events/3/book -H "X-User-Id: 1" -H "Content-Type: application/json" -d '{"quantity": 2}'
curl localhost:3000/me/tickets -H "X-User-Id: 1"
curl -X POST localhost:3000/checkins -H "X-User-Id: 1" -H "Content-Type: application/json" -d '{"code": "<code from /me/tickets>"}'
```

Race for the last 2 tickets of event 3 (run from `api/`). Exactly two requests print `201`, the third `409`:

```bash
npm run db:seed
for user in 1 2 3; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/events/3/book \
    -H "X-User-Id: $user" -H "Content-Type: application/json" -d '{"quantity": 1}' &
done; wait
```

Errors look like `{ "error": { "code": "SOLD_OUT", "message": "..." } }`: 400 invalid input, 401 missing or unknown user, 404 not found, 409 sold out or already checked in.

## How overselling is prevented

Booking runs one conditional `UPDATE Event SET ticketsLeft = ticketsLeft - n WHERE id = ? AND ticketsLeft >= n` inside a transaction with the ticket inserts.
MySQL locks the row, so concurrent bookings queue up and re-check the stock. If 0 rows are updated, the request gets a 409 ([`booking.ts`](api/src/services/booking.ts)).

Double check-in is prevented the same way: `UPDATE ... WHERE code = ? AND checkedInAt IS NULL`. Any later scan gets a 409 with the first check-in time.

## Tests

```bash
cd api && npm test
```

The tests use a separate `ota_test` database in the same container. They cover 10 concurrent bookings for 2 tickets (exactly 2 succeed), double check-in and input validation.

## Notes

- `X-User-Id` instead of real auth, on purpose. Any user can check a ticket in, standing in for gate staff.
- Prices are stored as integers in the smallest currency unit (yen), never as floats.
- Ticket codes are 10 random characters from `crypto`, kept unique by a database index.
- If the app can't reach the API: check that the phone and computer are on the same Wi-Fi, re-run the `echo ... > .env` line, and restart with `npx expo start -c`.
