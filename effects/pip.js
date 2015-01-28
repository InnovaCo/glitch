/**
 * Рисует уменьшенный оригинал в заданной области
 */
export default function effect(canvas, state) {
	var {x, y, width, height} = state;
	var sw = state.imageWidth;
	var sh = state.imageHeight;

	canvas.clearRect(x, y, width, height);
	canvas.drawImage(state.image, 0, 0, sw, sh, x, y, width, height);
}

effect.config = {
	amount: 1,
	height: {min: '30%', max: '50%'},
	ttl: 200
};