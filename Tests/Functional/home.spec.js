// Tests/Functional/home.spec.js

// Test home page
'use strict';
// Set up environment
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const Browser = require('zombie');
const TestServer = require('./testserver');
const Helpers = require('./helpers');

// Utils
const expect = chai.expect;

// Test
describe('Home Page Test suite', () => {

	describe('Given user go to home page', () => {

		var browser = new Browser();

		let server, url, port;

		before('Setting up server', (done) => {

			TestServer.run().then(testserver => {
				port = testserver.address().port;
				url = 'http://localhost:' + port;
				server = testserver;
				done();
			}).catch(err => {
				done(err);
			});

		});

		after("Turn off test server", () => {
			server.close();
		});

		before('Visit home page', (done) => {
			Helpers.visitAndValidate(browser, url + '/', done);
		});

		after('Close browser', () => {
			browser.window.close();
		});

		it('should load the page', () => {
			expect(browser.status).to.eq(200);
			expect(browser.success).to.be.true;
		});
	});
});