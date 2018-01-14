/*jshint expr: true*/
'use strict';
// Basic static function for recurring test

// Dependencies
const chai = require('chai');

// Utils
var expect = chai.expect;

/**
 * Mock canvas element
 * Bind standard method to the canvas element.
 *
 * This is mainly for the support of canvas in
 * testing since zombie.js (using jsdom) does not support
 * canvas unless installing peer dependencies.
 * While we could install the peer dependencies
 * it would be heavier then just mocking up.
 * The canvas is more a visual testing and therefore,
 * wouldn't be giving more insights in those
 * testing.
 * 
 * @param  {DOM element} canvas [The canvas to bind]
 */
function mockifyCanvas(canvas) {

	canvas.getContext = function() {
		return {
			fillRect: function() {},
			clearRect: function() {},
			getImageData: function(x, y, w, h) {
				return {
					data: new Array(w * h * 4)
				};
			},
			putImageData: function() {},
			createImageData: function() {
				return [];
			},
			setTransform: function() {},
			drawImage: function() {},
			save: function() {},
			fillText: function() {},
			restore: function() {},
			beginPath: function() {},
			moveTo: function() {},
			lineTo: function() {},
			closePath: function() {},
			stroke: function() {},
			translate: function() {},
			scale: function() {},
			rotate: function() {},
			arc: function() {},
			fill: function() {},
			strokeText: function() {},
			createLinearGradient: function() {
				return {
					addColorStop: function() {}
				};
			}
		};
	};
}
module.exports = {
	mockifyCanvas: mockifyCanvas,
	visitAndValidate: function(browser, path, done) {
		browser.visit(path)
			.then(() => {
				expect(browser.status).to.eq(200);
				expect(browser.success).to.be.true;
				browser.wait({
					element: '#canvas1'
				}).then(() => {
					// Need to mock canvas as zombie.js aka jsdom not supporting canvas
					mockifyCanvas(browser.document.getElementById('canvas1'));
					done();
				});

			}).catch(done);
	}
};