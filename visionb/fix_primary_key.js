const db = require("./config/dbconfig.js");

const alterQuery = "ALTER TABLE completed MODIFY COLUMN compid INT AUTO_INCREMENT;";

db.query(alterQuery, (err, results) => {
    if (err) {
        console.error("Failed to alter table:", err);
    } else {
        console.log("Successfully added AUTO_INCREMENT to compid.");
    }
    process.exit();
});
