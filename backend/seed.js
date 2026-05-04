const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Note = require('./models/Note');
const CustomCategory = require('./models/CustomCategory');

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    // Kết nối với database
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Xóa toàn bộ dữ liệu cũ
    await User.deleteMany();
    await Note.deleteMany();
    await CustomCategory.deleteMany();
    console.log('Đã xóa sạch dữ liệu cũ...');

    // Tạo 1 User mẫu
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123' // Password sẽ tự động được mã hóa nhờ pre-save hook trong Model
    });
    const createdUser = await testUser.save();
    console.log(`Đã tạo User: ${createdUser.email} (mật khẩu: password123)`);

    // Tạo các category mẫu
    const categories = ['Công việc', 'Cá nhân', 'Học tập', 'Ý tưởng'];

    // Tạo 10 Note mẫu cho User đó
    const notes = [];
    for (let i = 1; i <= 10; i++) {
      notes.push({
        userId: createdUser._id,
        title: `Ghi chú mẫu số ${i}`,
        content: `Đây là nội dung chi tiết của ghi chú mẫu số ${i}. Dữ liệu này được tạo tự động để test giao diện và tính năng.`,
        category: categories[i % categories.length],
        color: ['#FFE4B5', '#FFFACD', '#E6E6FA', '#F0FFF0', '#F08080'][i % 5],
        tags: [`tag${i}`, 'test'],
        isFavorite: i % 3 === 0, // Cứ 3 note thì có 1 note được yêu thích
        isPinned: i === 1, // Ghim note số 1
      });
    }

    await Note.insertMany(notes);
    console.log('Đã tạo 10 Ghi chú (Notes) thành công!');

    console.log('🎉 SEED DỮ LIỆU THÀNH CÔNG!');
    process.exit();
  } catch (error) {
    console.error(`Lỗi khi seed dữ liệu: ${error.message}`);
    process.exit(1);
  }
};

seedData();
