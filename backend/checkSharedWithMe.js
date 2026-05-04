const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ShareNote = require('./models/ShareNote');
const Note = require('./models/Note');
const User = require('./models/User');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/notes-app");
  
  const shares = await ShareNote.find({}).populate("noteId").populate("ownerId").populate("sharedWithId");
  console.log("ALL SHARES IN DB:", JSON.stringify(shares, null, 2));

  const testUserId = "69f6fc8017b0c29f4868328e"; // Replace with actual test user ID later if needed.
  
  process.exit(0);
};

run();
