'use strict';

const request = require('request');
const cheerio = require('cheerio');
var rp = require('request-promise');

//http://invoice.etax.nat.gov.tw/invoice.xml

var options = {
    uri: 'http://invoice.etax.nat.gov.tw/invoice.xml',
    transform: function(body) {
        return cheerio.load(body);
    }
};
exports.list_invoice = function(req, res) {
    fatchInvoice(0, function(response) {
        res.json(response);
    });
}
exports.get_invoice = function(req, res) {
    let count = 0;
    if ('undefined' !== req.params.countId) {
        count = req.params.countId;
    }
    fatchInvoice(count, function(response) {
        console.log(response);
        res.json(response);
    });
}


function fatchInvoice(count, callback) {
    rp(options)
        .then(function($) {
            let results = [];
            if (count > $('item').length) {
                count = $('item').length;
            }
            $('item').map(function(i, el) {
                if (i <= count) {
                    let JSONString = filterContent($(this).find('description').text());
                    JSONString.title = $(this).find('title').text();
                    results.push(JSONString);
                }
                return $(this).text();
            }).get().join(' ');
            return callback({ 'resources': results });
        });
}
// "<p>特別獎：74748874</p> <p>特獎：82528918</p> <p>頭獎：07836485、13410946、96152286</p> <p>增開六獎：996</p>"
function filterContent(text) {
    let value = text.replace(/<\/p>/g, '、').replace(/<p>/g, '');
    let raw = value.split('、');
    let resultJson = {
        title: '',
        alls: [],
        special: ''
    };
    raw.forEach(function(v, k) {
        if (v.includes('特別獎')) {
            resultJson.special = leftPad(v.replace(/[^0-9]/g, ''), '*', 8);
            raw.splice(k, 1);
        } else if ((v.trim() === '')) {
            raw.splice(k, 1);
        }
    });
    let result = raw.map(function(x) {
        return leftPad(x.replace(/[^0-9]/g, ''), '*', 8); //leftPad(  ,'*',8);
    });
    result.sort(compare);
    resultJson.alls = result;
    return resultJson;
}
var compare = (a, b) => a.slice(-3) - b.slice(-3);
/*
	String padding:
  http://stackoverflow.com/a/36247412/1869660
*/
var leftPad = (s, c, n) => (s.length < n) ? c.repeat(n - s.length) + s : s;
//.replace(/[^0-9]/g, '')