/**
 * Меняет яркость указанного фрагмента
 */

import {Color} from '../lib/color';

var light = new Color('#fff');
var dark  = new Color('#000');
var nativeBlending = null;

function supportsNativeBlending(ctx) {
	if (nativeBlending === null) {
		// проверим, поддерживается ли нативное смешение цветов
		var oldOp = ctx.globalCompositeOperation;
		ctx.globalCompositeOperation = 'screen';
		nativeBlending = ctx.globalCompositeOperation === 'screen';
		ctx.globalCompositeOperation = oldOp;
	}

	return nativeBlending;
}

/**
 * @param {CanvasRenderingContext2D} canvas Канвас, в который рисуем результат
 * @param {Object} state Текущее состояние эффекта, сохраняется между отрисовками
 */
export default function effect(canvas, state) {
	var color = (state.value < 0) ? dark : light;
	var mode = 'overlay';

	if (!state.buffer) {
		let c = document.createElement('canvas');
		c.width = state.imageWidth;
		c.height = state.imageHeight;
		state.buffer = c.getContext('2d');
	}
	
	if (supportsNativeBlending(canvas)) {
		let {x, y, width, height} = state;

		// сохраним в буффер текущий фрагмент, 
		// чтобы использовать его в качестве маски
		state.buffer.clearRect(0, 0, width, height);
		state.buffer.drawImage(canvas.canvas, 0, 0);

		canvas.globalCompositeOperation = mode;
		canvas.globalAlpha = Math.abs(state.value);
		canvas.fillStyle = color.toCSS();
		canvas.fillRect(x, y, width, height);

		// Заново отрисуем оригинал, чтобы отсечь лишнее
		canvas.globalAlpha = 1;
		canvas.globalCompositeOperation = 'destination-in';
		canvas.drawImage(state.buffer.canvas, 0, 0);
	} else {
		console.log('XXX Not implemented');
	}
}

effect.config = {
	amount: 5,
	height: {min: 3, max: 15},
	ttl: 500
};