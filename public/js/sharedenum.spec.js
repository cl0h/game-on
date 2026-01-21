'use strict';
/**
 * Unit test for enum
 */

/**
 * Unit test dependencies
 * @private
 */




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
			expect(enum_type[el]).toBeDefined();
			expect(typeof enum_type[el]).toBe('string');
			expect((() => {
				enum_type[el] = 'test';
			})).toThrow(Error);
			expect(enum_type[el]).toEqual(el.toLowerCase());
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
					expect(ctx.exports.sharedEnum.PermissionType).toBeDefined();
					expect(ctx.exports.sharedEnum.ChatEventType).toBeDefined();
					expect(ctx.exports.sharedEnum.TableEventType).toBeDefined();
				} else {
					expect(ctx.sharedEnum.PermissionType).toBeDefined();
					expect(ctx.sharedEnum.ChatEventType).toBeDefined();
					expect(ctx.sharedEnum.TableEventType).toBeDefined();
				}

			});

		});

	});

	describe('PermissionType', () => {

		var PermissionType;
		beforeAll(() => {
			PermissionType = require('./sharedenum').PermissionType;
		});

		it('should exist', () => {
			expect(PermissionType).toBeDefined();
		});

		it('should have properties read-only', () => {
			assertEnumValide(PermissionType, ['DENIED', 'GRANTED', 'DEFAULT']);
		});
	});

	describe('Chat Event Type', () => {
		
		let ChatEventType;
		beforeAll(() => {
			ChatEventType = require('./sharedenum').ChatEventType;
		});

		it('should exist', () => {
			expect(ChatEventType).toBeDefined();
		});

		it('should have properties read-only', () => {
			assertEnumValide(ChatEventType, ['CHAT']);
		});
	});

	describe('Table Event Type', () => {
		
		var TableEventType;
		beforeAll(() => {
			TableEventType = require('./sharedenum').TableEventType;
		});

		it('should exist', () => {
			expect(TableEventType).toBeDefined();
		});

		it('should have properties read-only', () => {
			assertEnumValide(TableEventType,
				['START_TABLE', 'DRAW_TABLE', 'UPDATE_TABLE',
				'FULL_TABLE', 'CLEAR_TABLE', 'ADD_PLAYER'
			]);
		});
	});
});