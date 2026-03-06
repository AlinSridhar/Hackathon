const db = require("./config/dbconfig.js");

db.query("DESCRIBE completed;", (err, results) => {
    if (err) console.error("Error:", err);
    else {
        console.table(results);
    }
    process.exit();
});
