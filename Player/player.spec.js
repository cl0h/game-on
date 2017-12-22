// Player/player.spec.js

// Unit test for player

'use strict';
process.env.NODE_ENV = 'test';

// Dependencies
const chai = require('chai');
const sinon = require('sinon');

// Utils
const expect = chai.expect;

// Unit tested
const Player = require('./player');

describe('Player Object Basic test',() =>{
	
	it('should return Player object', () => {
		var player1 = new Player();
		expect(player1).is.not.null;
		expect(player1).is.not.undefined;
	});

	it('should have name property as string', () =>{
		var player1 = new Player();
		expect(player1.name).is.not.undefined;
		expect(player1.name).to.be.a.string;
	});

	it('should have clientId property as string', () =>{
		var player1 = new Player();
		expect(player1.clientId).is.not.undefined;
		expect(player1.clientId).to.be.a.string;
	});
});

describe('Given user want to set name to player',() =>{
	
	it('should be able to set name via constructor', () => {
		var expectedName = 'PlayerTest';
		var player1 = new Player(expectedName);
		expect(player1.name).to.eq(expectedName);
	});
});
	
describe('Given user want to set clientId to player',() =>{
	
	it('should be able to set clientId via constructor', () => {
		var expectedClientId = 'ClientTest';
		var player1 = new Player(null, expectedClientId);
		expect(player1.clientId).to.eq(expectedClientId);
	});
});

describe('Given user want to log player',() =>{
	
	beforeEach('Spy console log', () =>{
		sinon.spy(console, 'log');
	});

	afterEach('Clean spy', () =>{
		console.log.restore();
	});

	it('should have log method', () => {
		expect((new Player()).log).is.not.undefined;
	});

	it('should have call console.log', () =>{
		var playername = 'PlayerTest';
		var playerId = 'Id';
		(new Player(playername, playerId)).log();
		expect(console.log).to.be.called;
	});
});