import express from "express";
import { errorHandler, notFoundHandler } from "./errors";
import { requireUser } from "./middleware/user";
import { checkinsRouter } from "./routes/checkins";
import { eventsRouter } from "./routes/events";
import { ticketsRouter } from "./routes/tickets";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(["/events", "/me", "/checkins"], requireUser);
app.use("/events", eventsRouter);
app.use("/me/tickets", ticketsRouter);
app.use("/checkins", checkinsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
