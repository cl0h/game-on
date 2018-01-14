/*jshint expr: true*/
// Test home page
'use strict';

// Set up environment
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const Browser = require('zombie');
const Helpers = require('./helpers');
const TestServer = require('./testserver');

// Utils
const expect = chai.expect;

describe('Foosball Notifier Test Suite', () => {

	var browser = new Browser();

	let server, url, port;

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
});