import {rand, extend, createCanvas} from './lib/utils';
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
	return extend({
		image: image,
		imageWidth: image.width, 
		imageHeight: image.height,
		value: 0
	}, params);
}

function setup(img, effect, ctx) {
	var target = createCanvas(img.width, img.height);
	var targetCtx = target.getContext('2d');

	var state = createState(img, {
		value: 0.2,
		x: 0,
		y: 30,
		width: img.width,
		height: 6
	});

	var active = false;
	if (ctx) {
		ctx.querySelector('.original').appendChild(img);
		ctx.querySelector('.effect').appendChild(target);
	}

	document.addEventListener('click', (evt) => active = false);

	var mainLoop = () => {
		state.value = (state.value - 0.01) % 1;
		draw(targetCtx, effects[effect], state);
		active && requestAnimationFrame(mainLoop);
	};

	mainLoop();
}

export default function(image, effect, ctx) {
	var img = new Image();
	img.onload = () => setup(img, effect, ctx);
	img.src = image;
};