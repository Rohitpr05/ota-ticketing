import { Router } from "express";
import { z } from "zod";
import { checkInTicket } from "../services/checkin";

const checkinSchema = z.object({
  code: z.string().trim().toUpperCase().min(1),
});

export const checkinsRouter = Router();

checkinsRouter.post("/", async (req, res) => {
  const { code } = checkinSchema.parse(req.body);
  res.json(await checkInTicket(code));
});
