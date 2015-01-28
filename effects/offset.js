/**
 * Смещает изображение в указанном направлении, 
 * при этом выходящие за пределы изображения фрагменты
 * рисует на противоположной стороне
 */

import {createCanvas} from '../lib/utils';

function tile(x, y, width, height) {
	return {x, y, width, height};
}

export function offset(ctx, xOffset, yOffset, state) {
	var {x, y, width, height} = state;

	if (!state.buffer) {
		state.buffer = createCanvas(width, height);
	}

	xOffset = ((1 + xOffset) * width % width)|0;
	yOffset = ((1 + yOffset) * height % height)|0;

	state.buffer.width = width;
	state.buffer.height = height;
	state.buffer.getContext('2d').drawImage(ctx.canvas, x, y, width, height, 0, 0, width, height);

	var draw = (tile, x, y) => {
		if (tile.width && tile.height) {
		 	ctx.drawImage(state.buffer, 
		 		tile.x, tile.y, tile.width, tile.height,
		 		x, y, tile.width, tile.height);
		}
	};

	var t = tile(Math.min(xOffset, 0), Math.min(yOffset, 0), (width - xOffset) % width, (height - yOffset) % height);
	// переставляем тайлы в том порядке, в котором они должны быть отрисованы
	var tiles = [
		tile(t.width, t.height, width - t.width, height - t.height), 
		tile(t.x, t.height, t.width, height - t.height),
		tile(t.width, t.y, width - t.width, t.height), 
		t
	];

	ctx.translate(x, y);
	ctx.clearRect(0, 0, width, height);
	draw(tiles[0], 0, 0);
	draw(tiles[1], tiles[0].width, 0);
	draw(tiles[2], 0, tiles[0].height);
	draw(tiles[3], tiles[0].width, tiles[0].height);
}

export function offsetX(canvas, state) {
	offset(canvas, state.value, 0, state);
}

export function offsetY(canvas, state) {
	offset(canvas, 0, state.value, state);
}

export function offsetXY(canvas, state) {
	offset(canvas, state.value, state.value, state);
}

offset.config = offsetX.config = offsetY.config = offsetXY.config = {
	amount: 3,
	height: '40%',
	ttl: 500
};