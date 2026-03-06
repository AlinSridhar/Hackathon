const db = require("./config/dbconfig.js");

db.query("DESCRIBE courses;", (err, results) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("Courses Table Schema:");
        console.table(results);
    }
    process.exit();
});
