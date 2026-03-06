const db = require("./config/dbconfig.js");

async function checkDatabase() {
    try {
        const [tables] = await db.promise().query("SHOW TABLES");
        console.log("Existing tables:", tables.map(t => Object.values(t)[0]));

        const [courses] = await db.promise().query("SELECT * FROM courses");
        console.log("\nCourses data:", courses);

        const [topics] = await db.promise().query("SELECT * FROM topics");
        console.log("\nTopics data:", topics);
        
    } catch (err) {
        console.error("Database check error:", err.message);
    }
    process.exit();
}

checkDatabase();
