'use strict';
/**
 * Unit test for enum
 */

/**
 * Unit test dependencies
 * @private
 */
const chai = require('chai');

/**
 * Utils
 * @private
 */
const assert = chai.assert;
chai.should();

describe('Shared Enum Unit Test', () => {

	describe('Front end loading', () => {

		it('should only assign to module.exports if exist', () => {
			let FS = require('fs');
			let Path = require('path');
			let VM = require('vm');

			let module_path = Path.resolve(__dirname, './sharedenum.js');
			let module = FS.readFileSync(module_path, {
				encoding: 'UTF-8'
			});

			// Loop through context
			[{
				//CommonJS module 1.1.1 spec (`exports` cannot be a function)
				exports: {}
				// Others such as window from browser
			}, {}]
			.forEach(context => {

				let ctx = VM.createContext(context);
				VM.runInContext(module, ctx, module_path);

				if ('exports' in ctx) {
					assert.isDefined(ctx.exports.sharedEnum.PermissionType, 'undefined for context ' + context);
					assert.isDefined(ctx.exports.sharedEnum.ChatEventType, 'undefined for context ' + context);
					assert.isDefined(ctx.exports.sharedEnum.TableEventType, 'undefined for context ' + context);
				} else {
					assert.isDefined(ctx.sharedEnum.PermissionType, 'undefined for context ' + context);
					assert.isDefined(ctx.sharedEnum.ChatEventType, 'undefined for context ' + context);
					assert.isDefined(ctx.sharedEnum.TableEventType, 'undefined for context ' + context);
				}

			});

		});

	});

	describe('PermissionType', () => {

		var PermissionType;
		before('Extract PermissionType', () => {
			PermissionType = require('./sharedenum').PermissionType;
		});

		it('should exist', () => {
			assert.isDefined(PermissionType, 'PermissionType declared?');
		});

		it('should have properties read-only', () => {
			['DENIED', 'GRANTED', 'DEFAULT']
			.forEach(permission => {
				assert.isDefined(PermissionType[permission], permission + ' defined?');
				assert.typeOf(PermissionType[permission], 'string', permission + ' is string?');
				(() => {
					PermissionType[permission] = 'test';
				}).should.throw(Error);
				assert.equal(PermissionType[permission], permission.toLowerCase(), permission + 'read-only?');
			});
		});
	});

	describe('Chat Event Type', () => {
		let ChatEventType;
		before('Extract Chat Type', () => {
			ChatEventType = require('./sharedenum').ChatEventType;
		});

		it('should exist', () => {
			assert.isDefined(ChatEventType, 'Chat event type declared?');
		});

		it('should have properties read-only', () => {
			['CHAT']
			.forEach(event => {
				assert.isDefined(ChatEventType[event], event + ' defined?');
				assert.typeOf(ChatEventType[event], 'string', event + ' is string?');
				(() => {
					ChatEventType[event] = 'test';
				}).should.throw(Error);
				assert.equal(ChatEventType[event], event.toLowerCase(), event + ' read-only?');
			});
		});
	});

	describe('Table Event Type', () => {
		var TableEventType;
		before('Extract Table Event Type', () => {
			TableEventType = require('./sharedenum').TableEventType;
		});

		it('should exist', () => {
			assert.isDefined(TableEventType, 'Table event type declared?');
		});

		it('should have properties read-only', () => {
			['START_TABLE', 'DRAW_TABLE', 'UPDATE_TABLE',
				'FULL_TABLE', 'CLEAR_TABLE', 'ADD_PLAYER'
			]
			.forEach(event => {
				assert.isDefined(TableEventType[event], event + ' defined?');
				assert.typeOf(TableEventType[event], 'string', event + ' is string?');
				(() => {
					TableEventType[event] = 'test';
				}).should.throw(Error);
				assert.equal(TableEventType[event], event.toLowerCase(), event + ' rea	d-only?');
			});
		});
	});
});