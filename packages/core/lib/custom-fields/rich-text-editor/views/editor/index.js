function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import decorators from './entity-decorator';
import { AnnotationButton } from './annotation';
import { Editor, EditorState, KeyBindingUtil, RichUtils, getDefaultKeyBinding } from 'draft-js';
import { EmbeddedCodeButton } from './embedded-code';
import { EnlargeButton } from './enlarge';
import { ImageButton } from './image';
import { InfoBoxButton } from './info-box';
import { LinkButton } from './link'; // import { MediaButton } from './media'

import { SlideshowButton } from './slideshow';
import { TableButton } from './table';
import { atomicBlockRenderer } from './block-redender-fn';
import styled, { css } from 'styled-components';
import { DividerButton } from './divider';
import { FontColorButton, CUSTOM_STYLE_PREFIX_FONT_COLOR } from './font-color';
export const buttonNames = {
  // inline styles
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  code: 'code',
  // block styles
  h2: 'header-two',
  h3: 'header-three',
  h4: 'header-four',
  blockquote: 'blockquote',
  ul: 'unordered-list-item',
  ol: 'ordered-list-item',
  codeBlock: 'code-block',
  // custom styles
  annotation: 'annotation',
  divider: 'divider',
  embed: 'embed',
  fontColor: 'font-color',
  image: 'image',
  infoBox: 'info-box',
  link: 'link',
  slideshow: 'slideshow',
  table: 'table'
};
const disabledButtonsOnBasicEditor = [buttonNames.annotation, buttonNames.divider, buttonNames.embed, buttonNames.image, buttonNames.infoBox, buttonNames.slideshow, buttonNames.table];
const buttonStyle = css`
  /* Rich-editor default setting (.RichEditor-styleButton)*/
  margin-right: 16px;
  padding: 2px 0;
  /* Custom Setting */
  border-radius: 6px;
  text-align: center;
  font-size: 1rem;
  padding: 8px 12px;
  margin: 0px 0px 10px 0px;
  background-color: #fff;
  border: solid 1px rgb(193, 199, 208);
  cursor: ${props => {
  if (props.readOnly) {
    return 'not-allowed';
  }

  return 'pointer';
}};
  color: ${props => {
  if (props.readOnly) {
    return '#c1c7d0';
  }

  if (props.isActive) {
    return '#3b82f6';
  }

  return '#6b7280';
}};
  border: solid 1px
    ${props => {
  if (props.readOnly) {
    return '#c1c7d0';
  }

  if (props.isActive) {
    return '#3b82f6';
  }

  return '#6b7280';
}};
  box-shadow: ${props => {
  if (props.readOnly) {
    return 'unset';
  }

  if (props.isActive) {
    return 'rgba(38, 132, 255, 20%)  0px 0px 0px 3px ';
  }

  return 'unset';
}};
  transition: box-shadow 100ms linear;

  display: ${props => {
  if (props.isDisabled) {
    return 'none';
  }

  return 'inline-block';
}};
`;
const CustomFontColorButton = styled(FontColorButton)`
  ${buttonStyle}
`;
const CustomButton = styled.div`
  ${buttonStyle}
`;
const CustomAnnotationButton = styled(AnnotationButton)`
  ${buttonStyle}
`;
const CustomLinkButton = styled(LinkButton)`
  ${buttonStyle}
`;

function createButtonWithoutProps(referenceComponent, additionalCSS = ``) {
  return styled(referenceComponent)`
    ${buttonStyle}
    ${additionalCSS}
  `;
}

const CustomEnlargeButton = createButtonWithoutProps(EnlargeButton, `color: #999`);
const CustomImageButton = createButtonWithoutProps(ImageButton);
const CustomSlideshowButton = createButtonWithoutProps(SlideshowButton);
const CustomEmbeddedCodeButton = createButtonWithoutProps(EmbeddedCodeButton);
const CustomTableButton = createButtonWithoutProps(TableButton);
const CustomInfoBoxButton = createButtonWithoutProps(InfoBoxButton);
const CustomDividerButton = createButtonWithoutProps(DividerButton);
const DraftEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-root)*/
  background: #fff;
  border: 1px solid #ddd;
  font-family: 'Georgia', serif;
  font-size: 14px;
  padding: 15px;

  /* Custom setting */
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  width: 100%;
  height: 100%;
  background: rgb(255, 255, 255);
  border-radius: 6px;
  padding: 0 1rem 1rem;
