import {rand, extend, createCanvas} from './lib/utils';
import config from './lib/config';

import saturation from './effects/saturation';
import solidColor from './effects/solid-color';
import pip from './effects/pip';
import channelOffset from './effects/channel-offset';
import {offsetX, offsetY, offsetXY} from './effects/offset';

var effects = {saturation, solidColor, pip, offsetX, offsetY, offsetXY, channelOffset};

function draw(target, effect, state) {
	target.clearRect(0, 0, state.imageWidth, state.imageHeight);
	target.drawImage(state.image, 0, 0);

	target.save();
	effect(target, state);
	target.restore();
}

function createState(image, params = {}) {
	var fxHeight = params.height || 1;
	return extend({
		image: image,
		imageWidth: image.width, 
		imageHeight: image.height,
		width: image.width,
		value: 0,
		baseValue: rand(0.5, 1),
		decay: rand(0.05, 0.1),
		delay: 0,
		x: 0,
		y: 0,
		yOrigin: rand(0, image.height - fxHeight) | 0,
		yDelta: rand(0, image.height / 2),
		minSkipFrame: 2,
		maxSkipFrame: 10,
		skipFrame: 0
	}, params);
}

function animate(ctx, image, effects, startTime = Date.now()) {
	var now = Date.now();
	var timeDelta = now - startTime;
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.drawImage(image, 0, 0);
	var didDraw = false;
	effects.forEach(obj => {
		// debugger;
		let {state} = obj;

		if (state.delay > timeDelta || !state.baseValue) {
			return;
		}

		didDraw = true;
		ctx.save();
		if (--state.skipFrame <= 0) {
			state.baseValue = Math.max(state.baseValue - state.decay, 0);
			state.value = rand(-state.baseValue, state.baseValue);
			state.y = Math.max(Math.min(state.yOrigin + rand(-state.yDelta, state.yDelta), state.imageHeight - state.height), 0) | 0;
			state.skipFrame = rand(state.minSkipFrame, state.maxSkipFrame) | 0
		}
		obj.fn(ctx, state);
		ctx.restore();
	});

	if (didDraw) {
		requestAnimationFrame(() => animate(ctx, image, effects, startTime));
	}
}

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
			state: createState(img, config.randomize(fxConfig))
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

		animate(cv.getContext('2d'), img, fx);
	};
	img.src = image;
	return cv;
};