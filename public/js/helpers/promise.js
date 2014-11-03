define([], function() {

	'use strict';

	return Promise;
	
	/*
		var p = new Promise(function(resolve, reject) {
			window.setTimeout(function() {
				resolve("my value");
			}, 1500);
		});

		p.then(function(value) {
			value = 'At the end of my promise: ' + value;
			console.log(value);
		});
	*/

	function Promise(fn) {

		/**
			Private properties
		*/
		var _data;
		var _deferred;
		var _state = 'pending';
		var _parentData;

		/**
			Private functions
		*/
		function _handle(handler) {
			if (_state === 'pending') {
				_deferred = handler;
				return;
			}

			var handlerCallback = _getCallback(handler);

			setTimeout(function() {
				try {
					if (!handlerCallback) {
						_getPromiseFunction().call(this, _data);
						return;
					}
					handler._resolve.call(this, handlerCallback(_data))
				} catch (e) {
					if (handler._reject)
						handler._reject.call(this, e);
					else
						throw e;
				}
			}, 1);

		}

		function _getCallback(handler) {
			return (_state === 'resolved') ? handler.onResolve : handler.onReject;
		}


		function _getPromiseFunction(handler) {
			return (_state === 'resolved') ? handler._resolve : handler._reject;
		}

		function _resolve(args) {
			_set('resolved', args);
		}

		function _reject(args) {
			_set('rejected', args);
		}

		function _set(status, args) {
			_data = args;
			_state = status;

			if (_deferred)
				_handle(_deferred);
		}

		/**
			API, public interface
		*/
		this.status = function() {
			return _state;
		}

		this.then = function(resolve, reject) {
			// "res" is the internal _resolve function
			// "resolve" is the function that'll be used
			// on the values of the promise
			//_parent = this;
			var promise = new Promise(function(res, rej) {
				_handle({
					onResolve: resolve,
					onReject: reject,
					_resolve: res,
					_reject: rej,
				});
			})

			return promise;
		}

		this.catch = function(reject) {

			return this.then(null, reject);
		}

		this.done = function(resolve, reject) {
			this.then(resolve, reject);
		}

		/**
			Kickstarting the promise
		*/
		fn(_resolve, _reject);
	}

	/**
		Static methods
	*/
	Promise.all = function(promises) {
		var count = promises.length;
		var finished = 0;
		var result = [];

		return new Promise(function(resolve, reject) {
			for (var p = 0; p < count; p++) {
				promises[p].then(function(value) {
					finished++;
					result.push(value);
					if (finished === count) {
						try {
							resolve(result)
						} catch (e) {
							reject(e);
						}
					}
				}, function(err) {
					console.log('Errors occured when calling "ALL"', err);
				});
			}
		})
	}

});