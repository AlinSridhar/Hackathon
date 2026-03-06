const db = require("./config/dbconfig");

const query = "ALTER TABLE completed MODIFY COLUMN compid INT AUTO_INCREMENT";

db.query(query, (err, result) => {
  if (err) {
    console.error(`Error running query:`, err.message);
    process.exit(1);
  }
  console.log("Success: completed table updated with AUTO_INCREMENT");
  process.exit(0);
});
