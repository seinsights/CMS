"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertCreateIsNonNullAllowed = assertCreateIsNonNullAllowed;
exports.assertReadIsNonNullAllowed = assertReadIsNonNullAllowed;
exports.getResolvedIsNullable = getResolvedIsNullable;
exports.hasCreateAccessControl = hasCreateAccessControl;
exports.hasReadAccessControl = hasReadAccessControl;

function hasReadAccessControl(access) {
  if (access === undefined) {
    return false;
  }

  return typeof access === 'function' || typeof access.read === 'function';
}

function hasCreateAccessControl(access) {
  if (access === undefined) {
    return false;
  }

  return typeof access === 'function' || typeof access.create === 'function';
}

function getResolvedIsNullable(validation, db) {
  if ((db === null || db === void 0 ? void 0 : db.isNullable) === false) {
    return false;
  }

  if ((db === null || db === void 0 ? void 0 : db.isNullable) === undefined && validation !== null && validation !== void 0 && validation.isRequired) {
    return false;
  }

  return true;
}

function assertReadIsNonNullAllowed(meta, config, resolvedIsNullable) {
  var _config$graphql, _config$graphql$read;

  if ((_config$graphql = config.graphql) !== null && _config$graphql !== void 0 && (_config$graphql$read = _config$graphql.read) !== null && _config$graphql$read !== void 0 && _config$graphql$read.isNonNull) {
    if (resolvedIsNullable) {
      throw new Error(`The field at ${meta.listKey}.${meta.fieldKey} sets graphql.read.isNonNull: true but not validation.isRequired: true or db.isNullable: false.\n` + `Set validation.isRequired: true or db.isNullable: false or disable graphql.read.isNonNull`);
    }

    if (hasReadAccessControl(config.access)) {
      throw new Error(`The field at ${meta.listKey}.${meta.fieldKey} sets graphql.read.isNonNull: true and has read access control, this is not allowed.\n` + 'Either disable graphql.read.isNonNull or read access control.');
    }
  }
}

function assertCreateIsNonNullAllowed(meta, config) {
  var _config$graphql2, _config$graphql2$crea;

  if ((_config$graphql2 = config.graphql) !== null && _config$graphql2 !== void 0 && (_config$graphql2$crea = _config$graphql2.create) !== null && _config$graphql2$crea !== void 0 && _config$graphql2$crea.isNonNull && hasCreateAccessControl(config.access)) {
    throw new Error(`The field at ${meta.listKey}.${meta.fieldKey} sets graphql.create.isNonNull: true and has create access control, this is not allowed.\n` + 'Either disable graphql.create.isNonNull or create access control.');
  }
}