// Unit test index

'use strict';
process.env.NODE_ENV = 'test';

/**
 * Test dependencies
 * @private
 */

const fork = require('child_process').fork;
const Path = require('path');

/**
 * Constances
 * @private
 */
const INDEX_PATH = Path.resolve(__dirname, './index.js');

/**
 * Utils
 * @private
 */


const logger = jest.fn();



describe('Index unit test', () => {

	/**
	 * Load Index js with proxyquire
	 * 
	 * This allow to load proxyquire with
	 * a stub loggging and with different port
	 * 
	 * @param  {function} logger [Function used for logging]
	 * @return {application}     [Individual application]
	 */
	function loadTestModule() {
		return require('./index');
	}

	describe('Start and shutdown', () => {

		it('should shutdown', (done) => {
			expect(() => {
				var app = loadTestModule();
				app.server.close(done);
			}).not.toThrow();
		});
	});

	describe('Selective port', () => {

		it('should listen to default port 3000', (done) => {
			var app = loadTestModule();
			expect(app.server.address().port).toEqual(3000);
			app.server.close(done);
		});

		it('should listen to specified port', () => {
			var port = 6000;
			process.env.PORT = port;
			var app = loadTestModule();
			try {
				expect(app.server.address().port).toEqual(port);
			} catch (e) {
				throw e;
			} finally {
				app.server.close();
				delete process.env.PORT;

			}
		});
	});

	describe('Running as a fork', () => {

		it('should emit message process child', (done) => {

			var timeout = setTimeout(() => {
				appfork.kill();
				done(new Error('Message not received before 1000 ms.'));
			}, 1000);

			var appfork = fork(INDEX_PATH);
			appfork.on('message', (msg) => {
				expect(msg).toEqual('listening');
				clearTimeout(timeout);
				appfork.kill();
				done();
			});
		});
	});

	describe('Running in VM', () => {
		let VM = require('vm');
		let fs = require('fs');

		it('should not change the port of this context', () => {
			let port = 5000;
			let module = fs.readFileSync(INDEX_PATH, {
				encoding: 'UTF-8'
			});

			let context = VM.createContext({
				require: require,
				__dirname: __dirname,
				module: {
					parent: this
				},
				process: {
					env: {
						PORT: port
					}
				}
			});
			context.module.exports = context;
			VM.runInContext(module, context, INDEX_PATH);
			expect(process.env.PORT).toBeUndefined();
			expect(context.server.address().port).toEqual(port);
			try{
				context.server.close();
			}catch(e){
				throw e;
			}
		});
	});
});