import Global from './Global';

/** path :: ([String], JsObj?) -> JsObj */
var path = function (parts: string[], scope?: {}) {
  var o = scope !== undefined && scope !== null ? scope : Global;
  for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
    o = o[parts[i]];
  return o;
};

/** resolve :: (String, JsObj?) -> JsObj */
var resolve = function (p: string, scope?: {}) {
  var parts = p.split('.');
  return path(parts, scope);
};

/** step :: (JsObj, String) -> JsObj */
var step = function (o: {}, part: string) {
  if (o[part] === undefined || o[part] === null)
    o[part] = {};
  return o[part];
};

/** forge :: ([String], JsObj?) -> JsObj */
var forge = function (parts: string[], target?: {}) {
  var o = target !== undefined ? target : Global;
  for (var i = 0; i < parts.length; ++i)
    o = step(o, parts[i]);
  return o;
};

/** namespace :: (String, JsObj?) -> JsObj */
var namespace = function (name: string, target?: {}) {
  var parts = name.split('.');
  return forge(parts, target);
};

export default {
  path: path,
  resolve: resolve,
  forge: forge,
  namespace: namespace
};