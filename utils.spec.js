// utils.spec.js
// Unit test for utilities
"use strict";



describe('Unit test Utils',() =>{
	
	describe('Log',() =>{

		/**
		* Unit tested
		* @private
		*/
		const log = require('./utils').log;		

		var consoleSpy;
		beforeEach(() =>{
			consoleSpy = jest.spyOn(console, 'log');
		});

		beforeEach(() =>{
			process.env.NODE_ENV = 'test-log';
		});

		afterEach(() =>{
			consoleSpy.mockRestore();
		});

		it('should output to the console', () => {
			var testMsg = 'This is a test message';
			log(testMsg);
			expect(consoleSpy).toHaveBeenCalled();
			expect(consoleSpy).toHaveBeenCalledWith(testMsg);
		});

	});

});