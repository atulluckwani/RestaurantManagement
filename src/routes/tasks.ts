import { Router } from "express";
import { randomUUID } from "node:crypto";
import { taskStore } from "../data/fileStore";
import { Task } from "../types";

export const tasksRouter = Router();

tasksRouter.get("/", (_req, res) => {
  const tasks = taskStore.read() as Task[];
  res.json(tasks);
});

tasksRouter.post("/", (req, res) => {
  const { title, completed } = req.body as { title?: string; completed?: boolean };

  if (!title || typeof title !== "string") {
    res.status(400).json({ message: "title is required" });
    return;
  }

  const tasks = taskStore.read() as Task[];
  const task: Task = {
    id: randomUUID(),
    title: title.trim(),
    completed: Boolean(completed),
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  taskStore.write(tasks);
  res.status(201).json(task);
});

tasksRouter.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body as { title?: string; completed?: boolean };

  const tasks = taskStore.read() as Task[];
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  if (title !== undefined) {
    if (!title || typeof title !== "string") {
      res.status(400).json({ message: "title must be a non-empty string" });
      return;
    }
    tasks[index].title = title.trim();
  }

  if (completed !== undefined) {
    tasks[index].completed = Boolean(completed);
  }

  taskStore.write(tasks);
  res.json(tasks[index]);
});

tasksRouter.delete("/:id", (req, res) => {
  const { id } = req.params;
  const tasks = taskStore.read() as Task[];
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  const [deleted] = tasks.splice(index, 1);
  taskStore.write(tasks);
  res.json(deleted);
});
