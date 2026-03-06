const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: 'duu0bnya5',
  api_key: '134324521294551',
  api_secret: 'hcoPrYzGieBGwqoLdvLCoO-65kw'
});

console.log("Testing Cloudinary connection...");

cloudinary.api.ping((error, result) => {
  if (error) {
    console.error("Cloudinary ping failed:", error);
  } else {
    console.log("Cloudinary ping successful:", result);
  }
  process.exit(error ? 1 : 0);
});
