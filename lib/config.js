/**
 * Нормализация и рандомизация конфига эффекта
 */
import {rand, extend} from '../lib/utils';

var skipKeys = ['amount'];
var floatKeys = ['baseValue', 'decay']

export function normalize(config, base = {}) {
	var out = {};
	Object.keys(config).forEach(key => {
		if (!~skipKeys.indexOf(key)) {
			out[key] = normalizeValue(config[key], base[key])
		} else {
			out[key] = config[key];
		}
	});
	return out;
}

export function randomize(config) {
	var out = {};
	config = normalize(config);
	Object.keys(config).forEach(key => {
		if (!~skipKeys.indexOf(key)) {
			out[key] = rand(config[key].min, config[key].max);
			if (!~floatKeys.indexOf(key)) {
				out[key] |= 0;
			}
		}
	});
	return out;
}

export function create(image, ...params) {
	var fxHeight = params.height || 1;
	return extend({
		image: image,
		imageWidth: image.width, 
		imageHeight: image.height,
		width: image.width,
		value: 0,
		baseValue: rand(0.5, 1),
		decay: 0,
		delay: 0,
		x: 0,
		y: 0,
		yOrigin: rand(0, image.height - fxHeight) | 0,
		yDelta: rand(0, image.height / 2),
		minSkipFrame: 2,
		maxSkipFrame: 10,
		skipFrame: 0
	}, ...params);
}

function normalizeValue(value, base) {
	var [min, max] = [1, value];
	if (typeof value === 'object' && 'min' in value && 'max' in value) {
		min = value.min;
		max = value.max;
	}

	return {
		min: primitive(min, base),
		max: primitive(max, base)
	};
}

function primitive(value, base = 1) {
	if (typeof value === 'string' && /^\-?\d+(?:\.\d+)?%$/.test(value)) {
		return base * parseFloat(value) / 100;
	}
	return value;
}