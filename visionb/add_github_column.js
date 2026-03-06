const db = require("./config/dbconfig.js");

const alterQuery = "ALTER TABLE users ADD COLUMN github_token VARCHAR(255);";

db.query(alterQuery, (err, results) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
             console.log("github_token column already exists.");
        } else {
             console.error("Failed to alter users table:", err);
        }
    } else {
        console.log("Successfully added github_token column to users table.");
    }
    process.exit();
});
