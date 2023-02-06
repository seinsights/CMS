/** @jsxRuntime classic */

/** @jsx jsx */
import { Fragment, useMemo, useRef } from 'react';
import bytes from 'bytes';
import { jsx, Stack, Text, VisuallyHidden } from '@keystone-ui/core';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { TextInput } from '@keystone-ui/fields';
import { Pill } from '@keystone-ui/pill';
import { Button } from '@keystone-ui/button';
import { parseFileRef } from '../utils';
export function validateRef({
  ref
}) {
  if (!parseFileRef(ref)) {
    return 'Invalid ref';
  }
}

const RefView = ({
  field,
  onChange,
  onCancel,
  error
}) => {
  return jsx(Fragment, null, jsx(VisuallyHidden, {
    as: "label",
    htmlFor: `${field.path}--ref-input`
  }, "Paste the file ref here"), jsx(Stack, {
    gap: "small",
    across: true,
    css: {
      width: '100%',
      justifyContent: 'space-between',
      'div:first-of-type': {
        flex: '2'
      }
    }
  }, jsx(TextInput, {
    autoFocus: true,
    id: `${field.path}=--ref-input`,
    placeholder: "Paste the file ref here",
    onChange: event => {
      onChange(event.target.value);
    },
    css: {
      width: '100%'
    }
  }), jsx(Button, {
    tone: "passive",
    onClick: onCancel
  }, "Cancel"), error ? jsx(Pill, {
    weight: "light",
    tone: "negative"
  }, error) : null));
};

export function Field({
  autoFocus,
  field,
  value,
  forceValidation,
  onChange
}) {
  const inputRef = useRef(null);
  const errorMessage = createErrorMessage(value, forceValidation);

  const onUploadChange = ({
    currentTarget: {
      validity,
      files
    }
  }) => {
    const file = files === null || files === void 0 ? void 0 : files[0];
    if (!file) return; // bail if the user cancels from the file browser

    onChange === null || onChange === void 0 ? void 0 : onChange({
      kind: 'upload',
      data: {
        file,
        validity
      },
      previous: value
    });
  }; // Generate a random input key when the value changes, to ensure the file input is unmounted and
  // remounted (this is the only way to reset its value and ensure onChange will fire again if
  // the user selects the same file again)
  // eslint-disable-next-line react-hooks/exhaustive-deps


  const inputKey = useMemo(() => Math.random(), [value]);
  return jsx(FieldContainer, {
    as: "fieldset"
  }, jsx(FieldLabel, {
    as: "legend"
  }, field.label), value.kind === 'ref' ? jsx(RefView, {
    field: field,
    onChange: ref => {
      onChange === null || onChange === void 0 ? void 0 : onChange({
        kind: 'ref',
        data: {
          ref
        },
        previous: value.previous
      });
    },
    error: forceValidation && errorMessage ? errorMessage : undefined,
    onCancel: () => {
      onChange === null || onChange === void 0 ? void 0 : onChange(value.previous);
    }
  }) : jsx(FileView, {
    errorMessage: errorMessage,
    value: value,
    onChange: onChange,
    inputRef: inputRef,
    field: field
  }), jsx("input", {
    css: {
      display: 'none'
    },
    autoComplete: "off",
    autoFocus: autoFocus,
    ref: inputRef,
    key: inputKey,
    name: field.path,
    onChange: onUploadChange,
    type: "file",
    disabled: onChange === undefined
  }));
}