`;
const DraftEditorControls = styled.div`
  padding-top: 1rem;
  width: 100%;
  background: rgb(255, 255, 255);
`;
const DraftEditorControlsWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding-right: 45px;
`;
const TextEditorWrapper = styled.div`
  /* Rich-editor default setting (.RichEditor-editor)*/
  border-top: 1px solid #ddd;
  cursor: text;
  font-size: 16px;
  margin-top: 10px;
  /* Custom setting */
  h2 {
    font-size: 22px;
  }
  h3 {
    font-size: 17.5px;
  }
  font-weight: normal;
  max-width: 800px;
`;
const DraftEditor = styled.div`
  position: relative;
  margin-top: 4px;
  ${props => props.isEnlarged ? css`
          position: fixed;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 11;
          padding-left: 3em;
          padding-right: 3em;
          background: rgba(0, 0, 0, 0.5);
        ` : ''}
  ${DraftEditorWrapper} {
    ${props => props.isEnlarged ? css`
            width: 100%;
            height: 100%;
            padding: 0 1rem 0;
            overflow: scroll;
          ` : ''}
  }
  ${DraftEditorControls} {
    ${props => props.isEnlarged ? css`
            position: sticky;
            top: 0;
            z-index: 12;
          ` : ''}
  }
  ${DraftEditorControlsWrapper} {
    ${props => props.isEnlarged ? css`
            overflow: auto;
            padding-bottom: 0;
          ` : ''}
  }
  ${TextEditorWrapper} {
    ${props => props.isEnlarged ? css`
            max-width: 100%;
            min-height: 100vh;
            padding-bottom: 0;
          ` : ''}
  }
`;
const ButtonGroup = styled.div`
  margin: 0 10px 0 0;
`;
const EnlargeButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
`;
export class RichTextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnlarged: false,
      readOnly: false
    };
  }

  onChange = editorState => {
    this.props.onChange(editorState);
  };
  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      this.onChange(newState);
      return true;
    }

    return false;
  };
  handleReturn = event => {
    if (KeyBindingUtil.isSoftNewlineEvent(event)) {
      const {
        onChange,
        editorState
      } = this.props;
      onChange(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }

    return 'not-handled';
  };
  mapKeyToEditorCommand = e => {
    if (e.keyCode === 9
    /* TAB */
    ) {
      const newEditorState = RichUtils.onTab(e, this.props.editorState, 4
      /* maxDepth */
      );

      if (newEditorState !== this.props.editorState) {
        this.onChange(newEditorState);
      }

      return;
    }

    return getDefaultKeyBinding(e);
  };
  toggleBlockType = blockType => {
    this.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType));
  };
  toggleInlineStyle = inlineStyle => {
    this.onChange(RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle));
  };
  getEntityType = editorState => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startOffset = selection.getStartOffset();
    const startBlock = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
    const endOffset = selection.getEndOffset();
    let entityInstance;
    let entityKey;

    if (!selection.isCollapsed()) {
      entityKey = startBlock.getEntityAt(startOffset);
    } else {
      entityKey = startBlock.getEntityAt(endOffset);
    }

    if (entityKey !== null) {
      entityInstance = contentState.getEntity(entityKey);
    }

    let entityType = '';

    if (entityInstance) {
      entityType = entityInstance.getType();
    }

    return entityType;
  };
  getCustomStyle = style => {
    const styleName = style.findLast(value => value.startsWith(CUSTOM_STYLE_PREFIX_FONT_COLOR));
    const styles = {};

    if (styleName) {
      styles['color'] = styleName.split(CUSTOM_STYLE_PREFIX_FONT_COLOR)[1];
    }

    return styles;
  };
  toggleEnlarge = () => {
    this.setState({
      isEnlarged: !this.state.isEnlarged
    });
  };
  customStyleFn = style => {
    return this.getCustomStyle(style);
  };
  blockRendererFn = block => {
    const atomicBlockObj = atomicBlockRenderer(block);

    if (atomicBlockObj) {
      const onEditStart = () => {
        this.setState({
          // If custom block renderer requires mouse interaction,
          // [Draft.js document](https://draftjs.org/docs/advanced-topics-block-components#recommendations-and-other-notes)
          // suggests that we should temporarily set Editor
          // to readOnly={true} during the interaction.
          // In readOnly={true} condition, the user does not
          // trigger any selection changes within the editor
          // while interacting with custom block.
          // If we don't set readOnly={true},
          // it will cause some subtle bugs in InfoBox button.
          readOnly: true
        });
      };

      const onEditFinish = ({
        entityKey,
        entityData
      }) => {
        if (entityKey) {
          const oldContentState = this.props.editorState.getCurrentContent();
          const newContentState = oldContentState.replaceEntityData(entityKey, entityData);
          this.onChange(EditorState.set(this.props.editorState, {
            currentContent: newContentState
          }));
        } // Custom block interaction is finished.
        // Therefore, we set readOnly={false} to
        // make editor editable.


        this.setState({
          readOnly: false
        });
      }; // `onEditStart` and `onEditFinish` will be passed
      // into custom block component.
      // We can get them via `props.blockProps.onEditStart`
      // and `props.blockProps.onEditFinish` in the custom block components.


      atomicBlockObj['props'] = {
        onEditStart,
        onEditFinish,
        getMainEditorReadOnly: () => this.state.readOnly,
        renderBasicEditor: propsOfBasicEditor => {
          return /*#__PURE__*/React.createElement(RichTextEditor, _extends({}, propsOfBasicEditor, {
            disabledButtons: disabledButtonsOnBasicEditor
          }));
        }
      };
    }

    return atomicBlockObj;
  };

  render() {
    const {
      disabledButtons
    } = this.props;
    let {
      editorState
    } = this.props;

    if (!(editorState instanceof EditorState)) {
      editorState = EditorState.createEmpty(decorators);
    }

    const {
      isEnlarged,
      readOnly
    } = this.state;
    const entityType = this.getEntityType(editorState);
    const customStyle = this.getCustomStyle(editorState.getCurrentInlineStyle());

    const renderBasicEditor = propsOfBasicEditor => {
      return /*#__PURE__*/React.createElement(RichTextEditor, _extends({}, propsOfBasicEditor, {
        disabledButtons: disabledButtonsOnBasicEditor
      }));
    };

    return /*#__PURE__*/React.createElement(DraftEditor, {
      isEnlarged: isEnlarged
    }, /*#__PURE__*/React.createElement(DraftEditorWrapper, null, /*#__PURE__*/React.createElement("link", {
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
      rel: "stylesheet",
      type: "text/css"
    }), /*#__PURE__*/React.createElement("link", {
      href: "https://storage.googleapis.com/static-readr-tw-dev/cdn/draft-js/rich-editor.css",
      rel: "stylesheet",
      type: "text/css"
    }), /*#__PURE__*/React.createElement("link", {
      href: "https://cdnjs.cloudflare.com/ajax/libs/draft-js/0.11.7/Draft.css",
      rel: "stylesheet",
      type: "text/css"
    }), /*#__PURE__*/React.createElement("link", {
      href: "https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css",
      rel: "stylesheet",
      type: "text/css"
    }), /*#__PURE__*/React.createElement(DraftEditorControls, null, /*#__PURE__*/React.createElement(DraftEditorControlsWrapper, null, /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(BlockStyleControls, {
      disabledButtons: disabledButtons,
      editorState: editorState,
      onToggle: this.toggleBlockType,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(InlineStyleControls, {
      disabledButtons: disabledButtons,
      editorState: editorState,
      onToggle: this.toggleInlineStyle,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(EnlargeButtonWrapper, null, /*#__PURE__*/React.createElement(CustomEnlargeButton, {
      onToggle: this.toggleEnlarge,
      isEnlarged: isEnlarged
    }))), /*#__PURE__*/React.createElement(DraftEditorControlsWrapper, null, /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomLinkButton, {
      isDisabled: disabledButtons.includes(buttonNames.link),
      isActive: entityType === 'LINK',
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomFontColorButton, {
      isDisabled: disabledButtons.includes(buttonNames.fontColor),
      isActive: Object.prototype.hasOwnProperty.call(customStyle, 'color'),
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomDividerButton, {
      isDisabled: disabledButtons.includes(buttonNames.divider),
      editorState: editorState,
      onChange: this.onChange
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomAnnotationButton, {
      isDisabled: disabledButtons.includes(buttonNames.annotation),
      isActive: entityType === 'ANNOTATION',
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly,
      renderBasicEditor: renderBasicEditor
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomImageButton, {
      isDisabled: disabledButtons.includes(buttonNames.image),
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomSlideshowButton, {
      isDisabled: disabledButtons.includes(buttonNames.slideshow),
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomInfoBoxButton, {
      isDisabled: disabledButtons.includes(buttonNames.infoBox),
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly,
      renderBasicEditor: renderBasicEditor
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomEmbeddedCodeButton, {
      isDisabled: disabledButtons.includes(buttonNames.embed),
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly
    })), /*#__PURE__*/React.createElement(ButtonGroup, null, /*#__PURE__*/React.createElement(CustomTableButton, {
      isDisabled: disabledButtons.includes(buttonNames.table),
      editorState: editorState,
      onChange: this.onChange,
      readOnly: this.state.readOnly
    })))), /*#__PURE__*/React.createElement(TextEditorWrapper, {
      onClick: () => {
        var _this$refs$editor;

        ;
        (_this$refs$editor = this.refs.editor) === null || _this$refs$editor === void 0 ? void 0 : _this$refs$editor.focus(); // eslint-disable-line
      }
    }, /*#__PURE__*/React.createElement(Editor, {
      blockStyleFn: getBlockStyle,
      blockRendererFn: this.blockRendererFn,
      customStyleMap: styleMap,
      customStyleFn: this.customStyleFn,
      editorState: editorState,
      handleKeyCommand: this.handleKeyCommand,
      handleReturn: this.handleReturn,
      keyBindingFn: this.mapKeyToEditorCommand,
      onChange: this.onChange,
      placeholder: "Tell a story...",
      ref: "editor",
      spellCheck: true,
      readOnly: readOnly
    }))));
  }

} // Custom overrides for "code" style.

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';

    default:
      return null;
  }
}

class StyleButton extends React.Component {
  onToggle = e => {
    e.preventDefault();
    this.props.onToggle(this.props.style);
  };

  render() {
    return /*#__PURE__*/React.createElement(CustomButton, {
      isDisabled: this.props.isDisabled,
      isActive: this.props.active,
      onMouseDown: this.onToggle,
      readOnly: this.props.readOnly
    }, /*#__PURE__*/React.createElement("i", {
      className: this.props.icon
    }), /*#__PURE__*/React.createElement("span", null, !this.props.icon ? this.props.label : ''));
  }

}

const blockStyles = [{
  label: 'H2',
  style: buttonNames.h2,
  icon: ''
}, {
  label: 'H3',
  style: buttonNames.h3,
  icon: ''
}, {
  label: 'H4',
  style: buttonNames.h4,
  icon: ''
}, {
  label: 'Blockquote',
  style: buttonNames.blockquote,
  icon: 'fas fa-quote-right'
}, {
  label: 'UL',
  style: buttonNames.ul,
  icon: 'fas fa-list-ul'
}, {
  label: 'OL',
  style: buttonNames.ol,
  icon: 'fas fa-list-ol'
}, {
  label: 'Code Block',
  style: buttonNames.codeBlock,
  icon: 'fas fa-code'
}];

const BlockStyleControls = props => {
  const {
    editorState,
    disabledButtons
  } = props;
  const selection = editorState.getSelection();
  const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();
  return /*#__PURE__*/React.createElement("div", {
    className: "RichEditor-controls"
  }, blockStyles.map(type => /*#__PURE__*/React.createElement(StyleButton, {
    isDisabled: disabledButtons.includes(type.style),
    key: type.label,
    active: type.style === blockType,
    label: type.label,
    onToggle: props.onToggle,
    style: type.style,
    icon: type.icon,
    readOnly: props.readOnly
  })));
};

const inlineStyles = [{
  label: 'Bold',
  style: buttonNames.bold.toUpperCase(),
  icon: 'fas fa-bold'
}, {
  label: 'Italic',
  style: buttonNames.italic.toUpperCase(),
  icon: 'fas fa-italic'
}, {
  label: 'Underline',
  style: buttonNames.underline.toUpperCase(),
  icon: 'fas fa-underline'
}, {
  label: 'Monospace',
  style: buttonNames.code.toUpperCase(),
  icon: 'fas fa-terminal'
}];

const InlineStyleControls = props => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  return /*#__PURE__*/React.createElement("div", {
    className: "RichEditor-controls"
  }, inlineStyles.map(type => /*#__PURE__*/React.createElement(StyleButton, {
    isDisabled: props.disabledButtons.includes(type.style.toLowerCase()),
    key: type.label,
    active: currentStyle.has(type.style),
    label: type.label,
    onToggle: props.onToggle,
    style: type.style,
    icon: type.icon,
    readOnly: props.readOnly
  })));
};