"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.richTextEditor = void 0;

var _types = require("@keystone-6/core/types");

var _core = require("@keystone-6/core");

const richTextEditor = ({
  defaultValue = null,
  disabledButtons = [],
  ...config
} = {}) => meta => {
  var _config$db;

  if (config.isIndexed === 'unique') {
    throw Error("isIndexed: 'unique' is not a supported option for field type textEditor");
  }

  const resolve = val => val === null && meta.provider === 'postgresql' ? 'DbNull' : val;

  return (0, _types.jsonFieldTypePolyfilledForSQLite)(meta.provider, { ...config,
    input: {
      create: {
        arg: _core.graphql.arg({
          type: _core.graphql.JSON
        }),

        resolve(val) {
          return resolve(val === undefined ? defaultValue : val);
        }

      },
      update: {
        arg: _core.graphql.arg({
          type: _core.graphql.JSON
        }),
        resolve
      }
    },
    output: _core.graphql.field({
      type: _core.graphql.JSON
    }),
    views: require.resolve('./views'),
    getAdminMeta: () => ({
      defaultValue,
      disabledButtons
    })
  }, {
    default: defaultValue === null ? undefined : {
      kind: 'literal',
      value: JSON.stringify(defaultValue)
    },
    map: (_config$db = config.db) === null || _config$db === void 0 ? void 0 : _config$db.map
  });
};

exports.richTextEditor = richTextEditor;