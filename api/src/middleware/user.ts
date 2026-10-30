import type { RequestHandler } from "express";
import { prisma } from "../db";
import { HttpError } from "../errors";

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

// No real auth on purpose: the caller says who they are with X-User-Id, and we only check that the user exists.
export const requireUser: RequestHandler = async (req, _res, next) => {
  const header = req.header("X-User-Id");
  if (!header || !/^\d+$/.test(header)) {
    throw new HttpError(401, "UNAUTHORIZED", "X-User-Id header must be a user id");
  }
  const user = await prisma.user.findUnique({ where: { id: Number(header) } });
  if (!user) {
    throw new HttpError(401, "UNAUTHORIZED", "Unknown user");
  }
  req.userId = user.id;
  next();
};
