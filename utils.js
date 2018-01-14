// utils.js
// Utilities functions

/**
 * Output to console
 * @note Log only if not test
 * 
 * @param {string} message
 * @public
 */
module.exports.log = function(msg) {
	"use strict";
	if (process.env.NODE_ENV !== 'test') {
		console.log(msg);
	}
};