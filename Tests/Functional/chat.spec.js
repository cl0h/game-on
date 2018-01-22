'use strict';

/**
 * Test chat page
 */

// Dependencies
const testSetup = require('./testsetup');
const Browser = require('zombie');
const Helpers = require('./helpers');

describe('Chat Test Suite',() =>{

	let testargs={
		url: ''
	};
	testSetup.testServerBeforeAfter(testargs);
	
	var browser = new Browser();
	
	before('Visit chat page', (done) =>{
		Helpers.visitAndValidate(browser,testargs.url + '/', done);
	});

	after('Close browser', ()=>{
		browser.window.close();
	});

	context('When landing on the page',() =>{

		it('should contains chat elements', () =>{
			expect(browser.query('#messages')).is.not.undefined;
			expect(browser.query('#msg')).is.not.undefined;
			expect(browser.query('#send')).is.not.undefined;
		});
	});

	context('When submitting a message',() =>{
		
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