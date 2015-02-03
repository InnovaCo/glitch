import * as utils from './lib/utils';
import config from './lib/config';
import renderer from './lib/renderer';

import saturation from './effects/saturation';
import solidColor from './effects/solid-color';
import pip from './effects/pip';
import channelOffset from './effects/channel-offset';
import {offsetX, offsetY, offsetXY} from './effects/offset';

export var effects = {saturation, solidColor, pip, offsetX, offsetY, offsetXY, channelOffset};

export function preloadImages(images, callback) {
	if (!Array.isArray(images)) {
		images = [images];
	}

	var loaded = 0, expected = images.length;
	var onload = () => {
		if (++loaded >= expected) callback(images);
	};

	images = images.map(src => {
		let img = new Image();
		img.onload = img.onerror = onload;
		img.src = src;
		return img;
	});
}

export function generate(img, amount = 10, available = Object.keys(effects)) {
	var effectConfigs = available.map(name => config.normalize(effects[name].config, img));
	var curEffects = [];
	var effectsLookup = {};
	var loopProtect = 10000;

	while (amount && loopProtect--) {
		let fx = utils.rand(0, available.length) | 0;
		let fxName = available[fx];
		let fxConfig = effectConfigs[fx];

		if (!(fxName in effectsLookup)) {
			effectsLookup[fxName] = 0;
		}

		if ((effectsLookup[fxName] || 0) >= fxConfig.amount) {
			continue;
		}

		effectsLookup[fxName]++;
		amount--;
		curEffects.push({
			name: fxName,
			fn: effects[fxName],
			state: config.create(img, config.randomize(fxConfig))
		});
	}

	return curEffects;
}

export default function main(imageSrc, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = null;
	}

	options = options || {};

	var cv = utils.createCanvas();
	preloadImages(imageSrc, (images) => {
		var img = images[0];
		cv.width = img.width;
		cv.height = img.height;

		var genfx = options.generate || generate;
		var anim = renderer.animate(cv, img, genfx(img, options.amount, options.effects));
		anim.allImages = images;
		callback && callback(anim);
	});
	return cv;
};

main.utils = utils;
main.config = config;
main.renderer = renderer;