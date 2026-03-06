const db = require("./config/dbconfig.js");

db.query("DESCRIBE topics;", (err, results) => {
    if (err) console.error(err);
    else {
        console.log("Topics Table Schema:");
        console.table(results);
    }
    
    db.query("DESCRIBE users;", (err2, results2) => {
        if (err2) console.error(err2);
        else {
            console.log("\nUsers Table Schema:");
            console.table(results2);
        }
        process.exit();
    });
});
