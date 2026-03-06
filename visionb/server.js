const http = require("http");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const db = require("./config/dbconfig");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
  credentials: true
}));

const PORT = 8080;
const SECRET_KEY = "your_secret_key_here";

const server = http.createServer(app);


app.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    const query = "SELECT * FROM users WHERE username = ?";
  
    db.query(query, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
  
      if (results.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }
  
      const user = results[0];
  
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { username: user.username },
        SECRET_KEY,
        { expiresIn: "1d" }
      );
  
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
      });
  
      res.json({
        message: "Login successful",
        user: {
          username: user.username,
          name: user.name
        }
      });
    });
  });

  app.post("/register", async (req, res) => {
    try {
      const { name, semester, password, leetcodeUsername,username} = req.body;
  
      const checkUser = "SELECT * FROM users WHERE username = ?";

      db.query(checkUser, [username], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
  
        if (result.length > 0) {
          return res.status(400).json({ error: "User already exists" });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        let parsedSemester = null;
        if (semester) {
          const digits = String(semester).replace(/\D/g, '');
          parsedSemester = digits ? parseInt(digits, 10) : null;
        }

        const insertUser =
          "INSERT INTO users (name, semester, password, leetcodeid, username) VALUES (?, ?, ?, ?, ?)";
  
        db.query(
          insertUser,
          [name, parsedSemester, hashedPassword, leetcodeUsername, username],
          (err, result) => {
            if (err) {
              console.error("Database insert error:", err);
              return res.status(500).json({ error: "Insert failed", details: err.message });
            }
  
            const token = jwt.sign(
              { username: username },
              SECRET_KEY,
              { expiresIn: "1d" }
            );
  
            res.cookie("token", token, {
              httpOnly: true,
              secure: false,
              sameSite: "lax"
            });
  
            res.json({
              message: "User registered successfully",
              userId: username
            });
          }
        );
      });
  
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // adds username from payload
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

app.get("/profile", verifyToken, (req, res) => {
  const query = "SELECT name, semester, leetcodeid, username FROM users WHERE username = ?";
  db.query(query, [req.user.username], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(results[0]);
  });
});

app.put("/profile", verifyToken, (req, res) => {
  const { name, semester, leetcodeid } = req.body;
  
  let parsedSemester = null;
  if (semester) {
    const digits = String(semester).replace(/\D/g, '');
    parsedSemester = digits ? parseInt(digits, 10) : null;
  }

  const updateQuery = "UPDATE users SET name = ?, semester = ?, leetcodeid = ? WHERE username = ?";
  db.query(updateQuery, [name, parsedSemester, leetcodeid, req.user.username], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error during update" });
    
    res.json({ message: "Profile updated successfully" });
  });
});

app.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Match setting from login
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/courses/:semester", verifyToken, (req, res) => {
  const semester = req.params.semester;
  
  const query = "SELECT * FROM courses WHERE semester = ?";
  db.query(query, [semester], (err, results) => {
    if (err) {
      console.error("Database error fetching courses:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Proxy endpoint to fetch LeetCode stats to bypass frontend CORS issues
app.get("/leetcode/:username", async (req, res) => {
  try {
    const { username } = req.params;
    // Using dynamic import for node-fetch is modern standard, or native fetch in Node 18+
    // Since Node is v22+, native fetch is available globally!
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
    
    if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from LeetCode API" });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("LeetCode proxy error:", error);
    res.status(500).json({ error: "Server error fetching LeetCode stats" });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
