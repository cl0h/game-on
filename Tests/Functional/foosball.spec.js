// Tests/Functional/chat.spec.js

// Test home page
'use strict';
// Set up environment
process.env.NODE_ENV = 'test';
const PORT = 3000;

// Dependencies
const chai = require('chai');
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

	describe('When registering for a game',() =>{

		it('should notify in chat user joined', (done) =>{
			
			expect(browser.query('#messages')).is.not.undefined;

			browser
			.fill('name', 'Frank')
			.pressButton('Notify me!')
			.then(() =>{
				// TODO: Better way to collect messages?
				// Timeout to wait for message to populate
				setTimeout(() =>{
					var messages = browser.text('#messages').split("\n");
					console.log('in');
					expect(messages.length).to.eq(1);
					expect(messages[0]).to.contains('New player join');
					done();	
				}, 10);
			}).catch(done);
		});
	});
});