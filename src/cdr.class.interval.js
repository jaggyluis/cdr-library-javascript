cdr.class.Interval = function (start, end) {	
	return new Interval(start, end);
};
cdr.class.Interval.deserialize = function (data) {
	return Object.create(Interval.prototype, {
		'start' : {'value' : data.start },
		'end' : {'value' : data.end }
	});
};
cdr.class.Interval.interpolateRandom = function (start, end) {
	return Math.floor(Math.random() * (end - start + 1)) + start;
};
function Interval (start, end) {
	this.start = start;
	this.end = end;
}
Interval.prototype = {};
Interval.prototype.__defineGetter__('min', function () {
	return this.start < this.end ? this.start : this.end;
});
Interval.prototype.__defineGetter__('max', function () {
	return this.start > this.end ? this.start : this.end;
});
Interval.prototype.intersects = function (other) {
	return this.includes(other.start) ||
		this.includes(other.end) ||
		other.includes(this.start) ||
		other.includes(this.end);
};
Interval.prototype.getLength = function () {
	return this.end-this.start;
};
Interval.prototype.contains = function (other) {
	return this.includes(other.start) && this.includes(other.end);
};
Interval.prototype.includes = function (num) {
	return num >= this.start && num <= this.end;
};
Interval.prototype.padded = function (val1, val2) {
	if (val1 && val2) return new Interval(this.start-val1, this.end+val2);
	else if (val1) return new Interval(this.start-val1, this.end+val1);
	else return this;
};
Interval.prototype.serialize = function (cycle) {
	return {
		'class' : 'Interval',
		'data' : {
			'start' : this.start,
			'end' : this.end
		}
	};
};
