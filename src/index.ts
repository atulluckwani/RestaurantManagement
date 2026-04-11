import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { tasksRouter } from "./routes/tasks";
import { restaurantRouter } from "./routes/restaurant";
import { startOrderStatusScheduler } from "./services/orderStatusScheduler";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/tasks", tasksRouter);
app.use("/api", restaurantRouter);

const publicDir = path.join(process.cwd(), "src", "public");
app.use(express.static(publicDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "menu.html"));
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ message: "Internal server error", detail: err.message });
});

startOrderStatusScheduler();

app.listen(port, () => {
  console.log(`Restaurant app server running on http://localhost:${port}`);
});
