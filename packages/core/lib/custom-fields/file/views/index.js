/** @jsxRuntime classic */

/** @jsx jsx */
import { jsx } from '@keystone-ui/core'; // eslint-disable-line

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { validateFile, validateRef } from './Field';
export { Field } from './Field';
export const Cell = ({
  item,
  field
}) => {
  const data = item[field.path];
  if (!data) return null;
  const url = data.url;
  const isImage = url.match(/\.(png|svg|jpg|jpeg|gif|bmp|webp|tif|tiff)$/); // FIXME:
  // `data.url` currently is resolved incorrectly in https://github.com/mirror-media/openwarehouse-k6/blob/dev/customFields/CustomFile/index.ts#L54
  // It would look like 'https://https://storage.googleapis.com/static-vision-tw-dev//x09gQpI5Jz5pRXO56yVt.jpg'.
  // However, the right url would be 'https://https://storage.googleapis.com/static-vision-tw-dev/images/x09gQpI5Jz5pRXO56yVt.jpg'.
  // Therefore, we need to change '//x09gQpI5Jz5pRXO56yVt.jpg' to '/images/x09gQpI5Jz5pRXO56yVt.jpg'.

  const imgSrc = url.replace(`/${data.filename}`, `images/${data.filename}`);
  return jsx("div", {
    css: {
      alignItems: 'center',
      display: 'flex',
      height: isImage ? '100px' : '24px',
      lineHeight: 0,
      width: isImage ? '100px' : '24px'
    }
  }, isImage ? jsx("img", {
    src: imgSrc,
    width: "100%"
  }) : url);
};
export const CardValue = ({
  item,
  field
}) => {
  const data = item[field.path];
  return jsx(FieldContainer, null, jsx(FieldLabel, null, field.label), data && data.filename);
};
export const controller = config => {
  return {
    customConfig: {
      fileType: config.fieldMeta.customConfig.fileType
    },
    path: config.path,
    label: config.label,
    graphqlSelection: `${config.path} {
        url
        filename
        ref
        filesize
      }`,
    defaultValue: {
      kind: 'empty'
    },

    deserialize(item) {
      const value = item[config.path];
      if (!value) return {
        kind: 'empty'
      };
      return {
        kind: 'from-server',
        data: {
          src: value.url,
          filename: value.filename,
          ref: value.ref,
          filesize: value.filesize
        }
      };
    },

    validate(value) {
      if (value.kind === 'ref') {
        return validateRef(value.data) === undefined;
      }

      return value.kind !== 'upload' || validateFile(value.data) === undefined;
    },

    serialize(value) {
      if (value.kind === 'upload') {
        return {
          [config.path]: {
            upload: value.data.file
          }
        };
      }

      if (value.kind === 'ref') {
        return {
          [config.path]: {
            ref: value.data.ref
          }
        };
      }

      if (value.kind === 'remove') {
        return {
          [config.path]: null
        };
      }

      return {};
    }

  };
};