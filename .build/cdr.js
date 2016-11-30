cdr = {};
cdr.version = "0.0.1",
cdr.class = {};
cdr.core = {};
cdr.core.file = {
	readFile: function(file, cb) {
	    function readTextFile(file, cb) {
	        var rawFile = new XMLHttpRequest();
	        rawFile.responseType = "blob";
	        rawFile.open("GET", file, true);
	        rawFile.onreadystatechange = function () {
	            if (rawFile.readyState === 4) {
	                if (rawFile.status === 200 || rawFile.status === 0) {
	                    var response = rawFile.response;
	                    cb(response);
	                }
	            }
	        };
	        rawFile.send(null);
	    }
	    var reader = new FileReader();
	    reader.onprogress = cdr.core.file.updateProgress;
	    reader.onabort = cdr.core.file.abortUpload;
	    reader.onerror = cdr.core.file.errorHandler;
	    reader.onloadend = function (evt) {
	        cb(cdr.core.file.onSuccess(evt));
	    };
	    readTextFile(file, function (data) {
	        reader.readAsText(data);
	    });
	},
	abortUpload: function() {
	    console.log('Aborted read!');
	},
	errorHandler: function(evt) {
	    switch (evt.target.error.code) {
	        case evt.target.error.NOT_FOUND_ERR:
	            alert('File Not Found!');
	            break;
	        case evt.target.error.NOT_READABLE_ERR:
	            alert('File is not readable');
	            break;
	        case evt.target.error.ABORT_ERR:
	            break; // noop
	        default:
	            alert('An error occurred reading this file.');
	    }
	},
	updateProgress: function(evt) {
	    console.log('progress');
	    console.log(Math.round((evt.loaded / evt.total) * 100));
	},
	onSuccess: function(evt) {
	    var fileReader = evt.target;
	    if (fileReader.error) return console.log("error onloadend!?");
	    return fileReader.result;
	}
};
cdr.core.event = {
	// http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
	eventFire: function(el, etype, stop) {
	    if (el.fireEvent) {
	        el.fireEvent('on' + etype);
	    } else {
	        var evObj = document.createEvent('Events');
	        evObj.initEvent(etype, true, false);
	        el.dispatchEvent(evObj);
	        if (stop) evObj.stopPropagation();
	    }
	}
};
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
cdr.core.obj = {
	isNull : function (obj) {
		var is = true;
		for (var key in obj) {
			if (obj[key] !== null) is = false;
		}
		return is;
	},
	parse : function (obj) {
		return Object.keys(obj).reduce(function(o, k) {
				if(Number(obj[k])) {
					o[k] = Number(obj[k]);
				} else if (obj[k].toLowerCase().match(/false|true/)) {
					o[k] = obj[k].toLowerCase().match(/false/)
						? false
						: true;
				} else if (obj[k].length === 0) {
					o[k] = null;
				} else {
					o[k] = obj[k];
				}
				return o;
			}, {});
	},
	pprint : function (obj) {
		function format(obj, _tabs) {
			var tabs = _tabs+"\t",
				str = "";
			if (obj instanceof array) {
				obj.forEach((function(i) {
					str+="\r\n"+tabs+format(i, tabs);
				}).bind(this));
			} else if (obj instanceof Object ){
				for (var k in obj) {
					str+= "\r\n"+ tabs + k;
					str+= format(obj[k], tabs);
				}
			} else {
				str+= "\t"+obj;
			}
			return str;
		}
		return format(obj, "");
	}
};
cdr.core.csv = {
	parse : function (str) {
		var parsed = str.split('\n'),
			re = /[^\w\:\-]/gi,
			keys = parsed[0].split(',').map(function(str) {
				return str.replace(re, "");
			});
		return parsed.slice(1).map(function(csvarray) {
			var obj = {};
			csvarray.split(',').map(function(str) {	return str.replace(re, "");	})
				.forEach(function(value, idx) {
				obj[keys[idx]] = value;
			});
			return obj;
		});
	},
	serialize : function (obj, keys) {
		return obj.reduce(function(a,b) {
			return a+(keys.map(function(key) {
				return '"'+b[key]+'"';
			}).join(',')+'\n');
		}, keys.join(',')+'\n');
	}
};
cdr.core.array = {
	filterStrict : function (arr, str) {
		var spl = str.split(/[^\w\.]/);
		return arr.filter(function(obj) {
			return spl.every(function(s) {
				return JSON.stringify(obj).match(s);
			});
		});
	},
	filterLoose : function (arr, str) {
		var spl = str.split(/[^\w\.]/);
		return arr.filter(function(obj) {
			return spl.some(function(s) {
				return JSON.stringify(obj).match(s);
			});
		});
	},
	getBestMatch : function (arr, str) {
		var spl = str.split(/[^\w\.]/);
		if (!arr) return arr;
		return arr.sort(function(a,b) {
			var ac = 0, 
				bc = 0;
			spl.forEach(function(s) {
				if (JSON.stringify(a).match(s)) ac++;
				if (JSON.stringify(b).match(s)) bc++;
			});
			return bc-ac;
		})[0];
	},
	mode : function (arr) {
		var max = arr[0],
			hold = {};
		for (var i=0; i<arr.length; i++) {
			if (hold[arr[i]]) hold[arr[i]]++;
			else hold[arr[i]] = 1;
			if (hold[arr[i]] > hold[max]) max = arr[i];
		}
		return max;
	},
	mapElementsToObjByPercentile : function (arr, clean) {
		var len = arr.length,
			perc = {};
		for (var i=0; i<arr.length; i++) {
			if (perc[arr[i]]) perc[arr[i]]++;
			else perc[arr[i]] = 1;
		}
		for (var p in perc) {
			perc[p] = Math.round((perc[p]/len)*100);
			if (perc[p] === 0 && clean) delete perc[p];
		}
		return perc;
	},
	mapElementsToObjByKey : function (arr, k) {
		var lib = {};
		arr.forEach(function(p) {
			if (p[k] !== null && p[k] !== undefined) {
				if (p[k] in lib) lib[p[k]].push(p);
				else lib[p[k]] = [p];
			}
		});
		return lib;
	},
	hasAllMatchingElementsByKeys : function (arr, k, l) {
		arr.forEach(function(p,i) {
			parr.forEach(function(q,j) {
				if (i!==j) {
					if (p[k]!==q[k] || 
						p[l]!==q[l]) {
						return false;
					}
				}
			});
		});
		return true;
	},
	///
    /// from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
    ///
    shuffle: function(arr) {
        var counter = arr.length;
        while (counter > 0) {
            var index = Math.floor(Math.random() * counter);
            counter--;
            var temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;
        }
        return arr;
    }
};
cdr.core.string = {
	generateUUID : function () {
		//	http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	    var d = new Date().getTime(),
	    	uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        	var r = (d + Math.random()*16)%16 | 0;
	        	d = Math.floor(d/16);
	        	return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    	});
	    return uuid;
	}
};
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
cdr.class.Matrix3d = function(numRow, numCol, mod) {
	return new Matrix3d(numRow, numCol, mod);
};
cdr.class.Matrix3d.deserialize = function (data) {	
	return Object.create(Matrix3d.prototype, {
		'd' : {'value' : null }, // !!!!! TODO
		'm' : {'value' : data.m },
		'r' : {'value' : data.r },
		'c' : {'value' : data.c },
		'_rs' : {'value' : data._rs },
	});
};
function Matrix3d (numRow, numCol, mod) {
	this.d = [];
	this.m = mod;
	this.r = numRow;
	this.c = numCol;
	this._rs = [];
	var row,
		col,
		r,
		c;
	for (r=0; r<numRow; r++) {
		row = [];
		for (c=0; c<numCol; c++) {
			col = [];
			row.push(col);
		}
		this.d.push(row);
		this._rs.push([]);
	}
}
Matrix3d.prototype = {};
Matrix3d.prototype.forEachItem = function (cb) {
	var r,
		c,
		i;
	for (r=0; r<this.d.length; r++) {
		for (c=0; c<this.c; c++) {
			for (i=0, len = this.d[r][c].length; i<len; i++) {
				cb(this.d[r][c][i], len, i, c, r);
			}
		}
	}
};
Matrix3d.prototype.setItem = function (item, r, c, i) {
	this.d[r][c][i] = item;
};
Matrix3d.prototype.getItem = function (r, c, i) {
	return this.d[r][c][i] || null;
};
Matrix3d.prototype.pushItem = function (item, r, c) {
	if ( r === -1 || undefined ) r = this.d.length-1;
	if ( c === -1 || undefined ) c = this.d[r].length-1;
	this.d[r][c].push(item);
};
Matrix3d.prototype.spliceItem = function (item, index, r, c) {
	if ( this.d[r] === undefined ) return null;
	if ( this.d[r][c] === undefined ) return null;
	this.d[r][c].splice(index, 0, item);
},
Matrix3d.prototype.unShiftItem = function (item, r, c) {
	if ( r === -1 || undefined ) r = this.d.length-1;
	if ( c === -1 || undefined ) c = this.d[r].length-1;
	this.d[r][c].unshift(item);
};
Matrix3d.prototype.getCol = function (r, c) {
	return this.d[r][c] || null;
};
Matrix3d.prototype.getRow = function (r) {
	if (r === -1) r = this.d.length-1;
	return this.d[r] || null;
};
Matrix3d.prototype.getRowItemCount = function(r) {
	return this.d[r].reduce(function(a,b) {	return a + b.length; }, 0);
};
Matrix3d.prototype.getRowBlank = function () {
	var row = [];
	for (var c=0; c<this.c; c++) row.push([]);				
	return row;
};
Matrix3d.prototype.setRow = function (row, r) {
	this.d[r] = row;
};
Matrix3d.prototype.copyRow = function (f, t, insert) {
	if (insert === true) this.insertRow(t, this.d[f]);
	else this.d[t] = this.d[f].slice();
},
Matrix3d.prototype.shiftRow = function (r, shift) {
	var i;
	if (shift > 0) {
		for (i=0; i<shift; i++) {
			this.d[r].push(this.d[r].shift());
			this._rs[r].push(-shift);
		}
	} else if (shift < 0) {
		for (i=0; i<-shift; i++) {
			this.d[r].unshift(this.d[r].pop());
			this._rs[r].push(-shift);
		}
	}
};
Matrix3d.prototype.sortRow = function (r, cb) {
	this.d[r].sort(cb);
};
Matrix3d.prototype.sortRowCols = function (r, cb) {
	for (var c=0; c<this.d[r].length; c++) this.sortRowCol(r, c, cb);
};
Matrix3d.prototype.sortRowCol = function (r, c, cb) {
	this.d[r][c].sort(cb);
};
Matrix3d.prototype.copyRowApply = function (f, t, insert, cb) {
	var row = this.getRowBlank(),
		col,
		item,
		count,
		index,
		c,
		i;
	for (c=0; c<this.d[f].length; c++) {
		for (i=0; i<this.d[f][c].length; i++) {
			item = this.d[f][c][i],
			count = this.d[f][c].length,
			index = cb(item, this, count, i, c, f);
			if (index !== undefined) {
				col = index < this.c 
					? row[index]
					: row[index-this.c];
				col.push(item);
			}					
		}
	}
	if (insert) this.insertRow(t, row);
	else this.d[t] = row;
};
Matrix3d.prototype.insertRowBlank = function (t) {
	this.insertRow(t, this.getRowBlank());
};
Matrix3d.prototype.insertRow = function (t, row) {
	this.d.splice(t, 0, row.slice());
	this._rs.push([]);
	this.r++;
};
Matrix3d.prototype.distributeRowByCount = function (f, t, count) {
	var len,
		delta,
		c;
	count = count || Infinity;
	if (f !== t) this.concatRows(f,t);
	for (c=0; c<this.c; c++) {
		if (this.d[t][c].length > count) {
			len = this.d[t][c].length,
			delta = len - count;
			if(this.d[t][c+1] !== undefined) this.d[t][c+1] = this.d[t][c].slice(len-delta, len).concat(nxt);
			else this.d[t][c+1-this.c] = this.d[t][c].slice(len-delta, len).concat(nxt);
			this.d[t][c] = this.d[t][c].slice(0,len-delta);
		}
	}
};
Matrix3d.prototype.distributeRowByIndex = function(f, t, insert, cb) {
	var index,
		c;
	if (f !== t) this.concatRows(f,t);
	for (c=0; c<this.c; c++) { 
		index = cb(this.d[t][c], this, c, t);
		if (index >= this.d[t][c].length ||	index === undefined || index === null ) continue;
		else if (index < 0 && -index>this.d[t][c].length) continue;
		else if (index < 0 && -index<this.d[t][c].length) index = this.d[t][c].length-index;
		if(this.d[t][c+1] !== undefined) this.d[t][c+1] = this.d[t][c].slice(index-1).concat(this.d[t][c+1]);
		else this.d[t][c+1-this.c] = this.d[t][c].slice(index-1).concat(this.d[t][c+1-this.c]);
		this.d[t][c] = this.d[t][c].slice(0,index-1);
	}
};
Matrix3d.prototype.distributeRowByCounter = function (f, t, insert, cb) {
	if (f !== t) this.concatRows(f,t);
	var total,
		count,
		index,
		c,
		i;
	for (c=0; c<this.c; c++) {
		total = 0;
		for (i=0; i<this.d[t][c].length; i++) {
			total += cb(this.d[t][c][i], this, i, c, t, true);
		}
		if (total > this.m) {
			count = 0;
			index = 0;
			for (i=0; i<this.d[t][c].length; i++) {		
				count += cb(this.d[t][c][i], this, index, c, t, false);
				index ++ ;
				if (count >= this.m) break;
			}
			if(this.d[t][c+1] !== undefined) this.d[t][c+1] = this.d[t][c].slice(index-1).concat(this.d[t][c+1]);
			else this.d[t][c+1-this.c] = this.d[t][c].slice(index-1).concat(this.d[t][c+1-this.c]);
			this.d[t][c] = this.d[t][c].slice(0,index-1);
		}
	}
},
Matrix3d.prototype.distributeRowByCallBack = function (f, t, insert, cb) {
	if (f !== t) this.concatRows(f,t);
	var add,
		c;
	for (c=0; c<this.c; c++) {
		add = [];
		while(cb(this.d[t][c], this, c, t)) add.push(this.d[t][c].pop());
		if(this.d[t][c+1] !== undefined) this.d[t][c+1] = add.concat(this.d[t][c+1]);
		else this.d[t][c+1-this.c] = add.concat(this.d[t][c+1-this.c]);
	}
},
Matrix3d.prototype.restore = function () {
	for (var r=0; r<this.r; r++) this.shiftRow(r, this._rs.reduce(function(a,b) { return a+b; }));
};
Matrix3d.prototype.concatRows = function (f, t, isMerge) {
	var fcol,
		tcol,
		delta,
		c,
		i;
	for (c=0; c<this.c; c++) {
		fcol = this.d[f][c];
		tcol = this.d[t][c];
		delta = isMerge
			? fcol.length
			: fcol.length - tcol.length;
		for (i=fcol.length-delta; i<fcol.length; i++) tcol.push(fcol[i]);
	}
};
Matrix3d.prototype.mergeRows = function (f, t) {
	var c,
		i;
	if (typeof f === 'number') {
		this.concatRows(f, t, true);
	} else {
		for (c=0; c < this.c; c++) {
			for (i=0; i<f[c].length; i++) {
				this.d[t][c].push(f[c][i]);
			}
		}
	}
};
Matrix3d.prototype.merge = function (other) {
	this.m = this.m ? this.m : other.m ? other.m : this.m;
	this.r = this.r ? this.r : other.r ? other.r : this.r;
	this.c = this.c ? this.c : other.c ? other.c : this.c;
	this.rs = [];
	var m1,
		m2,
		r,
		c,
		i;
	if (this.d.length) {
		m1 = this;
		m2 = other;
	} else if (other.d.length) {
		m1 = other;
		m2 = this;
	} else {
		console.warn('empty merge');
	}
	for (r=0; r<m2.d.length; r++) {
		for (c=0; c<m2.d[r].length; c++) {
			for (i=0; i<m2.d[r][c].length; i++) {
				m1.d[r][c].push(m2.d[r][c][i]);
			}
		}
	}
	return m1;
};
Matrix3d.prototype.serialize = function (cycle) {		
	return 	{
		'class' : 'Matrix3d',
		'data' : {
			'd' : null , // !!!!! TODO
			'm' : this.m,
			'r' : this.r,
			'c' : this.c,
			'_rs' : this._rs
		}
	};
};


