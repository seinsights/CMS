import React, { useState } from 'react';
import { ImageSelector } from './image';
import { AtomicBlockUtils, EditorState } from 'draft-js';
const styles = {
  image: {
    width: '100%'
  },
  slideshow: {
    moreBt: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      borderRadius: '100%',
      border: 'black 1px solid',
      transform: 'translate(-50%, -50%)',
      padding: '10px',
      backgroundColor: 'white'
    }
  },
  buttons: {
    marginBottom: 10,
    display: 'flex'
  },
  button: {
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer'
  }
};
export function SlideshowBlock(entity) {
  var _images$, _images$$resized;

  const images = entity.getData();
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: images === null || images === void 0 ? void 0 : (_images$ = images[0]) === null || _images$ === void 0 ? void 0 : (_images$$resized = _images$.resized) === null || _images$$resized === void 0 ? void 0 : _images$$resized.original,
    style: styles.image,
    onError: e => {
      var _images$2, _images$2$imageFile;

      return e.currentTarget.src = images === null || images === void 0 ? void 0 : (_images$2 = images[0]) === null || _images$2 === void 0 ? void 0 : (_images$2$imageFile = _images$2.imageFile) === null || _images$2$imageFile === void 0 ? void 0 : _images$2$imageFile.url;
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: styles.slideshow.moreBt
  }, "+", images.length));
}
export function SlideshowButton(props) {
  const {
    editorState,
    onChange,
    className
  } = props;
  const [toShowImageSelector, setToShowImageSelector] = useState(false);

  const promptForImageSelector = () => {
    setToShowImageSelector(true);
  };

  const onImageSelectorChange = selected => {
    if (selected.length === 0) {
      setToShowImageSelector(false);
      return;
    }

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('slideshow', 'IMMUTABLE', selected.map(ele => {
      return { ...(ele === null || ele === void 0 ? void 0 : ele.image),
        desc: ele === null || ele === void 0 ? void 0 : ele.desc
      };
    }));
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    }); // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null

    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
    setToShowImageSelector(false);
  };

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ImageSelector, {
    isOpen: toShowImageSelector,
    onChange: onImageSelectorChange,
    enableMultipleSelect: true
  }), /*#__PURE__*/React.createElement("div", {
    className: className,
    onClick: promptForImageSelector
  }, /*#__PURE__*/React.createElement("i", {
    className: "far fa-images"
  }), /*#__PURE__*/React.createElement("span", null, " Slideshow")));
}