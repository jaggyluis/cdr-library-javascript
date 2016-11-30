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