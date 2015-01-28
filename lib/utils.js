export function rand(n1, n2) {
	return Math.random() * (n2 - n1) + n1;
}

export function extend(obj, ...ext) {
	ext.forEach(o => o && Object.keys(o).forEach(k => obj[k] = o[k]));
	return obj;
}

export function createCanvas(width, height) {
	var elem = document.createElement('canvas');
	elem.width = width;
	elem.height = height;
	return elem;
}