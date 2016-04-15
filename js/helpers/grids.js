define([], function() {
    return (function() {

        var NoiseGrid = function(opt) {

        };

        NoiseGrid.prototype = {
            grid: function() {
                throw "NoiseGrid: Grid doesn't support this function";
            },
            step: function() {
                throw "NoiseGrid: Grid doesn't support this function";
            },
            extend: function() {
                throw "NoiseGrid: Grid doesn't support this function";
            }
        };

        var TwoDeeNoiseGrid = function(opt) {
            var _opt = _verify(opt);

            this.set = function(opt) {
                _opt = _set(_opt, opt);
            };

            this.grid = function(speedX, speedY) {
                var sx = speedX || 0;
                var sy = speedY || 0;
                var grid = [];
                for (var x = 0 - _opt.top; x < _opt.w + _opt.bottom; x++) {
                    grid[x + _opt.top] = [];
                    for (var y = 0 - _opt.left; y < _opt.h + _opt.right; y++) {
                        grid[x + _opt.top][y + _opt.left] = _calc(x + sx, y + sy);
                    }
                }
                return grid;
            };

            this.step = function(direction) {
                var x = direction[0] * (_opt.speed / 1000);
                var y = direction[1] * (_opt.speed / 1000);
                return this.grid(x, y);
            };

            this.next = function(direction) {
                //get a chunk in any direction of the set size
                var x = direction[0] * _opt.size;
                var y = direction[1] * _opt.size;
                return this.grid(x, y);
            };

            this.extend = function(direction) {
                _opt.top += direction[0]; // h, before
                _opt.right += direction[1]; //w, after
                _opt.bottom += direction[2]; //h, after
                _opt.left += direction[3]; //w, before
                return this.grid();
            };

            function _calc(x, y, z) {
                return _opt.decorator(_opt.noise(x * _opt.scale, y * _opt.scale));
            };
        };

        var ThreeDeeNoiseGrid = function(opt) {
            var _opt = _verify(opt);

            this.set = function(opt) {
                _opt = _set(_opt, opt);
            };

            this.grid = function() {
                var grid = [];
                for (var x = 0; x < _opt.w; x++) {
                    grid[x] = [];
                    for (var y = 0; y < _opt.h; y++) {
                        grid[x][y] = [];
                        for (var z = 0; z < _opt.z; z++) {
                            grid[x][y][z] = _calc(x, y, z);
                        }
                    }
                }
                return grid;
            };

            function _calc(x, y, z) {
                return _opt.decorator(_opt.noise(x * _opt.scale, y * _opt.scale, z * _opt.scale));
            }
        };

        var SphereNoiseGrid = function(opt) {
            var _opt = _verify(opt);

            this.set = function(opt) {
                _opt = _set(_opt, opt);
            };

            this.grid = function() {
                var grid = [];
                for (var x = 0; x < _opt.w; x++) {
                    grid[x] = [];
                    for (var y = 0; y < _opt.h; y++) {
                        grid[x][y] = _calc(x, y);
                    }
                }
                return grid;
            };

            this.step = function() {

            };

            this.extend = function(grid, direction) {

            };

            function _calc(x, y, z) {
                return _opt.decorator(_opt.noise(x * _opt.scale, y * _opt.scale));
            }
        };

        var TileableNoiseGrid = function(opt) {
            var _opt = _verify(opt);

            this.set = function(opt) {
                _opt = _set(_opt, opt);
            };

            this.grid = function() {
                var grid = [];
                for (var x = 0; x < _opt.w; x++) {
                    grid[x] = [];
                    for (var y = 0; y < _opt.h; y++) {
                        grid[x][y] = _calc(x, y);
                    }
                }
                return grid;
            };

            this.step = function() {

            };

            this.extend = function(grid, direction) {

            };

            function _calc(x, y, z) {

                var fNX = x / _opt.circle;
                var fNY = y / _opt.circle;
                var fRdx = fNX * 2 * Math.PI;
                var fRdy = fNY * 2 * Math.PI;
                var a = _opt.rads * Math.sin(fRdx);
                var b = _opt.rads * Math.cos(fRdx);
                var c = _opt.rads * Math.sin(fRdy);
                var d = _opt.rads * Math.cos(fRdy);
                var v = _opt.noise(123 + a * _opt.scale, 231 + b * _opt.scale, 312 + c * _opt.scale, 273 + d * _opt.scale);
                return opt.decorator(v);
            }
        };

        TwoDeeNoiseGrid.prototype = Object.create(NoiseGrid.prototype);
        TwoDeeNoiseGrid.prototype.constructor = TwoDeeNoiseGrid;
        ThreeDeeNoiseGrid.prototype = Object.create(NoiseGrid.prototype);
        ThreeDeeNoiseGrid.prototype.constructor = ThreeDeeNoiseGrid;
        SphereNoiseGrid.prototype = Object.create(NoiseGrid.prototype);
        SphereNoiseGrid.prototype.constructor = SphereNoiseGrid;
        TileableNoiseGrid.prototype = Object.create(NoiseGrid.prototype);
        TileableNoiseGrid.prototype.constructor = TileableNoiseGrid;

        function _set(_opt, opt) {
            var o = _clone(_opt);
            o.scale = opt.scale;
            o.repeats = opt.repeats;
            o.decorator = opt.decorator;
            o.top = opt.top;
            o.bottom = opt.bottom;
            o.left = opt.left;
            o.right = opt.right;
            _opt = _verify(o);
        }

        function _verify(opt) {
            if (_undef(opt.noise)) {
                throw "Specify a noise function";
            }

            opt.h = opt.size || opt.h || 10;
            opt.w = opt.size || opt.w || 10;
            opt.z = opt.size || opt.z || 10;
            opt.repeats = opt.repeats || 1;
            opt.circle = opt.h / opt.repeats;
            opt.rads = opt.circle;
            opt.speed = opt.speed || 5;
            opt.decorator = opt.decorator || function(n) {
                return n;
            };
            opt.top = 0;
            opt.right = 0;
            opt.bottom = 0;
            opt.left = 0;
            return opt;

        }

        function _undef(v) {
            return typeof v === 'undefined';
        }

        function _clone(obj) {
            if (obj === null || typeof(obj) !== 'object')
                return obj;

            var temp = obj.constructor(); // changed

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    temp[key] = _clone(obj[key]);
                }
            }
            return temp;
        }

        function Factory(opt) {
            if (_undef(opt) && _undef(opt.type)) {
                throw "Please specifcy the type of noisy grid"
            }

            opt = _verify(opt);
            var type = opt.type;
            delete opt.type;

            switch (type) {
                case Factory.twoDee:
                    return new TwoDeeNoiseGrid(opt);
                case Factory.threeDee:
                    return new ThreeDeeNoiseGrid(opt);
                case Factory.sphere:
                    return new SphereNoiseGrid(opt);
                case Factory.tileable:
                    return new TileableNoiseGrid(opt);
                default:
                    return new ThreeDeeNoiseGrid(opt);
            }
        }

        Factory.twoDee = 1;
        Factory.threeDee = 2;
        Factory.sphere = 3;
        Factory.tileable = 4;

        return Factory;

    })();
});