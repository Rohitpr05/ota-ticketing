export type Event = {
  id: number;
  name: string;
  venue: string;
  startsAt: string;
  price: number;
  currency: string;
  ticketsLeft: number;
};

export type Ticket = {
  id: string;
  code: string;
  createdAt: string;
  checkedInAt: string | null;
  event: Event;
};

type ErrorBody = {
  error?: { code?: string; message?: string; [field: string]: unknown };
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// Without a timeout, a wrong IP or a blocked Local Network permission leaves iOS waiting about a minute.
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

async function request<T>(userId: number, path: string, body?: object): Promise<T> {
  if (!API_URL) {
    throw new ApiError(0, "CONFIG_ERROR", "EXPO_PUBLIC_API_URL is not set in app/.env");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", "X-User-Id": String(userId) },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", `Could not reach the API at ${API_URL}`);
  } finally {
    clearTimeout(timeout);
  }

  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const { code, message, ...details } = (json as ErrorBody | null)?.error ?? {};
    throw new ApiError(
      response.status,
      code ?? "UNKNOWN_ERROR",
      message ?? `Request failed with ${response.status}`,
      details,
    );
  }
  // The API is ours and typed on the server, so the success body is trusted to match T.
  return json as T;
}

export const api = {
  listEvents: (userId: number) => request<Event[]>(userId, "/events"),
  bookTickets: (userId: number, eventId: number, quantity: number) =>
    request<Ticket[]>(userId, `/events/${eventId}/book`, { quantity }),
  listMyTickets: (userId: number) => request<Ticket[]>(userId, "/me/tickets"),
  checkIn: (userId: number, code: string) => request<Ticket>(userId, "/checkins", { code }),
};
