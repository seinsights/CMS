"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.default = exports.customFields = void 0;

var accessControl = _interopRequireWildcard(require("./utils/accessControl"));

var _manualOrderRelationship = _interopRequireDefault(require("./utils/manual-order-relationship"));

var _draftConverter = _interopRequireDefault(require("./custom-fields/rich-text-editor/draft-to-api-data/draft-converter"));

var _file = require("./custom-fields/file");

var _relationship = require("./custom-fields/relationship");

var _timestamp = require("./custom-fields/timestamp");

var _trackingHandler = require("./utils/trackingHandler");

var _richTextEditor = require("./custom-fields/rich-text-editor");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const customFields = {
  file: _file.CustomFile,
  relationship: _relationship.CustomRelationship,
  timestamp: _timestamp.CustomTimestamp,
  richTextEditor: _richTextEditor.richTextEditor,
  draftConverter: _draftConverter.default
};
exports.customFields = customFields;
const utils = {
  accessControl,
  addManualOrderRelationshipFields: _manualOrderRelationship.default,
  addTrackingFields: _trackingHandler.addTrackingFields
};
exports.utils = utils;
var _default = {
  customFields,
  utils
};
exports.default = _default;