"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _shortid = _interopRequireDefault(require("shortid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ApiDataInstanceRecord = (0, _immutable.Record)({
  id: _shortid.default.generate(),
  type: 'paragraph',
  alignment: 'center',
  content: [],
  styles: {}
});

class ApiDataInstance extends ApiDataInstanceRecord {
  constructor(props) {
    let id = props && props.id || _shortid.default.generate();

    props.id = id;
    super(props);
  }

  getId() {
    return this.get('id');
  }

  getType() {
    return this.get('type');
  }

  getAlignment() {
    return this.get('alignment');
  }

  getContent() {
    return this.get('content');
  }

  getStyles() {
    return this.get('styles');
  }

}

var _default = ApiDataInstance;
exports.default = _default;