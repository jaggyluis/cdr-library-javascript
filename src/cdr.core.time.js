cdr.core.time = {
	toDecimalDay : function(time) {
		if (this.isapTime(time)) return this.apTimeToDecimalDay(time);
		else if(this.isTime(time)) return this.timeToDecimalDay(time);
		else if (!isNaN(time)) return time;
		else return null;
	},
	decimalDayToTime : function (dday) {
		dday = dday >= 0 ? dday : 1 + dday;
		var hours = Number((dday * 24).toString().split('.')[0]),
			minutes = Number((dday * 24 * 60 - hours * 60).toString().split('.')[0]),
			seconds = Number((dday * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60).toString().split('.')[0]);
		hours = hours > 0 ? hours.toString() : '00';
		minutes = minutes > 0 ? minutes.toString() : '00';
		seconds = seconds > 0 ? seconds.toString() : '00';
		hours = hours.length > 1 ? hours : "0"+ hours;
		minutes = minutes.length > 1 ? minutes: "0"+ minutes;
		seconds = seconds.length > 1 ? seconds: "0"+ seconds;
		return hours+':'+minutes+':'+seconds;
	},
	decimalDayToMinutes : function (dday) {
		dday = dday >= 0 ? dday : 1 + dday;
		return Number((dday*24*60).toString().split('.')[0]);
	},
	decimalDayDelta : function (fdday, tdday) {
		return tdday - fdday < 0 ? ( tdday - fdday + 1 ) : ( tdday - fdday );
	},
	timeToDecimalDay : function (time) {
		var str = time.split(':').map(function(t) { return Number(t); });
		return this.minutesToDecimalDay(str[0] * 60 + str[1]);
	},
	minutesToDecimalDay : function (minutes) {
		return (minutes / 60) / 24;
	},
	secondsToDecimalDay : function (seconds) {
		return ((seconds / 60) / 60) / 24;
	},
	apTimeToDecimalDay : function (str) {
		var time = str.split(/[:]/),
			hours = time[2] === 'AM' 
					? time[0] 
					: time[2] === 'PM'
						? (Number(time[0]) + 12).toString()
						: time[2],
			minutes = time[1];
		return this.timeToDecimalDay(hours+':'+minutes);
	},
	isTime : function(str) {
		return str.toString().match(/\d{1,2}:\d{2}(?!\D)/) !== null;
	},
	isapTime : function (str) {
		return str.toString().toLowerCase().match(/am|pm/);
	},
	isPre9AM : function (time) {
		return this.toDecimalDay(time) < 0.375;
	},
	romanToNumber : function (str) {
		var dict = { 'I' : 1, 'II' : 2, 'III' : 3, 'IV' : 4, 'V' : 5, 'VI' : 6 };
		if (dict[str] !== undefined) return dict[str];
		else return 3; 
	},
	romanToLetter : function(str) {
		var dict = { 'I' : 'A', 'II' : 'B', 'III' : 'C', 'IV' : 'D', 'V' : 'E', 'VI' : 'F' };
		if (dict[str] !== undefined) return dict[str]; 
		else return 'C';
	}
};