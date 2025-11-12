/* jshint expr: true*/
// Unit test for player

'use strict';
process.env.NODE_ENV = 'test';

// Dependencies


// Utils


const loggerspy = jest.fn();



const Player = require('./player');

describe('Player Unit Test', () => {
	
	describe('Player Object Basic test', () => {

		it('should return Player object', () => {
			var player1 = new Player();
			expect(player1).not.toBeNull();
			expect(player1).not.toBeUndefined();
		});

		it('should have name property as string', () => {
			var player1 = new Player();
			expect(player1.name).not.toBeUndefined();
			expect(typeof player1.name).toBe('string');
		});

		it('should have clientId property as string', () => {
			var player1 = new Player();
			expect(player1.clientId).not.toBeUndefined();
			expect(typeof player1.clientId).toBe('string');
		});
	});

	describe('Given user want to set name to player', () => {

		it('should be able to set name via constructor', () => {
			var expectedName = 'PlayerTest';
			var player1 = new Player(expectedName);
			expect(player1.name).toEqual(expectedName);
		});
	});

	describe('Given user want to set clientId to player', () => {

		it('should be able to set clientId via constructor', () => {
			var expectedClientId = 'ClientTest';
			var player1 = new Player(null, expectedClientId);
			expect(player1.clientId).toEqual(expectedClientId);
		});
	});

	describe('Given user want to loggerspy player', () => {

		afterEach(() => {
			loggerspy.mockClear();
		});

		it('should have loggerspy method', () => {
			expect((new Player()).log).not.toBeUndefined();
		});

		it('should call loggerspy', () => {
			var playername = 'PlayerTest';
			var clientId = 'Id';
			(new Player(playername, clientId)).log();
			expect(loggerspy).toHaveBeenCalledTimes(1);
			expect(loggerspy).toHaveBeenCalledWith('\tPlayer name: ' + playername + ', id: ' + clientId + '\n');
		});
	});
});