function FileView({
  errorMessage,
  value,
  onChange,
  inputRef,
  field
}) {
  var _value$data;

  // const { addToast } = useToasts()
  // const onSuccess = () => {
  //   addToast({ title: 'Copied file ref to clipboard', tone: 'positive' })
  // }
  // const onFailure = () => {
  //   addToast({
  //     title: 'Failed to copy file ref to clipboard',
  //     tone: 'negative',
  //   })
  // }
  // const copyRef = () => {
  //   if (value.kind !== 'from-server') {
  //     return
  //   }
  //   if (navigator) {
  //     // use the new navigator.clipboard API if it exists
  //     navigator.clipboard.writeText(value?.data.ref).then(onSuccess, onFailure)
  //     return
  //   } else {
  //     // Fallback to a library that leverages document.execCommand
  //     // for browser versions that dont' support the navigator object.
  //     // As document.execCommand
  //     try {
  //       copy(value?.data.ref)
  //     } catch (e) {
  //       addToast({ title: 'Faild to oopy to clipboard', tone: 'negative' })
  //     }
  //     return
  //   }
  // }
  // 修正檔案的URL
  let correctUrl = '';
  let fileType = '';
  const wrongUrl = value === null || value === void 0 ? void 0 : (_value$data = value.data) === null || _value$data === void 0 ? void 0 : _value$data.src;

  if (wrongUrl) {
    const urlArray = wrongUrl.split('/');
    const filename = urlArray.pop();
    fileType = field.customConfig.fileType;
    let fileGcsPath;

    switch (fileType) {
      case 'image':
        fileGcsPath = 'images';
        break;

      case 'audio':
        fileGcsPath = 'audios';
        break;

      case 'video':
        fileGcsPath = 'videos';
        break;

      default:
        fileGcsPath = 'assets/files';
        break;
    }

    urlArray.push(fileGcsPath, filename);
    correctUrl = urlArray.filter(function (el) {
      return el != '';
    }).join('/');
    correctUrl = correctUrl.replace('https:/', 'https://'); //FIXME: the walkaround solution to be correctted 
  }

  return value.kind === 'from-server' || value.kind === 'upload' ? jsx(Stack, {
    gap: "small",
    across: true,
    align: "center"
  }, onChange && jsx(Fragment, null, value.kind === 'from-server' && jsx(Stack, {
    padding: "xxsmall",
    gap: "xxsmall"
  }, jsx(Stack, {
    across: true,
    align: "center",
    gap: "small"
  }, jsx(Text, {
    size: "medium"
  }, fileType === 'image' && correctUrl ? jsx("a", {
    href: correctUrl,
    target: "_blank"
  }, jsx("img", {
    src: correctUrl,
    style: {
      width: '100%',
      height: '100%'
    }
  })) : jsx("a", {
    href: correctUrl,
    target: "_blank"
  }, `${value.data.filename}`))), jsx(Text, {
    size: "xsmall"
  }, bytes(value.data.filesize))), jsx(Stack, {
    across: true,
    gap: "small",
    align: "center"
  }, jsx(Button, {
    size: "small",
    onClick: () => {
      var _inputRef$current;

      (_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 ? void 0 : _inputRef$current.click();
    }
  }, "Change"), value.kind === 'from-server' && jsx(Button, {
    size: "small",
    tone: "negative",
    onClick: () => {
      onChange({
        kind: 'remove',
        previous: value
      });
    }
  }, "Remove"), value.kind === 'upload' && jsx(Button, {
    size: "small",
    tone: "negative",
    onClick: () => {
      onChange(value.previous);
    }
  }, "Cancel"), errorMessage ? jsx(Pill, {
    tone: "negative",
    weight: "light"
  }, errorMessage) : value.kind === 'upload' && jsx(Pill, {
    weight: "light",
    tone: "positive"
  }, "Save to upload this file")))) : jsx(Stack, {
    gap: "small"
  }, jsx(Stack, {
    css: {
      alignItems: 'center'
    },
    gap: "small",
    across: true
  }, jsx(Button, {
    size: "small",
    disabled: onChange === undefined,
    onClick: () => {
      var _inputRef$current2;

      (_inputRef$current2 = inputRef.current) === null || _inputRef$current2 === void 0 ? void 0 : _inputRef$current2.click();
    },
    tone: "positive"
  }, "Upload File"), value.kind === 'remove' && value.previous && jsx(Button, {
    size: "small",
    tone: "negative",
    onClick: () => {
      if (value.previous !== undefined) {
        onChange === null || onChange === void 0 ? void 0 : onChange(value === null || value === void 0 ? void 0 : value.previous);
      }
    }
  }, "Undo removal"), value.kind === 'remove' && // NOTE -- UX decision is to not display this, I think it would only be relevant
  // for deleting uploaded images (and we don't support that yet)
  // <Pill weight="light" tone="warning">
  //   Save to remove this image
  // </Pill>
  null));
}

function createErrorMessage(value, forceValidation) {
  if (value.kind === 'upload') {
    return validateFile(value.data);
  } else if (value.kind === 'ref') {
    return forceValidation ? validateRef(value.data) : undefined;
  }
}

export function validateFile({
  validity
}) {
  if (!validity.valid) {
    return 'Something went wrong, please reload and try again.';
  }
}