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