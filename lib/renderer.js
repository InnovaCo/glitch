/**
 * Модуль для отрисовки и анимации указанные спецэффектов
 * на канвасе
 */
import {rand, perlin} from './utils';

function mainLoop(obj, effects) {
	var time = Date.now() - obj.startTime;
	var ctx = obj.canvas.getContext('2d');
	ctx.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
	ctx.drawImage(obj.image, 0, 0);
	effects = effects.filter(fx => {
		// debugger;
		render(ctx, fx.fn, fx.state, time);
		return !!fx.state.baseValue;
	});

	if (effects.length && !obj.stopped) {
		requestAnimationFrame(() => mainLoop(obj, effects));
	} else if (typeof obj.complete === 'function') {
		obj.complete();
	}
}

export function render(ctx, effect, state, time) {
	if (state.delay > time || !state.baseValue) {
		return false;
	}

	var [px, py] = [0, time / 100];

	ctx.save();
	if (--state.skipFrame <= 0) {
		state.value = rand(-state.baseValue, state.baseValue);
		state.y = Math.max(Math.min(state.yOrigin + perlin(px, py) * state.yDelta, state.imageHeight - state.height), 0) | 0;
		state.skipFrame = rand(state.minSkipFrame, state.maxSkipFrame) | 0
		state.baseValue = Math.max(state.baseValue - state.decay, 0);
		state.reset && state.reset(time);
	}

	if (!state.update || state.update(time)) {
		// Если есть функция update — проверим, что она вернёт.
		// Если false — то эффект рисовать не надо
		effect(ctx, state, time);
	}
	ctx.restore();
	return true;
}

export function animate(canvas, image, effects, startTime = Date.now()) {
	var state = {
		startTime: null,
		stopped: true,
		canvas: canvas,
		image: image,
		stop: function() {
			this.stopped = true;
			return this;
		},
		start: function() {
			if (this.stopped) {
				this.stopped = false;
				this.startTime = Date.now(),
				mainLoop(this, effects);
			}
			return this;
		},
		toggle: function() {
			return this.stopped ? this.start() : this.stop();
		}
	};
	return state.start();
}