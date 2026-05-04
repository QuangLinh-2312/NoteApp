const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ShareNote = require('./models/ShareNote');
const User = require('./models/User');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/notes-app");
  const shares = await ShareNote.find({}).populate('ownerId', 'email').populate('sharedWithId', 'email');
  console.log("Shares in DB:", JSON.stringify(shares, null, 2));
  process.exit(0);
};

run();
