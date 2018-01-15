/*jshint expr: true*/
// Test home page
'use strict';

// Set up environment
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const sinon = require('sinon');
const sinonchai = require('sinon-chai');
const Browser = require('zombie');
const Helpers = require('./helpers');
const TestServer = require('./testserver');

// Utils
const expect = chai.expect;
const assert = chai.assert;
chai.should();
chai.use(sinonchai);

describe('Foosball Notifier Test Suite', () => {

	var browser = new Browser();
	let server, url, port;

	let sinonbox;
	before('Setting up sinon sandbox', () => {
		sinonbox = sinon.sandbox.create();
	});

	afterEach('Clear sinon sandbox', () => {
		sinonbox.restore();
		sinonbox.resetBehavior();
		sinonbox.reset();
	});

	before('Setting up server', (done) => {
		try {
			TestServer.run().then(testserver => {
				port = testserver.address().port;
				url = 'http://localhost:' + port;
				server = testserver;
				done();
			}).catch(err => {
				done(err);
			});
		} catch (e) {
			done(e);
		}
	});

	after("Turn off test server", () => {
		server.close();
	});

	before('Query Foosball Notifier page', (done) => {
		Helpers.visitAndValidate(browser, url + '/', done);
	});

	after('Close browser', (done) => {
		try {
			browser.window.close();
			done();
		} catch (e) {
			done(e);
		}
	});

	describe('When registering for a game', () => {

		it('should notify in chat user joined', (done) => {

			expect(browser.query('#messages')).is.not.undefined;

			browser
				.fill('name', 'Frank')
				.pressButton('Notify me!')
				.then(() => {
					// TODO: Better way to collect messages?
					// Timeout to wait for message to populate
					setTimeout(() => {
						var messages = browser.text('#messages').split('\n');
						expect(messages.length).to.eq(1);
						expect(messages[0]).to.contains('New player join');
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
			sinonbox.stub(canvas, 'getContext')
				.returns(ctx);
			sinonbox.stub(ctx, 'strokeText')
				.callsFake((name) => {
					let prefix = 'data:image/png;base64,';
					if (!dataUrl.startsWith(prefix)) {
						dataUrl = prefix;
					}
					dataUrl += new Buffer(name)
						.toString('base64');
				});
			sinonbox.stub(ctx, 'clearRect')
				.callsFake(() => {
					dataUrl = blankDataUrl;
				});
			sinonbox.stub(canvas, 'toDataURL')
				.callsFake(() => {
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
									expect(canvas).is.not.undefined;
									assert.isFunction(canvas.toDataURL);
									assert.isFunction(canvas.getContext);
									assert.isObject(canvas.getContext('2d'));
									assert.isDefined(ctx);
									canvas.toDataURL().should.equal(blankDataUrl);
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
							assert.isDefined(canvas.toDataURL());
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