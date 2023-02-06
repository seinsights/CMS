function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/** @jsxRuntime classic */

/** @jsx jsx */
import { Fragment, useState } from 'react';
import { Button } from '@keystone-ui/button';
import { Inline, jsx, Stack, useTheme } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, FieldLegend } from '@keystone-ui/fields';
import { DrawerController } from '@keystone-ui/modals';
import { Link } from '@keystone-6/core/admin-ui/router'; // import { Link } from '../../../../admin-ui/router';

import { useKeystone, useList } from '@keystone-6/core/admin-ui/context';
import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo';
import { CellContainer, CreateItemDrawer } from '@keystone-6/core/admin-ui//components';
import { Cards } from './cards';
import { RelationshipSelect } from './RelationshipSelect';

function LinkToRelatedItems({
  itemId,
  value,
  list,
  refFieldKey
}) {
  var _value$value;

  function constructQuery({
    refFieldKey,
    itemId,
    value
  }) {
    if (!!refFieldKey && itemId) {
      return `!${refFieldKey}_matches="${itemId}"`;
    }

    return `!id_in="${(value === null || value === void 0 ? void 0 : value.value).slice(0, 100).map(({
      id
    }) => id).join(',')}"`;
  }

  const commonProps = {
    size: 'small',
    tone: 'active',
    weight: 'link'
  };

  if (value.kind === 'many') {
    const query = constructQuery({
      refFieldKey,
      value,
      itemId
    });
    return jsx(Button, _extends({}, commonProps, {
      as: Link,
      href: `/${list.path}?${query}`
    }), "View related ", list.plural);
  }

  return jsx(Button, _extends({}, commonProps, {
    as: Link,
    href: `/${list.path}/${(_value$value = value.value) === null || _value$value === void 0 ? void 0 : _value$value.id}`
  }), "View ", list.singular, " details");
}

const RelationshipLinkButton = ({
  href,
  children
}) => jsx(Button, {
  css: {
    padding: 0,
    height: 'auto'
  },
  weight: "link",
  tone: "active",
  as: Link,
  href: href
}, children);

const RelationshipDisplay = ({
  list,
  value
}) => {
  if (value.kind === 'many') {
    if (value.value.length) {
      return jsx(Inline, {
        gap: "small"
      }, value.value.map(i => jsx(RelationshipLinkButton, {
        href: `/${list.path}/${i.id}`
      }, i.label)));
    } else {
      return jsx("div", null, "(No ", list.plural, ")");
    }
  } else {
    if (value.value) {
      return jsx(RelationshipLinkButton, {
        href: `/${list.path}/${value.value.id}`
      }, value.value.label);
    } else {
      return jsx("div", null, "(No ", list.singular, ")");
    }
  }
};

