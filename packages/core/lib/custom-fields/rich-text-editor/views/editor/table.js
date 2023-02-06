import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { AtomicBlockUtils, Editor, EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import cloneDeep from 'lodash/cloneDeep';
const _ = {
  cloneDeep
};
var ActionType;

(function (ActionType) {
  ActionType["Insert"] = "insert";
  ActionType["Delete"] = "delete";
  ActionType["Update"] = "update";
})(ActionType || (ActionType = {}));

var TableEnum;

(function (TableEnum) {
  TableEnum["Row"] = "row";
  TableEnum["Column"] = "column";
})(TableEnum || (TableEnum = {}));

function createEmptyRow(colLen = 0, emptyValue) {
  const rtn = [];

  for (let i = 0; i < colLen; i++) {
    rtn.push(emptyValue);
  }

  return rtn;
}

function resolveTableStyles(action, tableStyles) {
  switch (action === null || action === void 0 ? void 0 : action.type) {
    case ActionType.Insert:
      {
        if (action.target === TableEnum.Row) {
          const rows = [...tableStyles.rows.slice(0, action.index), {}, ...tableStyles.rows.slice(action.index)];
          return Object.assign({}, tableStyles, {
            rows
          });
        } // TODO: handle target === TableEnum.Column if needed


        return tableStyles;
      }

    case ActionType.Delete:
      {
        if (action.target === TableEnum.Row) {
          const rows = [...tableStyles.rows.slice(0, action.index), ...tableStyles.rows.slice(action.index + 1)];
          return Object.assign({}, tableStyles, {
            rows
          });
        } // TODO: handle target === TableEnum.Column if needed


        return tableStyles;
      }
    // TODO: handle action.type === ActionType.Update if needed

    default:
      {
        return tableStyles;
      }
  }
}

function resolveTableData(action, tableData) {
  switch (action === null || action === void 0 ? void 0 : action.type) {
    case ActionType.Insert:
      {
        var _tableData$;

        if (typeof (action === null || action === void 0 ? void 0 : action.index) !== 'number') {
          return tableData;
        }

        if ((action === null || action === void 0 ? void 0 : action.target) === TableEnum.Column) {
          // add the new column at specific position in each row
          return tableData.map(r => [...r.slice(0, action === null || action === void 0 ? void 0 : action.index), EditorState.createEmpty(), ...r.slice(action === null || action === void 0 ? void 0 : action.index)]);
        } // add the new row


        return [...tableData.slice(0, action === null || action === void 0 ? void 0 : action.index), createEmptyRow(tableData === null || tableData === void 0 ? void 0 : (_tableData$ = tableData[0]) === null || _tableData$ === void 0 ? void 0 : _tableData$.length, EditorState.createEmpty()), ...tableData.slice(action === null || action === void 0 ? void 0 : action.index)];
      }

    case ActionType.Delete:
      {
        if (typeof (action === null || action === void 0 ? void 0 : action.index) !== 'number') {
          return tableData;
        }

        if ((action === null || action === void 0 ? void 0 : action.target) === 'column') {
          // delete the column at specific position in each row
          return tableData.map(r => [...r.slice(0, action.index), ...r.slice(action.index + 1)]);
        } // delete the column


        return [...tableData.slice(0, action.index), ...tableData.slice(action.index + 1)];
      }

    case ActionType.Update:
      {
        // The reason we copy the array is to make sure
        // that React component re-renders.
        const copiedData = [...tableData];

        if (typeof (action === null || action === void 0 ? void 0 : action.rIndex) !== 'number' || typeof (action === null || action === void 0 ? void 0 : action.cIndex) !== 'number') {
          return copiedData;
        }

        copiedData[action.rIndex][action.cIndex] = action === null || action === void 0 ? void 0 : action.value;
        return copiedData;
      }

    default:
      {
        return tableData;
      }
  }
}

function convertTableDataFromRaw(rawTableData) {
  return rawTableData.map(rowData => {
    return rowData.map(colData => {
      const contentState = convertFromRaw(colData);
      return EditorState.createWithContent(contentState);
    });
  });
}

function convertTableDataToRaw(tableData) {
  return tableData.map(rowData => {
    return rowData.map(colData => {
      return convertToRaw(colData.getCurrentContent());
    });
  });
}

const Table = styled.div`
  display: table;
  width: 95%;
  border-collapse: collapse;
`;
const Tr = styled.div`
  display: table-row;
`;
const Td = styled.div`
  display: table-cell;
  border-width: 1px;
  min-width: 100px;
  min-height: 40px;
  padding: 10px;
`;
const StyledFirstRow = styled.div`
  display: table-row;
  height: 10px;

  div {
    display: table-cell;
    position: relative;
  }

  span {
    cursor: pointer;
    line-height: 10px;
  }

  span:first-child {
    position: absolute;
    right: 50%;
    transform: translateX(50%);
  }

  span:first-child:before {
    content: '•';
  }

  span:first-child:hover:before {
    content: '➖';
  }

  span:last-child {
    position: absolute;
    right: -5px;
  }

  span:last-child:before {
    content: '•';
  }

  span:last-child:hover:before {
    content: '➕';
  }
`;
const StyledFirstColumn = styled.div`
  display: table-cell;
  width: 10px;
  position: relative;

  span {
    cursor: pointer;
  }

  span:first-child {
    position: absolute;
    bottom: 50%;
    right: 0px;
    transform: translateY(50%);
  }

  span:first-child:before {
    content: '•';
  }

  span:first-child:hover:before {
    content: '➖';
  }

  span:last-child {
    position: absolute;
    bottom: -10px;
    right: 0px;
  }

  span:last-child:before {
    content: '•';
  }

  span:last-child:hover:before {
    content: '➕';
  }
`;
const TableBlockContainer = styled.div`
  margin: 15px 0;
  position: relative;
  overflow: scroll;
  padding: 15px;
`;
export const TableBlock = props => {
  var _tableData$2;

  const {
    block,
    blockProps,
    contentState
  } = props;
  const {
    onEditStart,
    onEditFinish,
    getMainEditorReadOnly
  } = blockProps;
  const entityKey = block.getEntityAt(0);
  const entity = contentState.getEntity(entityKey);
  const {
    tableData: rawTableData,
    tableStyles: _tableStyles
  } = entity.getData();
  const [tableData, setTableData] = useState(convertTableDataFromRaw(rawTableData)); // deep clone `_tableStyles` to prevent updating the entity data directly

  const [tableStyles, setTableStyles] = useState(_.cloneDeep(_tableStyles));
  const tableRef = useRef(null); // `TableBlock` will render other inner/nested DraftJS Editors inside the main Editor.
  // However, main Editor's `readOnly` needs to be mutually exclusive with nested Editors' `readOnly`.
  // If the main Editor and nested Editor are editable (`readOnly={false}`) at the same time,
  // there will be a DraftJS Edtior Selection bug.

  const [cellEditorReadOnly, setCellEditorReadOnly] = useState(!getMainEditorReadOnly()); // The user clicks the table for editing

  const onTableClick = () => {
    // call `onEditStart` function to tell the main DraftJS Editor
    // that we are going to interact with the custom atomic block.
    onEditStart(); // make nested DraftJS Editors editable

    setCellEditorReadOnly(false);
  };

  useEffect(() => {
    // The user clicks other places except the table,
    // so we think he/she doesn't want to edit the table anymore.
    // Therefore, we call `onEditFinish` function to pass modified table data
    // back to the main DraftJS Edtior.
    function handleClickOutside(event) {
      // `!cellEditorReadOnly` condition is needed.
      //  If there are two tables in the main Editor,
      //  this `handleClickOutside` will only handle the just updated one.
      if (tableRef.current && !tableRef.current.contains(event.target) && !cellEditorReadOnly) {
        // make inner DraftJS Editors NOT editable
        setCellEditorReadOnly(true); // call `onEditFinish` function tell the main DraftJS Editor
        // that we are finishing interacting with the custom atomic block.

        onEditFinish({
          entityKey,
          entityData: {
            tableData: convertTableDataToRaw(tableData),
            tableStyles
          }
        });
      }
    }

    console.debug('(rich-text-editor/table): add click outside event listener');
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      console.debug('(rich-text-editor/table): remove click outside event listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, // Skip running effect if `tableData` and `cellEditorReadOnly` are not changed.
  [tableData, cellEditorReadOnly]);
  return /*#__PURE__*/React.createElement(TableBlockContainer, null, /*#__PURE__*/React.createElement(Table, {
    key: entityKey,
    onClick: onTableClick,
    ref: tableRef
  }, /*#__PURE__*/React.createElement(StyledFirstRow, null, /*#__PURE__*/React.createElement("div", null), tableData === null || tableData === void 0 ? void 0 : (_tableData$2 = tableData[0]) === null || _tableData$2 === void 0 ? void 0 : _tableData$2.map((colData, cIndex) => {
    return /*#__PURE__*/React.createElement("div", {
      key: `col_${cIndex + 1}`
    }, /*#__PURE__*/React.createElement("span", {
      onClick: () => {
        const deleteColumn = {
          type: ActionType.Delete,
          target: TableEnum.Column,
          index: cIndex
        };
        const updatedTableData = resolveTableData(deleteColumn, tableData);
        setTableData(updatedTableData);
      }
    }), /*#__PURE__*/React.createElement("span", {
      onClick: () => {
        const insertColumn = {
          type: ActionType.Insert,
          target: TableEnum.Column,
          index: cIndex + 1
        };
        const updatedTableData = resolveTableData(insertColumn, tableData);
        setTableData(updatedTableData);
      }
    }));
  })), tableData.map((rowData, rIndex) => {
    var _tableStyles$rows;

    const colsJsx = rowData.map((colData, cIndex) => {
      return /*#__PURE__*/React.createElement(Td, {
        key: `col_${cIndex}`
      }, /*#__PURE__*/React.createElement(Editor, {
        onChange: editorState => {
          const updateAction = {
            type: ActionType.Update,
            cIndex,
            rIndex,
            value: editorState
          };
          const updatedTableData = resolveTableData(updateAction, tableData);
          setTableData(updatedTableData);
        },
        editorState: colData,
        readOnly: cellEditorReadOnly
      }));
    });
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: `row_${rIndex}`
    }, /*#__PURE__*/React.createElement(Tr, {
      style: tableStyles === null || tableStyles === void 0 ? void 0 : (_tableStyles$rows = tableStyles.rows) === null || _tableStyles$rows === void 0 ? void 0 : _tableStyles$rows[rIndex]
    }, /*#__PURE__*/React.createElement(StyledFirstColumn, null, /*#__PURE__*/React.createElement("span", {
      onClick: () => {
        const deleteRowAction = {
          type: ActionType.Delete,
          target: TableEnum.Row,
          index: rIndex
        };
        const updatedTableData = resolveTableData(deleteRowAction, tableData);
        setTableData(updatedTableData);
        setTableStyles(resolveTableStyles(deleteRowAction, tableStyles));
      }
    }), /*#__PURE__*/React.createElement("span", {
      onClick: () => {
        const addRowAction = {
          type: ActionType.Insert,
          target: TableEnum.Row,
          index: rIndex + 1
        };
        const updatedTableData = resolveTableData(addRowAction, tableData);
        setTableData(updatedTableData);
        setTableStyles(resolveTableStyles(addRowAction, tableStyles));
      }
    })), colsJsx));
  })));
};
export function TableButton(props) {
  const {
    editorState,
    onChange,
    className
  } = props;

  const onClick = () => {
    const rawDarftContentState = {
      blocks: [],
      entityMap: {}
    };
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity('TABLE', 'IMMUTABLE', {
      // `tableStyles` is to used to store custom React CSS inline styles.
      // Therefore, please make sure the style name needs to be camelCase.
      tableStyles: {
        // We can customize the inline styles of each row.
        rows: [// thead has different background color.
        {
          backgroundColor: '#f2f2f2'
        }, {}, {}],
        // TODO: add column styles and cell styles if needed
        columns: [],
        cells: []
      },
      // We use two dimensions array to store the data.
      // The items of the array represent the rows,
      // and each item is also an array, which represents the columns.
      // Take the following array as example.
      // It is a
      // row: 3
      // column: 2
      // sheet data stored in a 2 dimensions arrary.
      tableData: [[rawDarftContentState, rawDarftContentState], [rawDarftContentState, rawDarftContentState], [rawDarftContentState, rawDarftContentState]]
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity
    }); // The third parameter here is a space string, not an empty string
    // If you set an empty string, you will get an error: Unknown DraftEntity key: null

    onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
  };

  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    className: className
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa fa-table"
  }), /*#__PURE__*/React.createElement("span", null, "Table"));
}