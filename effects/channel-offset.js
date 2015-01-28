/**
 * Смещает цветовые каналы относительно друг друга
 */
export default function effect(canvas, state) {
	var maxOffset = 10;
	var [ro, go, bo] = [-state.value * maxOffset | 0, 0 , state.value * maxOffset | 0];
	var im = canvas.getImageData(state.x, state.y, state.width, state.height);
	var data = im.data;
	var rowSize = state.width * 4;

	var draw = (row, col, i, offset) => {
		if (col >= 0 && col < state.width) {
			let ix = row * rowSize + col * 4;
			data[ix + offset] = data[i + offset];
			data[ix + 3] = Math.max(data[ix + 3], data[i + 3]);
		}
	};

	var offsetChannel = (channel, offset, i) => {
		let row = i / rowSize | 0;
		let col = (i - row * rowSize) / 4;
		draw(row, offset + col, i, channel);
	};
	
	for (let i = 0, il = data.length; i < il; i += 4) {
		offsetChannel(0, ro, i);
	}

	for (let i = data.length - 4; i >= 0; i -= 4) {
		offsetChannel(2, bo, i);
	}

	canvas.putImageData(im, state.x, state.y);
};

effect.config = {
	amount: 50,
	height: {min: 3, max: 10},
	ttl: 1000
};