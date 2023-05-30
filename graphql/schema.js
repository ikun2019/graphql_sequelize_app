const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  """Type"""
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    imageUrl: String!
  }
  type AuthData {
    token: String!
    user: User!
  }
  type PostData {
    posts: [Post!]!
    totalPosts: Int!
  }

  """Input"""
  input UserInputData {
    name: String!
    email: String!
    password: String!
  }
  input PostInputData {
    title: String!
    content: String!
    imageUrl: String!
  }

  """Root Query"""
  type RootQuery {
    getUser(id: ID!): User!
    posts: PostData!
  }

  """Root Mutation"""
  type RootMutation {
    createUser(userInput: UserInputData!): User!
    loginUser(email: String!, password: String!): AuthData!
    createPost(postInput: PostInputData): Post!
  }

  """Schema"""
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);