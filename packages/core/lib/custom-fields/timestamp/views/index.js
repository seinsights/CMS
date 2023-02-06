function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/** @jsxRuntime classic */

/** @jsx jsx */
import { useState } from 'react';
import { jsx, Inline, Stack, VisuallyHidden, Text } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { FieldContainer, FieldLabel, TextInput, DatePicker } from '@keystone-ui/fields';
import { CellContainer, CellLink } from '@keystone-6/core/admin-ui/components';
import { useFormattedInput } from '../../utils/integer/utils';
import { constructTimestamp, deconstructTimestamp, formatOutput, parseTime, formatTime } from './utils';
export const Field = ({
  field,
  value,
  onChange,
  forceValidation
}) => {
  var _field$fieldMeta$defa;

  const [touchedFirstInput, setTouchedFirstInput] = useState(false);
  const [touchedSecondInput, setTouchedSecondInput] = useState(false);
  const showValidation = touchedFirstInput && touchedSecondInput || forceValidation;
  const validationMessages = showValidation ? validate(value, field.fieldMeta, field.label) : undefined;
  const timeInputProps = useFormattedInput({
    format({
      value
    }) {
      if (value === null) {
        return '';
      }

      return formatTime(value);
    },

    parse(value) {
      value = value.trim();

      if (value === '') {
        return {
          kind: 'parsed',
          value: null
        };
      }

      const parsed = parseTime(value);

      if (parsed !== undefined) {
        return {
          kind: 'parsed',
          value: parsed
        };
      }

      return value;
    }

  }, {
    value: value.value.timeValue,

    onChange(timeValue) {
      onChange === null || onChange === void 0 ? void 0 : onChange({ ...value,
        value: { ...value.value,
          timeValue
        }
      });
    },

    onBlur() {
      setTouchedSecondInput(true);
    }

  });
  const hasNowButton = field.customConfig.hasNowButton;
  const hideTime = field.customConfig.hideTime;

  const nowHandler = () => {
    const now = new Date(Date.now()); // 個位數必須補0不然會報錯

    const nowDate = `${now.getFullYear()}-${now.getMonth() + 1 < 10 ? 0 : ''}${now.getMonth() + 1}-${now.getDate() < 10 ? 0 : ''}${now.getDate()}`;
    const nowTime = `${now.getHours() < 10 ? 0 : ''}${now.getHours()}:${now.getMinutes() < 10 ? 0 : ''}${now.getMinutes()}:00.000`;
    onChange({ ...value,
      value: {
        dateValue: nowDate,
        timeValue: typeof value.value.timeValue === 'object' && value.value.timeValue.value === null || hideTime ? {
          kind: 'parsed',
          value: '00:00:00.000'
        } : {
          kind: 'parsed',
          value: nowTime
        }
      }
    }); // trigger validation

    setTouchedFirstInput(true);
    setTouchedSecondInput(true);
  };

  return jsx(FieldContainer, {
    as: "fieldset"
  }, jsx(Stack, null, jsx(FieldLabel, {
    as: "legend"
  }, field.label), onChange ? jsx(Inline, {
    gap: "small"
  }, jsx(Stack, null, jsx(DatePicker, {
    onUpdate: date => {
      onChange({ ...value,
        value: {
          dateValue: date,
          timeValue: typeof value.value.timeValue === 'object' && value.value.timeValue.value === null && hideTime ? {
            kind: 'parsed',
            value: '00:00:00.000'
          } : value.value.timeValue
        }
      });
    },
    onClear: () => {
      onChange({ ...value,
        value: { ...value.value,
          dateValue: null
        }
      });
    },
    onBlur: () => setTouchedFirstInput(true),
    value: value.value.dateValue ?? ''
  }), (validationMessages === null || validationMessages === void 0 ? void 0 : validationMessages.date) && jsx(Text, {
    color: "red600",
    size: "small"
  }, validationMessages.date)), !hideTime ? jsx(Stack, null, jsx(VisuallyHidden, {
    as: "label",
    htmlFor: `${field.path}--time-input`
  }, `${field.label} time field`), jsx(TextInput, _extends({
    id: `${field.path}--time-input`
  }, timeInputProps, {
    disabled: onChange === undefined,
    placeholder: "00:00"
  })), (validationMessages === null || validationMessages === void 0 ? void 0 : validationMessages.time) && jsx(Text, {
    color: "red600",
    size: "small"
  }, validationMessages.time)) : null, hasNowButton ? jsx(Stack, null, jsx(Button, {
    onClick: nowHandler
  }, "NOW")) : null) : value.value.dateValue !== null && typeof value.value.timeValue === 'object' && value.value.timeValue.value !== null && jsx(Text, null, formatOutput(constructTimestamp({
    dateValue: value.value.dateValue,
    timeValue: value.value.timeValue.value
  }))), (value.kind === 'create' && typeof field.fieldMeta.defaultValue !== 'string' && ((_field$fieldMeta$defa = field.fieldMeta.defaultValue) === null || _field$fieldMeta$defa === void 0 ? void 0 : _field$fieldMeta$defa.kind) === 'now' || field.fieldMeta.updatedAt) && jsx(Text, null, "When this item is saved, this field will be set to the current date and time")));
};

