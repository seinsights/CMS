"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomFile = void 0;

var _graphqlErrors = require("../utils/graphql-errors");

var _types = require("@keystone-6/core/types");

var _core = require("@keystone-6/core");

var _utils = require("./utils");

// import { userInputError } from '../../../lib/core/graphql-errors'
const CustomFileFieldInput = _core.graphql.inputObject({
  name: 'CustomFileFieldInput',
  fields: {
    upload: _core.graphql.arg({
      type: _core.graphql.Upload
    }),
    ref: _core.graphql.arg({
      type: _core.graphql.String
    })
  }
});

const fileFields = _core.graphql.fields()({
  filename: _core.graphql.field({
    type: _core.graphql.nonNull(_core.graphql.String)
  }),
  filesize: _core.graphql.field({
    type: _core.graphql.nonNull(_core.graphql.Int)
  }),
  ref: _core.graphql.field({
    type: _core.graphql.nonNull(_core.graphql.String),

    resolve(data) {
      return (0, _utils.getFileRef)(data.mode, data.filename);
    }

  }),
  url: _core.graphql.field({
    type: _core.graphql.nonNull(_core.graphql.String),

    resolve(data, args, context) {
      if (!context.files) {
        throw new Error('File context is undefined, this most likely means that you havent configurd keystone with a file config, see https://keystonejs.com/docs/apis/config#files for details');
      }

      return context.files.getUrl(data.mode, data.filename);
    }

  })
});

const CustomFileFieldOutput = _core.graphql.interface()({
  name: 'CustomFileFieldOutput',
  fields: fileFields,
  resolveType: val => val.mode === 'local' ? 'LocalCustomFileFieldOutput' : 'CloudCustomFileFieldOutput'
});

const LocalCustomFileFieldOutput = _core.graphql.object()({
  name: 'LocalCustomFileFieldOutput',
  interfaces: [CustomFileFieldOutput],
  fields: fileFields
});

const CloudCustomFileFieldOutput = _core.graphql.object()({
  name: 'CloudCustomFileFieldOutput',
  interfaces: [CustomFileFieldOutput],
  fields: fileFields
});

async function inputResolver(data, context) {
  if (data === null || data === undefined) {
    return {
      mode: data,
      filename: data,
      filesize: data
    };
  }

  if (data.ref) {
    if (data.upload) {
      throw (0, _graphqlErrors.userInputError)('Only one of ref and upload can be passed to CustomFileFieldInput');
    }

    return context.files.getDataFromRef(data.ref);
  }

  if (!data.upload) {
    throw (0, _graphqlErrors.userInputError)('Either ref or upload must be passed to CustomFileFieldInput');
  }

  const upload = await data.upload;
  return context.files.getDataFromStream(upload.createReadStream(), upload.filename);
}

const CustomFile = (config = {}) => () => {
  var _config$customConfig;

  if (config.isIndexed === 'unique') {
    throw Error("isIndexed: 'unique' is not a supported option for field type file");
  }

  return (0, _types.fieldType)({
    customConfig: {
      isImage: ((_config$customConfig = config.customConfig) === null || _config$customConfig === void 0 ? void 0 : _config$customConfig.fileType) || 'file'
    },
    kind: 'multi',
    fields: {
      filesize: {
        kind: 'scalar',
        scalar: 'Int',
        mode: 'optional'
      },
      mode: {
        kind: 'scalar',
        scalar: 'String',
        mode: 'optional'
      },
      filename: {
        kind: 'scalar',
        scalar: 'String',
        mode: 'optional'
      }
    }
  })({ ...config,
    input: {
      create: {
        arg: _core.graphql.arg({
          type: CustomFileFieldInput
        }),
        resolve: inputResolver
      },
      update: {
        arg: _core.graphql.arg({
          type: CustomFileFieldInput
        }),
        resolve: inputResolver
      }
    },
    output: _core.graphql.field({
      type: CustomFileFieldOutput,

      resolve({
        value: {
          filesize,
          filename,
          mode
        }
      }) {
        if (filesize === null || filename === null || mode === null || mode !== 'local' && mode !== 'cloud') {
          return null;
        }

        return {
          mode,
          filename,
          filesize
        };
      }

    }),
    unreferencedConcreteInterfaceImplementations: [LocalCustomFileFieldOutput, CloudCustomFileFieldOutput],
    views: require.resolve('./views'),

    getAdminMeta() {
      return {
        customConfig: {
          fileType: config.customConfig.fileType
        }
      };
    }

  });
};

exports.CustomFile = CustomFile;