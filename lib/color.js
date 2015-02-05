var reRGBA = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\.\d]+)\s*)?\)/;
var reHexColor = /^#([a-f0-9]+)/i;
var maxColor = (255 << 16) + (255 << 8) + 255;

function clamp(v, max, min) {
	return Math.min(Math.max(v, min || 0), max); 
}

function normalizeHex(str) {
	str = str.replace(/^#/, '');
	if (str.length === 3) {
		str = str[0] + str[0]
			+ str[1] + str[1]
			+ str[2] + str[2];
	}

	return str;
}

function cssHex(value) {
	value = clamp(value|0, 255);
	return (value < 16 ? '0' : '') + value.toString(16);
}

function fromDecimal(color) {
	color = clamp(color, maxColor);
	return [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff, 1];
}

var blendModes = {
	multiply(a, b) {
		return (a * b) / 255;
	},

	screen(a, b) {
		return 255 - (((255 - a) * (255 - b)) >> 8);
	},

	overlay(a, b) {
		return b < 128
			? (2 * a * b / 255)
			: (255 - 2 * (255 - a) * (255 - b) / 255);
	},

	darken(a, b) {
		return (b > a) ? a : b;
	},

	lighten(a, b) {
		return (b > a) ? b : a;
	},

	colorDodge(a, b) {
		return b == 255 ? b : Math.min(255, ((a << 8 ) / (255 - b)));
	},

	colorBurn(a, b) {
		return b == 0 ? b : Math.max(0, (255 - ((255 - a) << 8 ) / b));
	},

	hardLight(a, b) {
		return blendModes.overlay(b, a);
	},

	softLight(a, b) {
		return b < 128
			? (2 * ((a >> 1) + 64)) * (b / 255)
			: 255 - (2 * (255 - (( a >> 1) + 64)) * (255 - b) / 255);
	},

	difference(a, b) {
		return Math.abs(a - b);
	},

	exclusion(a, b) {
		return a + b - 2 * a * b / 255;
	}
};

export class Color {
	constructor(r = 0, g = 0, b = 0, a = 1) {
		if (!(this instanceof Color)) {
			return new Color(r, g, b, a);
		}

		if (typeof r === 'string') {
			let m;
			if (r === 'transparent') {
				[r, g, b, a] = [0, 0, 0, 0];
			} else if (m = r.match(reRGBA)) {
				[r, g, b, a] = m;
			} else if (m = r.match(reHexColor)) {
				[r, g, b, a] = fromDecimal(parseInt(normalizeHex(m[1]), 16));
			}
		} else if (Array.isArray(r)) {
			[r, g, b, a] = r;
		}

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a != null ? a : 1;
	}

	static blend(c1, c2, mode) {
		if (typeof mode !== 'function') {
			if (!(mode in blendModes)) {
				throw new Error('Unknown blending mode: ' + mode);
			}
			mode = blendModes[mode];
		}

		return new Color(['r', 'g', 'b'].map(comp => mode(c1[comp], c2[comp])).concat(c1.a));
	}

	blendWith(color, mode) {
		return Color.blend(this, color, mode);
	}

	toArray(includeAlpha) {
		var arr = [this.r, this.g, this.b];
		if (includeAlpha) {
			arr.push(this.a);
		}

		return arr;
	}

	toHex() {
		return '#' + this.toArray().map(cssHex).join('');
	}

	toCSS() {
		if (this.a === 0) {
			return 'transparent';
		}

		if (this.a < 1) {
			var color = this.toArray().map(c => clamp(c|0, 255));
			color.push(clamp(this.a, 1));
			return 'rgba(' + color.join(', ') + ')';
		}

		return this.toHex();
	}

	toString() {
		return this.toCSS();
	}
}