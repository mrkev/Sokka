/* global require, console, module */
'use strict';	

var Promise = require('es6-promise').Promise;
var remap   = require('obender').remap;

var jquery = require("fs").readFileSync(__dirname + "/vendor/jquery.min.js", "utf-8");
var t2json = require("fs").readFileSync(__dirname + "/vendor/jquery.tabletojson.js", "utf-8");

/**
 * Sokka, v0.0.0
 * 
 * Exports for the module.
 * @return {NetPrintSource}
 *
 * NetPrintSource usage:
 *
 * query()   : returns a promise to the queried data and resets the timer. The
 * 			   data recieved gets stored on cache.
 * 
 * jetJSON() : returns a promise to the most readily available data. If there's
 * 			   no cache, same as query(). Else, to cache.
 *
 * interval  : time in milliseconds between automatic calls of query()
 * 
 */
module.exports = (function () {

	function NetPrintSource(url) {
		var self = this;
		self.url = url;
		self.interval = 604800000; // One week
		self.data = null;
	}

	NetPrintSource.prototype.query = function() {
		var self  = this;
		var jsdom = require('jsdom');

		return new Promise(function (resolve, reject) {

			jsdom.env({
				url : self.url,
				src : [jquery, t2json],
			    done: 
			    function (err, window) {
			    	var $ = window.jQuery;

			    	if (err !== null) {
			    		console.error(err);
			    		reject(err);
			    	}
			    	
			    	self.data = $('table').tableToJSON();

			    	// Remap and reformat data.
			    	for (var i = self.data.length - 1; i >= 0; i--) {
			    		remap(
			    			{'Queue Name': 'queue_name',
			    			 'Printer Name': 'printer_name',
			    			 'Printer Model': 'printer_model',
			    			 'Color': {'color'
			    					    : function (value) { return value === 'Color'; } },
			    			 'DPI': {'dpi'
			    						: function (value) { return parseFloat(value); } },
			    			 'Duplex': {'duplex'
			    			 			: function (value) { return value === "Two-sided"; } },
			    			 '¢/Pg': {'price_per_page' 
			    			 		    : function (value) { return parseFloat(value) / 100; } }
			    			},
			    			self.data[i]);
			    	};

			    	resolve(self.data);
			  	}
			});

			self.timer = setTimeout(self.query, self.interval);

		});
	};


	NetPrintSource.prototype.clear = function() {
		this.data = null;
	};

	NetPrintSource.prototype.getJSON = function() {
		if (this.data === null) {
			return this.query();

		} else {
			return Promise.resolve(this.data);
		}
	};

	return new NetPrintSource('https://net-print.cit.cornell.edu/netprintx-cgi/qfeatures.cgi');
})();



