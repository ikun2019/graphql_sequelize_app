const { buildSchema } = require('graphql');

module.exports = buildSchema(`

  """Type"""
  type TestData {
    text: String!
    views: Int!
  }

  """RootQuery"""
  type RootQuery {
    hello: TestData!
  }

  """Schema"""
  schema {
    query: RootQuery
  }
`);