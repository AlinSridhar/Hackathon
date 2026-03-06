const db = require("./config/dbconfig.js");

db.query("SELECT username FROM users;", (err, results) => {
    if (err) console.error("Error:", err);
    else {
        console.log("Existing Users:");
        console.table(results);
    }
    process.exit();
});
