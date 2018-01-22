// utils.spec.js
// Unit test for utilities
"use strict";

/**
* Test dependencies
* @private
*/
const chai = require('chai');
const sinon = require('sinon');

/**
* Utils
* @private
*/
const expect = chai.expect;

describe('Unit test Utils',() =>{
	
	describe('Log',() =>{

		/**
		* Unit tested
		* @private
		*/
		const log = require('./utils').log;		

		var consoleSpy;
		beforeEach('Setting spy', () =>{
			consoleSpy = sinon.stub(console, 'log');
			// Allow mocha to use console output
			consoleSpy.callThrough();
		});

		beforeEach('Setting env', () =>{
			process.env.NODE_ENV = 'test-log';
		});

		afterEach('Clear spy', () =>{
			consoleSpy.restore();
		});

		it('should output to the console', () => {
			var testMsg = 'This is a test message';
			consoleSpy
				.withArgs(testMsg)
				.returns(testMsg);
			log(testMsg);
			expect(consoleSpy.called).to.be.ok;
			expect(consoleSpy.calledWith(testMsg)).to.be.ok;
		});

	});

});