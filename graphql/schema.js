const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  """Type"""
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }

  """Input"""
  input UserInputData {
    name: String!
    email: String!
    password: String!
  }

  """Root Query"""
  type RootQuery {
    getUser(id: ID!): User!
  }

  """Root Mutation"""
  type RootMutation {
    createUser(userInput: UserInputData!): User!
  }

  """Schema"""
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);