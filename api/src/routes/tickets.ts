import { Router } from "express";
import { listUserTickets } from "../services/tickets";

export const ticketsRouter = Router();

ticketsRouter.get("/", async (req, res) => {
  res.json(await listUserTickets(req.userId));
});
