// Tests/Functional/chat.spec.js
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

describe('Chat Test Suite',() =>{

	var browser = new Browser();
	let server, url, port;

	before('Setting up server', (done) => {

		TestServer.run().then(testserver =>{
			port = testserver.address().port;
			url = 'http://localhost:' + port;
			server = testserver;
			done();
		}).catch(err =>{
			done(err);
		});

	});

	after("Turn off test server",() => {
		server.close();
	});
	
	before('Query Foosball Notifier page', (done) =>{
		Helpers.visitAndValidate(browser,url + '/', done);
	});

	after('Close browser', ()=>{
		browser.window.close();
	});

	describe('When landing on the page',() =>{

		it('should contains chat elements', () =>{
			expect(browser.query('#messages')).is.not.undefined;
			expect(browser.query('#msg')).is.not.undefined;
			expect(browser.query('#send')).is.not.undefined;
		});
	});

	describe('When submitting a message',() =>{
		
		it('should populate chat box', (done) => {
			var testMessage = 'This is a test';
			browser
			.fill('msg', testMessage)
			.pressButton('Send')
			.then(() =>{
				setTimeout(() =>{
					// TODO: Better way to retrive messages
					var messages = browser.text('#messages').split("\n");
					expect(messages.length).to.eq(1);
					expect(messages[0]).to.contains(testMessage);
					done();
				}, 10);
			}).catch(done);
		});

		// TODO: Test to reenable when feature implemented
		// it('should refuse blank message', (done) =>{
		// 	var testMessage = '';
		// 	browser
		// 	.fill('msg', testMessage)
		// 	.pressButton('Send')
		// 	.then(() =>{
		// 		browser.wait({element:'#messages li'})
		// 		.then(() =>{
		// 			// TODO: Better way to retrieve messages
		// 			var messages = browser.text('#messages').split("\n");
		// 			expect(messages.length).to.eq(0);
		// 			done();
		// 		}).catch(done);
		// 	});
		// });
	});
});