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

	/**
	 * Validate the enum provided has each element required
	 * @param  {Enum} enum_type	[The enumerator holder]
	 * @param  {Array} arr_el   [Array of each element required]
	 */
	function assertEnumValide(enum_type, arr_el) {

		if(enum_type === undefined || arr_el === undefined){
			throw new Error("assertEnumValide required enumerator and array");
		}

		arr_el.forEach( el => {
			assert.isDefined(enum_type[el], el + ' defined?');
			assert.typeOf(enum_type[el], 'string', el + ' is string?');
			(() => {
				enum_type[el] = 'test';
			}).should.throw(Error);
			assert.equal(enum_type[el], el.toLowerCase(), el + 'read-only?');
		});
	}

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
			assertEnumValide(PermissionType, ['DENIED', 'GRANTED', 'DEFAULT']);
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
			assertEnumValide(ChatEventType, ['CHAT']);
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
			assertEnumValide(TableEventType,
				['START_TABLE', 'DRAW_TABLE', 'UPDATE_TABLE',
				'FULL_TABLE', 'CLEAR_TABLE', 'ADD_PLAYER'
			]);
		});
	});
});