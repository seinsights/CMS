"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CustomRelationship = void 0;

var _types = require("@keystone-6/core/types");

var _core = require("@keystone-6/core");

const CustomRelationship = ({
  ref,
  ...config
}) => meta => {
  var _config$db2, _config$customConfig3;

  const {
    many = false
  } = config;
  const [foreignListKey, foreignFieldKey] = ref.split('.');
  const commonConfig = { ...config,
    views: require.resolve('./views'),
    getAdminMeta: adminMetaRoot => {
      var _config$ui, _config$customConfig, _config$ui2, _config$ui3, _config$ui4;

      if (!meta.lists[foreignListKey]) {
        throw new Error(`The ref [${ref}] on relationship [${meta.listKey}.${meta.fieldKey}] is invalid`);
      }

      if (((_config$ui = config.ui) === null || _config$ui === void 0 ? void 0 : _config$ui.displayMode) === 'cards') {
        // we're checking whether the field which will be in the admin meta at the time that getAdminMeta is called.
        // in newer versions of keystone, it will be there and it will not be there for older versions of keystone.
        // this is so that relationship fields doesn't break in confusing ways
        // if people are using a slightly older version of keystone
        const currentField = adminMetaRoot.listsByKey[meta.listKey].fields.find(x => x.path === meta.fieldKey);

        if (currentField) {
          const allForeignFields = new Set(adminMetaRoot.listsByKey[foreignListKey].fields.map(x => x.path));

          for (const [configOption, foreignFields] of [['ui.cardFields', config.ui.cardFields], ['ui.inlineCreate.fields', ((_config$ui$inlineCrea = config.ui.inlineCreate) === null || _config$ui$inlineCrea === void 0 ? void 0 : _config$ui$inlineCrea.fields) ?? []], ['ui.inlineEdit.fields', ((_config$ui$inlineEdit = config.ui.inlineEdit) === null || _config$ui$inlineEdit === void 0 ? void 0 : _config$ui$inlineEdit.fields) ?? []]]) {
            var _config$ui$inlineCrea, _config$ui$inlineEdit;

            for (const foreignField of foreignFields) {
              if (!allForeignFields.has(foreignField)) {
                throw new Error(`The ${configOption} option on the relationship field at ${meta.listKey}.${meta.fieldKey} includes the "${foreignField}" field but that field does not exist on the "${foreignListKey}" list`);
              }
            }
          }
        }
      }

      return {
        customConfig: {
          isImage: (_config$customConfig = config.customConfig) === null || _config$customConfig === void 0 ? void 0 : _config$customConfig.isImage
        },
        refFieldKey: foreignFieldKey,
        refListKey: foreignListKey,
        many,
        hideCreate: ((_config$ui2 = config.ui) === null || _config$ui2 === void 0 ? void 0 : _config$ui2.hideCreate) ?? false,
        ...(((_config$ui3 = config.ui) === null || _config$ui3 === void 0 ? void 0 : _config$ui3.displayMode) === 'cards' ? {
          displayMode: 'cards',
          cardFields: config.ui.cardFields,
          linkToItem: config.ui.linkToItem ?? false,
          removeMode: config.ui.removeMode ?? 'disconnect',
          inlineCreate: config.ui.inlineCreate ?? null,
          inlineEdit: config.ui.inlineEdit ?? null,
          inlineConnect: config.ui.inlineConnect ?? false,
          refLabelField: adminMetaRoot.listsByKey[foreignListKey].labelField
        } : ((_config$ui4 = config.ui) === null || _config$ui4 === void 0 ? void 0 : _config$ui4.displayMode) === 'count' ? {
          displayMode: 'count'
        } : {
          displayMode: 'select',
          refLabelField: adminMetaRoot.listsByKey[foreignListKey].labelField
        })
      };
    }
  };

  if (!meta.lists[foreignListKey]) {
    throw new Error(`Unable to resolve related list '${foreignListKey}' from ${meta.listKey}.${meta.fieldKey}`);
  }

  const listTypes = meta.lists[foreignListKey].types;

  if (config.many) {
    var _config$db, _config$customConfig2;

    return (0, _types.fieldType)({
      kind: 'relation',
      mode: 'many',
      list: foreignListKey,
      field: foreignFieldKey,
      relationName: (_config$db = config.db) === null || _config$db === void 0 ? void 0 : _config$db.relationName,
      customConfig: {
        isImage: ((_config$customConfig2 = config.customConfig) === null || _config$customConfig2 === void 0 ? void 0 : _config$customConfig2.isImage) || false
      }
    })({ ...commonConfig,
      input: {
        where: {
          arg: _core.graphql.arg({
            type: listTypes.relateTo.many.where
          }),

          resolve(value, context, resolve) {
            return resolve(value);
          }

        },
        create: listTypes.relateTo.many.create && {
          arg: _core.graphql.arg({
            type: listTypes.relateTo.many.create
          }),

          async resolve(value, context, resolve) {
            return resolve(value);
          }

        },
        update: listTypes.relateTo.many.update && {
          arg: _core.graphql.arg({
            type: listTypes.relateTo.many.update
          }),

          async resolve(value, context, resolve) {
            return resolve(value);
          }

        }
      },
      output: _core.graphql.field({
        args: listTypes.findManyArgs,
        type: _core.graphql.list(_core.graphql.nonNull(listTypes.output)),

        resolve({
          value
        }, args) {
          return value.findMany(args);
        }

      }),
      extraOutputFields: {
        [`${meta.fieldKey}Count`]: _core.graphql.field({
          type: _core.graphql.Int,
          args: {
            where: _core.graphql.arg({
              type: _core.graphql.nonNull(listTypes.where),
              defaultValue: {}
            })
          },

          resolve({
            value
          }, args) {
            return value.count({
              where: args.where
            });
          }

        })
      }
    });
  }

  return (0, _types.fieldType)({
    kind: 'relation',
    mode: 'one',
    list: foreignListKey,
    field: foreignFieldKey,
    foreignKey: (_config$db2 = config.db) === null || _config$db2 === void 0 ? void 0 : _config$db2.foreignKey,
    customConfig: {
      isImage: ((_config$customConfig3 = config.customConfig) === null || _config$customConfig3 === void 0 ? void 0 : _config$customConfig3.isImage) || false
    }
  })({ ...commonConfig,
    input: {
      where: {
        arg: _core.graphql.arg({
          type: listTypes.where
        }),

        resolve(value, context, resolve) {
          return resolve(value);
        }

      },
      create: listTypes.relateTo.one.create && {
        arg: _core.graphql.arg({
          type: listTypes.relateTo.one.create
        }),

        async resolve(value, context, resolve) {
          return resolve(value);
        }

      },
      update: listTypes.relateTo.one.update && {
        arg: _core.graphql.arg({
          type: listTypes.relateTo.one.update
        }),

        async resolve(value, context, resolve) {
          return resolve(value);
        }

      }
    },
    output: _core.graphql.field({
      type: listTypes.output,

      resolve({
        value
      }) {
        return value();
      }

    })
  });
};

exports.CustomRelationship = CustomRelationship;