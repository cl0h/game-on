/**
 * Share enum between node and front-end
 */
(function(global) {
	'use strict';
	/**
	 * Enum for Permission Type
	 * @type {string}
	 * @public
	 */
	const PermissionType = Object.freeze({
		DENIED: 'denied',
		GRANTED: 'granted',
		DEFAULT: 'default'
	});

	/**
	 * Enum for chat events
	 * @type {string}
	 * @public
	 */
	const ChatEventType = Object.freeze({
		// When message sent/receive
		CHAT: 'chat'
	});

	/**
	 * Enum for Table events
	 * @type {string}
	 */
	const TableEventType = Object.freeze({
		// When new table is created
		START_TABLE: 'start_table',
		// When player connect
		DRAW_TABLE: 'draw_table',
		// When player join
		UPDATE_TABLE: 'update_table',
		// When table full
		FULL_TABLE: 'full_table',
		// When user click on clear table
		CLEAR_TABLE: 'clear_table',
		// When user joined
		ADD_PLAYER: 'add_player'
	});

	let sharedEnum = {
		PermissionType: PermissionType,
		ChatEventType: ChatEventType,
		TableEventType: TableEventType
	};

	// CommonJS and Node.js module support.
	if (typeof exports !== 'undefined') {
		// Support Node.js specific `module.exports` (which can be a function)
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = sharedEnum;
		}
		// But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
		exports.sharedEnum = sharedEnum;
	} else {
		global.sharedEnum = sharedEnum;
	}
})(this);