import request from "supertest";
import { seed } from "../prisma/seed";
import { app } from "../src/app";
import { prisma } from "../src/db";

const TWO_LEFT_EVENT_ID = 3;

beforeEach(seed);
afterAll(() => prisma.$disconnect());

function book(userId: number, quantity: number, eventId = TWO_LEFT_EVENT_ID) {
  return request(app).post(`/events/${eventId}/book`).set("X-User-Id", String(userId)).send({ quantity });
}

describe("POST /events/:id/book", () => {
  it("never oversells under concurrent bookings", async () => {
    const userIds = [1, 2, 3, 1, 2, 3, 1, 2, 3, 1];
    const responses = await Promise.all(userIds.map((userId) => book(userId, 1)));

    const statuses = responses.map((response) => response.status);
    expect(statuses.filter((status) => status === 201)).toHaveLength(2);
    expect(statuses.filter((status) => status === 409)).toHaveLength(8);

    const event = await prisma.event.findUniqueOrThrow({ where: { id: TWO_LEFT_EVENT_ID } });
    expect(event.ticketsLeft).toBe(0);
    expect(await prisma.ticket.count({ where: { eventId: TWO_LEFT_EVENT_ID } })).toBe(2);
  });

  it("returns the created tickets with unique codes", async () => {
    const response = await book(1, 2);

    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].code).toMatch(/^[0-9A-Z]{10}$/);
    expect(response.body[0].code).not.toBe(response.body[1].code);
  });

  it("returns 409 SOLD_OUT with the tickets left when asking for too many", async () => {
    const response = await book(1, 3);

    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({ code: "SOLD_OUT", ticketsLeft: 2 });
  });

  it.each([0, 5, 1.5])("rejects quantity %p with 400", async (quantity) => {
    const response = await book(1, quantity);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 for an unknown event", async () => {
    const response = await book(1, 1, 999);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("EVENT_NOT_FOUND");
  });
});

describe("X-User-Id", () => {
  it("returns 401 when the header is missing", async () => {
    const response = await request(app).get("/events");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 for an unknown user", async () => {
    const response = await request(app).get("/events").set("X-User-Id", "999");

    expect(response.status).toBe(401);
  });
});
