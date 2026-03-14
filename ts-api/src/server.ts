import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import pool from "./db";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, service: "ts-api", db: "connected" });
  } catch {
    res.status(500).json({ ok: false, service: "ts-api", db: "error" });
  }
});

app.get("/users", async (_req: Request, res: Response) => {
  const [rows] = await pool.query("SELECT id, email, name, created_at FROM users ORDER BY id DESC LIMIT 100");
  res.json(rows);
});

app.post("/users", async (req: Request, res: Response) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password || !name) {
    return res.status(400).json({ error: "email, password and name are required" });
  }

  try {
    const [result] = await pool.query("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, password, name]);
    res.status(201).json({ message: "user created", result });
  } catch {
    res.status(409).json({ error: "user already exists or invalid payload" });
  }
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const [rows] = await pool.query(
    "SELECT id, email, name FROM users WHERE email = ? AND password = ? LIMIT 1",
    [email, password]
  );
  const users = rows as Array<{ id: number; email: string; name: string }>;

  if (users.length === 0) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  return res.json({
    token: `dev-token-${users[0].id}`,
    user: users[0]
  });
});

app.listen(port, () => {
  console.log(`TS API running on ${port}`);
});
