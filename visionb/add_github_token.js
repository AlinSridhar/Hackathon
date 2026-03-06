const db = require("./config/dbconfig");

const alterQuery = "ALTER TABLE users ADD COLUMN github_token TEXT";

db.query(alterQuery, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column 'github_token' already exists.");
      process.exit(0);
    }
    console.error("Error adding column:", err);
    process.exit(1);
  }
  console.log("Column 'github_token' added successfully.");
  process.exit(0);
});
