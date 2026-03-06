const http = require("http");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const db = require("./config/dbconfig");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// Global error handler for debugging
app.use((err, req, res, next) => {
  console.error("Global error caught:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

const PORT = 8080;
const SECRET_KEY = "your_secret_key_here";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'duu0bnya5',
  api_key: '134324521294551',
  api_secret: 'hcoPrYzGieBGwqoLdvLCoO-65kw'
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    const { name, semester, password, leetcodeUsername, username } = req.body;

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
    req.user = verified;
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
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });
  res.json({ message: "Logged out successfully" });
});

app.get("/courses/:semester", verifyToken, (req, res) => {
  const semester = req.params.semester;
  console.log(`Fetching courses for semester: ${semester}`);

  const query = "SELECT * FROM courses WHERE semester = ?";
  db.query(query, [semester], (err, results) => {
    if (err) {
      console.error("Database error fetching courses:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log(`Found ${results.length} courses`);
    res.json(results);
  });
});

app.get("/topics/:cid", verifyToken, (req, res) => {
  const cid = req.params.cid;
  console.log(`Fetching topics for course ID: ${cid}`);

  const query = "SELECT * FROM topics WHERE cid = ?";
  db.query(query, [cid], (err, results) => {
    if (err) {
      console.error("Database error fetching topics:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log(`Found ${results.length} topics`);
    res.json(results);
  });
});

app.get("/completed-topics/:cid", verifyToken, (req, res) => {
  const cid = req.params.cid;
  const username = req.user.username;

  const query = `
    SELECT c.topicid AS tid 
    FROM completed c 
    JOIN topics t ON c.topicid = t.tid 
    WHERE c.username = ? AND t.cid = ?
  `;

  db.query(query, [username, cid], (err, results) => {
    if (err) {
      console.error("Database error fetching completed topics:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results.map(row => row.tid));
  });
});


app.post("/complete-topic", verifyToken, (req, res) => {
  console.log("POST /complete-topic received:", req.body);
  const { tid } = req.body;
  const username = req.user.username;

  if (!tid) {
    console.log("Error: Topic ID is missing.");
    return res.status(400).json({ error: "Topic ID is required" });
  }

  const query = "INSERT INTO completed (username, topicid) VALUES (?, ?)";
  db.query(query, [username, tid], (err, result) => {
    if (err) {
      // Ignore duplicate entry errors gracefully since it means it's already completed
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`Topic ${tid} is already completed for ${username}.`);
        return res.json({ message: "Topic already marked as completed." });
      }
      console.error("Database error marking topic completed:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log(`Successfully completed topic ${tid} for ${username}. Resulting compid: ${result.insertId}`);
    res.json({ message: "Topic marked as completed", compid: result.insertId });
  });
});

// Unmark a topic as completed
app.delete("/complete-topic/:tid", verifyToken, (req, res) => {
  console.log("DELETE /complete-topic received for tid:", req.params.tid);
  const tid = req.params.tid;
  const username = req.user.username;

  const query = "DELETE FROM completed WHERE username = ? AND topicid = ?";
  db.query(query, [username, tid], (err, result) => {
    if (err) {
      console.error("Database error unmarking topic:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Topic completion removed" });
  });
});

// CERTIFICATES ENDPOINTS

// Fetch all certificates for the logged-in user
app.get("/certificates", verifyToken, (req, res) => {
  const query = "SELECT title, clink FROM certificate WHERE usrnm = ?";
  db.query(query, [req.user.username], (err, results) => {
    if (err) {
      console.error("Database error fetching certificates:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Upload a new certificate
app.post("/certificates/upload", verifyToken, upload.single('image'), (req, res) => {
  const { title } = req.body;
  const username = req.user.username;

  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  if (!title) {
    return res.status(400).json({ error: "Certificate title is required" });
  }

  // Upload to Cloudinary using the buffer
  cloudinary.uploader.upload_stream(
    { folder: "vision_certificates", resource_type: "auto" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ error: "Upload failed" });
      }

      // Save to Database (Table: certificate, Columns: usrnm, clink, title)
      const imageUrl = result.secure_url;
      console.log(`Cloudinary upload success for ${username}. URL: ${imageUrl}. Saving to DB...`);

      const insertQuery = "INSERT INTO certificate (usrnm, clink, title) VALUES (?, ?, ?)";
      db.query(insertQuery, [username, imageUrl, title], (dbErr, dbResult) => {
        if (dbErr) {
          console.error("Database insert error for certificate:", dbErr);
          return res.status(500).json({ error: "Database save failed" });
        }
        console.log(`Certificate saved to DB for ${username}. Affected rows: ${dbResult.affectedRows}`);
        res.json({
          message: "Certificate uploaded successfully",
          certificate: {
            title,
            clink: imageUrl
          }
        });
      });
    }
  ).end(req.file.buffer);
});

// Delete a certificate (using clink since no id column exists)
app.delete("/certificates", verifyToken, (req, res) => {
  const { clink } = req.body;
  const username = req.user.username;

  if (!clink) {
    return res.status(400).json({ error: "Certificate link (clink) is required for deletion" });
  }

  console.log(`Attempting to delete certificate with link: ${clink} for user: ${username}`);

  const query = "DELETE FROM certificate WHERE clink = ? AND usrnm = ?";
  db.query(query, [clink, username], (err, result) => {
    if (err) {
      console.error("Database error deleting certificate:", err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log(`Delete result:`, result);

    if (result.affectedRows === 0) {
      console.warn(`No certificate found with link ${clink} for user ${username}`);
      return res.status(404).json({ error: "Certificate not found or unauthorized" });
    }

    res.json({ message: "Certificate deleted successfully" });
  });
});

// Proxy endpoint to fetch GitHub repositories
app.get("/github/repos", verifyToken, async (req, res) => {
  // Column 'github_token' was removed from 'users' table.
  // This endpoint is currently disabled or needs an alternative token source.
  return res.status(501).json({ error: "GitHub integration is currently disabled (token column removed)" });
});

// Proxy endpoint to fetch LeetCode stats to bypass frontend CORS issues
app.get("/leetcode/:username", async (req, res) => {
  try {
    const { username } = req.params;
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
