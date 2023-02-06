"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upcase = exports.humanize = void 0;

/**
 * Converts the first character of a string to uppercase.
 * @param {String} str The string to convert.
 * @returns The new string
 */
const upcase = str => str.substr(0, 1).toUpperCase() + str.substr(1);
/**
 * Turns a passed in string into
 * a human readable label
 * @param {String} str The string to convert.
 * @returns The new string
 */


exports.upcase = upcase;

const humanize = str => {
  return str.replace(/([a-z])([A-Z]+)/g, '$1 $2').split(/\s|_|\-/).filter(i => i).map(upcase).join(' ');
};

exports.humanize = humanize;