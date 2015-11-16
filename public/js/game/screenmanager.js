define(['settings'], function(settings) {
	'use strict';

	var screens = {},
		h = window.innerHeight,
		w = window.innerWidth,
		mainW = settings.screen.width,
		mainH = settings.screen.height,
		pix = settings.screen.block;

	//implement the main divs if not existing upon first 
	//calling the Screen Manager
	if (!document.getElementById('game')) {
		var div = document.createElement('div');
		div.style.width = mainW + 'px';
		div.style.height = mainH + 'px';
		div.id = 'main';
		var game = document.createElement('div');
		game.id = 'game';
		canvas.style.cssText = "position:absolute;left:" + ((w - mainW) / 2) + "px;top:" + ((h - mainH) / 2) + "px;"
		div.appendChild(game);
		document.body.appendChild(div);
	}

	function Factory(name, height, width) {
		if (!screens[name]) screens[name] = new Screen(name, height, width);

		return screens[name];
	}

	function Screen(name, height, width) {
		canvas = document.createElement('canvas');
		canvas.id = 'game-screen-' + name;
		canvas.height = hh;
		canvas.width = ww;
		canvas.style.cssText = "display:block;position:absolute;left:" + ((w - ww) / 2) + "px;top:" + ((h - hh) / 2) + "px;"
		document.getElementById('game').appendChild(canvas)

		var context = canvas.getContext("2d");
		context.font = "bold " + pix + "px monospace";

		this.canvas = canvas;
		this.context = context;
		this.height = height;
		this.width = width;
	}

	Screen.prototype = {
		show: function() {
			this.canvas.style.display = "none";
		}
		hide: function() {
			this.canvas.style.display = "block";
		}
	}
});