import { Router } from "express";
import { z } from "zod";
import { bookTickets } from "../services/booking";
import { listUpcomingEvents } from "../services/events";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/, "must be a positive integer").transform(Number),
});
const bookingSchema = z.object({
  quantity: z.number().int().min(1).max(4),
});

export const eventsRouter = Router();

eventsRouter.get("/", async (_req, res) => {
  res.json(await listUpcomingEvents());
});

eventsRouter.post("/:id/book", async (req, res) => {
  const { id } = paramsSchema.parse(req.params);
  const { quantity } = bookingSchema.parse(req.body);
  res.status(201).json(await bookTickets(req.userId, id, quantity));
});
