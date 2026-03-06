const db = require("./config/dbconfig");

db.query("DESCRIBE users", (err, results) => {
  if (err) {
    console.error("Error describing users table:", err);
    process.exit(1);
  }
  console.log("Users table schema:");
  console.table(results);
  process.exit(0);
});
