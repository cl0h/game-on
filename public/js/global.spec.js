/*jshint expr: true */
'use strict';

/**
 * Test Dependencies
 */

import rewiremock from 'rewiremock';
import MockBrowser from 'mock-browser';
import jquery from 'jquery';
import SharedEnum from './sharedenum.js';
import { mockifyCanvas } from '../../Tests/Functional/helpers.js';
import SocketIOMock from 'socket.io-mock';
import DelayAction from '../../Tests/Utils/DelayAction/delayaction.js';

/**
 * Set up enums
 * @type {[type]}
 */
const PermissionType = SharedEnum.PermissionType;
const ChatEventType = SharedEnum.ChatEventType;
const TableEventType = SharedEnum.TableEventType;

rewiremock.around(() => import('./global.js'), (mock) => {
	describe('Global.js Unit Tests', () => {

		

		afterEach(() => {
			jest.clearAllMocks();
		});

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
			killer.time = timeout = 200;
		});

		describe('View variables', () => {

			let globalJs, window;
			beforeAll(async () => {
				const browser = new MockBrowser();
				window = browser.getWindow();
				window.window = window;
				window.document = browser.getDocument();
				window.$ = jquery(window);
				window.io = () => new SocketIOMock().socketClient;
				window.console = {
					log: jest.fn()
				};

			it('should have message board', () => {
				expect(globalJs.view.chat.$msgBoard).toBeDefined();
			});

		});

		describe('Notification', () => {

			let globalJs, window;
			beforeAll(async () => {
				const browser = new MockBrowser();
				window = browser.getWindow();
				window.window = window;
				window.document = browser.getDocument();
				window.$ = jquery(window);
				window.io = () => new SocketIOMock().socketClient;
				window.console = {
					log: jest.fn()
				};

				mock.mock('jquery', window.$);
				globalJs = await import('./global.js');

				window.Notification = jest.fn();
				window.Notification.permission = PermissionType.DEFAULT;
				window.Notification.requestPermission = jest.fn();
			});

			let stubInstance;
			beforeAll('Set up onclick getter/setter', () => {
				stubInstance = jest.createMockFromModule('notification');
			});

			afterEach(() => {
				window.Notification.permission = PermissionType.DEFAULT;
			});

			it('should have declared nofityMe', () => {
				expect(typeof globalJs.notifyMe).toBe('function');
			});

			it('should raise alert if notification not available', async () => {
				const browser = new MockBrowser();
				const win = browser.getWindow();
				win.window = win;
				win.document = browser.getDocument();
				win.$ = jquery(win);
				win.alert = jest.fn();
				win.console = {
					log: jest.fn()
				};
				mock.mock('jquery', win.$);
				const globalJsNoNotification = await import('./global.js');

				expect(globalJsNoNotification.notifyMe()).toBe(false);
				expect(win.alert).toHaveBeenCalledTimes(1);
			});

			it(
                'should request permission on DOMContentLoaded if not already granted',
                () => {
					expect(window.Notification).toBeDefined();
                    globalJs.notifyMe();

                    let evt = new window.Event('DOMContentLoaded');

                    Object.keys(PermissionType)
                        .forEach((permission) => {
                jest.clearAllMocks();
                            window.Notification.permission = PermissionType[permission];
                            let dispatched = window.document.dispatchEvent(evt);
                            if (dispatched) {
                                if (permission.toLowerCase() === PermissionType.GRANTED) {
                                    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
                                } else {
                                    expect(window.Notification.requestPermission).toHaveBeenCalled();
                                }
                            } else {
                                throw new Error('DOMContentLoaded event has been cancelled.');
                            }
                        });
                }
            );

			it('should request permission if not already granted', () => {
				expect(window.Notification).toBeDefined();

				Object.keys(PermissionType)
					.forEach((permission) => {
						jest.clearAllMocks();
						window.Notification.permission = PermissionType[permission];
						globalJs.notifyMe();
						if (permission.toLowerCase() === PermissionType.GRANTED) {
							expect(window.Notification.requestPermission).not.toHaveBeenCalled();
						} else {
							expect(window.Notification.requestPermission).toHaveBeenCalled();
						}
					});
			});

			it('should send notification if permission granted', () => {
				window.Notification.permission = PermissionType.GRANTED;
				globalJs.notifyMe();
				expect(window.Notification).toHaveBeenCalled();
			});

			it('should log on click', (done) => {
				window.Notification = jest.fn(() => stubInstance);
				window.Notification.permission = PermissionType.GRANTED;

				Object.defineProperty(stubInstance, 'onclick', { set: (fn) => {
					killer.cancel();
					expect(typeof fn).toBe('function');
					fn();
					expect(window.console.log).toHaveBeenCalledTimes(1);
					done();
				} });
				expect(stubInstance.onclick).toBeDefined();
				killer.startWith(done);
				globalJs.notifyMe();
			});
		});

		// Other describe blocks will be converted similarly
	});
});
