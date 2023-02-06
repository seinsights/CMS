function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/** @jsxRuntime classic */

/** @jsx jsx */
import { Fragment } from 'react';
import { Box, Stack, Text, jsx, useTheme, forwardRefWithAs, VisuallyHidden } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Button } from '@keystone-ui/button';
import { Tooltip } from '@keystone-ui/tooltip';
import { LoadingDots } from '@keystone-ui/loading';
import { useEffect, useRef, useState } from 'react';
import { getRootGraphQLFieldsFromFieldController, makeDataGetter } from '@keystone-6/core/admin-ui/utils';
import { Link } from '@keystone-6/core/admin-ui/router';
import { gql, useApolloClient } from '@keystone-6/core/admin-ui/apollo';
import { RelationshipSelect } from '../RelationshipSelect';
import { useItemState } from './useItemState';
import { InlineEdit } from './InlineEdit';
import { InlineCreate } from './InlineCreate';
const CardContainer = forwardRefWithAs(({
  mode = 'view',
  ...props
}, ref) => {
  const {
    tones
  } = useTheme();
  const tone = tones[mode === 'edit' ? 'active' : mode === 'create' ? 'positive' : 'passive'];
  return jsx(Box, _extends({
    ref: ref,
    paddingLeft: "xlarge",
    css: {
      position: 'relative',
      ':before': {
        content: '" "',
        backgroundColor: tone.border,
        borderRadius: 4,
        width: 4,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1
      }
    }
  }, props));
});
export function Cards({
  localList,
  field,
  foreignList,
  id,
  value,
  onChange,
  forceValidation
}) {
  var _displayOptions$inlin;

  const {
    displayOptions
  } = value;
  let selectedFields = [...new Set([...displayOptions.cardFields, ...(((_displayOptions$inlin = displayOptions.inlineEdit) === null || _displayOptions$inlin === void 0 ? void 0 : _displayOptions$inlin.fields) || [])])].map(fieldPath => {
    return foreignList.fields[fieldPath].controller.graphqlSelection;
  }).join('\n');

  if (!displayOptions.cardFields.includes('id')) {
    selectedFields += '\nid';
  }

  if (!displayOptions.cardFields.includes(foreignList.labelField) && foreignList.labelField !== 'id') {
    selectedFields += `\n${foreignList.labelField}`;
  }

  const {
    items,
    setItems,
    state: itemsState
  } = useItemState({
    selectedFields,
    localList,
    id,
    field
  });
  const client = useApolloClient();
  const [isLoadingLazyItems, setIsLoadingLazyItems] = useState(false);
  const [showConnectItems, setShowConnectItems] = useState(false);
  const [hideConnectItemsLabel, setHideConnectItemsLabel] = useState('Cancel');
  const editRef = useRef(null);
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  });
  useEffect(() => {
    if (value.itemsBeingEdited) {
      var _editRef$current;

      editRef === null || editRef === void 0 ? void 0 : (_editRef$current = editRef.current) === null || _editRef$current === void 0 ? void 0 : _editRef$current.focus();
    }
  }, [value]);

  if (itemsState.kind === 'loading') {
    return jsx("div", null, jsx(LoadingDots, {
      label: `Loading items for ${field.label} field`
    }));
  }

  if (itemsState.kind === 'error') {
    return jsx("span", {
      css: {
        color: 'red'
      }
    }, itemsState.message);
  }

  return jsx(Stack, {
    gap: "xlarge"
  }, jsx(Stack, {
    as: "ul",
    gap: "xlarge",
    css: {
      padding: 0,
      marginBottom: 0,
      li: {
        listStyle: 'none'
      }
    }
  }, [...value.currentIds].map((id, index) => {
    const itemGetter = items[id];
    const isEditMode = !!(onChange !== undefined) && value.itemsBeingEdited.has(id);
    return jsx(CardContainer, {
      role: "status",
      mode: isEditMode ? 'edit' : 'view',
      key: id
    }, jsx(VisuallyHidden, {
      as: "h2"
    }, `${field.label} ${index + 1} ${isEditMode ? 'edit' : 'view'} mode`), isEditMode ? jsx(InlineEdit, {
      list: foreignList,
      fields: displayOptions.inlineEdit.fields,
      onSave: newItemGetter => {
        setItems({ ...items,
          [id]: newItemGetter
        });
        const itemsBeingEdited = new Set(value.itemsBeingEdited);
        itemsBeingEdited.delete(id);
        onChange({ ...value,
          itemsBeingEdited
        });
      },
      selectedFields: selectedFields,
      itemGetter: itemGetter,
      onCancel: () => {
        const itemsBeingEdited = new Set(value.itemsBeingEdited);
        itemsBeingEdited.delete(id);
        onChange({ ...value,
          itemsBeingEdited
        });
      }
    }) : jsx(Fragment, null, jsx(Stack, {
      gap: "xlarge"
    }, displayOptions.cardFields.map(fieldPath => {
      const field = foreignList.fields[fieldPath];
      const itemForField = {};

      for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
        const fieldGetter = itemGetter.get(graphqlField);

        if (fieldGetter.errors) {
          const errorMessage = fieldGetter.errors[0].message;
          return jsx(FieldContainer, null, jsx(FieldLabel, null, field.label), errorMessage);
        }

        itemForField[graphqlField] = fieldGetter.data;
      }

      return jsx(field.views.CardValue, {
        key: fieldPath,
        field: field.controller,
        item: itemForField
      });
    })), jsx(Stack, {
      across: true,
      gap: "small",
      marginTop: "xlarge"
    }, displayOptions.inlineEdit && onChange !== undefined && jsx(Button, {
      size: "small",
      disabled: onChange === undefined,
      onClick: () => {
        onChange({ ...value,
          itemsBeingEdited: new Set([...value.itemsBeingEdited, id])
        });
      },
      tone: "active"
    }, "Edit"), displayOptions.removeMode === 'disconnect' && onChange !== undefined && jsx(Tooltip, {
      content: "This item will not be deleted. It will only be removed from this field."
    }, props => jsx(Button, _extends({
      size: "small",
      disabled: onChange === undefined,
      onClick: () => {
        const currentIds = new Set(value.currentIds);
        currentIds.delete(id);
        onChange({ ...value,
          currentIds
        });
      }
    }, props, {
      tone: "negative"
    }), "Remove")), displayOptions.linkToItem && jsx(Button, {
      size: "small",
      weight: "link",
      tone: "active",
      css: {
        textDecoration: 'none'
      },
      as: Link,
      href: `/${foreignList.path}/${id}`
    }, "View ", foreignList.singular, " details"))));
  })), onChange === undefined ? null : displayOptions.inlineConnect && showConnectItems ? jsx(CardContainer, {
    mode: "edit"
  }, jsx(Stack, {
    gap: "small",
    marginY: "medium",
    across: true,
    css: {
      width: '100%',
      justifyContent: 'space-between',
      'div:first-of-type': {
        flex: '2'
      }
    }
  }, jsx(RelationshipSelect, {
    autoFocus: true,
    controlShouldRenderValue: isLoadingLazyItems,
    isDisabled: onChange === undefined,
    list: foreignList,
    isLoading: isLoadingLazyItems,
    placeholder: `Select a ${foreignList.singular}`,
    portalMenu: true,
    state: {
      kind: 'many',

      async onChange(options) {
        // TODO: maybe use the extraSelection prop on RelationshipSelect here
        const itemsToFetchAndConnect = [];
        options.forEach(item => {
          if (!value.currentIds.has(item.id)) {
            itemsToFetchAndConnect.push(item.id);
          }
        });

        if (itemsToFetchAndConnect.length) {
          try {
            const {
              data,
              errors
            } = await client.query({
              query: gql`query ($ids: [ID!]!) {
                      items: ${foreignList.gqlNames.listQueryName}(where: { id: { in: $ids }}) {
                        ${selectedFields}
                      }
                    }`,
              variables: {
                ids: itemsToFetchAndConnect
              }
            });

            if (isMountedRef.current) {
              const dataGetters = makeDataGetter(data, errors);
              const itemsDataGetter = dataGetters.get('items');
              let newItems = { ...items
              };
              let newCurrentIds = field.many ? new Set(value.currentIds) : new Set();

              if (Array.isArray(itemsDataGetter.data)) {
                itemsDataGetter.data.forEach((item, i) => {
                  if ((item === null || item === void 0 ? void 0 : item.id) != null) {
                    newCurrentIds.add(item.id);
                    newItems[item.id] = itemsDataGetter.get(i);
                  }
                });
              }

              if (newCurrentIds.size) {
                setItems(newItems);
                onChange({ ...value,
                  currentIds: newCurrentIds
                });
                setHideConnectItemsLabel('Done');
              }
            }
          } finally {
            if (isMountedRef.current) {
              setIsLoadingLazyItems(false);
            }
          }
        }
      },

      value: (() => {
        let options = [];
        Object.keys(items).forEach(id => {
          if (value.currentIds.has(id)) {
            options.push({
              id,
              label: id
            });
          }
        });
        return options;
      })()
    }
  }), jsx(Button, {
    onClick: () => setShowConnectItems(false)
  }, hideConnectItemsLabel))) : value.itemBeingCreated ? jsx(CardContainer, {
    mode: "create"
  }, jsx(InlineCreate, {
    selectedFields: selectedFields,
    fields: displayOptions.inlineCreate.fields,
    list: foreignList,
    onCancel: () => {
      onChange({ ...value,
        itemBeingCreated: false
      });
    },
    onCreate: itemGetter => {
      const id = itemGetter.data.id;
      setItems({ ...items,
        [id]: itemGetter
      });
      onChange({ ...value,
        itemBeingCreated: false,
        currentIds: field.many ? new Set([...value.currentIds, id]) : new Set([id])
      });
    }
  })) : displayOptions.inlineCreate || displayOptions.inlineConnect ? jsx(CardContainer, {
    mode: "create"
  }, jsx(Stack, {
    gap: "small",
    marginTop: "medium",
    across: true
  }, displayOptions.inlineCreate && jsx(Button, {
    size: "small",
    disabled: onChange === undefined,
    tone: "positive",
    onClick: () => {
      onChange({ ...value,
        itemBeingCreated: true
      });
    }
  }, "Create ", foreignList.singular), displayOptions.inlineConnect && jsx(Button, {
    size: "small",
    weight: "none",
    tone: "passive",
    onClick: () => {
      setShowConnectItems(true);
      setHideConnectItemsLabel('Cancel');
    }
  }, "Link existing ", foreignList.singular))) : null, forceValidation && jsx(Text, {
    color: "red600",
    size: "small"
  }, "You must finish creating and editing any related", ' ', foreignList.label.toLowerCase(), " before saving the", ' ', localList.singular.toLowerCase()));
}