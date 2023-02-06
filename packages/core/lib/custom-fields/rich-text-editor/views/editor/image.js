import React, { useState } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import errors from '@twreporter/errors';
import { AlertDialog } from '@keystone-ui/modals';
import { Button } from '@keystone-ui/button';
import { TextInput } from '@keystone-ui/fields';
import { AtomicBlockUtils, EditorState } from 'draft-js';
const _ = {
  debounce
};
const styles = {
  imagesGrid: {
    display: 'flex'
  },
  image: {
    width: '100%'
  },
  imageItem: {
    width: '100px',
    cursor: 'pointer'
  },
  searchBox: {
    display: 'flex'
  },
  buttons: {
    marginBottom: 10,
    display: 'flex'
  },
  button: {
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer'
  },
  separationLine: {
    border: '#e1e5e9 1px solid',
    marginTop: '10px',
    marginBottom: '10px'
  }
};

async function fetchImagesFromGraphQL({
  searchText,
  apiUrl = '/api/graphql'
}) {
  // TODO: add pagination if needed
  // TODO: fetch other resized targets, such as w800, when resizing function is ready
  const query = `
query {
  photos (where: {name:{contains: "${searchText}"}}) {
    id
    name
    imageFile {
      url
    }
    resized {
      original
    }
  }
}
`;

  try {
    var _results$data, _results$data2, _results$data2$data;

    const results = await axios.post(apiUrl, {
      query
    });
    const gqlErrors = (_results$data = results.data) === null || _results$data === void 0 ? void 0 : _results$data.errors;

    if (gqlErrors) {
      const annotatingError = errors.helpers.wrap(new Error('Errors occurs in the GraphQL returned value'), 'GraphQLError', 'Errors occurs in `images` query', {
        errors: gqlErrors,
        query
      });
      throw annotatingError;
    }

    return (_results$data2 = results.data) === null || _results$data2 === void 0 ? void 0 : (_results$data2$data = _results$data2.data) === null || _results$data2$data === void 0 ? void 0 : _results$data2$data.photos;
  } catch (axiosError) {
    const annotatingError = errors.helpers.annotateAxiosError(axiosError);
    throw annotatingError;
  }
}

function ImageItem(props) {
  var _image$resized;

  const {
    image,
    onSelect,
    isSelected
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    style: styles.imageItem,
    key: image === null || image === void 0 ? void 0 : image.id,
    onClick: () => onSelect(image)
  }, /*#__PURE__*/React.createElement("div", null, isSelected ? /*#__PURE__*/React.createElement("i", {
    className: "fas fa-check-circle"
  }) : null), /*#__PURE__*/React.createElement("img", {
    style: styles.image,
    src: image === null || image === void 0 ? void 0 : (_image$resized = image.resized) === null || _image$resized === void 0 ? void 0 : _image$resized.original,
    onError: e => {
      var _image$imageFile;

      return e.currentTarget.src = image === null || image === void 0 ? void 0 : (_image$imageFile = image.imageFile) === null || _image$imageFile === void 0 ? void 0 : _image$imageFile.url;
    }
  }));
}

function ImagesGrid(props) {
  const {
    images,
    selected,
    onSelect
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    style: styles.imagesGrid
  }, images.map(image => {
    return /*#__PURE__*/React.createElement(ImageItem, {
      key: image.id,
      isSelected: selected === null || selected === void 0 ? void 0 : selected.includes(image),
      onSelect: () => onSelect(image),
      image: image
    });
  }));
}

function SearchBox(props) {
  const {
    onChange
  } = props;
  const [searchInput, setSearchInput] = useState('');
  return /*#__PURE__*/React.createElement("div", {
    style: styles.searchBox
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "text",
    placeholder: "\u8ACB\u8F38\u5165\u95DC\u9375\u5B57\u641C\u5C0B",
    value: searchInput,
    onChange: e => {
      setSearchInput(e.target.value);
    }
  }), /*#__PURE__*/React.createElement(Button, {
    onClick: () => {
      onChange(searchInput);
    }
  }, "Search"));
}

function ImageDescInput(props) {
  var _image$resized2;

  const {
    image,
    desc,
    onChange
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    style: styles.imageItem
  }, /*#__PURE__*/React.createElement("img", {
    style: styles.image,
    src: image === null || image === void 0 ? void 0 : (_image$resized2 = image.resized) === null || _image$resized2 === void 0 ? void 0 : _image$resized2.original,
    onError: e => {
      var _image$imageFile2;

      return e.currentTarget.src = image === null || image === void 0 ? void 0 : (_image$imageFile2 = image.imageFile) === null || _image$imageFile2 === void 0 ? void 0 : _image$imageFile2.url;
    }
  }), /*#__PURE__*/React.createElement(TextInput, {
    type: "text",
    placeholder: image === null || image === void 0 ? void 0 : image.name,
    defaultValue: desc,
    onChange: _.debounce(e => {
      onChange({
        image,
        desc: e.target.value
      });
    })
  }));
}

