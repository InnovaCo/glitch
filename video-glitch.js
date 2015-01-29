import {rand, createCanvas, perlin, seed} from './lib/utils';
import config from './lib/config';
import renderer from './lib/renderer';
import {Color} from './lib/color';

import saturation from './effects/saturation';
import solidColor from './effects/solid-color';
import channelOffset from './effects/channel-offset';
import {offsetX, offsetY} from './effects/offset';

function effect(img, fn, params) {
	return {
		fn: fn,
		state: config.create(img, config.randomize(fn.config), params)
	};
}


function generateEffects(img) {
	seed(Math.random());
	var fx = [
		effect(img, saturation, {
			y: 0,
			height: img.height,
			minSkipFrame: 2,
			maxSkipFrame: 7,
			baseValue: 0.3
		}),
		effect(img, offsetY, {
			y: 0,
			minSkipFrame: 20,
			maxSkipFrame: 40,
			baseValue: 0.06,
			ttl: 40,
			height: img.height,
			_startTime: 0,
			reset: function(time) {
				// seed(Math.random());
				this._startTime = time;
				this.ttl = rand(20, 120);
			},
			update: function(time) {
				if (time > this._startTime + this.ttl) {
					return false;
				}

				// this.value = rand(-this.baseValue, this.baseValue);
				this.value = this.baseValue * perlin(this._startTime / 100, time / 100);
				return true;
			}
		})
	];

	var num = rand(3, 7) | 0;
	while (num--) {
		fx.push(effect(img, channelOffset, {
			minSkipFrame: 5,
			maxSkipFrame: 9
		}));
	}

	num = rand(3, 7) | 0;
	while (num--) {
		fx.push(effect(img, solidColor, {
			minSkipFrame: 4,
			maxSkipFrame: 9,
			solidColor: new Color(0, 0, 0, rand(0, 0.2))
		}));
	}

	fx.push(effect(img, offsetX, {
		minSkipFrame: 80,
		maxSkipFrame: 160,
		baseValue: 0.5,
		height: 80,
		ttl: 40,
		_startTime: 0,
		reset: function(time) {
			let h = rand(40, 60);
			this._startTime = time;
			this.ttl = rand(80, 120);
			this.height = h;
			this.y = rand(0, this.imageHeight - h);
		},
		update: function(time) {
			if (time > this._startTime + this.ttl) {
				return false;
			}

			this.value = this.baseValue * perlin(this._startTime / 100, time / 100);
			return true;
		}
	}))

	return fx;
}

export default function(image) {
	var cv = createCanvas();
	var img = new Image();
	img.onload = () => {
		cv.width = img.width;
		cv.height = img.height;
		var fx = generateEffects(img);

		var anim = renderer.animate(cv.getContext('2d'), img, fx);
		document.addEventListener('click', function(evt) {
			anim.toggle();
		}, false);
	};
	img.src = image;
	return cv;
};