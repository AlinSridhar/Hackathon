const db = require("./config/dbconfig");

db.query("DESCRIBE completed", (err, results) => {
  if (err) {
    console.error("Error describing completed table:", err);
    process.exit(1);
  }
  console.log("Completed table schema:");
  console.table(results);
  process.exit(0);
});
