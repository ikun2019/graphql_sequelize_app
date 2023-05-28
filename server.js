require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const sequelize = require('./config/db');

const User = require('./models/User');
const Post = require('./models/Post');

const express = require('express');

const app = express();
app.use(express.json());

// アソシエーション
User.hasMany(Post);
Post.belongsTo(User);

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
}));

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running.');
    })
  });