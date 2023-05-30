require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const sequelize = require('./config/db');
const auth = require('./middleware/auth');

const User = require('./models/User');
const Post = require('./models/Post');

const express = require('express');

const app = express();
app.use(express.json());

// アソシエーション
User.hasMany(Post);
Post.belongsTo(User);

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
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running.');
    })
  });