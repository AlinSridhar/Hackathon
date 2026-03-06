const db = require("./config/dbconfig.js");

const createQuery = `
CREATE TABLE IF NOT EXISTS completed (
  compid INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(25),
  tid INT,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
  FOREIGN KEY (tid) REFERENCES topics(tid) ON DELETE CASCADE,
  UNIQUE KEY unique_completion (username, tid)
);
`;

db.query(createQuery, (err, results) => {
    if (err) {
        console.error("Error creating completed table:", err);
    } else {
        console.log("Successfully created or verified 'completed' table.");
    }
    process.exit();
});
