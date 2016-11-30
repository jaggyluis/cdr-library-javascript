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
	    reader.onprogress = this.updateProgress;
	    reader.onabort = this.abortUpload;
	    reader.onerror = this.errorHandler;
	    reader.onloadend = function (evt) {
	        cb(this.onSuccess(evt));
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