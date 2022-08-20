const { ApolloServer } = require('apollo-server')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { getUserId } = require('./utils')
const Link = require('./resolvers/Link')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const Subscription = require('./resolvers/Subscription')
const User = require('./resolvers/User')
const Vote = require('./resolvers/Vote')
const { PubSub } = require('apollo-server')

const prisma = new PrismaClient()
const pubSub = new PubSub()

const resolvers = {
  Link,
  Mutation,
  Query,
  Subscription,
  User,
  Vote,
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubSub,
      userId: req && req.headers.authorization ? getUserId(req) : null
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server is running on ${url}`);
})
