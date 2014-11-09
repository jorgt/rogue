define(["helpers/log"], function(
	log) {

	'use strict';

	function Txt(scr, assets, down, side) {
		var _txt = {};
		var _d = down || 1;
		var _s = side || 12;

		var _cd = 0;
		var _cs = 0;

		this.set = function(txt, value, x, y) {
			_cd = x;
			txt = _clean(txt);
			var t;
			if (typeof _txt[txt] === 'undefined') {
				t = assets.text(value, x, y);
				t.id = t.dataset.name + '-' + txt
				scr.add(t);
				_txt[txt] = t;
			} else {
				t = _txt[txt]
			}

			t.setText(value);
			return this;
		}

		this.next = function(txt, value) {
			this.set(txt, value, _cd, _s);
			return this;
		}
		this.down = function(txt, value, y) {
			_cd += _d;
			this.set(txt, value, _cd, y);
			return this;
		}

	}

	function _clean(txt) {
		return txt.replace(/[^a-zA-Z0-9-]/g, '');
	}

	return Txt;

});