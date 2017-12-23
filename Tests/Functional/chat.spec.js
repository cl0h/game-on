// Tests/Functional/chat.spec.js

// Test home page
'use strict';
// Set up environment
process.env.NODE_ENV = 'test';
const PORT = 3000;

// Dependencies
const chai = require('chai');
const assert = require('assert');
const Browser = require('zombie');
const Helpers = require('./helpers');

// Utils
const expect = chai.expect;
Browser.localhost('localhost', PORT);

describe('Foosball Notifier Test Suite',() =>{

	var browser = new Browser();

	// before('Start server', () =>{
	// 	this.server = require('../../index.js');
	// });

	// after('Shutdown server', (done) =>{
	// 	this.server.close(done);
	// });
	
	before('Query Foosball Notifier page', (done) =>{
		Helpers.visitAndValidate(browser,'/', done);
	});

	after('Close browser', ()=>{
		browser.window.close()
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
				}, 5);
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