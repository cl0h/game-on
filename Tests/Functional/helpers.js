// Tests/Functional/helpers.js

// Basic static function for recurring test

// Dependencies
const chai = require('chai');

// Utils
var expect = chai.expect;

module.exports = {
	visitAndValidate: function(browser, path, done){
		browser.visit(path)
		.then(() =>{
			expect(browser.status).to.eq(200);
			expect(browser.success).to.be.true;
			done();
		}).catch(done);
	}
};