const userRepository = require('../repositories/user.repository');
const generateToken = require('../utils/generateToken');
const logger = require('../utils/logger');

class AuthService {
  async register(userData) {
    const { name, email, password } = userData;
    
    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new Error('User already exists');
    }

    const user = await userRepository.create({ name, email, password });
    
    if (user) {
      logger.info(`User registered: ${user.email}`);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      };
    } else {
      throw new Error('Invalid user data');
    }
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (user && (await user.matchPassword(password))) {
      logger.info(`User logged in: ${user.email}`);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      };
    } else {
      throw new Error('Invalid email or password');
    }
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (user) {
      return user;
    } else {
      throw new Error('User not found');
    }
  }
}

module.exports = new AuthService();
