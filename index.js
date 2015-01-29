import {rand, createCanvas} from './lib/utils';
import config from './lib/config';
import renderer from './lib/renderer';

import saturation from './effects/saturation';
import solidColor from './effects/solid-color';
import pip from './effects/pip';
import channelOffset from './effects/channel-offset';
import {offsetX, offsetY, offsetXY} from './effects/offset';

var effects = {saturation, solidColor, pip, offsetX, offsetY, offsetXY, channelOffset};

function generateEffects(img, maxEffects, available = Object.keys(effects)) {
	var effectConfigs = available.map(name => config.normalize(effects[name].config, img));
	var curEffects = [];
	var effectsLookup = {};
	var loopProtect = 10000;

	while (maxEffects && loopProtect--) {
		let fx = rand(0, available.length) | 0;
		let fxName = available[fx];
		let fxConfig = effectConfigs[fx];

		if (!(fxName in effectsLookup)) {
			effectsLookup[fxName] = 0;
		}

		if ((effectsLookup[fxName] || 0) >= fxConfig.amount) {
			continue;
		}

		effectsLookup[fxName]++;
		maxEffects--;
		curEffects.push({
			name: fxName,
			fn: effects[fxName],
			state: config.create(img, config.randomize(fxConfig))
		});
	}

	return curEffects;
}

export default function(image, amount = 10, available = Object.keys(effects)) {
	var cv = createCanvas(100, 100);
	var img = new Image();
	img.onload = () => {
		cv.width = img.width;
		cv.height = img.height;
		var fx = generateEffects(img, amount, available);

		renderer.animate(cv.getContext('2d'), img, fx);
	};
	img.src = image;
	return cv;
};