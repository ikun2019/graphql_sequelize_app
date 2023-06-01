const validator = require('validator');
const User = require('../models/User');
const Post = require('../models/Post');
const { clearImage } = require('../util/file');

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
  updatePost: async (args, req) => {
    try {
      if (!req.isAuth) {
        const error = new Error('認証されていません');
        error.code = 401;
        throw error;
      }
      const post = await Post.findOne({
        where: { id: args.id }
      });
      if (!post) {
        const error = new Error('postが見つかりません');
        error.code = 404;
        throw error;
      }
      post.title = args.postInput.title;
      post.content = args.postInput.content;
      if (args.postInput.imageUrl !== 'undefined') {
        post.imageUrl = args.postInput.imageUrl;
      }
      const updatedPost = await post.save();
      return updatedPost;
    } catch (err) {
      console.error(err);
    }
  },
  getPosts: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error('認証されていません');
      error.code = 401;
      throw error;
    }
    if (!args.page) {
      args.page = 1;
    }
    const perPage = 2;
    try {
      const result = await Post.findAndCountAll({
        offset: (args.page - 1) * perPage,
        limit: perPage,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [{ model: User }]
      });
      console.log(result);
      const totalPosts = result.count;
      const posts = result.rows;
      return {
        posts: posts,
        totalPosts: totalPosts,
        totalPages: Math.ceil(totalPosts / perPage),
      }
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (args, req) => {
    try {
      if (!req.isAuth) {
        const error = new Error('認証されていません');
        error.code = 404;
        throw error;
      }
      const post = await Post.findOne({
        where: { id: args.id },
        include: [{ model: User }]
      });
      if (!post) {
        const error = new Error('postが見つかりません');
        error.code = 404;
        throw error;
      }
      return post;
    } catch (err) {
      console.error(err);
    }
  },
  deletePost: async (args, req) => {
    try {
      if (!req.isAuth) {
        const error = new Error('認証されていません');
        error.code = 404;
        throw error;
      }
      const post = await Post.findOne({
        where: { id: args.id }
      });
      if (!post) {
        if (!post) {
          const error = new Error('postが見つかりません');
          error.code = 404;
          throw error;
        }
      }
      if (post.userId !== req.userId) {
        const error = new Error('認証されていません');
        error.code = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      await post.findByIdAndRemove(args.id);
      return true;
    } catch (err) {
      console.error(err);
    }
  },
};