"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validationFailureError = exports.userInputError = exports.resolverError = exports.relationshipError = exports.prismaError = exports.limitsExceededError = exports.filterAccessError = exports.extensionError = exports.accessReturnError = exports.accessDeniedError = void 0;

var _apolloServerErrors = require("apollo-server-errors");

const userInputError = msg => new _apolloServerErrors.ApolloError(`Input error: ${msg}`, 'KS_USER_INPUT_ERROR');

exports.userInputError = userInputError;

const accessDeniedError = msg => new _apolloServerErrors.ApolloError(`Access denied: ${msg}`, 'KS_ACCESS_DENIED');

exports.accessDeniedError = accessDeniedError;

const prismaError = err => {
  return new _apolloServerErrors.ApolloError(`Prisma error: ${err.message.split('\n').slice(-1)[0].trim()}`, 'KS_PRISMA_ERROR', {
    prisma: { ...err
    }
  });
};

exports.prismaError = prismaError;

const validationFailureError = messages => {
  const s = messages.map(m => `  - ${m}`).join('\n');
  return new _apolloServerErrors.ApolloError(`You provided invalid data for this operation.\n${s}`, 'KS_VALIDATION_FAILURE');
};

exports.validationFailureError = validationFailureError;

const extensionError = (extension, things) => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new _apolloServerErrors.ApolloError(`An error occured while running "${extension}".\n${s}`, 'KS_EXTENSION_ERROR', // Make the original stack traces available.
  {
    debug: things.map(t => ({
      stacktrace: t.error.stack,
      message: t.error.message
    }))
  });
};

exports.extensionError = extensionError;

const resolverError = things => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new _apolloServerErrors.ApolloError(`An error occured while resolving input fields.\n${s}`, 'KS_RESOLVER_ERROR', // Make the original stack traces available.
  {
    debug: things.map(t => ({
      stacktrace: t.error.stack,
      message: t.error.message
    }))
  });
};

exports.resolverError = resolverError;

const relationshipError = things => {
  const s = things.map(t => `  - ${t.tag}: ${t.error.message}`).join('\n');
  return new _apolloServerErrors.ApolloError(`An error occured while resolving relationship fields.\n${s}`, 'KS_RELATIONSHIP_ERROR', // Make the original stack traces available.
  {
    debug: things.map(t => ({
      stacktrace: t.error.stack,
      message: t.error.message
    }))
  });
};

exports.relationshipError = relationshipError;

const accessReturnError = things => {
  const s = things.map(t => `  - ${t.tag}: Returned: ${t.returned}. Expected: boolean.`).join('\n');
  return new _apolloServerErrors.ApolloError(`Invalid values returned from access control function.\n${s}`, 'KS_ACCESS_RETURN_ERROR');
}; // FIXME: In an upcoming PR we will use these args to construct a better
// error message, so leaving the, here for now. - TL
// eslint-disable-next-line @typescript-eslint/no-unused-vars


exports.accessReturnError = accessReturnError;

const limitsExceededError = args => new _apolloServerErrors.ApolloError('Your request exceeded server limits', 'KS_LIMITS_EXCEEDED');

exports.limitsExceededError = limitsExceededError;

const filterAccessError = ({
  operation,
  fieldKeys
}) => new _apolloServerErrors.ApolloError(`You do not have access to perform '${operation}' operations on the fields ${JSON.stringify(fieldKeys)}.`, 'KS_FILTER_DENIED');

exports.filterAccessError = filterAccessError;