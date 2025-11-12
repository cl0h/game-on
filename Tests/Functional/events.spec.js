/*jshint expr: true*/
// Test io handler
'use strict';

/**
 * Test dependencies
 * @private
 */
const http = require('http');
const io = require('socket.io-client');

const SocketTester = require('socket-tester');
const SharedEnum = require('../../public/js/sharedenum');


/**
 * Constances
 * @private
 */
const PORT = 8000;
const SOCKET_URL = 'http://localhost:' + PORT;
const ChatEventType = SharedEnum.ChatEventType;
const TableEventType = SharedEnum.TableEventType;


/**
 * Unit tested
 * @private
 */
const log = jest.fn();



const iohandler = require('../../components/iohandler');

/**
 * Test settings
 * @private
 */
var clientOptions = {
	transports: ['websocket'],
	'force new connection': true
};

var ioTester = new SocketTester(io, SOCKET_URL, clientOptions);

describe('Events handler Test Suite', () => {

	var server, ioServer;
	var table;
	beforeAll(() => {
		server = http.createServer((req, res) => {
			res.write('Hello world!');
			res.end();
		});
		server.listen(PORT);
		table = {
			players: ['player1', 'player2'],
			clear: jest.fn(),
			addPlayer: jest.fn(),
			getLength: jest.fn()
		};
		ioServer = iohandler(server, table);
	});

	afterAll((done) => {
		server.close(done);
	});

	describe('Single or multiple client', () => {

		// Util function killer timeout
		function killClient(client, fn, time) {
			return killClients([client], fn, time);
		}

		function killClients(clients, fn, time) {
			if (time === undefined) {
				time = 200;
			}
			return setTimeout(() => {
				clients.forEach(c => {
					c.disconnect();
				});
				fn(new Error('Message not received below ' + time + 'ms.'));
			}, time);
		}
		
		var patternConnected = /^(Connected\. ID:\s).*?$/;
		var patternDisconnected = /^(Disconnected ID:\s).*?$/;
		var patternClearTable = /^(Clear sent by:\s).*?$/;
		var patternAddPlayer = /^(Add received from:\s).*?$/;
		var patternFullTable = /^(Full table sent to\s).*?$/;

		function validateRegex(pattern, positive, negative){
			var regx = new RegExp(pattern);
			expect(regx.test(positive)).toBe(true);
			expect(regx.test(negative)).toBe(false);
		}

		beforeAll(() => {
			validateRegex(patternConnected,
				'Connected. ID: Q-abf2C4d_448e',
				'Should not pass. ID: Q-abf2C4_d448e');
		});

		beforeAll(() => {
			validateRegex(patternDisconnected,
				'Disconnected ID: Q-abf2C4d448e',
				'Should not pass. ID: Q-abf2C4d448e');
		});

		beforeAll(() => {
			validateRegex(patternClearTable,
				'Clear sent by: Q-abf2C4d_448e',
				'Should not pass. ID: Q-abf2C4_d448e');
		});

		beforeAll(() => {
			validateRegex(patternAddPlayer,
				'Add received from: Q-abf2C4d_448e',
				'Should not pass. ID: Q-abf2C4_d448e');
		});

		beforeAll(() => {
			validateRegex(patternFullTable,
				'Full table sent to Q-abf2C4d_448e',
				'Should not pass. ID: Q-abf2C4_d448e');
		});

		afterEach(() => {
			table.clear.mockClear();
			table.addPlayer.mockClear();
			table.getLength.mockClear();
			if (table.full) {
				table.full = false;
			}
		});

		it('should confirm client connect', (done) => {

			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			client1.once('connect', () => {
				clearTimeout(killer);
				try {
					expect(log).toHaveBeenCalledWith(expect.stringMatching(patternConnected));
					client1.disconnect();
					done();
				} catch (e) {
					client1.disconnect();
					done(e);
				}
			});
		});

		it('should emit drawTable with list players event', (done) => {
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			client1.once(TableEventType.DRAW_TABLE, (playerlist) => {
				clearTimeout(killer);
				try {
					expect(playerlist).toEqual(table.players);
					client1.disconnect();
					done();
				} catch (e) {
					client1.disconnect();
					done(e);
				}
			});
		});

		it('should log when disconnect', (done) => {
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = setTimeout(() => {
				done.fail('Message disconnect not received below 500 ms.');
			}, 200);
			client1.once('disconnect', () => {
				clearTimeout(killer);
				try {
					expect(log).toHaveBeenCalledWith(expect.stringMatching(patternDisconnected));
					done();
				} catch (e) {
					done(e);
				}
			});
			client1.once('connect', () => {
				client1.disconnect();
			});
		});

		it('should log chat message', (done) => {
			var msg = 'This is a test';
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);
			client1.once(ChatEventType.CHAT, () => {
				clearTimeout(killer);
				try {
					expect(log).toHaveBeenCalledWith('message: ' + msg);
					expect(log).toHaveBeenCalledWith('chat msg sent.');
					client1.disconnect();
					done();
				} catch (e) {
					client1.disconnect();
					done(e);
				}
			});
			client1.emit(ChatEventType.CHAT, msg);
		});

		it('should send messages to all client', (done) => {
			var msg = 'This is a test';

			var clients = [];
			var totalClient = 3;
			for (var i = 0; i < totalClient; i++) {
				var settings = {
					on: {}
				};
				settings.on[ChatEventType.CHAT] = ioTester.shouldBeCalledWith(msg);
				if (i === (totalClient - 1)) {
					settings.emit = {};
					settings.emit[ChatEventType.CHAT] = msg;
				}
				clients.push(settings);
			}

			try {
				ioTester.run(clients, done);
			} catch (e) {
				done(e);
			}

		});

		it('should send clear_table when clearTable called', (done) => {

			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);

			client1.once(TableEventType.CLEAR_TABLE, () => {
				clearTimeout(killer);
				try {
					expect(log).toHaveBeenCalledWith(expect.stringMatching(patternClearTable));
					expect(log).toHaveBeenCalledWith('update table sent');
					expect(table.clear).toHaveBeenCalled();
					client1.disconnect();
					done();
				} catch (e) {
					client1.disconnect();
					done(e);
				}
			});

			client1.once('connect', () => {
				client1.emit(TableEventType.CLEAR_TABLE);
			});
		});

		it('should signal updateTable when user register', (done) => {
			var player = [{
				name: 'tester'
			}];
			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);

			client1.once(TableEventType.UPDATE_TABLE, (players) => {
				clearTimeout(killer);
				try {
					expect(log).toHaveBeenCalledWith(expect.stringMatching(patternAddPlayer));
					expect(players).toEqual(table.players);
					expect(table.addPlayer).toHaveBeenCalled();
					expect(log).toHaveBeenCalledWith('Player added. Sending Update Table event');
					client1.disconnect();
					done();
				} catch (e) {
					client1.disconnect();
					done(e);
				}
			});

			client1.once('connect', () => {
				client1.emit(TableEventType.ADD_PLAYER, player);
			});
		});

		it('should signal fullTable if table full', (done) => {
			var player = [{
				name: 'tester'
			}];

			table.full = true;

			var client1 = io.connect(SOCKET_URL, clientOptions);
			var killer = killClient(client1, done);

			client1.once(TableEventType.FULL_TABLE, () => {
				clearTimeout(killer);
				try {
					expect(log).toHaveBeenCalledWith('Table is full');
					expect(log).toHaveBeenCalledWith(expect.stringMatching(patternFullTable));
					expect(table.addPlayer).not.toHaveBeenCalled();
					client1.disconnect();
					done();
				} catch (e) {
					client1.disconnect();
					done(e);
				}
			});

			client1.once('connect', () => {
				client1.emit(TableEventType.ADD_PLAYER, player);
			});
		});

		/**
		 * TODO: Clean up this test
		 * It's quite long since it have to chain all
		 * the clients.
		 * client-tester module is not reliable with
		 * broadcast as the test end before calling
		 * the listener
		 */
		it('should signal startTable to others if first registration', (done) => {

			var called = 0;
			var connect = () => {
				return io.connect(SOCKET_URL, clientOptions);
			};

			var setUpClient = (client) => {
				client.on(TableEventType.START_TABLE, function() {
					called++;
				});
			};

			var disconnect = (clients, end, err) => {
				clients.forEach(client => {
					client.disconnect();
				});
				if (err) {
					end(err);
				} else {
					end();
				}
			};
			
			table.full = false;
			table.getLength.returns(1);

			var client1, client2, client3;

			var killer = killClients([client1, client2, client3], done);
			client1 = connect();
			client1.on('connect', function() {
				setUpClient(client1);
				client2 = connect();
				client2.on('connect', function() {
					setUpClient(client2);
					client3 = connect();
					client3.on('connect', function() {
						setUpClient(client3);

						client3.emit(TableEventType.ADD_PLAYER, [{
							name: 'Tester3'
						}]);

						setTimeout(() => {
							try {
								clearTimeout(killer);
								expect(called).toBe(2);
								disconnect([client1, client2, client3], done);
							} catch (e) {
								// Need to disconnect clients if test failed
								disconnect([client1, client2, client3], done, e);
							}
						}, 15); // Need to wait long enough
					});
				});
			});
		});
	});
});