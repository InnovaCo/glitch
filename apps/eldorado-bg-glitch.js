import glitch from '../index';
import {Color} from '../lib/color';

var widgetState = {
	container: null,
	anim: null,
	show() {
		var anim = widgetState.anim;
		if (anim && !anim.stopped) {
			anim.start();
			anim.image = anim.allImages[glitch.utils.randi(0, anim.allImages.length)];
			anim.canvas.style.opacity = 1;
			setTimeout(widgetState.hide, glitch.utils.randi(700, 1000));
		}
	},
	hide() {
		var anim = widgetState.anim;
		if (anim && !anim.stopped) {
			anim.canvas.style.opacity = 0;
			setTimeout(widgetState.show, glitch.utils.randi(100, 3000));
		}
	}
};

function toArray(obj, ix) {
	return Array.prototype.slice.call(obj, ix || 0);
}

function effect(img, fn, params) {
	return {
		fn: fn,
		state: glitch.config.create(img, glitch.config.randomize(fn.config), params)
	};
}

function generate(img) {
	glitch.utils.seed(Math.random());
	var fx = [
		effect(img, glitch.effects.saturation, {
			y: 0,
			height: img.height,
			minSkipFrame: 6,
			maxSkipFrame: 10,
			baseValue: 0.7
		}),
		effect(img, glitch.effects.offsetY, {
			y: 0,
			minSkipFrame: 40,
			maxSkipFrame: 80,
			baseValue: 0.06,
			ttl: 40,
			height: img.height,
			_startTime: 0,
			reset: function(time) {
				this._startTime = time;
				this.ttl = glitch.utils.rand(20, 120);
			},
			update: function(time) {
				if (time > this._startTime + this.ttl) {
					return false;
				}

				// this.value = rand(-this.baseValue, this.baseValue);
				this.value = this.baseValue * glitch.utils.perlin(this._startTime / 100, time / 100);
				return true;
			}
		})
	];

	var num = glitch.utils.randi(8, 16);
	while (num--) {
		fx.push(effect(img, glitch.effects.solidColor, {
			minSkipFrame: 4,
			maxSkipFrame: 9,
			solidColor: new Color(0, 0, 0, glitch.utils.rand(0, 0.2))
		}));
	}

	num = glitch.utils.randi(4, 10);
	while (num--) {
		fx.push(effect(img, glitch.effects.offsetX, {
			minSkipFrame: 300,
			maxSkipFrame: 660,
			baseValue: 0.3,
			height: 80,
			ttl: 40,
			_startTime: 0,
			_curValue: 0,
			reset: function(time) {
				let h = glitch.utils.rand(10, 100);
				this._startTime = time;
				this.ttl = glitch.utils.rand(80, 320);
				this.height = h;
				this.y = glitch.utils.rand(0, this.imageHeight - h);
				this._curValue = this.baseValue * glitch.utils.perlin(this._startTime / 100, time / 100);
			},
			update: function(time) {
				if (time > this._startTime + this.ttl) {
					return false;
				}

				this.value = this._curValue;
				return true;
			}
		}));
	}

	return fx;
}

export default function main(imageSrc, callback) {
	return glitch(imageSrc, {generate}, callback);
};

export function init(container) {
	widgetState.container = container;
}

export function turnOn() {
	var container = widgetState.container || document.body;
	var images = toArray(container.querySelectorAll('.glitch-images img')).map(img => img.src);

	return main(images, function(anim) {
		widgetState.anim = anim;
		widgetState.hide();
		anim.canvas.className = 'glitch';
		container.appendChild(anim.canvas);
	});
}

export function turnOff() {
	widgetState.anim && widgetState.anim.stop();
}
