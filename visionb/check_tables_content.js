const db = require("./config/dbconfig");

const query = "SELECT * FROM certificates";

db.query(query, (err, results) => {
  if (err) {
    console.error("Error fetching certificates:", err);
    process.exit(1);
  }
  console.log("Certificates table content:");
  console.table(results);
  process.exit(0);
});
