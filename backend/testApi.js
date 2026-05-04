const jwt = require("jsonwebtoken");

const dotenv = require("dotenv");

dotenv.config();

const run = async () => {
  // testuser id: 69f6fc8017b0c29f4868328e
  const token = jwt.sign({ userId: "69f6fc8017b0c29f4868328e" }, process.env.JWT_SECRET || "fallback_secret");
  
  try {
    const res = await fetch("http://localhost:5000/api/shares/shared-with-me", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error(e);
  }
}
run();
