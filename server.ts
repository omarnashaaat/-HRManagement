import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("hr_system.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    jobTitle TEXT,
    department TEXT,
    status TEXT,
    joinDate TEXT,
    nationalId TEXT,
    phone TEXT,
    address TEXT,
    baseSalary REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId TEXT,
    date TEXT,
    arrivalTime TEXT,
    departureTime TEXT,
    deduction REAL DEFAULT 0,
    notes TEXT,
    UNIQUE(employeeId, date)
  );

  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    experience TEXT,
    email TEXT,
    phone TEXT,
    status TEXT,
    priority TEXT,
    score INTEGER,
    createdAt INTEGER,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/employees", (req, res) => {
    const employees = db.prepare("SELECT * FROM employees").all();
    res.json(employees);
  });

  app.post("/api/employees", (req, res) => {
    const { id, code, name, jobTitle, department, status, joinDate, nationalId, phone, address, baseSalary } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO employees (id, code, name, jobTitle, department, status, joinDate, nationalId, phone, address, baseSalary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, code, name, jobTitle, department, status, joinDate, nationalId, phone, address, baseSalary || 0);
      res.json({ success: true, id });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/employees/:id", (req, res) => {
    const { code, name, jobTitle, department, status, joinDate, nationalId, phone, address, baseSalary } = req.body;
    const { id } = req.params;
    db.prepare(`
      UPDATE employees 
      SET code = ?, name = ?, jobTitle = ?, department = ?, status = ?, joinDate = ?, nationalId = ?, phone = ?, address = ?, baseSalary = ?
      WHERE id = ?
    `).run(code, name, jobTitle, department, status, joinDate, nationalId, phone, address, baseSalary, id);
    res.json({ success: true });
  });

  app.delete("/api/employees/:id", (req, res) => {
    db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Attendance
  app.get("/api/attendance/:date", (req, res) => {
    const records = db.prepare("SELECT * FROM attendance WHERE date = ?").all(req.params.date);
    res.json(records);
  });

  app.post("/api/attendance", (req, res) => {
    const { employeeId, date, arrivalTime, departureTime, deduction, notes } = req.body;
    db.prepare(`
      INSERT INTO attendance (employeeId, date, arrivalTime, departureTime, deduction, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(employeeId, date) DO UPDATE SET
        arrivalTime = excluded.arrivalTime,
        departureTime = excluded.departureTime,
        deduction = excluded.deduction,
        notes = excluded.notes
    `).run(employeeId, date, arrivalTime, departureTime, deduction, notes);
    res.json({ success: true });
  });

  // Candidates
  app.get("/api/candidates", (req, res) => {
    const candidates = db.prepare("SELECT * FROM candidates ORDER BY createdAt DESC").all();
    res.json(candidates);
  });

  app.post("/api/candidates", (req, res) => {
    const { id, name, role, experience, email, phone, status, priority, score, createdAt, notes } = req.body;
    db.prepare(`
      INSERT INTO candidates (id, name, role, experience, email, phone, status, priority, score, createdAt, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        role = excluded.role,
        experience = excluded.experience,
        email = excluded.email,
        phone = excluded.phone,
        status = excluded.status,
        priority = excluded.priority,
        score = excluded.score,
        notes = excluded.notes
    `).run(id, name, role, experience, email, phone, status, priority, score, createdAt, notes);
    res.json({ success: true });
  });

  app.delete("/api/candidates/:id", (req, res) => {
    db.prepare("DELETE FROM candidates WHERE id = ?").run(req.params.id);
    res.json({ success: true });
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