export const Field = ({
  field,
  autoFocus,
  value,
  onChange,
  forceValidation
}) => {
  var _value$value2;

  const keystone = useKeystone();
  const foreignList = useList(field.refListKey);
  const localList = useList(field.listKey);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (value.kind === 'cards-view') {
    return jsx(FieldContainer, {
      as: "fieldset"
    }, jsx(FieldLegend, null, field.label), jsx(Cards, {
      forceValidation: forceValidation,
      field: field,
      id: value.id,
      value: value,
      onChange: onChange,
      foreignList: foreignList,
      localList: localList
    }));
  }

  if (value.kind === 'count') {
    return jsx(Stack, {
      as: "fieldset",
      gap: "medium"
    }, jsx(FieldLegend, null, field.label), jsx("div", null, value.count === 1 ? `There is 1 ${foreignList.singular} ` : `There are ${value.count} ${foreignList.plural} `, "linked to this ", localList.singular));
  }

  const authenticatedItem = keystone.authenticatedItem;
  const isImage = field.customConfig.isImage;
  return jsx(FieldContainer, {
    as: "fieldset"
  }, jsx(FieldLabel, {
    as: "legend"
  }, field.label), onChange ? jsx(Fragment, null, jsx(Stack, {
    gap: "medium"
  }, jsx(RelationshipSelect, {
    isImage: isImage,
    controlShouldRenderValue: true,
    autoFocus: autoFocus,
    isDisabled: onChange === undefined,
    list: foreignList,
    portalMenu: true,
    state: value.kind === 'many' ? {
      kind: 'many',
      value: value.value,

      onChange(newItems) {
        onChange({ ...value,
          value: newItems
        });
      }

    } : {
      kind: 'one',
      value: value.value,

      onChange(newVal) {
        if (value.kind === 'one') {
          onChange({ ...value,
            value: newVal
          });
        }
      }

    }
  }), jsx(Stack, {
    across: true,
    gap: "small"
  }, !field.hideCreate && jsx(Button, {
    size: "small",
    disabled: isDrawerOpen,
    onClick: () => {
      setIsDrawerOpen(true);
    }
  }, "Create related ", foreignList.singular), authenticatedItem.state === 'authenticated' && authenticatedItem.listKey === field.refListKey && (value.kind === 'many' ? value.value.find(x => x.id === authenticatedItem.id) === undefined : ((_value$value2 = value.value) === null || _value$value2 === void 0 ? void 0 : _value$value2.id) !== authenticatedItem.id) && jsx(Button, {
    size: "small",
    isDisabled: onChange === undefined,
    onClick: () => {
      const val = {
        label: authenticatedItem.label,
        id: authenticatedItem.id
      };

      if (value.kind === 'many') {
        onChange({ ...value,
          value: [...value.value, val]
        });
      } else {
        onChange({ ...value,
          value: val
        });
      }
    }
  }, value.kind === 'many' ? 'Add ' : 'Set as ', authenticatedItem.label), !!(value.kind === 'many' ? value.value.length : value.kind === 'one' && value.value) && jsx(LinkToRelatedItems, {
    itemId: value.id,
    refFieldKey: field.refFieldKey,
    list: foreignList,
    value: value
  }))), jsx(DrawerController, {
    isOpen: isDrawerOpen
  }, jsx(CreateItemDrawer, {
    listKey: foreignList.key,
    onClose: () => {
      setIsDrawerOpen(false);
    },
    onCreate: val => {
      setIsDrawerOpen(false);

      if (value.kind === 'many') {
        onChange({ ...value,
          value: [...value.value, val]
        });
      } else if (value.kind === 'one') {
        onChange({ ...value,
          value: val
        });
      }
    }
  }))) : jsx(RelationshipDisplay, {
    value: value,
    list: foreignList
  }));
};
export const Cell = ({
  field,
  item
}) => {
  const list = useList(field.refListKey);
  const {
    colors
  } = useTheme();

  if (field.display === 'count') {
    const count = item[`${field.path}Count`] ?? 0;
    return jsx(CellContainer, null, count, " ", count === 1 ? list.singular : list.plural);
  }

  const data = item[field.path];
  const items = (Array.isArray(data) ? data : [data]).filter(item => item);
  const displayItems = items.length < 5 ? items : items.slice(0, 3);
  const overflow = items.length < 5 ? 0 : items.length - 3;
  const styles = {
    color: colors.foreground,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    }
  };
  return jsx(CellContainer, null, displayItems.map((item, index) => jsx(Fragment, {
    key: item.id
  }, !!index ? ', ' : '', jsx(Link, {
    href: `/${list.path}/[id]`,
    as: `/${list.path}/${item.id}`,
    css: styles
  }, item.label || item.id))), overflow ? `, and ${overflow} more` : null);
};
export const CardValue = ({
  field,
  item
}) => {
  const list = useList(field.refListKey);
  const data = item[field.path];
  return jsx(FieldContainer, null, jsx(FieldLabel, null, field.label), (Array.isArray(data) ? data : [data]).filter(item => item).map((item, index) => jsx(Fragment, {
    key: item.id
  }, !!index ? ', ' : '', jsx(Link, {
    href: `/${list.path}/[id]`,
    as: `/${list.path}/${item.id}`
  }, item.label || item.id))));
};
export const controller = config => {
  var _config$fieldMeta, _config$fieldMeta$cus;

  const cardsDisplayOptions = config.fieldMeta.displayMode === 'cards' ? {
    cardFields: config.fieldMeta.cardFields,
    inlineCreate: config.fieldMeta.inlineCreate,
    inlineEdit: config.fieldMeta.inlineEdit,
    linkToItem: config.fieldMeta.linkToItem,
    removeMode: config.fieldMeta.removeMode,
    inlineConnect: config.fieldMeta.inlineConnect
  } : undefined;
  return {
    customConfig: {
      isImage: (_config$fieldMeta = config.fieldMeta) === null || _config$fieldMeta === void 0 ? void 0 : (_config$fieldMeta$cus = _config$fieldMeta.customConfig) === null || _config$fieldMeta$cus === void 0 ? void 0 : _config$fieldMeta$cus.isImage
    },
    refFieldKey: config.fieldMeta.refFieldKey,
    many: config.fieldMeta.many,
    listKey: config.listKey,
    path: config.path,
    label: config.label,
    display: config.fieldMeta.displayMode === 'count' ? 'count' : 'cards-or-select',
    refListKey: config.fieldMeta.refListKey,
    graphqlSelection: config.fieldMeta.displayMode === 'count' ? `${config.path}Count` : `${config.path} {
              id
              label: ${config.fieldMeta.refLabelField}
            }`,
    hideCreate: config.fieldMeta.hideCreate,
    // note we're not making the state kind: 'count' when ui.displayMode is set to 'count'.
    // that ui.displayMode: 'count' is really just a way to have reasonable performance
    // because our other UIs don't handle relationships with a large number of items well
    // but that's not a problem here since we're creating a new item so we might as well them a better UI
    defaultValue: cardsDisplayOptions !== undefined ? {
      kind: 'cards-view',
      currentIds: new Set(),
      id: null,
      initialIds: new Set(),
      itemBeingCreated: false,
      itemsBeingEdited: new Set(),
      displayOptions: cardsDisplayOptions
    } : config.fieldMeta.many ? {
      id: null,
      kind: 'many',
      initialValue: [],
      value: []
    } : {
      id: null,
      kind: 'one',
      value: null,
      initialValue: null
    },
    deserialize: data => {
      if (config.fieldMeta.displayMode === 'count') {
        return {
          id: data.id,
          kind: 'count',
          count: data[`${config.path}Count`] ?? 0
        };
      }

      if (cardsDisplayOptions !== undefined) {
        const initialIds = new Set((Array.isArray(data[config.path]) ? data[config.path] : data[config.path] ? [data[config.path]] : []).map(x => x.id));
        return {
          kind: 'cards-view',
          id: data.id,
          itemsBeingEdited: new Set(),
          itemBeingCreated: false,
          initialIds,
          currentIds: initialIds,
          displayOptions: cardsDisplayOptions
        };
      }

      if (config.fieldMeta.many) {
        let value = (data[config.path] || []).map(x => ({
          id: x.id,
          label: x.label || x.id
        }));
        return {
          kind: 'many',
          id: data.id,
          initialValue: value,
          value
        };
      }

      let value = data[config.path];

      if (value) {
        value = {
          id: value.id,
          label: value.label || value.id
        };
      }

      return {
        kind: 'one',
        id: data.id,
        value,
        initialValue: value
      };
    },
    filter: {
      Filter: ({
        onChange,
        value
      }) => {
        const foreignList = useList(config.fieldMeta.refListKey);
        const {
          filterValues,
          loading
        } = useRelationshipFilterValues({
          value,
          list: foreignList
        });
        const state = {
          kind: 'many',
          value: filterValues,

          onChange(newItems) {
            onChange(newItems.map(item => item.id).join(','));
          }

        };
        return jsx(RelationshipSelect, {
          controlShouldRenderValue: true,
          list: foreignList,
          isLoading: loading,
          isDisabled: onChange === undefined,
          state: state
        });
      },
      graphql: ({
        value
      }) => {
        const foreignIds = getForeignIds(value);

        if (config.fieldMeta.many) {
          return {
            [config.path]: {
              some: {
                id: {
                  in: foreignIds
                }
              }
            }
          };
        }

        return {
          [config.path]: {
            id: {
              in: foreignIds
            }
          }
        };
      },

      Label({
        value
      }) {
        const foreignList = useList(config.fieldMeta.refListKey);
        const {
          filterValues
        } = useRelationshipFilterValues({
          value,
          list: foreignList
        });

        if (!filterValues.length) {
          return `has no value`;
        }

        if (filterValues.length > 1) {
          const values = filterValues.map(i => i.label).join(', ');
          return `is in [${values}]`;
        }

        const optionLabel = filterValues[0].label;
        return `is ${optionLabel}`;
      },

      types: {
        matches: {
          label: 'Matches',
          initialValue: ''
        }
      }
    },

    validate(value) {
      return value.kind !== 'cards-view' || value.itemsBeingEdited.size === 0 && !value.itemBeingCreated;
    },

    serialize: state => {
      if (state.kind === 'many') {
        const newAllIds = new Set(state.value.map(x => x.id));
        const initialIds = new Set(state.initialValue.map(x => x.id));
        let disconnect = state.initialValue.filter(x => !newAllIds.has(x.id)).map(x => ({
          id: x.id
        }));
        let connect = state.value.filter(x => !initialIds.has(x.id)).map(x => ({
          id: x.id
        }));

        if (disconnect.length || connect.length) {
          let output = {};

          if (disconnect.length) {
            output.disconnect = disconnect;
          }

          if (connect.length) {
            output.connect = connect;
          }

          return {
            [config.path]: output
          };
        }
      } else if (state.kind === 'one') {
        var _state$initialValue;

        if (state.initialValue && !state.value) {
          return {
            [config.path]: {
              disconnect: true
            }
          };
        } else if (state.value && state.value.id !== ((_state$initialValue = state.initialValue) === null || _state$initialValue === void 0 ? void 0 : _state$initialValue.id)) {
          return {
            [config.path]: {
              connect: {
                id: state.value.id
              }
            }
          };
        }
      } else if (state.kind === 'cards-view') {
        let disconnect = [...state.initialIds].filter(id => !state.currentIds.has(id)).map(id => ({
          id
        }));
        let connect = [...state.currentIds].filter(id => !state.initialIds.has(id)).map(id => ({
          id
        }));

        if (config.fieldMeta.many) {
          if (disconnect.length || connect.length) {
            return {
              [config.path]: {
                connect: connect.length ? connect : undefined,
                disconnect: disconnect.length ? disconnect : undefined
              }
            };
          }
        } else if (connect.length) {
          return {
            [config.path]: {
              connect: connect[0]
            }
          };
        } else if (disconnect.length) {
          return {
            [config.path]: {
              disconnect: true
            }
          };
        }
      }

      return {};
    }
  };
};

function useRelationshipFilterValues({
  value,
  list
}) {
  var _data$items;

  const foreignIds = getForeignIds(value);
  const where = {
    id: {
      in: foreignIds
    }
  };
  const query = gql`
    query FOREIGNLIST_QUERY($where: ${list.gqlNames.whereInputName}!) {
      items: ${list.gqlNames.listQueryName}(where: $where) {
        id 
        ${list.labelField}
      }
    }
  `;
  const {
    data,
    loading
  } = useQuery(query, {
    variables: {
      where
    }
  });
  return {
    filterValues: (data === null || data === void 0 ? void 0 : (_data$items = data.items) === null || _data$items === void 0 ? void 0 : _data$items.map(item => {
      return {
        id: item.id,
        label: item[list.labelField] || item.id
      };
    })) || foreignIds.map(f => ({
      label: f,
      id: f
    })),
    loading: loading
  };
}

function getForeignIds(value) {
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',');
  }

  return [];
}