import request from "supertest";
import { seed } from "../prisma/seed";
import { app } from "../src/app";
import { prisma } from "../src/db";

beforeEach(seed);
afterAll(() => prisma.$disconnect());

function checkIn(code: string) {
  return request(app).post("/checkins").set("X-User-Id", "2").send({ code });
}

describe("POST /checkins", () => {
  it("checks a ticket in once, then returns 409 with the original time", async () => {
    const booking = await request(app).post("/events/1/book").set("X-User-Id", "1").send({ quantity: 1 });
    const code: string = booking.body[0].code;

    const first = await checkIn(code);
    expect(first.status).toBe(200);
    expect(first.body.checkedInAt).toEqual(expect.any(String));

    const second = await checkIn(code);
    expect(second.status).toBe(409);
    expect(second.body.error).toMatchObject({
      code: "ALREADY_CHECKED_IN",
      checkedInAt: first.body.checkedInAt,
    });
  });

  it("returns 404 for an unknown code", async () => {
    const response = await checkIn("UNKNOWN123");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("TICKET_NOT_FOUND");
  });

  it("returns 400 when the code is missing", async () => {
    const response = await request(app).post("/checkins").set("X-User-Id", "2").send({});

    expect(response.status).toBe(400);
  });
});
