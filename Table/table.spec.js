/* jshint expr: true*/
// Test for table

'use strict';


// Import
const Table = require('./table');

process.env.NODE_ENV = 'test';

// Test
describe('Table Unit Testing', () => {

	/**
	 * Create an array of players object
	 * @param  {number} number       [Number of player]
	 * @param  {Table} foosballTable [Optional: Table object]
	 * @return {Array}               [Array containing player object]
	 */
	function createPlayers(number, opt_foosballTable) {

		let players= [];

		for (var i = 0; i < number; i++) {
			players.push({
				name: 'Player' + i,
				log: jest.fn()
			});

			if(opt_foosballTable !== undefined){
				opt_foosballTable.addPlayer(players[i]);
			}
		}

		return players;

	}

	describe('Table Basic testing', () => {

		it('should return object', () => {
			var table = new Table();
			expect(table).not.toBeNull();
			expect(table).toBeDefined();
		});

		it('should have a players list', () => {
			var table = new Table();
			expect(table.players).toBeDefined();
			expect(Array.isArray(table.players)).toBe(true);
			expect(table.players).toHaveLength(0);
		});

		it('should have a maximum players', () => {
			var table = new Table();
			expect(table.MAX_PLAYERS).toBeDefined();
			expect(table.MAX_PLAYERS).toBe(4);
		});

		it('should have indicator if table full', () => {
			var table = new Table();
			expect(table.full).toBeDefined();
			expect(table.full).toBe(false);
		});
	});

	describe('Given user add player', () => {

		var players;

		beforeEach(() => {
			players = createPlayers(4);
		});

		it('should have a method', () => {
			expect((new Table()).addPlayer).toBeDefined();
		});

		it('should add player to list', () => {
			var table = new Table();
			var player1 = players[0];
			table.addPlayer(player1);
			expect(table.players).toEqual(expect.arrayContaining([player1]));
		});

		it('should not contains player if not added', () => {
			var table = new Table();
			var player1 = players[0];
			var player2 = players[1];
			table.addPlayer(player1);
			expect(table.players).not.toEqual(expect.arrayContaining([player2]));
		});

		it('should update if full state', () => {
			var table = new Table();
			var i = 0;
			while (i < players.length - 1) {
				table.addPlayer(players[i]);
				expect(table.full).toBe(false);
				i++;
			}

			i++;
			table.addPlayer(players[i]);
			expect(table.full).toBe(true);
		});

		it('should not add player if table full', () => {
			var table = new Table();
			for (var i = 0; i < players.length; i++) {
				table.addPlayer(players[i]);
			}

			var newPlayer = {
				name: 'Rejected'
			};

			table.addPlayer(newPlayer);
			expect(table.players).not.toEqual(expect.arrayContaining([newPlayer]));
		});
	});

	describe('Given table created', () => {

		var players, foosballTable;

		beforeEach(() => {
			foosballTable = new Table();
			players = createPlayers(4, foosballTable);
			expect(foosballTable.full).toBe(true);
		});

		it('should have method to call players log', () => {
			expect((new Table()).logPlayers).toBeDefined();
		});

		it('should call each player log', () => {
			foosballTable.logPlayers();
			for (var i = 0; i < foosballTable.length; i++) {
				expect(players[i].log).toHaveBeenCalledTimes(1);
			}
		});
	});

	describe('Given user wish to empty table', () => {

		var players, foosballTable;

		beforeEach(() => {
			players = [];
			foosballTable = new Table();
			createPlayers(4, foosballTable);
			expect(foosballTable.full).toBe(true);
		});

		it('should have the method clear', () => {
			expect((new Table()).clear).toBeDefined();
		});

		it('should have an empty array', () => {
			foosballTable.clear();
			expect(foosballTable.players).toEqual([]);
		});

		it('should not been full', () => {
			foosballTable.clear();
			expect(foosballTable.full).toBe(false);
		});
	});

	describe('Given user get number of current user', () => {

		let foosballTable;

		beforeEach(() =>{
			foosballTable = new Table();
		});

		it('should have getLength', () => {
			expect((new Table()).getLength).toBeDefined();
		});

		it('should return the number currently registered', () => {
			createPlayers(2, foosballTable);
			expect(foosballTable.getLength()).toBe(2);
		});

		it('should return max number players if table full', () => {
			createPlayers(5, foosballTable);
			expect(foosballTable.getLength()).toBe(4);
		});

	});
});