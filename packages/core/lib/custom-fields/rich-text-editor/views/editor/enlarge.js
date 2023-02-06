import React from 'react';
export function EnlargeButton(props) {
  const {
    onToggle,
    isEnlarged,
    className
  } = props;
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    onClick: onToggle
  }, /*#__PURE__*/React.createElement("i", {
    className: isEnlarged ? 'fas fa-compress' : 'fas fa-expand'
  }));
}