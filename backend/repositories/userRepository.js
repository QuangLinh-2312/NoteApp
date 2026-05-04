const User = require('../models/User');
const NotFoundError = require('../utils/errors/NotFoundError');
const ValidationError = require('../utils/errors/ValidationError');

class UserRepository {
  async findById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByUsername(username) {
    return await User.findOne({ username });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async update(id, userData) {
    const user = await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async existsByEmail(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  async existsByUsername(username) {
    const user = await User.findOne({ username });
    return !!user;
  }
}

module.exports = new UserRepository();
