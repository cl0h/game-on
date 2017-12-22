// Table/table.spec.js
// Test for table

'use strict';
// Dependencies
const chai = require('chai');
const sinon = require('sinon');
// Utils
const expect = chai.expect;

// Import
const Table = require('./table');

process.env.NODE_ENV = 'test';

// Test
describe('Table Basic testing',() =>{
	
	it('should return object', () => {
		var table = new Table();
		expect(table).is.not.null;
		expect(table).is.not.undefined;
	});

	it('should have a players list', () =>{
		var table = new Table();
		expect(table.players).is.not.undefined;
		expect(table.players).to.be.an('array');
		expect(table.players).to.be.empty;
	});

	it('should have a maximum players', () =>{
		var table = new Table();
		expect(table.MAX_PLAYERS).is.not.undefined;
		expect(table.MAX_PLAYERS).to.eq(4);
	});

	it('should have indicator if table full', () =>{
		var table = new Table();
		expect(table.full).is.not.undefined;
		expect(table.full).to.be.false;
	});
});

describe('Given user add player',() =>{
	
	var players;

	beforeEach('Init players',() =>{
		players = [];
		for(var i = 0; i < 4; i++){
			players[i] = {
				name: 'Player' + i
			};
		}
	});

	it('should have a method', () =>{
		expect((new Table()).addPlayer).is.not.undefined;
	});

	it('should add player to list', () =>{
		var table = new Table();
		var player1 = players[0];
		table.addPlayer(player1);
		expect(table.players).to.deep.include.members([player1]);
	});

	it('should not contains player if not added', () =>{
		var table = new Table();
		var player1 = players[0];
		var player2 = players[1];
		table.addPlayer(player1);
		expect(table.players).to.not.deep.include.members([player2]);
	});

	it('should update if full state', () =>{
		var table = new Table();
		var i = 0;
		while(i < players.length - 1){
			table.addPlayer(players[i]);
			expect(table.full).to.be.false;
			i++;
		}

		i++;
		table.addPlayer(players[i]);
		expect(table.full).to.be.true;
	});

	it('should not add player if table full', () =>{
		var table = new Table();
		for(var i = 0; i < players.length; i++){
			table.addPlayer(players[i]);
		}

		var newPlayer = {
			name: 'Rejected'
		};

		table.addPlayer(newPlayer);
		expect(table.players).to.not.deep.include.members([newPlayer]);
	});
});

describe('Given table created',() =>{

	var players, foosballTable;
	
	beforeEach('Init players',() =>{
		players = [];
		foosballTable = new Table();
		for(var i = 0; i < 4; i++){
			players[i] = {
				name: 'Player' + i,
				log: sinon.spy()
			};

			foosballTable.addPlayer(players[i]); 
		}
		expect(foosballTable.full).to.be.true;
	});

	it('should have method to call players log', () => {
		expect((new Table()).logPlayers).to.be.defined;
	});

	it('should call each player log', () =>{
		foosballTable.logPlayers();
		for(var i = 0; i < foosballTable.length; i++){
			assert(players[i].log.calledOnce);
		}
	});
});

describe('Given user wish to empty table',() =>{
	
	var players, foosballTable;
	
	beforeEach('Init players',() =>{
		players = [];
		foosballTable = new Table();
		for(var i = 0; i < 4; i++){
			players[i] = {
				name: 'Player' + i
			};

			foosballTable.addPlayer(players[i]); 
		}
		expect(foosballTable.full).to.be.true;
	});

	it('should have the method clear', () => {
		expect((new Table()).clear).is.not.undefined;
	});

	it('should have an empty array', () =>{
		foosballTable.clear();
		expect(foosballTable.players).to.be.an('array').that.is.empty;
	});

	it('should not been full', () =>{
		foosballTable.clear();
		expect(foosballTable.full).to.false;
	});
});

describe('Given user get number of current user',() =>{
	
	it('should have getLength', () => {
		expect((new Table()).getLength).is.not.undefined;
	});

	it('should return the number currently registered', () =>{
		var foosballTable = new Table();
		for(var i = 0; i < 2; i++){
			foosballTable.addPlayer('Player' + i);
		}

		var numberPlayers = foosballTable.getLength();
		expect(numberPlayers).to.eq(2);
	});

	it('should return max number players if table full', () =>{
		var foosballTable = new Table();
		for(var i = 0; i < 5; i++){
			foosballTable.addPlayer('Player' + i);
		}

		var numberPlayers = foosballTable.getLength();
		expect(numberPlayers).to.eq(4);
	});

});