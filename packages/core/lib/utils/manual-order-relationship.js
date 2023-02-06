"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fields = require("@keystone-6/core/fields");

/**
 * For `relationship` field, KeystoneJS won't take user input order into account.
 * Therefore, after the create/update operation is done,
 * the order of relationship items maybe not be the same order as the user input order.
 *
 * This function
 * - adds monitoring fields in the list
 * - decorate `list.hooks.resolveInput` to record the user input order in the monitoring fields
 *
 * For example, if we have two lists like
 *  ```
 *  const User = {
 *    fields: {
 *      name: text(),
 *    }
 *  }
 *
 *  const Post = {
 *    fields: {
 *      title: text(),
 *      content: text(),
 *      authors: relationship({ref: 'User', many: true})
 *    }
 *  }
 *  ```
 *
 *  if we want to snapshot the authors input order, we can use this function like
 *  ```
 *  const postList = addManualOrderRelationshipFields([
 *    {
 *      fieldName: 'manualOrderOfAuthors',
 *      fieldLabel: 'authors 手動排序結果',
 *      targetFieldName: 'authors', // the target field to record the user input order
 *      targetListName: 'User', // relationship list name
 *      targetListLabelField: 'name', // refer to `User.fields.name`
 *    }
 *  ])(Post)
 *  ```
 *
 *  `addManualOrderRelationshipFields` will create another field `manualOrderOfAuthors`
 *  in the list, and decorate `list.hooks.resolveInput` to record the update/create operation
 *  if the operation modifies the order of the relationship field.
 *
 */
function addManualOrderRelationshipFields(manualOrderFields = [], list) {
  var _list$hooks;

  manualOrderFields.forEach(mo => {
    var _list$fields;

    if (!((_list$fields = list.fields) !== null && _list$fields !== void 0 && _list$fields[mo.fieldName])) {
      list.fields[mo.fieldName] = (0, _fields.json)({
        label: mo.fieldLabel,
        ui: {
          itemView: {
            fieldMode: 'read'
          }
        }
      });
    }
  });
  list.hooks = list.hooks || {};
  const originResolveInput = (_list$hooks = list.hooks) === null || _list$hooks === void 0 ? void 0 : _list$hooks.resolveInput;

  list.hooks.resolveInput = async props => {
    let resolvedData = props.resolvedData;

    if (typeof originResolveInput === 'function') {
      resolvedData = await originResolveInput(props);
    }

    const {
      item,
      context
    } = props;

    for (let i = 0; i < manualOrderFields.length; i++) {
      var _resolvedData;

      const {
        targetFieldName,
        fieldName,
        targetListName,
        targetListLabelField
      } = manualOrderFields[i]; // if create/update operation modifies the `specialfeatures` field

      if ((_resolvedData = resolvedData) !== null && _resolvedData !== void 0 && _resolvedData[targetFieldName]) {
        var _resolvedData$targetF3, _resolvedData$targetF4;

        let currentOrder = []; // update operation due to `item` not being `undefiend`

        if (item) {
          var _resolvedData$targetF, _resolvedData$targetF2;

          const previousOrder = Array.isArray(item[fieldName]) ? item[fieldName] : []; // user disconnects/removes some relationship items.

          const disconnectIds = ((_resolvedData$targetF = resolvedData[targetFieldName]) === null || _resolvedData$targetF === void 0 ? void 0 : (_resolvedData$targetF2 = _resolvedData$targetF.disconnect) === null || _resolvedData$targetF2 === void 0 ? void 0 : _resolvedData$targetF2.map(obj => obj.id.toString())) || []; // filtered out to-be-disconnected relationship items

          currentOrder = previousOrder.filter(({
            id
          }) => {
            return disconnectIds.indexOf(id) === -1;
          });
        } // user connects/adds some relationship item.


        const connectedIds = ((_resolvedData$targetF3 = resolvedData[targetFieldName]) === null || _resolvedData$targetF3 === void 0 ? void 0 : (_resolvedData$targetF4 = _resolvedData$targetF3.connect) === null || _resolvedData$targetF4 === void 0 ? void 0 : _resolvedData$targetF4.map(obj => obj.id.toString())) || [];

        if (connectedIds.length > 0) {
          // Query relationship items from the database.
          // Therefore, we can have other fields to record in the monitoring field
          const sfToConnect = await context.db[targetListName].findMany({
            where: {
              id: {
                in: connectedIds
              }
            }
          }); // Database query results are not sorted.
          // We need to sort them by ourselves.

          for (let i = 0; i < connectedIds.length; i++) {
            const sf = sfToConnect.find(obj => {
              return `${obj.id}` === connectedIds[i];
            });

            if (sf) {
              currentOrder.push({
                id: sf.id.toString(),
                [targetListLabelField]: sf[targetListLabelField]
              });
            }
          }
        } // records the order in the monitoring field


        resolvedData[fieldName] = currentOrder;
      }
    }

    return resolvedData;
  };

  return list;
}

var _default = addManualOrderRelationshipFields;
exports.default = _default;