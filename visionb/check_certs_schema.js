const db = require("./config/dbconfig");

const query = "DESCRIBE certificates";

db.query(query, (err, results) => {
  if (err) {
    console.error("Error describing certificates table:", err);
    process.exit(1);
  }
  console.log("Certificates table schema:");
  console.table(results);
  process.exit(0);
});
