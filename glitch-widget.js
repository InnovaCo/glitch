import glitch from './video-glitch';

var animContainer, anim;

function toArray(obj, ix) {
	return Array.prototype.slice.call(obj, ix || 0);
}

function rand(n1, n2) {
	return (Math.random() * (n2 - n1) + n1) | 0;
}

function show() {
	anim.start();
	anim.image = anim.allImages[rand(0, anim.allImages.length)];
	anim.canvas.style.opacity = 1;
	if (anim && !anim.stopped) {
		setTimeout(hide, rand(700, 1000));
	}
}

function hide() {
	anim.canvas.style.opacity = 0;
	if (anim && !anim.stopped) {
		setTimeout(show, rand(100, 3000));
	}
}

export function init(container) {
	animContainer = container;
}

export function turnOn() {
	var container = animContainer || document.body;
	var images = toArray(container.querySelectorAll('.glitch-images img')).map(img => img.src);

	return glitch(images, function(a) {
		console.log('got anim', a);
		anim = a;
		hide();
		anim.canvas.className = 'glitch';
		container.appendChild(anim.canvas);
	});
}

export function turnOff() {
	anim && anim.stop();
}
