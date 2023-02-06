"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseFileRef = exports.getFileRef = void 0;
const FILEREGEX = /^(local|cloud):file:([^\\\/:\n]+)/;

const getFileRef = (mode, name) => `${mode}:file:${name}`;

exports.getFileRef = getFileRef;

const parseFileRef = ref => {
  const match = ref.match(FILEREGEX);

  if (match) {
    const [, mode, filename] = match;
    return {
      mode: mode,
      filename: filename
    };
  }

  return undefined;
};

exports.parseFileRef = parseFileRef;