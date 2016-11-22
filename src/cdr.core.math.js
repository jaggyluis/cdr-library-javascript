cdr.core.math = {
	round : function (num, mod) {
		return Math.round(num/mod)*mod;
	},
	floor : function (num, mod) {
		return Math.floor(num/mod)*mod;
	},
	remap : function (num, fIval, tIval, bounded) {
		bounded = bounded || false;
		if (fIval.getLength() === 0) {
			return fIval.min;
		} else {
			var ret = (((num - fIval.min) * tIval.getRange()) / fIval.getRange()) + tIval.min;
			if (bounded) {
				return ret > tIval.max 
					? tIval.max
					: ret < tIval.min
						? tIval.min
						: ret;
			}
		}
	},
	getRandomBinaryWithProbablity : function (p) {
		return Math.random() >= 1-p ? 1 : 0;
	},
	getRandomArbitrary : function (range) {
		return Math.random() * (range[1] - range[0]) + range[0];
	},
	getRandomWeibull : function (scale, shape) {
		scale = scale || 0.5;
		shape = shape || 3;
		return scale * Math.pow(-Math.log(Math.random()),1/shape);
	}
};