function validate(value, fieldMeta, label) {
  var _fieldMeta$defaultVal;

  const val = value.value;
  const hasDateValue = val.dateValue !== null;
  const hasTimeValue = typeof val.timeValue === 'string' || typeof val.timeValue.value === 'string';
  const isValueEmpty = !hasDateValue && !hasTimeValue; // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error

  if (value.kind === 'update' && value.initial === null && isValueEmpty) {
    return undefined;
  }

  if (value.kind === 'create' && isValueEmpty && (typeof fieldMeta.defaultValue === 'object' && ((_fieldMeta$defaultVal = fieldMeta.defaultValue) === null || _fieldMeta$defaultVal === void 0 ? void 0 : _fieldMeta$defaultVal.kind) === 'now' || fieldMeta.updatedAt)) {
    return undefined;
  }

  if (fieldMeta.isRequired && isValueEmpty) {
    return {
      date: `${label} is required`
    };
  }

  if (hasDateValue && !hasTimeValue) {
    return {
      time: `${label} requires a time to be provided`
    };
  }

  const timeError = typeof val.timeValue === 'string' ? `${label} requires a valid time in the format hh:mm` : undefined;

  if (hasTimeValue && !hasDateValue) {
    return {
      date: `${label} requires a date to be selected`,
      time: timeError
    };
  }

  if (timeError) {
    return {
      time: timeError
    };
  }

  return undefined;
}

export const Cell = ({
  item,
  field,
  linkTo
}) => {
  let value = item[field.path];
  return linkTo ? jsx(CellLink, linkTo, formatOutput(value)) : jsx(CellContainer, null, formatOutput(value));
};
Cell.supportsLinkTo = true;
export const CardValue = ({
  item,
  field
}) => {
  return jsx(FieldContainer, null, jsx(FieldLabel, null, field.label), formatOutput(item[field.path]));
};
export const controller = config => {
  var _config$fieldMeta, _config$fieldMeta$cus, _config$fieldMeta2, _config$fieldMeta2$cu;

  return {
    customConfig: {
      hasNowButton: (_config$fieldMeta = config.fieldMeta) === null || _config$fieldMeta === void 0 ? void 0 : (_config$fieldMeta$cus = _config$fieldMeta.customConfig) === null || _config$fieldMeta$cus === void 0 ? void 0 : _config$fieldMeta$cus.hasNowButton,
      hideTime: (_config$fieldMeta2 = config.fieldMeta) === null || _config$fieldMeta2 === void 0 ? void 0 : (_config$fieldMeta2$cu = _config$fieldMeta2.customConfig) === null || _config$fieldMeta2$cu === void 0 ? void 0 : _config$fieldMeta2$cu.hideTime
    },
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    fieldMeta: config.fieldMeta,
    defaultValue: {
      kind: 'create',
      value: typeof config.fieldMeta.defaultValue === 'string' ? deconstructTimestamp(config.fieldMeta.defaultValue) : {
        dateValue: null,
        timeValue: {
          kind: 'parsed',
          value: null
        }
      }
    },
    deserialize: data => {
      const value = data[config.path];
      return {
        kind: 'update',
        initial: data[config.path],
        value: value ? deconstructTimestamp(value) : {
          dateValue: null,
          timeValue: {
            kind: 'parsed',
            value: null
          }
        },
        customConfig: {
          hasNowButton: true,
          hideTime: false
        }
      };
    },
    serialize: ({
      value: {
        dateValue,
        timeValue
      }
    }) => {
      if (dateValue && typeof timeValue === 'object' && timeValue.value !== null) {
        let formattedDate = constructTimestamp({
          dateValue,
          timeValue: timeValue.value
        });
        return {
          [config.path]: formattedDate
        };
      }

      return {
        [config.path]: null
      };
    },
    validate: value => validate(value, config.fieldMeta, config.label) === undefined
  };
};