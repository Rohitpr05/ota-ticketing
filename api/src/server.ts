import { app } from "./app";

const port = Number(process.env.PORT ?? 3000);

// 0.0.0.0 so the iPhone can reach the API over the local network.
app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on http://localhost:${port}`);
});
