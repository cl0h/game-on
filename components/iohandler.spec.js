/*jshint expr: true*/
/**
 * Unit test for iohandler
 */
'use strict';
/**
 * Test dependencies
 */
const chai = require('chai');
const sinon = require('sinon');
const sinonchai = require('sinon-chai');
const proxyquire = require('proxyquire');
const SocketIOMock = require('socket.io-mock');
const SharedEnum = require('../public/js/sharedenum');
const Emitter = require('events');
const DelayAction = require('../Tests/Utils/DelayAction/delayaction');
/**
 * Utils
 */
const assert = chai.assert;
chai.should();
chai.use(sinonchai);

/**
 * Constances
 */
const TableEventType = SharedEnum.TableEventType;
const ChatEventType = SharedEnum.ChatEventType;


describe('iohandler Unit Test', () => {

	let loggerSpy = sinon.spy();
	let socketServer = new SocketIOMock();
	socketServer.id = 'SocketTester1';

	// Hook server emitter and socket emitter
	let server = new Emitter();
	server.sockets = {
		connected: {}
	};

	server.sockets.connected[socketServer.id] = socketServer;

	socketServer.socketClient.connect = function() {
		server.emit('connection', socketServer);
	};
	socketServer.socketClient.disconnect = function() {
		socketServer.socketClient.removeAllListeners();
		socketServer.socketClient.emit('disconnect', {});
		socketServer.removeAllListeners();
	};
	socketServer.broadcast.emit = function(eventkey) {
		socketServer.emit(eventkey);
	};
	Object.keys(TableEventType).forEach(key => {
		server.on(TableEventType[key], data => {
			socketServer.emit(TableEventType[key], data);
		});
	});
	Object.keys(ChatEventType).forEach(key => {
		server.on(ChatEventType[key], data => {
			socketServer.emit(ChatEventType[key], data);
		});
	});

	function Player(name, socketid) {
		this.name = name;
		this.socketId = socketid;
	}

	let iohandler = proxyquire('./iohandler', {
		'../utils': {
			log: loggerSpy,
			'@noCallThru': true
		},
		// Replace socket io
		'socket.io': function() {
			return server;
		},
		'../Player/index': function() {
			return Player;
		}
	});

	let table = {
		players: [],
		full: false,
		clear: function() {
			table.players = [];
		},
		addPlayer: function() {},
		getLength: function() {
			return table.players.length;
		}
	};

	before('Set up IO handler', () =>{
		iohandler(null, table);
	});

	let client = socketServer.socketClient;
	/**
	 * Set up own timeout for faster test failure
	 */
	var killer, timeout = 200;
	beforeEach('Set up DelayAction', () => {
		killer = new DelayAction((end) => {
			end(new Error('Event not received below ' + timeout + ' ms.'));
		}, timeout);
	});

	afterEach('Clean up spy', () => {
		loggerSpy.resetHistory();
	});

	afterEach('Clean up', () => {
		client.disconnect();
		table.full = false;
		table.clear();
	});

	describe('Connection', () => {

		it('should log when user connection', () => {
			client.connect();
			loggerSpy.should.have.been.calledOnce;
		});

		it('should have emit draw table on connection', (done) => {
			client.once(TableEventType.DRAW_TABLE, (players) => {
				killer.cancel();
				assert.isDefined(players);
				done();
			});
			killer.startWith(done);
			client.connect();
		});
	});

	describe('Chat event', () => {

		it('should broadcast message', (done) => {
			let msg = 'This is a test';
			// Testing
			client.once(ChatEventType.CHAT, msg => {
				killer.cancel();
				assert.isDefined(msg);
				assert.isString(msg);
				assert.isNotEmpty(msg);
				loggerSpy.should.have.been.calledOnce;
				done();
			});

			// Once connected
			client.once(TableEventType.DRAW_TABLE, () => {
				// Need to clear loggerSpy history
				loggerSpy.resetHistory();
				client.emit(ChatEventType.CHAT, msg);
			});

			killer.startWith(done);
			client.connect();

		});

	});

	describe('Clear Table event', () => {

		it('should update the table when clear table called', (done) => {

			let spy = sinon.spy(table, 'clear');
			assert.lengthOf(table.players, 0);
			assert.isEmpty(table.players);

			for (let i = 0; i < 3; i++) {
				table.players.push('Tester' + i);
			}

			client.once(TableEventType.UPDATE_TABLE, players => {
				killer.cancel();
				spy.should.have.been.calledOnce;
				loggerSpy.should.have.been.calledOnce;
				assert.isDefined(players);
				assert.isArray(players);
				assert.isEmpty(players);
				done();
			});

			client.once(TableEventType.DRAW_TABLE, () => {
				loggerSpy.resetHistory();
				client.emit(TableEventType.CLEAR_TABLE, {});
			});

			killer.startWith(done);
			client.connect();
		});
	});

	describe('Add player', () => {

		it('should send to sender table full', (done) => {
			table.full = true;
			let player = [{
				name: 'Tester1'
			}];
			client.once(TableEventType.FULL_TABLE, () => {
				killer.cancel();
				loggerSpy.should.have.been.calledTwice;
				done();
			});

			client.once(TableEventType.DRAW_TABLE, () => {
				loggerSpy.resetHistory();
				client.emit(TableEventType.ADD_PLAYER, player);
			});

			killer.startWith(done);
			client.connect();
		});

		it('should add player to table', (done) => {
			var spy = sinon.spy(table, 'addPlayer');
			var expectedPlayers = [
				(new Player('Tester2', socketServer.id))
			];
			table.players = expectedPlayers;
			client.once(TableEventType.UPDATE_TABLE, players => {
				killer.cancel();
				loggerSpy.should.have.been.calledTwice;
				spy.should.have.been.called;
				assert.isDefined(players);
				assert.isArray(players);
				assert.isNotEmpty(players);
				assert.equal(players, expectedPlayers);
				done();
			});

			client.once(TableEventType.DRAW_TABLE, () => {
				loggerSpy.resetHistory();
				client.emit(TableEventType.ADD_PLAYER, expectedPlayers);
			});

			killer.startWith(done);
			client.connect();
		});

		it('should broadcast start table if table with 1 player', (done) => {

			var expectedPlayers = [
				(new Player('Tester3', socketServer.id))
			];

			table.players = expectedPlayers;

			client.once(TableEventType.START_TABLE, () => {
				killer.cancel();
				loggerSpy.should.have.been.calledThrice;
				done();
			});

			client.once(TableEventType.DRAW_TABLE, () => {
				loggerSpy.resetHistory();
				client.emit(TableEventType.ADD_PLAYER, expectedPlayers);
			});

			killer.startWith(done);
			client.connect();
		});

		it('should not broadcast when more then 1 player', (done) => {

			for (let i = 0; i < 2; i++) {
				table.players.push(new Player('Tester' + i, socketServer.id));
			}

			socketServer.once(TableEventType.ADD_PLAYER, () => {
				killer.cancel();
				done();
			});

			client.once(TableEventType.START_TABLE, () => {
				done(new Error('should not have trigger start table'));
			});

			client.once(TableEventType.DRAW_TABLE, () => {
				loggerSpy.resetHistory();
				client.emit(TableEventType.ADD_PLAYER, [new Player('Tester3', socketServer.id)]);
			});

			killer.startWith(done);
			client.connect();
		});
	});
});