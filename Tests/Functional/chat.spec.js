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
	
	beforeAll((done) => {

	afterAll(() => {

	describe('When landing on the page', () =>{

		it('should contains chat elements', () =>{
			expect(browser.query('#messages')).toBeDefined();
			expect(browser.query('#msg')).toBeDefined();
			expect(browser.query('#send')).toBeDefined();
		});
	});

	describe('When submitting a message', () =>{
		
		it('should populate chat box', (done) => {
			var testMessage = 'This is a test';
			browser
			.fill('msg', testMessage)
			.pressButton('Send')
			.then(() =>{
				setTimeout(() =>{
					// TODO: Better way to retrive messages
					var messages = browser.text('#messages').split("\n");
					expect(messages.length).toBe(1);
					expect(messages[0]).toEqual(expect.arrayContaining([testMessage]));
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