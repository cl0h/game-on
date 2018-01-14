// Tests/Utils/DelayAction/DelayAction.js
// Helper for timeout

'use strict';

/**
 * Helper to check if arguments object is empty
 * @private
 */
function isEmpty(args) {
	return Object.keys(args).length === 0 && args.constructor === Object;
}

/**
 * Class name
 * @public
 */
module.exports = class DelayAction {

	/**
	 * Constructor
	 * 
	 * @param {function} callback
	 * @param {number} time
	 * @public
	 */
	constructor() {

		/**
		 * Time in millisecond
		 * @private
		 */
		let _ms = 0;


		/**
		 * Get time in millisecond used for timeout
		 * 
		 * @return {number} millisecond
		 * @public
		 */
		this.getTime = function() {
			return _ms;
		};

		/**
		 * Set time in millisecond used for timeout
		 *
		 * @param {number} millisecond
		 * @public
		 */
		this.setTime = function(value) {
			if (typeof value !== 'number' && typeof value !== 'undefined' && value !== null) {
				throw TypeError('Time must be a number in millisecond.');
			}
			_ms = value || 0;
		};

		/**
		 * Timeout object
		 * @private
		 */
		var _timer = null;

		/**
		 * Set Timeout object
		 * Take params that setTimeout require.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
		 * @private
		 */
		this._setTimer = function() {

			if (isEmpty(arguments)) {
				var self = this;
				_timer = setTimeout(() => {
					self.action();
				}, self.time);
			} else {
				_timer = setTimeout.apply(null, arguments);
			}
		};

		/**
		 * Clear the timeout object
		 *
		 * @param {function} callback
		 * @private
		 */
		this._clearTimer = function(fn) {

			if (typeof fn !== 'function' && fn !== undefined) {
				throw new TypeError('ClearTimer\'s callback must be a function.');
			}
			clearTimeout(_timer);
			if (fn !== undefined) {
				fn();
			}
		};

		/**
		 * Action to run
		 * @return {function} Function defined
		 * @private
		 */
		let _action = null;

		/**
		 * Getter for action
		 * Function used as callback
		 * @public
		 */
		this.getAction = function() {
			return _action;
		};

		/**
		 * Getter for action
		 * Function used as callback
		 * @public
		 */
		this.setAction = function(fn) {

			if (typeof fn !== 'function') {
				throw new TypeError('Action must be a function.');
			}
			_action = fn;
		};

		// If argument provided, populate
		if (!isEmpty(arguments)) {

			/**
			 * Always required function and time
			 */
			this.action = arguments[0];
			this.time = arguments[1];

		}
	}

	/**
	 * Get time in millisecond used for timeout
	 * 
	 * @return {number} millisecond
	 * @public
	 */
	get time() {
		return this.getTime();
	}

	/**
	 * Set time in millisecond used for timeout
	 * 
	 * @param {number} millisecond
	 * @public
	 */
	set time(value) {
		this.setTime(value);
	}

	/**
	 * Get the function provided
	 * @return {function} Function defined
	 * @public
	 */
	get action() {
		return this.getAction();
	}

	/**
	* Set the function to call
	* @param {function} Function to calll
	$ @public
	*/
	set action(fn) {
		this.setAction(fn);
	}

	/**
	 * Start timeout
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
	 * @public
	 */
	start() {
		this._setTimer.apply(this, arguments);
	}

	/**
	 * Start timeout with arguments to pass
	 * to callback
	 *
	 * @params {any}
	 * @public
	 */
	startWith() {
		let self = this;

		/**
		 * Number of additional arguments
		 * Timeout has fn, time and arguments list
		 */
		let argSupp = 2;
		// Add +1 to all keys
		for (let i = arguments.length - 1; i >= 0; i--) {
			let newkey = i + argSupp;
			arguments[newkey] = arguments[i];
		}

		arguments[0] = self.action;
		arguments[1] = self.time;

		arguments.length += argSupp;
		this.start.apply(this, arguments);
	}

	/**
	 * Cancel timeout
	 * Equivalent of clearTimeout
	 *
	 * @param {function} Optional callback
	 * @public
	 */
	cancel(fn) {
		this._clearTimer.apply(this, [fn]);
	}
};