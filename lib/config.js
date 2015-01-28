/**
 * Нормализация и рандомизация конфига эффекта
 */
import {rand} from '../lib/utils';

export function normalize(config, base = {}) {
	var out = {};
	Object.keys(config).forEach(key => out[key] = normalizeValue(config[key], base[key]));
	return out;
}

export function randomize(config) {
	var out = {};
	Object.keys(config).forEach(key => out[key] = rand(config[key].min, config[key].max) | 0);
	return out;
}

function normalizeValue(value, base) {
	var [min, max] = [1, value];
	if (typeof value === 'object' && 'min' in value && 'max' in value) {
		{min, max} = value;
	}

	return {
		min: primitive(min, base),
		max: primitive(max, base)
	};
}

function primitive(value, base = 0) {
	if (typeof value === 'string' && /^\-?\d+(?:\.\d+)?%$/.test(value)) {
		return base  * parseFloat(value) / 100;
	}
	return value;
}