# Ota Ticketing

A small event-ticketing system: users browse upcoming events, book 1–4 tickets, get a QR code per ticket, and staff scan the QR code to check the ticket in.
It has an Express + Prisma API on MySQL and an Expo (React Native) app styled after the Ota Life app.

**Stack:** Node.js 22, Express 5, TypeScript (strict), Prisma 7 (MariaDB driver adapter), MySQL 8, zod, Jest + supertest · Expo SDK 58, Expo Router, expo-camera, react-native-qrcode-svg, i18next.

## Prerequisites

- Node.js 22 LTS (`node -v`)
- Docker with Docker Compose
- An iPhone with **Expo Go for SDK 58** (from the App Store), on the same Wi-Fi as your computer

## Setup

```bash
# 1. Database (MySQL 8 on port 3306; also creates the `ota_test` database for tests)
docker compose up -d

# 2. API
cd api
cp .env.example .env
npm install            # also runs `prisma generate`
npm run db:migrate     # applies the committed migrations
npm run db:seed        # clears and reseeds; safe to run again
npm run dev            # http://localhost:3000

# 3. App (in a second terminal)
cd app
cp .env.example .env
hostname -I            # take the first address, e.g. 192.168.1.23
# edit .env:  EXPO_PUBLIC_API_URL=http://192.168.1.23:3000
npm install
npx expo start
```

Scan the QR code shown in the terminal with the iPhone camera. It opens in Expo Go. When iOS asks, allow **Local Network** access for Expo Go, or the app can't reach the API.

## Seed data

| User id | Name  |
| ------- | ----- |
| 1       | Aiko  |
| 2       | Kenji |
| 3       | Rohit |

Four upcoming events are created with dates relative to now. **Event 3, "Ōta TOKYO Idol Live", has exactly 2 tickets left.** Prices are in yen.

In the app, tap the avatar (top right) to switch between users.

## API

Every endpoint except `GET /health` needs an `X-User-Id` header with a seeded user id.

| Endpoint                | Body                | Success                                       |
| ----------------------- | ------------------- | --------------------------------------------- |
| `GET /events`           |                     | 200, upcoming events sorted by date           |
| `POST /events/:id/book` | `{ "quantity": 1 }` | 201, the created tickets (1–4)                |
| `GET /me/tickets`       |                     | 200, the user's tickets with event, newest first |
| `POST /checkins`        | `{ "code": "..." }` | 200, the checked-in ticket with its event     |

Errors always look like `{ "error": { "code": "SOLD_OUT", "message": "...", ...extra } }`:
400 validation or malformed JSON, 401 missing/unknown user, 404 event/ticket/route not found,
409 `SOLD_OUT` (with `ticketsLeft`), `EVENT_STARTED`, or `ALREADY_CHECKED_IN` (with the original `checkedInAt`), 500 anything else.

```bash
# List events
curl -s localhost:3000/events -H "X-User-Id: 1"

# Book 2 tickets for event 3 (the one with 2 left)
curl -s -X POST localhost:3000/events/3/book -H "X-User-Id: 1" -H "Content-Type: application/json" -d '{"quantity": 2}'

# Book again: 409 SOLD_OUT
curl -s -X POST localhost:3000/events/3/book -H "X-User-Id: 2" -H "Content-Type: application/json" -d '{"quantity": 1}'
# {"error":{"code":"SOLD_OUT","message":"Sold out","ticketsLeft":0}}

# My tickets
curl -s localhost:3000/me/tickets -H "X-User-Id: 1"

# Check in a ticket (use a code from the response above), then again: 409 ALREADY_CHECKED_IN
curl -s -X POST localhost:3000/checkins -H "X-User-Id: 2" -H "Content-Type: application/json" -d '{"code": "ABCDE12345"}'
curl -s -X POST localhost:3000/checkins -H "X-User-Id: 2" -H "Content-Type: application/json" -d '{"code": "ABCDE12345"}'
# {"error":{"code":"ALREADY_CHECKED_IN","message":"...","checkedInAt":"2026-10-30T05:51:28.715Z"}}
```

