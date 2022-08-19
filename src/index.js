const { ApolloServer } = require('apollo-server')
const fs = require('fs')
const path = require('path')

const resolvers = {
  Query: {
    feed: () => links,
    info: () => 'This is the API of a Hackernews Clone'
  },
  Mutation: {
    post: (parent, args) => {
      const idCount = links.length

      const link = {
        id: `link-${idCount+1}`,
        description: args.description,
        url: args.url,
      }

      links.push(link)
      return link
    }
  },
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'schema.graphql'),
    'utf8'
  ),
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server is running on ${url}`);
})

const links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]