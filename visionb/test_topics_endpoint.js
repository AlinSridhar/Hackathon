async function testTopics() {
    try {
        const cid = 1;
        const response = await fetch(`http://localhost:8080/topics/${cid}`);
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data count:", data.length);
        console.log("First item:", data[0]);
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

testTopics();
