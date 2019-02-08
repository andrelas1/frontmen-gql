import { SchemaDirectiveVisitor, AuthenticationError } from 'apollo-server'

export class Auth extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const oldResolve = field.resolve

    field.resolve = function(root, args, ctx, info) {
      if (!ctx.isAuth) {
        throw new AuthenticationError('NOT AUTH')
      }
      return oldResolve.call(this, root, args, ctx, info)
    }
  }
}
