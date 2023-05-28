const validator = require('validator');
const User = require('../models/User');

module.exports = {
  createUser: async (args, req) => {
    try {
      const existingUser = await User.findOne({
        where: { email: args.userInput.email }
      });
      if (existingUser) {
        const error = new Error('すでにユーザーが存在します');
        throw error;
      }

    } catch (err) {
      console.error(err);
    }
  }
};