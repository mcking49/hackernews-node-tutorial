const { ApolloServer } = require('apollo-server')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const resolvers = {
  Query: {
    feed: async (parent, args, context) => {
      return context.prisma.link.findMany()
    },
    info: () => 'This is the API of a Hackernews Clone'
  },
  Mutation: {
    post: (parent, args, context, info) => {
      const newLink = context.prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        }
      })

      return newLink
    }
  },
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
  context: {
    prisma,
  }
})

server.listen().then(({ url }) => {
  console.log(`Server is running on ${url}`);
})
