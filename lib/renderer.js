/**
 * Модуль для отрисовки и анимации указанные спецэффектов
 * на канвасе
 */
import {rand, perlin} from './utils';

function mainLoop(ctx, image, effects, state) {
	var time = Date.now() - state.startTime;
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.drawImage(image, 0, 0);
	effects = effects.filter(obj => {
		// debugger;
		render(ctx, obj.fn, obj.state, time);
		return !!obj.state.baseValue;
	});

	if (effects.length && !state.stopped) {
		requestAnimationFrame(() => mainLoop(ctx, image, effects, state));
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

export function animate(ctx, image, effects, startTime = Date.now()) {
	var state = {
		startTime: null,
		stopped: true,
		stop: function() {
			this.stopped = true;
			return this;
		},
		start: function() {
			if (this.stopped) {
				this.stopped = false;
				this.startTime = Date.now(),
				mainLoop(ctx, image, effects, this);
			}
			return this;
		},
		toggle: function() {
			return this.stopped ? this.start() : this.stop();
		}
	};
	return state.start();
}