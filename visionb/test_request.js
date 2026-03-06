const http = require("http");

const data = JSON.stringify({
  name: "New User",
  username: "newuser123",
  semester: "",
  password: "mypassword",
  leetcodeUsername: "mycode"
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, responseBody));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
