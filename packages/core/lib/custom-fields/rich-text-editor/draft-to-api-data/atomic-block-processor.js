"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _apiDataInstance = _interopRequireDefault(require("./api-data-instance"));

var _entities = _interopRequireDefault(require("./entities"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _draftJs = require("draft-js");

var _draftConvert = require("draft-convert");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable @typescript-eslint/no-var-requires */
// import sizeOf from 'image-size';
// eslint-disable-line
// import htmlparser2 from 'htmlparser2'
// eslint-disable-next-line no-undef
const htmlparser2 = require('htmlparser2');
/**
 *  @typedef {Object} DraftEditor.TableEntity.TableStyles
 *  @property {Record<string, string>[]} rows
 *  @property {Record<string, string>[]} columns
 *  @property {Record<string, string>[][]} cells
 */

/**
 *  @typedef {RawDraftContentState[][]} DraftEditor.TableEntity.TableData
 */


const processor = {
  convertBlock(entityMap, block) {
    let alignment = 'center';
    let content;
    let entityRange = block.entityRanges[0];
    let styles = {}; // current block's entity data
    // ex:
    // entity.type = IMAGE, entity.data={id,name,url...}

    const entity = entityMap[entityRange.key];

    let type = _lodash.default.get(entity, 'type', ''); // backward compatible. Old entity type might be lower case


    switch (type && type.toUpperCase()) {
      case _entities.default.INFOBOX.type:
        {
          var _entity$data, _entity$data2;

          // About INFOBOX atomic block entity data structure,
          // see `../views/editor/info-box.tsx` for more information.
          content = [{
            title: entity === null || entity === void 0 ? void 0 : (_entity$data = entity.data) === null || _entity$data === void 0 ? void 0 : _entity$data.title,
            body: entity === null || entity === void 0 ? void 0 : (_entity$data2 = entity.data) === null || _entity$data2 === void 0 ? void 0 : _entity$data2.body
          }];
          break;
        }

      case _entities.default.TABLE.type:
        {
          var _content, _content2;

          // About TABLE atomic block entity data structure,
          // see `../views/editor/table.tsx` for more information.
          content = entity === null || entity === void 0 ? void 0 : entity.data;
          /** @type DraftEditor.TableEntity.TableStyles */

          const tableStyles = (_content = content) === null || _content === void 0 ? void 0 : _content.tableStyles;
          /** @type DraftEditor.TableEntity.TableData */

          const tableData = (_content2 = content) === null || _content2 === void 0 ? void 0 : _content2.tableData;
          const rowsJsx = tableData === null || tableData === void 0 ? void 0 : tableData.map((row, rIndex) => {
            var _tableStyles$rows;

            const colsJsx = row === null || row === void 0 ? void 0 : row.map((col, cIndex) => {
              var _tableStyles$columns, _tableStyles$cells, _tableStyles$cells$rI;

              const colStyle = tableStyles === null || tableStyles === void 0 ? void 0 : (_tableStyles$columns = tableStyles.columns) === null || _tableStyles$columns === void 0 ? void 0 : _tableStyles$columns[cIndex];
              const cellStyle = tableStyles === null || tableStyles === void 0 ? void 0 : (_tableStyles$cells = tableStyles.cells) === null || _tableStyles$cells === void 0 ? void 0 : (_tableStyles$cells$rI = _tableStyles$cells[rIndex]) === null || _tableStyles$cells$rI === void 0 ? void 0 : _tableStyles$cells$rI[cIndex];
              return /*#__PURE__*/React.createElement("td", {
                key: `col_${cIndex}`,
                style: Object.assign({}, colStyle, cellStyle),
                dangerouslySetInnerHTML: {
                  __html: (0, _draftConvert.convertToHTML)((0, _draftJs.convertFromRaw)(col))
                }
              });
            });
            return /*#__PURE__*/React.createElement("tr", {
              key: `row_${rIndex}`,
              style: tableStyles === null || tableStyles === void 0 ? void 0 : (_tableStyles$rows = tableStyles.rows) === null || _tableStyles$rows === void 0 ? void 0 : _tableStyles$rows[rIndex]
            }, colsJsx);
          }); // Use `React.renderToStsaticMarkup` to generate plain HTML string

          const html = _server.default.renderToStaticMarkup( /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("tbody", null, rowsJsx)));

          content = [{
            html
          }];
          break;
        }

      case _entities.default.DIVIDER.type:
        content = ['<hr>'];
        break;

      case _entities.default.BLOCKQUOTE.type:
        // this is different from default blockquote of draftjs
        // so we name our specific blockquote as 'quoteby'
        type = 'quoteby';
        alignment = entity.data && entity.data.alignment || alignment;
        content = _lodash.default.get(entity, 'data');
        content = Array.isArray(content) ? content : [content];
        break;

      case _entities.default.AUDIO.type:
      case _entities.default.IMAGE.type:
      case _entities.default.IMAGEDIFF.type:
      case _entities.default.SLIDESHOW.type:
      case _entities.default.VIDEO.type:
      case _entities.default.YOUTUBE.type:
        alignment = entity.data && entity.data.alignment || alignment;
        content = _lodash.default.get(entity, 'data');
        content = Array.isArray(content) ? content : [content];
        break;

      case _entities.default.IMAGELINK.type:
        {
          // use Embedded component to dangerouslySetInnerHTML
          type = _entities.default.EMBEDDEDCODE.type;
          alignment = entity.data && entity.data.alignment || alignment;

          let description = _lodash.default.get(entity, ['data', 'description'], '');

          let url = _lodash.default.get(entity, ['data', 'url'], '');

          content = [{
            caption: description,
            embeddedCodeWithoutScript: `<img alt="${description}" src="${url}" class="img-responsive"/>`,
            url: url
          }];
          break;
        }

      case _entities.default.EMBEDDEDCODE.type:
        {
          alignment = entity.data && entity.data.alignment || alignment;

          let caption = _lodash.default.get(entity, ['data', 'caption'], '');

          let embeddedCode = _lodash.default.get(entity, ['data', 'embeddedCode'], '');

          let script = {};
          let scripts = [];
          let scriptTagStart = false;
          let height;
          let width;
          let parser = new htmlparser2.Parser({
            onopentag: (name, attribs) => {
              if (name === 'script') {
                scriptTagStart = true;
                script.attribs = attribs;
              } else if (name === 'iframe') {
                height = _lodash.default.get(attribs, 'height', 0);
                width = _lodash.default.get(attribs, 'width', 0);
              }
            },
            ontext: text => {
              if (scriptTagStart) {
                script.text = text;
              }
            },
            onclosetag: tagname => {
              if (tagname === 'script' && scriptTagStart) {
                scriptTagStart = false;
                scripts.push(script);
              }
            }
          });
          parser.write(embeddedCode);
          parser.end();
          content = [{
            caption,
            embeddedCode,
            embeddedCodeWithoutScript: embeddedCode.replace(/<script(.+?)\/script>/g, ''),
            height,
            scripts,
            width
          }];
          break;
        }

      default:
        return;
    } // block type of api data should be lower case


    return new _apiDataInstance.default({
      id: block.key,
      alignment,
      type: type && type.toLowerCase(),
      content,
      styles
    });
  }

};
var _default = processor;
exports.default = _default;