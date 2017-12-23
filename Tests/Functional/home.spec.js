// Tests/Functional/home.spec.js

// Test home page
'use strict';
// Set up environment
process.env.NODE_ENV = 'test';
const PORT = 3000;

// Dependencies
const chai = require('chai');
const Browser = require('zombie');

// Utils
const expect = chai.expect;
Browser.localhost('localhost', PORT);

// Test
describe('Given user go to home page',() =>{
	
	var browser = new Browser();

	// TODO: Reenable after server refactor
	// before('Start server', (done) =>{
	// 	this.server = require('../../index.js');
	// 	done();
	// });

	// after('Shutdown server', (done) =>{
	// 	this.server.close(done);
	// });

	before('Visit page', (done) =>{
		browser.visit('/', done);
	});

	after('Close browser', ()=>{
		browser.window.close()
	});

	it('should load the page', () => {
		expect(browser.status).to.eq(200);
		expect(browser.success).to.be.true;	
	});
});