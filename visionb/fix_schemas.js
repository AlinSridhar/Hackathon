const db = require("./config/dbconfig");

const queries = [
  // Fix completed table
  "ALTER TABLE completed MODIFY COLUMN compid INT AUTO_INCREMENT PRIMARY KEY",
  
  // Fix certificate table (casing/schema)
  "ALTER TABLE certificate MODIFY COLUMN clink TEXT",
  "ALTER TABLE certificate MODIFY COLUMN title VARCHAR(255)",
  "ALTER TABLE certificate MODIFY COLUMN usrnm VARCHAR(255)"
];

const runQueries = async () => {
  for (const query of queries) {
    try {
      await new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      console.log(`Success: ${query}`);
    } catch (err) {
      console.error(`Error running query "${query}":`, err.message);
    }
  }
  process.exit(0);
};

runQueries();
