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