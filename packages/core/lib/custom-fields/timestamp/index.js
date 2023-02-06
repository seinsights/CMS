"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomTimestamp = void 0;

var _utils = require("../utils/text/utils");

var _types = require("@keystone-6/core/types");

var _core = require("@keystone-6/core");

var _nonNullGraphql = require("../utils/non-null-graphql");

const CustomTimestamp = ({
  isIndexed,
  validation,
  defaultValue,
  ...config
} = {}) => meta => {
  var _config$customConfig, _config$customConfig2, _config$db, _config$db2, _config$graphql, _config$graphql$creat, _config$graphql2, _config$graphql2$crea, _config$graphql3, _config$graphql3$read;

  if (typeof defaultValue === 'string') {
    try {
      _core.graphql.DateTime.graphQLType.parseValue(defaultValue);
    } catch (err) {
      throw new Error(`The timestamp field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: ${defaultValue} but values must be provided as a full ISO8601 date-time string such as ${new Date().toISOString()}`);
    }
  }

  const parsedDefaultValue = typeof defaultValue === 'string' ? _core.graphql.DateTime.graphQLType.parseValue(defaultValue) : defaultValue;
  const resolvedIsNullable = (0, _nonNullGraphql.getResolvedIsNullable)(validation, config.db);
  (0, _nonNullGraphql.assertReadIsNonNullAllowed)(meta, config, resolvedIsNullable);
  (0, _nonNullGraphql.assertCreateIsNonNullAllowed)(meta, config);
  const mode = resolvedIsNullable === false ? 'required' : 'optional';
  const fieldLabel = config.label ?? (0, _utils.humanize)(meta.fieldKey);
  return (0, _types.fieldType)({
    customConfig: {
      hasNowButton: config === null || config === void 0 ? void 0 : (_config$customConfig = config.customConfig) === null || _config$customConfig === void 0 ? void 0 : _config$customConfig.hasNowButton,
      hideTime: config === null || config === void 0 ? void 0 : (_config$customConfig2 = config.customConfig) === null || _config$customConfig2 === void 0 ? void 0 : _config$customConfig2.hideTime
    },
    kind: 'scalar',
    mode,
    scalar: 'DateTime',
    index: isIndexed === true ? 'index' : isIndexed || undefined,
    default: typeof defaultValue === 'string' ? {
      kind: 'literal',
      value: defaultValue
    } : defaultValue === undefined ? undefined : {
      kind: 'now'
    },
    updatedAt: (_config$db = config.db) === null || _config$db === void 0 ? void 0 : _config$db.updatedAt,
    map: (_config$db2 = config.db) === null || _config$db2 === void 0 ? void 0 : _config$db2.map
  })({ ...config,
    hooks: { ...config.hooks,

      async validateInput(args) {
        var _config$hooks, _config$hooks$validat;

        const value = args.resolvedData[meta.fieldKey];

        if ((validation !== null && validation !== void 0 && validation.isRequired || resolvedIsNullable === false) && value === null) {
          args.addValidationError(`${fieldLabel} is required`);
        }

        await ((_config$hooks = config.hooks) === null || _config$hooks === void 0 ? void 0 : (_config$hooks$validat = _config$hooks.validateInput) === null || _config$hooks$validat === void 0 ? void 0 : _config$hooks$validat.call(_config$hooks, args));
      }

    },
    input: {
      uniqueWhere: isIndexed === 'unique' ? {
        arg: _core.graphql.arg({
          type: _core.graphql.DateTime
        })
      } : undefined,
      where: {
        arg: _core.graphql.arg({
          type: _types.filters[meta.provider].DateTime[mode]
        }),
        resolve: mode === 'optional' ? _types.filters.resolveCommon : undefined
      },
      create: {
        arg: _core.graphql.arg({
          type: (_config$graphql = config.graphql) !== null && _config$graphql !== void 0 && (_config$graphql$creat = _config$graphql.create) !== null && _config$graphql$creat !== void 0 && _config$graphql$creat.isNonNull ? _core.graphql.nonNull(_core.graphql.DateTime) : _core.graphql.DateTime,
          defaultValue: (_config$graphql2 = config.graphql) !== null && _config$graphql2 !== void 0 && (_config$graphql2$crea = _config$graphql2.create) !== null && _config$graphql2$crea !== void 0 && _config$graphql2$crea.isNonNull && parsedDefaultValue instanceof Date ? parsedDefaultValue : undefined
        }),

        resolve(val) {
          if (val === undefined) {
            var _config$db3;

            if (parsedDefaultValue === undefined && (_config$db3 = config.db) !== null && _config$db3 !== void 0 && _config$db3.updatedAt) {
              return undefined;
            }

            if (parsedDefaultValue instanceof Date || parsedDefaultValue === undefined) {
              val = parsedDefaultValue ?? null;
            } else {
              val = new Date();
            }
          }

          return val;
        }

      },
      update: {
        arg: _core.graphql.arg({
          type: _core.graphql.DateTime
        })
      },
      orderBy: {
        arg: _core.graphql.arg({
          type: _types.orderDirectionEnum
        })
      }
    },
    output: _core.graphql.field({
      type: (_config$graphql3 = config.graphql) !== null && _config$graphql3 !== void 0 && (_config$graphql3$read = _config$graphql3.read) !== null && _config$graphql3$read !== void 0 && _config$graphql3$read.isNonNull ? _core.graphql.nonNull(_core.graphql.DateTime) : _core.graphql.DateTime
    }),
    views: require.resolve('./views'),

    getAdminMeta() {
      var _config$customConfig3, _config$customConfig4, _config$db4;

      return {
        customConfig: {
          hasNowButton: (config === null || config === void 0 ? void 0 : (_config$customConfig3 = config.customConfig) === null || _config$customConfig3 === void 0 ? void 0 : _config$customConfig3.hasNowButton) || false,
          hideTime: (config === null || config === void 0 ? void 0 : (_config$customConfig4 = config.customConfig) === null || _config$customConfig4 === void 0 ? void 0 : _config$customConfig4.hideTime) || false
        },
        defaultValue: defaultValue ?? null,
        isRequired: (validation === null || validation === void 0 ? void 0 : validation.isRequired) ?? false,
        updatedAt: ((_config$db4 = config.db) === null || _config$db4 === void 0 ? void 0 : _config$db4.updatedAt) ?? false
      };
    }

  });
};

exports.CustomTimestamp = CustomTimestamp;