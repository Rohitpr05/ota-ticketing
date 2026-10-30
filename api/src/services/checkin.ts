import { prisma } from "../db";
import { HttpError } from "../errors";
import { ticketSelect } from "./tickets";

export async function checkInTicket(code: string) {
  // Only an unused ticket matches `checkedInAt: null`, so of two simultaneous scans exactly one updates the row.
  const { count } = await prisma.ticket.updateMany({
    where: { code, checkedInAt: null },
    data: { checkedInAt: new Date() },
  });

  const ticket = await prisma.ticket.findUnique({ where: { code }, select: ticketSelect });
  if (!ticket) {
    throw new HttpError(404, "TICKET_NOT_FOUND", "Ticket not found");
  }
  if (count === 0) {
    throw new HttpError(409, "ALREADY_CHECKED_IN", "This ticket has already been checked in", {
      checkedInAt: ticket.checkedInAt,
    });
  }
  return ticket;
}