Quick manual race test (reseed first): three bookings at once for the last 2 tickets. Exactly two get `201`.

```bash
npm run db:seed --prefix api
for user in 1 2 3; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/events/3/book \
    -H "X-User-Id: $user" -H "Content-Type: application/json" -d '{"quantity": 1}' &
done; wait
```

## How overselling is prevented

Each booking does one conditional update, `UPDATE Event SET ticketsLeft = ticketsLeft - n WHERE id = ? AND ticketsLeft >= n`, instead of reading the stock first and then writing it.
MySQL locks the event row during that update, so simultaneous bookings take turns and each one re-checks the stock. If no row changes, the request gets a 409.
The tickets are created in the same transaction, so they are saved together with the stock change or not at all ([`booking.ts`](api/src/services/booking.ts)).

## How double check-in is prevented

Check-in is one conditional update: `UPDATE Ticket SET checkedInAt = now WHERE code = ? AND checkedInAt IS NULL`. Only one scan can match an unused ticket. Any later scan updates nothing and gets a 409 with the original `checkedInAt`.

## Running tests

```bash
docker compose up -d
cd api && npm test
```

Tests use a separate database, `ota_test`, in the same MySQL container (configured in [`api/.env.test`](api/.env.test)). Jest applies the migrations to it before running, and each test reseeds it. They cover:

- 10 concurrent single-ticket bookings for the event with 2 left: exactly 2 × 201 and 8 × 409, `ticketsLeft` ends at 0, 2 tickets in the DB
- check-in once (200), then again (409 with the same `checkedInAt`), plus unknown code (404)
- validation: quantity 0, 5 or 1.5, unknown event, missing or unknown `X-User-Id`

## Project structure

```
ota-ticketing/
├── docker-compose.yml        MySQL 8 + named volume + healthcheck
├── api/
│   ├── prisma/               schema, migrations, idempotent seed
│   ├── prisma7.config.ts     Prisma 7 config (datasource URL, seed command)
│   ├── src/
│   │   ├── app.ts            Express app (exported for tests)
│   │   ├── server.ts         listen()
│   │   ├── db.ts             PrismaClient with the MariaDB adapter
│   │   ├── errors.ts         HttpError + JSON error handler
│   │   ├── middleware/       X-User-Id → req.userId
│   │   ├── routes/           thin: validate, call service, respond
│   │   └── services/         booking and check-in rules
│   └── tests/
└── app/
    └── src/
        ├── app/              screens: events (index), tickets, scan + tab layout
        ├── components/       cards, header, scanner result, etc.
        ├── locales/          en.json, ja.json
        ├── api.ts            typed API client
        ├── theme.ts          colours, spacing, radii
        └── i18n.ts, format.ts, use-request.ts, user-context.tsx
```

## Decisions and trade-offs

- **No real auth, on purpose.** The `X-User-Id` header stands in for a session, and the API only checks that the user exists. Check-in is a staff action, so any valid user can check in any ticket. In production these would be real sessions and a staff role.
- **Integer money.** `price` is stored in the smallest currency unit (yen have no minor unit) with a `currency` column, never as a float. The app formats it with `Intl.NumberFormat`.
- **Random ticket codes.** 10 characters from Crockford base32 (no I/L/O/U), generated with `crypto.randomInt`, so codes can't be guessed. A unique index guarantees there are no duplicates.
- **Started events can't be booked.** Booking one returns 409 `EVENT_STARTED`. The request was valid, but the event's state no longer allows booking.
- **CommonJS API.** The Prisma client is generated as CommonJS so Jest (ts-jest) runs without ESM setup.
- **App error messages.** Known API error codes are translated (EN/JA). Any other error shows the server's message.
- **Seeded users are hard-coded in the app** ([`app/src/users.ts`](app/src/users.ts)) for the user switcher, since there is no users endpoint.
