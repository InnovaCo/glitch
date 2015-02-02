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
			minSkipFrame: 6,
			maxSkipFrame: 10,
			baseValue: 0.7
		}),
		effect(img, offsetY, {
			y: 0,
			minSkipFrame: 40,
			maxSkipFrame: 80,
			baseValue: 0.06,
			ttl: 40,
			height: img.height,
			_startTime: 0,
			reset: function(time) {
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

	var num = rand(8, 16) | 0;
	// while (num--) {
	// 	fx.push(effect(img, channelOffset, {
	// 		minSkipFrame: 5,
	// 		maxSkipFrame: 9
	// 	}));
	// }

	num = rand(8, 16) | 0;
	while (num--) {
		fx.push(effect(img, solidColor, {
			minSkipFrame: 4,
			maxSkipFrame: 9,
			solidColor: new Color(0, 0, 0, rand(0, 0.2))
		}));
	}

	num = rand(4, 10) | 0;
	while (num--) {
		fx.push(effect(img, offsetX, {
			minSkipFrame: 300,
			maxSkipFrame: 660,
			baseValue: 0.3,
			height: 80,
			ttl: 40,
			_startTime: 0,
			_curValue: 0,
			reset: function(time) {
				let h = rand(10, 100);
				this._startTime = time;
				this.ttl = rand(80, 320);
				this.height = h;
				this.y = rand(0, this.imageHeight - h);
				this._curValue = this.baseValue * perlin(this._startTime / 100, time / 100);
			},
			update: function(time) {
				if (time > this._startTime + this.ttl) {
					return false;
				}

				// this.value = this.baseValue * perlin(this._startTime / 100, time / 100);
				this.value = this._curValue;
				return true;
			}
		}));
	}

	return fx;
}

function preloadImages(images, callback) {
	if (!Array.isArray(images)) {
		images = [images];
	}

	var loaded = 0, expected = images.length;
	var onload = () => {
		if (++loaded >= expected) callback(images)
	};

	images = images.map(src => {
		let img = new Image();
		img.onload = img.onerror = onload;
		img.src = src;
		return img;
	});
}

export default function(imageSrc, callback) {
	var cv = createCanvas();
	preloadImages(imageSrc, (images) => {
		var img = images[0];
		cv.width = img.width;
		cv.height = img.height;
		var fx = generateEffects(img);

		var anim = renderer.animate(cv, img, generateEffects(img));
		anim.allImages = images;
		callback && callback(anim);
	});
	return cv;
};