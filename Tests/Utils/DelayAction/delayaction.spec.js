// Tests/Utils/DelayAction/DelayAction.spec.js

'use strict';
/**
 * Test dependencies
 * @private
 */



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
			expect((new DelayAction())).toBeDefined();
		});

		it('should have property timeout not exposed', () => {
			expect((new DelayAction()).timeout).not.toBeDefined();
			expect((new DelayAction()).watcher).not.toBeDefined();

		});



		it('should have a cancel function', () => {
			expect(typeof (new DelayAction()).cancel).toBe('function');
		});

	});

	describe('Constructor', () => {

		it('should take args of setTimeout', () => {
			let time = 5;
			let action = function() {};
			let da = new DelayAction(action, time);
			expect(da.time).toEqual(time);
			expect(da.action).toEqual(action);
		});

		it('should validate argument provided', () => {
			let action = 'invalid action';

			expect((() => {
				new DelayAction(action, 500);
			})).toThrow(TypeError);

			expect((() => {
				new DelayAction(function() {});
			})).not.toThrow(TypeError);

			expect((() => {
				new DelayAction(function() {}, null, 'test');
			})).not.toThrow(TypeError);
		});

	});

	describe('Action property', () => {

		it('should have property action with null as default', () => {

			let timer = new DelayAction();
			expect(timer.action).toBeDefined();
			expect(timer.action).toBeNull();

		});

		it('should not exposed _action', () => {
			expect((new DelayAction())._action).not.toBeDefined();
		});

		it('should allow to set action', () => {
			let timer = new DelayAction();
			expect((() => {
				timer.action = function() {};
			})).not.toThrow();

		});

		it('should throw when other than function', () => {
			let timer = new DelayAction();

			expect((() => {
				timer.action = 'Error type';
			})).toThrow(TypeError);

			expect((() => {
				timer.action = Object.create();
			})).toThrow(TypeError);

			expect((() => {
				timer.action = [];
			})).toThrow(TypeError);

		});

	});

	describe('Time property', () => {

		it('should have property time with 0 as default', () => {
			let timer = new DelayAction();
			expect(timer.time).toBeDefined();
			expect(timer.time).toEqual(0);
		});

		it('should not exposed _ms', () => {
			expect((new DelayAction())._ms).not.toBeDefined();
		});

		it('should set time', () => {
			let expected = 100;
			let timer = new DelayAction();
			timer.time = expected;
			expect(timer.time).toEqual(expected);
		});

		it('should not accept others than number', () => {
			expect((() => {
				(new DelayAction()).time = 'hello string';
			})).toThrow(TypeError);

			expect((() => {
				(new DelayAction()).time = Object.create();
			})).toThrow(TypeError);

			expect((() => {
				(new DelayAction()).time = function() {};
			})).toThrow(TypeError);

			expect((() => {
				(new DelayAction()).time = [];
			})).toThrow(TypeError);

		});

	});

	describe('Set time', () => {

		it('should set at 0 if value not provided', () => {
			var timer = new DelayAction();
			timer.setTime();
			expect(timer.time).toEqual(0);
		});

		it('should set at 0 if value null', () => {
			var timer = new DelayAction();
			timer.setTime(null);
			expect(timer.time).toEqual(0);
		});
	});
	describe('Start method', () => {

		it('should have a start function', () => {
			expect(typeof (new DelayAction()).start).toBe('function');
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
					expect(true).toBeTruthy();
					done();
				};
			}, 2);

			timer.start();
		});

	});

	describe('startWith', () => {

		it('should have the method', () => {
			expect(typeof (new DelayAction()).startWith).toBe('function');
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
				expect(arg1).toEqual(expected1);
				expect(arg2).toEqual(expected2);
				expect(arg3).toEqual(expected3);
				done();
			};

			da.startWith(expected1, expected2, expected3);
		});
	});

	describe('Cancel', () => {

		it('should have the method', () => {
			expect(typeof (new DelayAction()).cancel).toBe('function');
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
			expect((() => {
				timer.cancel('this is not function.');
			})).toThrow(TypeError);
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
			expect((() => {
				timer.cancel();
			})).not.toThrow(TypeError);
			clearTimeout(killer);
			done();
		});

	});
});