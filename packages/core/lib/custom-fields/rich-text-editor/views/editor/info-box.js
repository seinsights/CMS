import React, { useState } from 'react';
import decorators from './entity-decorator';
import { AtomicBlockUtils, EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { Drawer, DrawerController } from '@keystone-ui/modals';
import { TextInput } from '@keystone-ui/fields';
import draftConverter from '../../draft-to-api-data/draft-converter';
export function InfoBoxBlock(props) {
  const [toShowInput, setToShowInput] = useState(false);
  const {
    block,
    blockProps,
    contentState
  } = props;
  const {
    onEditStart,
    onEditFinish,
    renderBasicEditor
  } = blockProps;
  const entityKey = block.getEntityAt(0);
  const entity = contentState.getEntity(entityKey);
  const {
    title,
    body,
    rawContentState
  } = entity.getData();

  const onChange = ({
    title: newTitle,
    rawContentState: newRawContentState
  }) => {
    // close `InfoBoxInput`
    setToShowInput(false);
    onEditFinish({
      entityKey,
      entityData: {
        title: newTitle,
        body: draftConverter.convertToHtml(newRawContentState),
        rawContentState: newRawContentState
      }
    });
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InfoBoxInput, {
    renderBasicEditor: renderBasicEditor,
    title: title,
    rawContentStateForInfoBoxEditor: rawContentState,
    onChange: onChange,
    onCancel: () => {
      onEditFinish({});
      setToShowInput(false);
    },
    isOpen: toShowInput
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: '#F5F4F3',
      padding: '30px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("h2", null, title), /*#__PURE__*/React.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: body
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: () => {
      // call `onEditStart` prop as we are trying to update the InfoBox entity
      onEditStart(); // open `InfoBoxInput`

      setToShowInput(true);
    },
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-pen"
  }), /*#__PURE__*/React.createElement("span", null, "Modify"))));
}

function InfoBoxInput(props) {
  const {
    isOpen,
    onChange,
    onCancel,
    title,
    rawContentStateForInfoBoxEditor,
    renderBasicEditor
  } = props;
  const rawContentState = rawContentStateForInfoBoxEditor || {
    blocks: [],
    entityMap: {}
  };
  const [inputValue, setInputValue] = useState({
    title: title || '',
    // create an `editorState` from raw content state object
    editorStateOfBasicEditor: EditorState.createWithContent(convertFromRaw(rawContentState), decorators)
  });
  const basicEditorJsx = renderBasicEditor({
    editorState: inputValue.editorStateOfBasicEditor,
    onChange: editorStateOfBasicEditor => {
      setInputValue({
        title: inputValue.title,
        editorStateOfBasicEditor
      });
    }
  });
  return /*#__PURE__*/React.createElement(DrawerController, {
    isOpen: isOpen
  }, /*#__PURE__*/React.createElement(Drawer, {
    title: `Insert Info Box`,
    actions: {
      cancel: {
        label: 'Cancel',
        action: onCancel
      },
      confirm: {
        label: 'Confirm',
        action: () => {
          onChange({
            title: inputValue.title,
            // convert `contentState` of the `editorState` into raw content state object
            rawContentState: convertToRaw(inputValue.editorStateOfBasicEditor.getCurrentContent())
          });
        }
      }
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    onChange: e => setInputValue({
      title: e.target.value,
      editorStateOfBasicEditor: inputValue.editorStateOfBasicEditor
    }),
    type: "text",
    placeholder: "Title",
    value: inputValue.title,
    style: {
      marginTop: '30px',
      marginBottom: '10px'
    }
  }), basicEditorJsx));
}

export function InfoBoxButton(props) {
  const [toShowInput, setToShowInput] = useState(false);
  const {
    className,
    editorState,
    onChange: onEditorStateChange,
    renderBasicEditor
  } = props;

  const onChange = ({
    title,
    rawContentState
  }) => {
    const contentState = editorState.getCurrentContent(); // create an InfoBox entity

    const contentStateWithEntity = contentState.createEntity('INFOBOX', 'IMMUTABLE', {
      title,
      rawContentState,
      body: draftConverter.convertToHtml(rawContentState)
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    }); //The third parameter here is a space string, not an empty string
    //If you set an empty string, you will get an error: Unknown DraftEntity key: null

    onEditorStateChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
    setToShowInput(false);
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InfoBoxInput, {
    renderBasicEditor: renderBasicEditor,
    onChange: onChange,
    onCancel: () => {
      setToShowInput(false);
    },
    isOpen: toShowInput
  }), /*#__PURE__*/React.createElement("div", {
    className: className,
    onClick: () => {
      setToShowInput(true);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "far"
  }), /*#__PURE__*/React.createElement("span", null, "InfoBox")));
}