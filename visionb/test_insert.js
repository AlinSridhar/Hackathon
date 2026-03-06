const db = require("d:/Hackathon/visionb/config/dbconfig.js");

const insertUser = "INSERT INTO users (name, semester, password, leetcodeid, username) VALUES (?, ?, ?, ?, ?)";
const values = ["Test User", "", "hashedpassword", "testleetcode", "testuser_empty_sem"];

db.query(insertUser, values, (err, result) => {
    if (err) {
        console.error("INSERT ERROR:");
        console.error(err);
    } else {
        console.log("INSERT SUCCESS:");
        console.log(result);
    }
    process.exit();
});
