import { prisma } from "../db";
import { HttpError } from "../errors";
import { generateTicketCode, ticketSelect } from "./tickets";

export async function bookTickets(userId: number, eventId: number, quantity: number) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // One conditional UPDATE, not read-then-write: MySQL locks the event row, so concurrent bookings
    // queue up and each re-checks ticketsLeft against the latest value.
    const { count } = await tx.event.updateMany({
      where: { id: eventId, ticketsLeft: { gte: quantity }, startsAt: { gte: now } },
      data: { ticketsLeft: { decrement: quantity } },
    });

    if (count === 0) {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new HttpError(404, "EVENT_NOT_FOUND", "Event not found");
      }
      if (event.startsAt < now) {
        throw new HttpError(409, "EVENT_STARTED", "This event has already started");
      }
      const message = event.ticketsLeft === 0 ? "Sold out" : `Only ${event.ticketsLeft} ticket(s) left`;
      throw new HttpError(409, "SOLD_OUT", message, { ticketsLeft: event.ticketsLeft });
    }

    // Same transaction, so a failed insert also rolls back the decrement.
    const codes = Array.from({ length: quantity }, generateTicketCode);
    await tx.ticket.createMany({ data: codes.map((code) => ({ code, userId, eventId })) });

    return tx.ticket.findMany({ where: { code: { in: codes } }, select: ticketSelect });
  });
}
