// Tests/Utils/DelayAction/DelayAction.spec.js

'use strict';
/**
 * Test dependencies
 * @private
 */
const chai = require('chai');
const assert = chai.assert;
chai.should();

/**
 * Module tested
 * @private
 */
const DelayAction = require('./delayaction');

describe('DelayAction unit test', () => {

	/**
	 * Set timeout to fail if test not 
	 * finish above thresold.
	 *
	 * Default set to 200 ms.
	 * Throw error on done.
	 * 
	 * @param {function} done
	 * @param {number} Optional time in ms
	 * @return {timeout object}
	 * @private
	 */
	function failBeforeTime(done, time) {
		if (time === undefined) {
			time = 200;
		}

		return setTimeout(() => {
			done(new Error('Timeout not started below ' + time + '.'));
		}, time);
	}

	describe('Class definition', () => {

		it('should have constructor', () => {
			assert.isDefined((new DelayAction()), 'Construct');
		});

		it('should have property timeout not exposed', () => {
			assert.isUndefined((new DelayAction()).timeout, 'Timeout not exposed');
			assert.isUndefined((new DelayAction()).watcher, 'Timeout not exposed');

		});



		it('should have a cancel function', () => {
			assert.isFunction((new DelayAction()).cancel, 'Cancel is function?');
		});

	});

	describe('Constructor', () => {

		it('should take args of setTimeout', () => {
			let time = 5;
			let action = function() {};
			let da = new DelayAction(action, time);
			assert.equal(da.time, time);
			assert.equal(da.action, action);
		});

		it('should validate argument provided', () => {
			let action = 'invalid action';

			(() => {
				new DelayAction(action, 500);
			}).should.throw(TypeError);

			(() => {
				new DelayAction(function() {});
			}).should.not.throw(TypeError);

			(() => {
				new DelayAction(function() {}, null, 'test');
			}).should.not.throw(TypeError);
		});

	});

	describe('Action property', () => {

		it('should have property action with null as default', () => {

			let timer = new DelayAction();
			assert.isDefined(timer.action, 'Action defined?');
			assert.isNull(timer.action, 'Action null?');

		});

		it('should not exposed _action', () => {
			assert.isUndefined((new DelayAction())._action, 'Action undefined?');
		});

		it('should allow to set action', () => {
			let timer = new DelayAction();
			(() => {
				timer.action = function() {};
			}).should.not.throw();

		});

		it('should throw when other than function', () => {
			let timer = new DelayAction();

			(() => {
				timer.action = 'Error type';
			}).should.throw(TypeError);

			(() => {
				timer.action = Object.create();
			}).should.throw(TypeError);

			(() => {
				timer.action = [];
			}).should.throw(TypeError);

		});

	});

	describe('Time property', () => {

		it('should have property time with 0 as default', () => {
			let timer = new DelayAction();
			assert.isDefined(timer.time, 'Time defined?');
			assert.equal(timer.time, 0, 'Time set 0 per default');
		});

		it('should not exposed _ms', () => {
			assert.isUndefined((new DelayAction())._ms, '_ms not exist?');
		});

		it('should set time', () => {
			let expected = 100;
			let timer = new DelayAction();
			timer.time = expected;
			assert.equal(timer.time, expected, 'Value set?');
		});

		it('should not accept others than number', () => {
			(() => {
				(new DelayAction()).time = 'hello string';
			}).should.throw(TypeError);

			(() => {
				(new DelayAction()).time = Object.create();
			}).should.throw(TypeError);

			(() => {
				(new DelayAction()).time = function() {};
			}).should.throw(TypeError);

			(() => {
				(new DelayAction()).time = [];
			}).should.throw(TypeError);

		});

	});

	describe('Set time', () => {

		it('should set at 0 if value not provided', () => {
			var timer = new DelayAction();
			timer.setTime();
			assert.equal(timer.time, 0);
		});

		it('should set at 0 if value null', () => {
			var timer = new DelayAction();
			timer.setTime(null);
			assert.equal(timer.time, 0);
		});
	});
	describe('Start method', () => {

		it('should have a start function', () => {
			assert.isFunction((new DelayAction()).start, 'Start is function?');
		});


		it('should start timer', (done) => {
			let killer = failBeforeTime(done);
			let timer = new DelayAction();
			timer.time = 10;
			timer.start(() => {
				clearTimeout(killer);
				done();
			});
		});

		it('should run action provided', (done) => {

			let da = new DelayAction();

			da.time = 5;
			da.action = function() {
				done();
			};

			da.start();
		});

		it('should restart when changing action', (done) => {
			let killer = failBeforeTime(done);

			let timer = new DelayAction();
			timer.time = 5;
			timer.action = function() {
				done(new Error('This action should not have been called.'));
			};

			setTimeout(() => {
				timer.action = function() {
					clearTimeout(killer);
					assert.isOk(true);
					done();
				};
			}, 2);

			timer.start();
		});

	});

	describe('startWith', () => {

		it('should have the method', () => {
			assert.isFunction((new DelayAction()).startWith, 'startWith function?');
		});

		it('should pass arguments to function', (done) => {
			var killer = failBeforeTime(done);
			let da = new DelayAction();

			let expected1 = 'test1',
				expected2 = 'test2',
				expected3 = 'test3';

			da.time = 5;
			da.action = function(arg1, arg2, arg3) {
				clearTimeout(killer);
				assert.equal(arg1, expected1);
				assert.equal(arg2, expected2);
				assert.equal(arg3, expected3);
				done();
			};

			da.startWith(expected1, expected2, expected3);
		});
	});

	describe('Cancel', () => {

		it('should have the method', () => {
			assert.isFunction((new DelayAction()).cancel, 'Cancel is function?');
		});

		it('should cancel action from running', (done) => {
			let killer = failBeforeTime(done);

			let timer = new DelayAction();
			timer.time = 2;
			timer.action = function() {
				clearTimeout(killer);
				done(new Error('Action should have not been called.'));
			};

			timer.start();
			timer.cancel(() => {
				clearTimeout(killer);
				done();
			});
		});

		it('should only cancel action if callback is function', (done) => {
			let killer = failBeforeTime(done);

			let timer = new DelayAction();
			timer.time = 2;
			timer.action = function() {
				clearTimeout(killer);
				done();
			};

			timer.start();
			(() => {
				timer.cancel('this is not function.');
			}).should.throw(TypeError);
		});

		it('should cancel event if no callback provided', (done) => {
			let killer = failBeforeTime(done);

			let timer = new DelayAction();
			timer.time = 2;
			timer.action = function() {
				clearTimeout(killer);
				done(new Error('Action should not have been called.'));
			};

			timer.start();
			(() => {
				timer.cancel();
			}).should.not.throw(TypeError);
			clearTimeout(killer);
			done();
		});

	});
});