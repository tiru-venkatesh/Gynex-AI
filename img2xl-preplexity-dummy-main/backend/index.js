const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Fake in-memory DB
const users = [];

/* ---------------- SIGNUP ---------------- */
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });

  return res.json({ message: "Signup success" });
});

/* ---------------- LOGIN ---------------- */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: "demo-token-123"
  });
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: message,
        stream: false
      })
    });

    const data = await response.json();
    res.json({ reply: data.response });

  } catch (error) {
    res.status(500).json({ error: "Ollama connection failed" });
  }
});

app.listen(8000, () => {
  console.log("Backend running at http://localhost:8000");
});