export function ImageSelector(props) {
  const [selected, setSelected] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const {
    isOpen,
    enableMultipleSelect = false,
    onChange
  } = props;

  const onSave = () => {
    onChange(selected);
    setSelected([]);
    setImages([]);
    setError(null);
  };

  const onCancel = () => {
    onChange([]);
    setSelected([]);
    setImages([]);
    setError(null);
  };

  const onSearchBoxChange = async searchInput => {
    try {
      const images = await fetchImagesFromGraphQL({
        searchText: searchInput
      });
      setImages(images);
      setError(null);
    } catch (e) {
      setError(e);
    }
  };

  const onImageDescInputChange = imageEntityWithDesc => {
    if (enableMultipleSelect) {
      const foundIndex = selected.findIndex(ele => {
        var _ele$image, _imageEntityWithDesc$;

        return (ele === null || ele === void 0 ? void 0 : (_ele$image = ele.image) === null || _ele$image === void 0 ? void 0 : _ele$image.id) === (imageEntityWithDesc === null || imageEntityWithDesc === void 0 ? void 0 : (_imageEntityWithDesc$ = imageEntityWithDesc.image) === null || _imageEntityWithDesc$ === void 0 ? void 0 : _imageEntityWithDesc$.id);
      });

      if (foundIndex !== -1) {
        selected[foundIndex] = imageEntityWithDesc;
        setSelected(selected);
      }

      return;
    }

    setSelected([imageEntityWithDesc]);
  };

  const onImagesGridSelect = imageEntity => {
    const found = selected.find(ele => {
      var _ele$image2;

      return (ele === null || ele === void 0 ? void 0 : (_ele$image2 = ele.image) === null || _ele$image2 === void 0 ? void 0 : _ele$image2.id) === imageEntity.id;
    });

    if (found) {
      return;
    }

    if (enableMultipleSelect) {
      return setSelected(selected.concat([{
        image: imageEntity,
        desc: ''
      }]));
    }

    return setSelected([{
      image: imageEntity,
      desc: ''
    }]);
  };

  const selectedImages = selected.map(ele => {
    return ele.image;
  });
  return /*#__PURE__*/React.createElement(AlertDialog, {
    title: "Select image",
    isOpen: isOpen,
    actions: {
      cancel: {
        label: 'Cancel',
        action: onCancel
      },
      confirm: {
        label: 'Confirm',
        action: onSave
      }
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ImageSelector Selector"
  }, /*#__PURE__*/React.createElement("div", {
    className: "Selector__container"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SearchBox, {
    onChange: onSearchBoxChange
  }), error ? /*#__PURE__*/React.createElement("div", null, errors.helpers.printAll(error, {
    withStack: true,
    withPayload: true
  })) : /*#__PURE__*/React.createElement(ImagesGrid, {
    images: images,
    selected: selectedImages,
    onSelect: onImagesGridSelect
  })), /*#__PURE__*/React.createElement("div", {
    style: styles.separationLine
  }), /*#__PURE__*/React.createElement("div", {
    style: styles.imagesGrid
  }, selected.map(imageWithDesc => {
    var _imageWithDesc$image;

    return /*#__PURE__*/React.createElement(ImageDescInput, {
      key: imageWithDesc === null || imageWithDesc === void 0 ? void 0 : (_imageWithDesc$image = imageWithDesc.image) === null || _imageWithDesc$image === void 0 ? void 0 : _imageWithDesc$image.id,
      image: imageWithDesc === null || imageWithDesc === void 0 ? void 0 : imageWithDesc.image,
      desc: imageWithDesc.desc,
      onChange: onImageDescInputChange
    });
  })))));
}
export function ImageBlock(entity) {
  const {
    desc,
    imageFile,
    resized
  } = entity.getData();
  return /*#__PURE__*/React.createElement("figure", null, /*#__PURE__*/React.createElement("img", {
    style: styles.image,
    src: resized === null || resized === void 0 ? void 0 : resized.original,
    onError: e => e.currentTarget.src = imageFile === null || imageFile === void 0 ? void 0 : imageFile.url
  }), /*#__PURE__*/React.createElement("figcaption", null, desc));
}
export function ImageButton(props) {
  const {
    editorState,
    onChange,
    className
  } = props;
  const [toShowImageSelector, setToShowImageSelector] = useState(false);

  const promptForImageSelector = () => {
    setToShowImageSelector(true);
  };

  const onImageSelectorChange = selectedImagesWithDesc => {
    const selected = selectedImagesWithDesc === null || selectedImagesWithDesc === void 0 ? void 0 : selectedImagesWithDesc[0];

    if (!selected) {
      setToShowImageSelector(false);
      return;
    }

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('image', 'IMMUTABLE', { ...(selected === null || selected === void 0 ? void 0 : selected.image),
      desc: selected === null || selected === void 0 ? void 0 : selected.desc
    });
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
    onChange: onImageSelectorChange
  }), /*#__PURE__*/React.createElement("div", {
    className: className,
    onClick: promptForImageSelector
  }, /*#__PURE__*/React.createElement("i", {
    className: "far fa-image"
  }), /*#__PURE__*/React.createElement("span", null, " Image")));
}