/**
 * Заливает область сплошным цветом, кое-где оставляя дырки
 */
import {Color} from '../lib/color';
import {rand} from '../lib/utils';

function pickColor(canvas, state) {
	var [r, g, b, total] = [0, 0, 0, 0];
	var im = canvas.getImageData(state.x, state.y, state.width, state.height);
	var data = im.data;
	for (let i = 0, il = data.length; i < il; i++) {
		if (data[i + 3] < 60) {
			continue;
		}

		r += data[i];
		g += data[i + 1];
		b += data[i + 2];
		total++;
	}

	return new Color((r / total)|0, (g / total)|0, (b / total)|0);
}

export default function effect(canvas, state) {
	if (!state.solidColor) {
		state.solidColor = pickColor(canvas, state);
	}

	canvas.fillStyle = state.solidColor.toCSS();
	canvas.fillRect(state.x, state.y, state.width, state.height);

	var holes = rand(2, 8)|0;
	var size = rand(state.height / 2, state.height)|0;
	while (holes--) {
		canvas.clearRect(rand(0, state.width)|0, state.y + rand(0, state.height)|0, (rand(0.5, 3) * size)|0, (rand(0.5, 1) * size)|0);
	}
};

effect.config = {
	amount: 50,
	height: {min: 4, max: 8},
	ttl: 300
};