/**
 * Copyright 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
*/

'use strict';

/**
 * The warning() and invariant() functions take format strings as their second
 * argument.
 */

module.exports = function(context) {
  // we also allow literal strings and concatinated literal strings
  function getLiteralString(node) {
    if (node.type === 'Literal' && typeof node.value === 'string') {
      return node.value;
    } else if (node.type === 'BinaryExpression' && node.operator === '+') {
      var l = getLiteralString(node.left);
      var r = getLiteralString(node.right);
      if (l !== null && r !== null) {
        return l + r;
      }
    }
    return null;
  }

  return {
    CallExpression: function(node) {
      // This could be a little smarter by checking context.getScope() to see
      // how warning/invariant was defined.
      var isWarningOrInvariant =
        node.callee.type === 'Identifier' &&
        (node.callee.name === 'warning' || node.callee.name === 'invariant');
      if (!isWarningOrInvariant) {
        return;
      }
      if (node.arguments.length < 2) {
        context.report(
          node,
          '{{name}} takes at least two arguments',
          {name: node.callee.name}
        );
        return;
      }
      var str = getLiteralString(node.arguments[1]);
      if (str === null) {
        context.report(
          node,
          'The second argument to {{name}} must be a string literal',
          {name: node.callee.name}
        );
        return;
      }
      // count the number of string substitutions, plus the first two args
      var expectedNArgs = (str.match(/%s/g) || []).length + 2;
      if (node.arguments.length !== expectedNArgs) {
        context.report(
          node,
          'Expected {{expectedNArgs}} arguments in call to {{name}}, but ' +
          'got {{length}} based on the number of "%s" substitutions',
          {
            expectedNArgs: expectedNArgs,
            name: node.callee.name,
            length: node.arguments.length,
          }
        );
      }
    },
  };
};

module.exports.schema = [];
