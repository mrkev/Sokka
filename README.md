Sokka
=================

Net print module for the RedAPI. Can be used to fetch info about Cornell netprint in general.


	var netprint = require('Sokka');
	
	netprint.getJSON().then(function (data) {...}, 
							function (error) {...}); 
							// Do whatever you want with the promise. 


Note: this is the package officialy used at `http://api-mrkev.rhcloud.com/redapi/printers`, or will be once I fix an issue I have with node-gyp on OpenShift /: Check it out, tweak, suggest changes, post issues and enjoy!