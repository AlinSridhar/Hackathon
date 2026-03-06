const db = require("./config/dbconfig");

db.query("SHOW TABLES", (err, results) => {
  if (err) {
    console.error("Error listing tables:", err);
    process.exit(1);
  }
  console.log("Tables in database:");
  console.table(results);
  process.exit(0);
});
