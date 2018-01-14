/*jshint expr: true*/
'use strict';

/**
 * Test Dependencies
 */
const Chai = require('chai');
const Sinon = require('sinon');
const SinonChai = require('sinon-chai');
const MockBrowser = require('mock-browser').mocks.MockBrowser;
const VM = require('vm');
const Path = require('path');
const FS = require('fs');
const SharedEnum = require('./sharedenum.js');
const mockifyCanvas = require('../../Tests/Functional/helpers').mockifyCanvas;
const SocketIOMock = require('socket.io-mock');
const DelayAction = require('../../Tests/Utils/DelayAction/delayaction');

/**
 * Set up enums
 * @type {[type]}
 */
const PermissionType = SharedEnum.PermissionType;
const ChatEventType = SharedEnum.ChatEventType;
const TableEventType = SharedEnum.TableEventType;

/**
 * Utils
 */
Chai.use(SinonChai);
Chai.should();
const assert = Chai.assert;

function getWindow() {
	let browser = new MockBrowser();
	let win = browser.getWindow();
	win.window = win;
	win.document = browser.getDocument();
	require('jquery')(win);
	return browser.getWindow();
}

function createVMContext(o_module, o_window, str_module_path, callback) {
	o_window.$(o_window.document)
		.ready(function VMLoaded() {
			callback();
		});
	let winctx = VM.createContext(o_window);
	VM.runInContext(o_module, winctx, str_module_path);
	return winctx;
}
const MODULE_PATH = Path.resolve(__dirname, './global.js');
const MODULE_TESTED = FS.readFileSync(MODULE_PATH, {
	encoding: 'UTF-8'
});
describe('Global.js Unit Tests', () => {

	let sinonbox;
	before('Set up sinon sandbox', () => {
		sinonbox = Sinon.sandbox.create();
	});

	/**
	 * Set up own timeout for faster test failure
	 */
	var killer, timeout = 200;
	beforeEach('Set up DelayAction', () => {
		killer = new DelayAction((end) => {
			end(new Error('Event not received below ' + timeout + ' ms.'));
		}, timeout);
	});

	afterEach('Restore time on DelayAction', () => {
		killer.time = timeout = 200;
	});

	describe('View variables', () => {

		let ctx;
		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return (new SocketIOMock()).socketClient;
			};
			win.console = {
				log: sinonbox.spy()
			};
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
		});

		it('should have message board', () => {
			assert.isDefined(ctx.view.chat.$msgBoard);
		});

	});

	describe('Notification', () => {

		let ctx;
		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return (new SocketIOMock()).socketClient;
			};
			win.console = {
				log: sinonbox.spy()
			};
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
		});

		before('Set up notification', () => {
			ctx.Notification = sinonbox.mock();
			ctx.Notification.permission = PermissionType.DEFAULT;
			ctx.Notification.requestPermission = sinonbox.spy();
		});

		let stubInstance;
		before('Set up onclick getter/setter', () => {
			stubInstance = sinonbox.createStubInstance(ctx.Notification);
			Object.defineProperty(stubInstance,
				'onclick', {
					get: function() {
						return '';
					},
					set: function() {},
					configurable: true
				});
			assert.isDefined(stubInstance.onclick);
		});

		afterEach('Ensure permission set to default', () => {
			ctx.Notification.permission = PermissionType.DEFAULT;
		});

		it('should have declared nofityMe', () => {
			assert.isFunction(ctx.notifyMe);
		});

		it('should raise alert if notification not available', (done) => {

			let ctx_without_Notification;
			let test_handler = function test_handler() {
				killer.cancel();
				// Ensure notification is removed
				assert.isUndefined(ctx_without_Notification.Notification);
				assert.isFalse(ctx_without_Notification.notifyMe(), 'Has been notified?');
				ctx_without_Notification.alert.should.have.been.calledOnce;
				done();
			};
			// Create new context without notification
			let win = getWindow();
			win.alert = sinonbox.spy();
			win.console = {
				log: sinonbox.spy()
			};
			killer.startWith(done);
			ctx_without_Notification = createVMContext(MODULE_TESTED, win, MODULE_PATH, test_handler);

		});

		it('should request permission on DOMContentLoaded if not already granted', (done) => {
			// Ensure Notification exist
			assert.isDefined(ctx.Notification);
			/**
			 * Bind DOMContentLoaded by trigger function
			 * as event into function
			 */
			ctx.notifyMe();

			// Set up the dom event
			let evt = new ctx.Event('DOMContentLoaded');

			Object.keys(PermissionType)
				.forEach((permission, idx, array) => {
					sinonbox.resetHistory();
					ctx.Notification.permission = PermissionType[permission];
					let dispatched = ctx.document.dispatchEvent(evt);
					if (dispatched) {
						// If granted, requestPermission not called
						if (permission.toLowerCase() === PermissionType.GRANTED) {
							ctx.Notification.requestPermission
								.should.not.have.been.called;
						} else {
							ctx.Notification.requestPermission
								.should.have.been.called;
						}

						if (idx === (array.length - 1)) {
							done();
						}
					} else {
						done(new Error('DOMContentLoaded event has been cancelled.'));
					}
				});
		});

		it('should request permission if not already granted', () => {
			// Ensure Notification exist
			assert.isDefined(ctx.Notification);

			Object.keys(PermissionType)
				.forEach((permission) => {
					sinonbox.resetHistory();
					ctx.Notification.permission = PermissionType[permission];
					ctx.notifyMe();
					// If granted, requestPermission not called
					if (permission.toLowerCase() === PermissionType.GRANTED) {
						ctx.Notification.requestPermission
							.should.not.have.been.called;
					} else {
						ctx.Notification.requestPermission
							.should.have.been.called;
					}
				});
		});

		it('should send notification if permission granted', () => {
			ctx.Notification.permission = PermissionType.GRANTED;
			ctx.notifyMe();
			ctx.Notification.should.have.been.calledWithNew;
		});

		it('should log on click', (done) => {

			ctx.Notification = sinonbox.spy(function() {
				return stubInstance;
			});
			ctx.Notification.permission = PermissionType.GRANTED;

			sinonbox.stub(stubInstance, 'onclick').set((fn) => {
				killer.cancel();
				assert.isFunction(fn);
				fn();
				ctx.console.log.should.have.been.calledOnce;
				done();
			});
			assert.isDefined(stubInstance.onclick);
			killer.startWith(done);
			ctx.notifyMe();
		});


	});

	describe('updateTable function', () => {

		let ctx;
		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return (new SocketIOMock()).socketClient;
			};
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
			ctx.alert = sinonbox.spy();
			ctx.console = {
				log: sinonbox.spy()
			};
		});

		let spyNotifyMe, spyAddPlayerCanvas;
		before('Set up spy on NotifyMe', () => {
			spyNotifyMe = sinonbox.spy(ctx, 'notifyMe');
			spyAddPlayerCanvas = sinonbox.stub(ctx, 'addPlayerCanvas');
			spyAddPlayerCanvas.callsFake(function() {
				return true;
			});
		});

		after('Restore default', () => {
			sinonbox.restore();
		});

		afterEach('Reset notifyMe spy', () => {
			sinonbox.resetHistory();
		});

		it('Ensure is declared', () => {
			assert.isFunction(ctx.updateTable);
		});


		it('should notify user when table full', () => {

			let arr = ['player1', 'player2', 'player3', 'player4'];
			ctx.updateTable(arr);
			spyAddPlayerCanvas.should.have.been.called;
			spyAddPlayerCanvas.should.have.been.callCount(4);
			spyNotifyMe.should.have.been.calledOnce;
			spyNotifyMe.should.have.been.calledWith('Game On!');

		});

		it('should notify only if max player at the table', () => {
			let arr = ['player1', 'player2'];

			ctx.updateTable(arr);
			spyAddPlayerCanvas.should.have.been.called;
			spyAddPlayerCanvas.should.have.been.callCount(2);
			spyNotifyMe.should.not.have.been.called;
		});

		it('should not update the table or notify if args invalid', () => {

			ctx.updateTable();

			spyAddPlayerCanvas.should.not.have.been.called;
			spyNotifyMe.should.not.have.been.called;

		});
	});

	describe('addPlayerCanvas function', () => {

		let ctx;
		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return (new SocketIOMock()).socketClient;
			};
			win.alert = sinonbox.spy();
			win.console = console;
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
			ctx.alert = sinonbox.spy();
		});

		let canvas;
		before('Set up the canvas', () => {

			let canvasid = 'canvas1';
			canvas = ctx.document.getElementById(canvasid);
			if (canvas === null || canvas === undefined) {
				canvas = ctx.document.createElement('canvas');
				canvas.id = 'canvas1';
				mockifyCanvas(canvas);
				ctx.document.body.appendChild(canvas);
			}
		});

		afterEach('Restore stub', () => {
			sinonbox.restore();
		});

		it('should be declared', () => {
			assert.isFunction(ctx.addPlayerCanvas);
		});

		it('should place player name in correct position', () => {

			let ctx2D = canvas.getContext();
			let stub = sinonbox.stub(canvas, 'getContext');
			stub.returns(ctx2D);

			let spyStrokeText = sinonbox.spy(ctx2D, 'strokeText');

			[
				[40, 120],
				[440, 120],
				[40, 300],
				[440, 300]
			]
			.forEach((topleft, idx) => {
				spyStrokeText.resetHistory();
				let playername = 'Tester' + idx;
				ctx.addPlayerCanvas(playername, idx + 1);
				spyStrokeText.should.have.been.calledOnce;
				spyStrokeText.should.have.been.calledWith(
					playername, topleft[0], topleft[1]);
			});
		});

		it('should throw error if wrong data provided', () => {
			let ctx2D = canvas.getContext();
			let stub = sinonbox.stub(canvas, 'getContext');
			stub.returns(ctx2D);

			let spyStrokeText = sinonbox.spy(ctx2D, 'strokeText');

			(() => {
				ctx.addPlayerCanvas('', 9999999);
			}).should.throw();
			spyStrokeText.should.not.have.been.calledOnce;
		});

	});

	describe('Chat form', () => {

		let ctx, server, chatform;

		before('Set up socket server', () => {
			server = new SocketIOMock();
		});
		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return server.socketClient;
			};
			// win.console = {
			// 	log: sinonbox.spy()
			// };
			win.console = console;
			chatform = win.document.createElement('form');
			chatform.id = chatform.name = 'chat';

			let name = win.document.createElement('input');
			name.id = name.name = 'name';
			chatform.appendChild(name);

			let msg = win.document.createElement('input');
			msg.id = msg.name = 'msg';
			chatform.appendChild(msg);

			win.document.body.appendChild(chatform);
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);

		});

		afterEach('Clean form', () => {
			ctx.document.getElementById('name').value = '';
			ctx.document.getElementById('msg').value = '';

			//			chatform.onsubmit = null;
		});

		afterEach('Clean up listener', () => {
			server.removeListener(ChatEventType.CHAT);
		});

		it('should cancel default behavior', () => {
			let $evt = ctx.$.Event('submit');
			ctx.$(chatform).trigger($evt);
			assert.isTrue($evt.isDefaultPrevented());
		});

		it('should send chat event on submit', (done) => {

			assert.isUndefined(chatform.onsubmit);

			let spy = sinonbox.spy(server.socketClient, 'emit');
			let test_handler = function() {
				killer.cancel();
				ctx.$(chatform).off('submit', test_handler);
				spy.should.have.been.called;
				spy.should.have.been.calledWith('chat', sinonbox.match.any);
				done();
			};
			ctx.$(chatform).on('submit', test_handler);

			killer.startWith(done);
			ctx.$(chatform).trigger('submit');

		});

		it('should send chat event with message', (done) => {
			// Ensure on submit reset
			assert.isUndefined(chatform.onsubmit);

			// Server monitor event call
			server.once(ChatEventType.CHAT, (msg) => {
				killer.cancel();
				assert.isDefined(msg);
				assert.isString(msg);
				inputMsg.value.should.be.empty;
				done();
			});
			let inputName = ctx.document.getElementById('name');
			let inputMsg = ctx.document.getElementById('msg');

			// Ensure already empty
			assert.equal(inputName.value, '');
			assert.equal(inputMsg.value, '');

			inputName.value = 'Tester1';
			inputMsg.value = 'This is a test';

			assert.isDefined(ctx.$('input#name').val(), 'Able to retrieve name value.');
			assert.isDefined(ctx.$('input#msg').val(), 'Able to retrieve msg value');

			ctx.$('input#name').val().should.equal(inputName.value);
			ctx.$('input#msg').val().should.equal(inputMsg.value);

			killer.startWith(done);
			ctx.$(chatform).trigger('submit');
		});
	});

	describe('Chat Events', () => {

		let ctx, server, chatform;

		before('Set up socket server', () => {
			server = new SocketIOMock();
		});

		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return server.socketClient;
			};
			// win.console = {
			// 	log: sinonbox.spy()
			// };
			win.console = console;
			chatform = win.document.createElement('form');
			chatform.id = chatform.name = 'chat';

			let name = win.document.createElement('input');
			name.id = name.name = 'name';
			chatform.appendChild(name);

			let msg = win.document.createElement('input');
			msg.id = msg.name = 'msg';
			chatform.appendChild(msg);

			win.document.body.appendChild(chatform);

			let msgBoard = win.document.createElement('ul');
			msgBoard.id = 'messages';
			win.document.body.appendChild(msgBoard);
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
		});



		it('should populate chat message on chat event', (done) => {
			ctx.view.$msgBoard = ctx.$('#messages');
			let spyAppend = sinonbox.spy(ctx.view.chat.$msgBoard, 'append');
			let spyScrollTop = sinonbox.spy(ctx.view.chat.$msgBoard, 'scrollTop');

			server.socketClient.once(ChatEventType.CHAT, () => {
				killer.cancel();
				spyAppend.should.have.been.called;
				spyScrollTop.should.have.been.called;
				done();
			});

			killer.startWith(done);
			server.emit(ChatEventType.CHAT);
		});

		it('should fill view variable if not defined yet', (done) => {
			assert.isUndefined(chatform.onsubmit);
			ctx.view.chat.$msgBoard = null;
			server.socketClient.once(ChatEventType.CHAT, () => {
				killer.cancel();
				done();
			});

			killer.startWith(done);
			server.emit(ChatEventType.CHAT, 'Test message');
		});
	});

	describe('Table Events', () => {

		let ctx, server;
		before('Create server IO', function() {
			server = new SocketIOMock();
		});

		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return server.socketClient;
			};
			win.alert = sinonbox.spy();
			win.console = console;
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
		});

		let chxNotifyMe;
		before('Add notification checkbox', () => {
			chxNotifyMe = ctx.document.createElement('input');
			chxNotifyMe.id = 'notifystart';
			chxNotifyMe.type = 'checkbox';
			chxNotifyMe.checked = true;
			ctx.document.body.appendChild(chxNotifyMe);
			assert.isDefined(ctx.document.getElementById(chxNotifyMe.id));
		});

		beforeEach('Set $msgBoard view variable', () => {
			if (ctx.view.chat.$msgBoard === null) {
				ctx.view.chat.$msgBoard = ctx.$('#messages');
			}
		});

		let stubNotifyMe, spyUpdateTable;
		before('Stub functions', () => {
			stubNotifyMe = sinonbox.stub(ctx, 'notifyMe');
			stubNotifyMe.callsFake(() => {
				return true;
			});
			// Spy updateTable
			spyUpdateTable = sinonbox.spy(ctx, 'updateTable');

		});

		afterEach('Reset history', () => {
			sinonbox.resetHistory();
		});

		afterEach('Reset value', () => {
			chxNotifyMe.checked = true;
		});

		it('should notify user only if notification selected', (done) => {

			server.socketClient.once(TableEventType.START_TABLE, () => {

				stubNotifyMe.should.have.been.calledOnce;
				stubNotifyMe.should.have.been.calledWith('New Table');

				// Reset spy counter
				stubNotifyMe.resetHistory();
				chxNotifyMe.checked = false;

				server.socketClient.once(TableEventType.START_TABLE, () => {
					killer.cancel();
					stubNotifyMe.should.not.have.been.calledOnce;
					done();
				});

				server.emit(TableEventType.START_TABLE);
			});

			killer.startWith(done);
			chxNotifyMe.checked = true;
			server.emit(TableEventType.START_TABLE);
		});

		it('should call update table on draw & update table event', (done) => {

			let dummy = {};

			server.socketClient.once(TableEventType.DRAW_TABLE, () => {
				spyUpdateTable.should.have.been.calledOnce;
				spyUpdateTable.should.have.been.calledWith(dummy);

				server.socketClient.once(TableEventType.UPDATE_TABLE, () => {
					killer.cancel();
					spyUpdateTable.should.have.been.calledOnce;
					spyUpdateTable.should.have.been.calledWith(dummy);
					done();
				});

				sinonbox.resetHistory();
				server.emit(TableEventType.UPDATE_TABLE, dummy);

			});
			killer.startWith(done);
			server.emit(TableEventType.DRAW_TABLE, dummy);

		});

		it('should add message when player join', (done) => {

			let spyAppend = sinonbox.spy(ctx.view.chat.$msgBoard, 'append');
			server.socketClient.once(TableEventType.UPDATE_TABLE, () => {
				killer.cancel();
				spyAppend.should.have.been.calledOnce;
				done();
			});
			killer.startWith(done);
			server.emit(TableEventType.UPDATE_TABLE, []);

		});

		it('should raise an alert when table full', (done) => {

			server.socketClient.once(TableEventType.FULL_TABLE, () => {
				killer.cancel();
				ctx.alert.should.have.been.calledOnce;
				done();
			});
			killer.startWith(done);
			server.emit(TableEventType.FULL_TABLE);

		});

		it('should set find $msgBoard if not defined', (done) => {
			ctx.view.chat.$msgBoard = null;
			server.socketClient.once(TableEventType.UPDATE_TABLE, () => {
				killer.cancel();
				assert.isNotNull(ctx.view.chat.$msgBoard);
				done();
			});

			killer.startWith(done);
			server.emit(TableEventType.UPDATE_TABLE, []);
		});
	});

	describe('Clear Table button', () => {

		let ctx, server;
		before('Create server IO', function() {
			server = new SocketIOMock();
		});

		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return server.socketClient;
			};

			let button = win.document.createElement('button');
			button.id = 'clearTable';
			win.document.body.appendChild(button);

			win.alert = sinonbox.spy();
			win.console = console;
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);

		});

		it('should have been hook to event', (done) => {
			let button = ctx.document.getElementById('clearTable');

			server.once(TableEventType.CLEAR_TABLE, () => {
				killer.cancel();
				done();
			});

			killer.startWith(done);
			button.click();
		});
	});

	describe('Add player button', () => {

		let ctx, server;
		before('Create server IO', function() {
			server = new SocketIOMock();
		});

		before('Create a context', (done) => {
			let win = getWindow();
			win.io = function() {
				return server.socketClient;
			};
			win.alert = sinonbox.spy();
			win.console = sinonbox.spy();
			ctx = createVMContext(MODULE_TESTED, win, MODULE_PATH, done);
		});

		let button;
		before('Set up the button', () => {
			let name = ctx.document.createElement('input');
			name.id = name.name = 'name';
			ctx.document.body.appendChild(name);

			button = ctx.document.createElement('button');
			button.id = 'addPlayer';
			ctx.document.body.appendChild(button);

		});

		beforeEach('Reset sinon', () => {
			server.removeListener(TableEventType.ADD_PLAYER);
			sinonbox.restore();
		});

		afterEach('Clean field name', () => {
			ctx.document.getElementById('name').value = '';
		});

		it('should have been hook to event', (done) => {

			assert.isEmpty(ctx.document.getElementById('name').value, 'Name is empty');

			let name = 'player1';
			ctx.document.getElementById('name').value = name;

			server.on(TableEventType.ADD_PLAYER, data => {
				killer.cancel();
				assert.isArray(data, 'data is an array?');
				assert.lengthOf(data, 1, 'Have one value?');
				assert.isObject(data[0], 'player object?');
				assert.isString(data[0].name, 'name of player');
				assert.isNotEmpty(data[0].name, 'name of player');
				assert.equal(data[0].name, name);
				done();
			});

			killer.startWith(done);
			button.click();
		});

		it('should ensure that no empty value is submitted', (done) => {
			assert.isEmpty(ctx.document.getElementById('name').value, 'Name is empty');

			server.on(TableEventType.ADD_PLAYER, () => {
				done(new Error('Event should not have been received.'));
			});
			// Monitor click event to ensure
			// test ended without trigger socket event
			var monitoring = function() {
				try {
					button.removeEventListener('click', monitoring);
					done();
				} catch (e) {
					done(e);
				}
			};
			button.addEventListener('click', monitoring);
			button.click();
			ctx.alert.should.have.been.calledOnce;
		});

		it('should ensure empty with space is invalid', (done) => {
			ctx.document.getElementById('name').value = '  ';

			server.on(TableEventType.ADD_PLAYER, () => {
				done(new Error('Event should not have been received.'));
			});
			// Monitor click event to ensure
			// test ended without trigger socket event
			var monitoring = function() {
				try {
					button.removeEventListener('click', monitoring);
					done();
				} catch (e) {
					done(e);
				}
			};
			button.addEventListener('click', monitoring);
			button.click();
			ctx.alert.should.have.been.calledOnce;
		});
	});
});