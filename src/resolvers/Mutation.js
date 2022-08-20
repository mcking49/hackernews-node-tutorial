const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function login(parent, args, context, info) {
  const user = await context.prisma.user.findUnique({
    where: {
      email: args.email
    }
  })

  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function post(parent, args, context, info) {
  const { userId } = context

  const newLink = await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: {
        connect: {
          id: userId
        }
      }
    }
  })

  context.pubSub.publish("NEW_LINK", newLink)

  return newLink
}


async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10)

  const user = await context.prisma.user.create({
    data: {
      ...args,
      password
    }
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function vote(parent, args, context, info) {
  const userId = context.userId

  const vote = await context.prisma.vote.findFirst({
    where: {
      linkId: Number(args.linkId),
      userId,
    }
  })

  if (Boolean(vote)) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  const newVote = await context.prisma.vote.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      link: {
        connect: {
          id: Number(args.linkId)
        }
      }
    }
  })

  context.pubSub.publish("NEW_VOTE", newVote)

  return newVote
}

module.exports = {
  login,
  post,
  signup,
  vote,
}