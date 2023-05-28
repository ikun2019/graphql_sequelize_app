const validator = require('validator');
const User = require('../models/User');

module.exports = {
  createUser: async (args, req) => {
    try {
      const errors = [];
      if (!validator.isEmail(args.userInput.email)) {
        errors.push({ message: 'Emailが入力されていません' });
      };
      if (validator.isEmpty(args.userInput.password) || !validator.isLength(args.userInput.password, { min: 5 })) {
        errors.push({ message: 'パスワードは5文字以上必要です' });
      }
      if (errors.length > 0) {
        const error = new Error('エラーがあります');
        error.data = errors;
        error.code = 422;
        throw error;
      }

      const existingUser = await User.findOne({
        where: { email: args.userInput.email }
      });
      if (existingUser) {
        const error = new Error('すでにユーザーが存在します');
        throw error;
      }
      const user = new User({
        name: args.userInput.name,
        email: args.userInput.email,
        password: args.userInput.password,
      });
      await user.save();
      return user;
    } catch (err) {
      console.error(err);
    }
  }
};