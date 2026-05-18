import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import { tasksRouter } from "./routes/tasks";
import { restaurantRouter } from "./routes/restaurant";
import { startOrderStatusScheduler } from "./services/orderStatusScheduler";
import { swaggerSpec } from "./swagger";

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/tasks", tasksRouter);
app.use("/api", restaurantRouter);

app.get("/api", (_req, res) => {
  res.json({ status: "ok", message: "Restaurant API is running" });
});

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
