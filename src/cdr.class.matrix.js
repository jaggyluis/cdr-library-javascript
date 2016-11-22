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
