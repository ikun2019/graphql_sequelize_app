require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const sequelize = require('./config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('./middleware/auth');

const User = require('./models/User');
const Post = require('./models/Post');

const express = require('express');

const app = express();
app.use(express.json());

// * multerの設定
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});
// ファイルフィルター
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });
// 保存先を静的フォルダに指定
app.use('/images', express.static(path.join(__dirname, 'images')));

// * アソシエーション
User.hasMany(Post);
Post.belongsTo(User);


app.put('/post-image', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(200).json({ message: '画像がありません' });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(200).json({
    message: 'ファイルをアップロードしました',
    filePath: req.file.path,
  });
})
app.use(auth);

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err) {
    if (!err.originalError) {
      return err;
    }
    const data = err.originalError.data;
    const message = err.message || 'An error occurred.';
    const code = err.originalError.code || 500;
    return { message: message, sataus: code, data: data };
  }
}));

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running.');
    })
  });

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}