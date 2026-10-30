import { prisma } from "../src/db";

const DAY_MS = 24 * 60 * 60 * 1000;

const TOKYO_UTC_OFFSET_HOURS = 9;

// Dates are relative to now so the events are always upcoming, whenever the seed runs.
function daysFromNow(days: number, tokyoHour: number): Date {
  const date = new Date(Date.now() + days * DAY_MS);
  date.setUTCHours(tokyoHour - TOKYO_UTC_OFFSET_HOURS, 0, 0, 0);
  return date;
}

// Clears everything and inserts fixed data with fixed ids, so it can be run any number of times.
export async function seed() {
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { id: 1, name: "Aiko" },
      { id: 2, name: "Kenji" },
      { id: 3, name: "Rohit" },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        id: 1,
        name: "Ōta TOKYO Anime Night",
        venue: "Shibuya Stream Hall",
        startsAt: daysFromNow(3, 18),
        price: 3500,
        capacity: 200,
        ticketsLeft: 200,
      },
      {
        id: 2,
        name: "Cosplay Meetup Harajuku",
        venue: "Harajuku Quest Hall",
        startsAt: daysFromNow(7, 13),
        price: 2000,
        capacity: 120,
        ticketsLeft: 120,
      },
      {
        id: 3,
        name: "Ōta TOKYO Idol Live",
        venue: "Akihabara UDX Theater",
        startsAt: daysFromNow(10, 19),
        price: 6800,
        capacity: 300,
        ticketsLeft: 2,
      },
      {
        id: 4,
        name: "Manga Artist Talk & Signing",
        venue: "Ikebukuro Sunshine City",
        startsAt: daysFromNow(14, 15),
        price: 4500,
        capacity: 80,
        ticketsLeft: 80,
      },
    ],
  });
}

if (require.main === module) {
  seed()
    .then(() => console.log("Seeded 3 users and 4 events"))
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
