

import SocketIOMock from 'socket.io-mock';
import SharedEnum from '../public/js/sharedenum.js';
import Emitter from 'events';
import DelayAction from '../Tests/Utils/DelayAction/delayaction.js';

/**
 * Constances
 */
const TableEventType = SharedEnum.TableEventType;
const ChatEventType = SharedEnum.ChatEventType;


jest.mock('../utils/index.js', () => ({ log: jest.fn() }));
jest.mock('socket.io', () => jest.fn(() => (new Emitter())));
jest.mock('../Player/index.js', () => jest.fn());

describe('iohandler Unit Test', () => {

		let loggerSpy = jest.fn();
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

		/**
		 * Bind server events to socket events
		 */
		[TableEventType, ChatEventType].forEach(EventType => {

			Object.keys(EventType).forEach(key => {
				server.on(EventType[key], data => {
					socketServer.emit(EventType[key], data);
				});
			});

		});

		function Player(name, socketid) {
			this.name = name;
			this.socketId = socketid;
		}

		let iohandler;

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

		beforeAll(() => {
			const iohandlerModule = require('./iohandler.js');
			iohandler = iohandlerModule.default;
			iohandler(null, table);
		});

		let client = socketServer.socketClient;
		/**
		 * Set up own timeout for faster test failure
		 */
		var killer, timeout = 200;
		beforeEach(() => {
			killer = new DelayAction((end) => {
				end(new Error('Event not received below ' + timeout + ' ms.'));
			}, timeout);
		});

		afterEach(() => {
			loggerSpy.mockClear();
		});

		afterEach(() => {
			client.disconnect();
			table.full = false;
			table.clear();
		});

		describe('Connection', () => {

			it('should log when user connection', () => {
				client.connect();
				expect(loggerSpy).toHaveBeenCalledTimes(1);
			});

			it('should have emit draw table on connection', (done) => {
				client.once(TableEventType.DRAW_TABLE, (players) => {
					killer.cancel();
					expect(players).toBeDefined();
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
					expect(msg).toBeDefined();
					expect(typeof msg).toBe('string');
					expect(msg).not.toBe('');
					expect(loggerSpy).toHaveBeenCalledTimes(1);
					done();
				});

				// Once connected
				client.once(TableEventType.DRAW_TABLE, () => {
					// Need to clear loggerSpy history
					loggerSpy.mockClear();
					client.emit(ChatEventType.CHAT, msg);
				});

				killer.startWith(done);
				client.connect();

			});

		});

		describe('Clear Table event', () => {

			it('should send to all client when requested by one client', (done) => {

				const spy = jest.spyOn(table, 'clear');
				expect(table.players).toHaveLength(0);

				for (let i = 0; i < 3; i++) {
					table.players.push('Tester' + i);
				}

				client.once(TableEventType.CLEAR_TABLE, players => {
					killer.cancel();
					expect(spy).toHaveBeenCalledTimes(1);
					expect(loggerSpy).toHaveBeenCalledTimes(1);
					expect(players).toBeDefined();
					expect(Array.isArray(players)).toBe(true);
					expect(players).toHaveLength(0);
					done();
				});

				client.once(TableEventType.DRAW_TABLE, () => {
					loggerSpy.mockClear();
					client.emit(TableEventType.CLEAR_TABLE, {});
				});

				killer.startWith(done);
				client.connect();
			});
		});

		describe('Add player', () => {

			/**
			 * Once connected binding event
			 * @param {object} client   [listener client]
			 * @param {string} evt      [event to listen]
			 * @param {string} emit_evt [event to emit]
			 * @param {any} data     	[data to send]
			 */
			function onceConnectedEmit(client, evt, emit_evt, data) {

				client.once(evt, () => {
					loggerSpy.mockClear();
					client.emit(emit_evt, data);
				});
			}

			it('should send to sender table full', (done) => {
				table.full = true;
				let player = [{
					name: 'Tester1'
				}];
				
				client.once(TableEventType.FULL_TABLE, () => {
					killer.cancel();
					expect(loggerSpy).toHaveBeenCalledTimes(2);
					done();
				});

				onceConnectedEmit(client, TableEventType.DRAW_TABLE,
					TableEventType.ADD_PLAYER, player);

				killer.startWith(done);
				client.connect();
			});

			it('should add player to table', (done) => {
				const spy = jest.spyOn(table, 'addPlayer');
				var expectedPlayers = [
					(new Player('Tester2', socketServer.id))
				];
				table.players = expectedPlayers;
				client.once(TableEventType.UPDATE_TABLE, players => {
					killer.cancel();
					expect(loggerSpy).toHaveBeenCalledTimes(2);
					expect(spy).toHaveBeenCalled();
					expect(players).toBeDefined();
					expect(Array.isArray(players)).toBe(true);
					expect(players.length).toBeGreaterThan(0);
					expect(players).toEqual(expectedPlayers);
					done();
				});

				onceConnectedEmit(client, TableEventType.DRAW_TABLE,
					TableEventType.ADD_PLAYER, expectedPlayers);

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
					expect(loggerSpy).toHaveBeenCalledTimes(3);
					done();
				});

				onceConnectedEmit(client, TableEventType.DRAW_TABLE,
					TableEventType.ADD_PLAYER, expectedPlayers);

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

				onceConnectedEmit(client, TableEventType.DRAW_TABLE,
					TableEventType.ADD_PLAYER, [new Player('Tester3', socketServer.id)]);


				killer.startWith(done);
				client.connect();
			});
		});
	});
});