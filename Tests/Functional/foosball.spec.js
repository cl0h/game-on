/*jshint expr: true*/
// Test home page
'use strict';

const testSetup = require('./testsetup');

// Dependencies

const Browser = require('zombie');
const Helpers = require('./helpers');

// Utils


describe('Foosball Notifier Test Suite', () => {

	let testargs = {
		url:''
	};
	testSetup.testServerBeforeAfter(testargs);
	
	var browser = new Browser();
	

	let sinonbox;
	beforeAll(() => {
		sinonbox = sinon.sandbox.create();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	beforeAll((done) => {
		Helpers.visitAndValidate(browser, testargs.url + '/', done);
	});

	afterAll((done) => {
		try {
			browser.window.close();
			done();
		} catch (e) {
			done(e);
		}
	});

	describe('When registering for a game', () => {

		it('should notify in chat user joined', (done) => {

			expect(browser.query('#messages')).toBeDefined();

			browser
				.fill('name', 'Frank')
				.pressButton('Notify me!')
				.then(() => {
					// TODO: Better way to collect messages?
					// Timeout to wait for message to populate
					setTimeout(() => {
						var messages = browser.text('#messages').split('\n');
						expect(messages).toHaveLength(1);
						expect(messages[0]).toContain('New player join');
						done();
					}, 10);
				}).catch(done);
		});
	});

	describe('When click clear table', () => {

		it('should clear the table', (done) => {
			expect(browser.query('#canvas1')).is.not.undefined;
			let canvas = browser.document.getElementById('canvas1');
			let dataUrl = '';
			let blankDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAxUlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=';
			// Stub missing items in canvas
			// as zombie.js through jsdom 
			// does not support canvas
			let ctx = canvas.getContext('2d');
			jest.spyOn(canvas, 'getContext')
				.mockImplementation(() => ctx);
			jest.spyOn(ctx, 'strokeText')
				.mockImplementation((name) => {
					let prefix = 'data:image/png;base64,';
					if (!dataUrl.startsWith(prefix)) {
						dataUrl = prefix;
					}
					dataUrl += new Buffer(name)
						.toString('base64');
				});
			jest.spyOn(ctx, 'clearRect')
				.mockImplementation(() => {
					dataUrl = blankDataUrl;
				});
			jest.spyOn(canvas, 'toDataURL')
				.mockImplementation(() => {
					return dataUrl;
				});

			let next = function next(idx, array) {
				if (idx === (array.length - 1)) {

					browser
						.pressButton('Clear Table!')
						.then(() => {
							/**
							 * Waiting a little bit for the
							 * clear table to action.
							 */
							setTimeout(() => {

								try {
									expect(canvas).toBeDefined();
									expect(typeof canvas.toDataURL).toBe('function');
										expect(typeof canvas.getContext).toBe('function');
										expect(typeof canvas.getContext('2d')).toBe('object');
										expect(ctx).toBeDefined();
									expect(canvas.toDataURL()).toEqual(blankDataUrl);
									done();
								} catch (e) {
									done(e);
								}
							}, 10);

						});
				}
			};

			['Tester1', 'Tester2'].forEach((name, idx, array) => {
				browser
					.fill('name', name)
					.pressButton('Notify me!')
					.then(() => {
						try {
							expect(canvas.toDataURL()).toBeDefined();
							canvas.toDataURL().should.not.equal(blankDataUrl);
							next(idx, array);
						} catch (e) {
							throw e;
						}
					});
			});
		});
	});
});