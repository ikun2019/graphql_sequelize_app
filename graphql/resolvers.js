const validator = require('validator');
const User = require('../models/User');
const Post = require('../models/Post');

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
  },
  loginUser: async (args, req) => {
    console.log(args);
    try {
      const user = await User.findOne({
        email: { email: args.email }
      });
      if (!user) {
        const error = new Error('ユーザーが存在しません');
        throw error;
      }
      const isMatch = await user.comparePassword(args.password);
      if (!isMatch) {
        const error = new Error('パスワードが違います');
        throw error;
      }
      const token = await user.getSignedJwtToken();
      return {
        token,
        user,
      };
    } catch (err) {
      console.error(err);
    }
  },
  createPost: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error('認証されていません');
      error.code = 401;
      throw error;
    };
    try {
      const user = await User.findOne({
        where: { id: req.userId }
      });
      // const post = new Post({
      //   title: args.postInput.title,
      //   content: args.postInput.content,
      //   imageUrl: args.postInput.imageUrl,
      //   creator: user,
      // });
      // const newPost = await post.save();
      const newPost = await user.createPost({
        title: args.postInput.title,
        content: args.postInput.content,
        imageUrl: args.postInput.imageUrl,
      });
      // user.posts.push(newPost);
      // await user.save();
      return newPost;
    } catch (err) {
      console.error(err);
    }
  },
  posts: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error('認証されていません');
      error.code = 401;
      throw error;
    }
    try {
      const result = await Post.findAndCountAll({
        include: [{ model: User }]
      });
      console.log(result);
      const totalPosts = result.count;
      const posts = result.rows;
      return {
        posts: posts,
        totalPosts: totalPosts,
      }
    } catch (err) {
      console.log(err);
    }
  },
};