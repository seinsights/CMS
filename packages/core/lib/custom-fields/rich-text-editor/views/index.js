import React from 'react';
import { Stack } from '@keystone-ui/core'; // eslint-disable-line

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { RichTextEditor } from './editor';
import decorators from './editor/entity-decorator';
export const Field = ({
  field,
  value,
  onChange,
  autoFocus // eslint-disable-line

}) => {
  return /*#__PURE__*/React.createElement(FieldContainer, null, /*#__PURE__*/React.createElement(FieldLabel, null, field.label, /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement(RichTextEditor, {
    disabledButtons: field.disabledButtons,
    editorState: value,
    onChange: editorState => onChange === null || onChange === void 0 ? void 0 : onChange(editorState)
  }))));
};
export const Cell = ({
  item,
  field,
  linkTo
}) => {
  const value = item[field.path] + '';
  return linkTo ? /*#__PURE__*/React.createElement(CellLink, linkTo, value) : /*#__PURE__*/React.createElement(CellContainer, null, value);
};
Cell.supportsLinkTo = true;
export const CardValue = ({
  item,
  field
}) => {
  return /*#__PURE__*/React.createElement(FieldContainer, null, /*#__PURE__*/React.createElement(FieldLabel, null, field.label), item[field.path]);
};
export const controller = config => {
  var _config$fieldMeta;

  return {
    disabledButtons: ((_config$fieldMeta = config.fieldMeta) === null || _config$fieldMeta === void 0 ? void 0 : _config$fieldMeta.disabledButtons) ?? [],
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: EditorState.createEmpty(decorators),
    deserialize: data => {
      const rawContentState = data[config.path];

      if (rawContentState === null) {
        return EditorState.createEmpty(decorators);
      }

      try {
        const contentState = convertFromRaw(rawContentState);
        const editorState = EditorState.createWithContent(contentState, decorators);
        return editorState;
      } catch (err) {
        console.error(err);
        return EditorState.createEmpty(decorators);
      }
    },
    serialize: editorState => {
      if (!editorState) {
        return {
          [config.path]: null
        };
      }

      try {
        const rawContentState = convertToRaw(editorState.getCurrentContent());
        return {
          [config.path]: rawContentState
        };
      } catch (err) {
        console.error(err);
        return {
          [config.path]: null
        };
      }
    }
  };
};