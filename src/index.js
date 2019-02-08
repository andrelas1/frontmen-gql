import { ApolloServer } from 'apollo-server'
import gql from 'graphql-tag'
import fetch from 'node-fetch'
import { Auth } from './auth'

const db = []

const typeDefs = gql`
  directive @auth on FIELD_DEFINITION
  type User {
    name: String
    id: ID
    todos: [Todo]
    joke: Joke @auth
  }

  type Joke {
    joke: String
    icon: String
  }

  type Todo {
    name: String
    done: Boolean
    user: User
  }

  input NewTodoInput {
    name: String
  }

  input NewCoolTodoInput {
    name: String
    done: Boolean
  }

  type Query {
    oneTodo(name: String): Todo
    todos: [Todo]!
  }

  type Mutation {
    newTodo(input: NewTodoInput!): Todo
    coolTodo(input: NewCoolTodoInput!): Todo
  }
`

const resolvers = {
  Query: {
    oneTodo(_, args, context, info) {
      console.log('ARGS', args)
      return db.filter(todo => todo.name === args.name)[0]
    },
    todos() {
      return db
    }
  },
  Mutation: {
    newTodo(_, args, context, info) {
      const newTodo = {
        name: args.input.name,
        done: false,
        user: {}
      }
      db.push(newTodo)

      return newTodo
    },
    coolTodo(_, args, contexts, info) {
      return args.input
    }
  },
  User: {
    name() {
      return 'Andre'
    },
    todos() {
      return db
    },
    async joke() {
      const joke = await fetch('https://api.chucknorris.io/jokes/random')
        .then(resp => resp.json())
        .then(joke => ({ joke: joke.value, icon: joke.icon_url }))
      console.log('RESPO', joke)
      return joke
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  context: ({ req }) => {
    return {
      isAuth: req.headers.authorization
    }
  },
  schemaDirectives: {
    auth: Auth
  }
})

server
  .listen()
  .then(() => {
    console.log('running')
  })
  .catch(() => {
    console.log('err')
  })
