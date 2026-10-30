import { prisma } from "../db";

// The public shape of an event, reused wherever an event is returned.
export const eventSelect = {
  id: true,
  name: true,
  venue: true,
  startsAt: true,
  price: true,
  currency: true,
  ticketsLeft: true,
} as const;

export function listUpcomingEvents() {
  return prisma.event.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    select: eventSelect,
  });
}
