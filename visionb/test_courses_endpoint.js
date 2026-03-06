async function testCourses() {
    try {
        const response = await fetch('http://localhost:8080/courses/1');
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", data);
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

testCourses();
