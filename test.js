var assert = require('assert');
var expect = require('chai').expect;
var chai   = require('chai');

chai.use(require('chai-as-promised'));
chai.should();

describe('Sokka', function(){
	
	this.timeout(120000); // (2 minutes for timeout should be enough)


	/**
	 * Test that the module work wont crash anything.
	 */
	it('can be loaded without blowing up', function () {
		assert.doesNotThrow(function () {require('./index.js')});
		expect(require('./index.js')).to.not.be.undefined;
		expect(require('./index.js')).to.respondTo('getJSON');
	});

	var netprint;
	beforeEach(function(){
		netprint = require('./index.js');
	});

	describe('#getJSON()', function() {
		it('returns non empty data', function(){
			return expect(netprint.getJSON()).to.eventually.have.length.above(0);
		});

		// have.property checks for (property, value). Change this.
		// it('returns the data we want', function(){
		// 	return netprint.getJSON().should.eventually.all.have.property(
		// 	 'queue_name', 'printer_name', 'printer_model', 'color', 'dpi', 'duplex', 'price_per_page');
		// });

		it('returns the data in the types we want', function(){
			return expect(netprint.getJSON()).to.eventually.satisfy(function (data) {
				var result = true;
				for (var i = data.length - 1; i >= 0; i--) {
					
					result = (typeof data[i].queue_name		===	'string'	) &&
							 (typeof data[i].printer_name	===	'string'	) &&
							 (typeof data[i].printer_model	===	'string'	) &&
							 (typeof data[i].color			===	'boolean'	) &&
							 (typeof data[i].dpi			===	'number'	) &&
							 (typeof data[i].duplex			===	'boolean'	) &&
							 (typeof data[i].price_per_page	===	'number'	) && result;
				};

				return result;
			});
			
		});
	});
});
