Promise = require("es6-promise").Promise
cheerio = require('cheerio')
rp      = require('request-promise')
tb2json = require('tabletojson')
csvjson = require('csv-parse');

##
# General CIT info module
class Sokka
  
  constructor: (@interval) ->
    @url_printers = "https://net-print.cit.cornell.edu/netprintx-cgi/qfeatures.cgi"
    @url_labs = "https://mapping.cit.cornell.edu/publiclabs/map/results_as_csv.cfm"
  
  labs : -> rp(@url_labs).then (csv) -> new Promise (res, rej) ->
    csvjson csv, (err, output) ->
      rej err if err
      res output.map (x) -> {
        id : parseInt x[0]
        created : new Date(x[1])
        updated : new Date(x[2])
        name : x[3]
        location : x[5]
        coordinates : x[6].split(',').map (c) -> (parseFloat c)
        resources : x[7].split(',')
      }

  printers : -> rp(@url_printers).then (html) ->
      $    = (cheerio.load html)
      conv = (tb2json.convert $("table").parent().html())[0]

      # Reformat data.
      conv.map (x) -> {
        queue_name : x["Queue Name"]
        printer_name : x["Printer Name"]
        printer_model : x["Printer Model"]
        color : x["Color"] is "Color"
        dpi : parseFloat x["DPI"]
        duplex : x["Duplex"] is "Two-sided"
        price_per_page : (parseFloat x["¢/Pg"]) / 100
      }

module.exports = new Sokka()

if require.main is module
  sokka = module.exports
  (Promise.all [sokka.printers(), sokka.labs()]).then (info) ->
    console.log info