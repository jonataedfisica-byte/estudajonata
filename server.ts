import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("studyflow.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#4f46e5',
    icon TEXT DEFAULT 'Book'
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    target_hours INTEGER NOT NULL,
    period TEXT DEFAULT 'weekly', -- 'daily' or 'weekly'
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  );
`);

// Seed initial subjects if empty
const subjectCount = db.prepare("SELECT COUNT(*) as count FROM subjects").get() as { count: number };
if (subjectCount.count === 0) {
  const seedSubjects = [
    { name: "Matemática", color: "#4f46e5", icon: "Calculator" },
    { name: "Biologia", color: "#059669", icon: "Flask" },
    { name: "História", color: "#d97706", icon: "Book" },
    { name: "Programação", color: "#2563eb", icon: "Code" }
  ];
  const insert = db.prepare("INSERT INTO subjects (name, color, icon) VALUES (?, ?, ?)");
  seedSubjects.forEach(s => insert.run(s.name, s.color, s.icon));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/subjects", (req, res) => {
    const subjects = db.prepare("SELECT * FROM subjects").all();
    res.json(subjects);
  });

  app.post("/api/subjects", (req, res) => {
    const { name, color, icon } = req.body;
    const info = db.prepare("INSERT INTO subjects (name, color, icon) VALUES (?, ?, ?)").run(name, color, icon);
    res.json({ id: info.lastInsertRowid, name, color, icon });
  });

  app.delete("/api/subjects/:id", (req, res) => {
    db.prepare("DELETE FROM subjects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/sessions", (req, res) => {
    const sessions = db.prepare(`
      SELECT s.*, sub.name as subject_name, sub.color as subject_color 
      FROM sessions s 
      JOIN subjects sub ON s.subject_id = sub.id
      ORDER BY s.date DESC
    `).all();
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const { subject_id, duration, date, notes } = req.body;
    const info = db.prepare("INSERT INTO sessions (subject_id, duration, date, notes) VALUES (?, ?, ?, ?)").run(subject_id, duration, date, notes);
    res.json({ id: info.lastInsertRowid, subject_id, duration, date, notes });
  });

  app.get("/api/stats", (req, res) => {
    const stats = db.prepare(`
      SELECT sub.name, SUM(s.duration) as total_duration, sub.color
      FROM sessions s
      JOIN subjects sub ON s.subject_id = sub.id
      GROUP BY sub.id
    `).all();
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
