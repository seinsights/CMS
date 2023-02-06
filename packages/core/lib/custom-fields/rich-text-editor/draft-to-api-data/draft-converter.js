"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _immutable = require("immutable");

var _lodash = _interopRequireDefault(require("lodash"));

var InlineStylesProcessor = _interopRequireWildcard(require("./inline-styles-processor"));

var _apiDataInstance = _interopRequireDefault(require("./api-data-instance"));

var _atomicBlockProcessor = _interopRequireDefault(require("./atomic-block-processor"));

var _entities = _interopRequireDefault(require("./entities"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Modified from https://github.com/dburrows/draft-js-basic-html-editor/blob/master/src/utils/draftRawToHtml.js
// 'use strict';
let defaultBlockTagMap = {
  atomic: `<div>%content%</div>`,
  blockquote: `<blockquote>%content%</blockquote>`,
  'code-block': `<code>%content%</code>`,
  default: `<p>%content%</p>`,
  'header-two': `<h2>%content%</h2>`,
  'header-three': `<h3>%content%</h3>`,
  'header-four': `<h4>%content%</h4>`,
  'ordered-list-item': `<li>%content%</li>`,
  paragraph: `<p>%content%</p>`,
  'unordered-list-item': `<li>%content%</li>`,
  unstyled: `<p>%content%</p>`
};
let inlineTagMap = {
  BOLD: ['<strong>', '</strong>'],
  CODE: ['<code>', '</code>'],
  default: ['<span>', '</span>'],
  ITALIC: ['<em>', '</em>'],
  UNDERLINE: ['<u>', '</u>']
};
let defaultEntityTagMap = {
  [_entities.default.DIVIDER.type]: ['<hr>', ''],
  [_entities.default.ANNOTATION.type]: ['<abbr title="<%= data.body %>"><%= data.text %>', '</abbr>'],
  [_entities.default.AUDIO.type]: ['<div class="audio-container center"><div class="audio-title"><%= data.name %></div><!-- <div class="audio-desc"><%= data.description %></div> --><audio src="<%= data.url %>" />', '</div>'],
  [_entities.default.BLOCKQUOTE.type]: ['<blockquote class="center"><div><%= data.quote %></div><div><%= data.quotedBy %></div>', '<blockquote>'],
  [_entities.default.EMBEDDEDCODE.type]: ['<div class="embedded <%= data.alignment %>" title="<%= data.caption %>"><%= data.code%>', '</div>'],
  [_entities.default.INFOBOX.type]: ['<div class="info-box-container center"><div class="info-box-title"><%= data.title %></div><div class="info-box-body"><%= data.body %></div>', '</div>'],
  [_entities.default.STOREDIMAGE.type]: ['<img alt="<%= data.name %>" src="<%= data.url %>" srcset="<%= data.urlMobileSized %> 800w,  <%= data.urlTabletSized %> 1280w, <%= data.urlDesktopSized %> 2400w" class="center">', '</img>'],
  [_entities.default.IMAGE.type]: ['<img alt="<%=data.name%>" src="<%=data.url%>" srcset="<%= data.mobile.url %> 800w,  <%= data.tablet.url %> 1280w, <%= data.desktop.url %> 2400w" class="center">', '</img>'],

  /*[ENTITY.IMAGEDIFF.type]: ['<!-- imageDiff component start --> <ol class="image-diff-container"> <% _.forEach(data, function(image, index) { if (index > 1) { return; } %><li class="image-diff-item"><img src="<%- image.url %>" /></li><% }); %>', '</ol><!-- imageDiff component end-->'],
  [ENTITY.IMAGELINK.type]: ['<img alt="<%= data.description %>" src="<%= data.url %>" class="<%= data.alignment %>">', '</img>'],*/
  [_entities.default.LINK.type]: ['<a target="_blank" href="<%= data.url %>">', '</a>'],
  [_entities.default.SLIDESHOW.type]: ['<!-- slideshow component start --> <ol class="slideshow-container"> <%  _.forEach(data, function(image) { %><li class="slideshow-slide"><img alt="<%- image.name %>" src="<%- image.url %>" srcset="<%= image.mobile.url %> 800w,  <%= image.tablet.url %> 1280w, <%= image.desktop.url %> 2400w" /></li><% }); %>', '</ol><!-- slideshow component end -->'],
  [_entities.default.VIDEO.type]: ['<div controls class="video-container <%= data.alignment %>"><div class="video-name"><%= data.title %></div><div class="video-desc"><%= data.description %></div><video src="<%= data.url %>" />', '</div>'],
  [_entities.default.YOUTUBE.type]: ['<iframe width="560" alt="<%= data.description %>" height="315" src="https://www.youtube.com/embed/<%= data.id %>" frameborder="0" allowfullscreen>', '</iframe>']
};
let nestedTagMap = {
  'ordered-list-item': ['<ol>', '</ol>'],
  'unordered-list-item': ['<ul>', '</ul>']
};

function _convertInlineStyle(block, entityMap, blockTagMap, entityTagMap) {
  return blockTagMap[block.type] ? blockTagMap[block.type].replace('%content%', InlineStylesProcessor.convertToHtml(inlineTagMap, entityTagMap, entityMap, block)) : blockTagMap.default.replace('%content%', InlineStylesProcessor.convertToHtml(inlineTagMap, block));
}

function _convertBlocksToHtml(blocks, entityMap, blockTagMap, entityTagMap) {
  let html = '';
  let nestLevel = []; // store the list type of the previous item: null/ol/ul

  blocks.forEach(block => {
    // create tag for <ol> or <ul>: deal with ordered/unordered list item
    // if the block is a list-item && the previous block is not a list-item
    if (nestedTagMap[block.type] && nestLevel[0] !== block.type) {
      html += nestedTagMap[block.type][0]; // start with <ol> or <ul>

      nestLevel.unshift(block.type);
    } // end tag with </ol> or </ul>: deal with ordered/unordered list item


    if (nestLevel.length > 0 && nestLevel[0] !== block.type) {
      html += nestedTagMap[nestLevel.shift()][1]; // close with </ol> or </ul>
    }

    html += _convertInlineStyle(block, entityMap, blockTagMap, entityTagMap);
  }); // end tag with </ol> or </ul>: or if it is the last block

  if (blocks.length > 0 && nestedTagMap[blocks[blocks.length - 1].type]) {
    html += nestedTagMap[nestLevel.shift()][1]; // close with </ol> or </ul>
  }

  return html;
}

function convertBlocksToApiData(blocks, entityMap, entityTagMap) {
  let apiDataArr = (0, _immutable.List)();
  let content = [];
  let nestLevel = [];
  blocks.forEach(block => {
    // block is not a list-item
    if (!nestedTagMap[block.type]) {
      // if previous block is a list-item
      if (content.length > 0 && nestLevel.length > 0) {
        apiDataArr = apiDataArr.push(new _apiDataInstance.default({
          type: nestLevel[0],
          content: [content]
        }));
        content = [];
        nestLevel.shift();
      }

      if (block.type.startsWith('atomic') || block.type.startsWith('media')) {
        try {
          apiDataArr = apiDataArr.push(_atomicBlockProcessor.default.convertBlock(entityMap, block));
        } catch (e) {
          console.error(e);
        }
      } else {
        let converted = InlineStylesProcessor.convertToHtml(inlineTagMap, entityTagMap, entityMap, block);
        let type = block.type;
        apiDataArr = apiDataArr.push(new _apiDataInstance.default({
          id: block.key,
          type: type,
          content: [converted]
        }));
      }
    } else {
      let converted = InlineStylesProcessor.convertToHtml(inlineTagMap, entityTagMap, entityMap, block); // previous block is not an item-list block

      if (nestLevel.length === 0) {
        nestLevel.unshift(block.type);
        content.push(converted);
      } else if (nestLevel[0] === block.type) {
        // previous block is a item-list and current block is the same item-list
        content.push(converted);
      } else if (nestLevel[0] !== block.type) {
        // previous block is a different item-list.
        apiDataArr = apiDataArr.push(new _apiDataInstance.default({
          id: block.key,
          type: nestLevel[0],
          content: [content]
        }));
        content = [converted];
        nestLevel[0] = block.type;
      }
    }
  }); // last block is a item-list

  if (blocks.length > 0 && nestLevel.length > 0) {
    let block = blocks[blocks.length - 1];
    apiDataArr = apiDataArr.push(new _apiDataInstance.default({
      id: block.key,
      type: block.type,
      content: content
    }));
  }

  return apiDataArr;
}

function convertRawToHtml(raw, blockTagMap, entityTagMap) {
  blockTagMap = _lodash.default.merge({}, defaultBlockTagMap, blockTagMap);
  entityTagMap = entityTagMap || defaultEntityTagMap;
  let html = '';
  raw = raw || {};
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};
  html = _convertBlocksToHtml(blocks, entityMap, blockTagMap, entityTagMap);
  return html;
}

function convertRawToApiData(raw) {
  let apiData;
  raw = raw || {};
  const blocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const entityMap = typeof raw.entityMap === 'object' ? raw.entityMap : {};

  let entityTagMap = _lodash.default.merge({}, defaultEntityTagMap, {
    [_entities.default.ANNOTATION.type]: [`<span data-entity-type="annotation" data-annotation-body="<%= data.bodyEscapedHTML %>">`, '</span>']
  });

  apiData = convertBlocksToApiData(blocks, entityMap, entityTagMap);
  return apiData;
}

var _default = {
  convertToHtml: convertRawToHtml,
  convertToApiData: convertRawToApiData
};
exports.default = _default;