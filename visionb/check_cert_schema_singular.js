const db = require("./config/dbconfig");

const query = "DESCRIBE certificate";

db.query(query, (err, results) => {
  if (err) {
    console.error("Error describing certificate table:", err);
    process.exit(1);
  }
  console.log("Certificate (singular) table schema:");
  console.table(results);
  process.exit(0);
});
