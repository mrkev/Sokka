Promise = require("es6-promise").Promise
remap   = require("obender").remap
cheerio = require('cheerio')
rp      = require('request-promise')
tb2json = require('tabletojson')
cache   = require('memory-cache')

###*
Sokka

query()   : returns a promise to the queried data and resets the timer. The
data recieved gets stored on cache.

jetJSON() : returns a promise to the most readily available data. If there's
no cache, same as query(). Else, to cache.

interval  : time in milliseconds between automatic calls of query()
###
class Sokka
  
  constructor: (@interval) ->
    @interval ?= 604800000 # One week
    @url = "https://net-print.cit.cornell.edu/netprintx-cgi/qfeatures.cgi"
  
  query : -> rp(@url).then (html) ->
      $    = (cheerio.load html)
      conv = (tb2json.convert $("table").parent().html())[0]

      # Reformat data.
      conv.map (x) ->
        remap
          "Queue Name"    : "queue_name"
          "Printer Name"  : "printer_name"
          "Printer Model" : "printer_model"
          "Color" :
            color : (value) -> value is "Color"
          "DPI" :
            dpi : (value) -> parseFloat value
          "Duplex" :
            duplex : (value) -> value is "Two-sided"
          "¢/Pg":
            price_per_page : (value) -> parseFloat(value) / 100
        , x

      cache.put "data", conv, @interval
      return conv
    
  getJSON : ->
    cached = (cache.get "data")
    if cached is null then @query() else Promise.resolve cached

module.exports = new Sokka()