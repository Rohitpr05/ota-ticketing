import { randomInt } from "node:crypto";
import { prisma } from "../db";
import { eventSelect } from "./events";

// Crockford base32: no I, L, O or U, so codes are easy to read out loud and type.
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 10;

export const ticketSelect = {
  id: true,
  code: true,
  createdAt: true,
  checkedInAt: true,
  event: { select: eventSelect },
} as const;

// crypto.randomInt makes codes unguessable; the unique index rejects the rare clash.
export function generateTicketCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export function listUserTickets(userId: number) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: ticketSelect,
  });
}
