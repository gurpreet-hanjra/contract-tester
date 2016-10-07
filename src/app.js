const request = require('request');
const fs = require('fs');
const compare = require('json-structure-diff').compareJSONObjects;

// holds all api endpoints //
var endpoints;
// holds object to compare temporarily //
var obj1,
    obj2;

// init function,
function init(mode) {

    // set mode based on input //
    mode = mode || "record";
    console.log('mode is ==>', mode);

    // make queue from input file //
    fs.readFile('input.json', 'UTF8', function(err, data) {
        //console.log('data', data);
        // store all endponts //
        endpoints = JSON.parse(data).compare;
        console.log("endpoints length ==> ", endpoints.length);

        // perfom action based upon mode //
        doAction(mode);
    });
}

// does record/play //
function doAction(mode) {
    if (mode === 'record') {
        // create records directory to store responses //
        fs.mkdir('records', function(err, folder) {

            // for each item pass, record as files //
            endpoints.forEach(function(item) {
                //console.log(item);
                recordFiles(item);
            });
        })
    } else {
        // for each item pass, compare data //
        endpoints.forEach(function(item) {
            //console.log(item);
            doCompare(item);
        });
    }
}

// get data from api endpoints and save them as files as per names from input files //
function recordFiles(endpoint) {
    console.log('recordFiles ==> ', endpoint.url);

    // get data //
    request(endpoint.url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('fetched data from:: ', endpoint.url);

            // write to files //
            fs.writeFile('./records/' + endpoint.name + '.json', body, function(err) {
                if (err) throw err;
                console.log('file saved::', './records/' + endpoint.name + '.json');
            });
        } else {
            console.log('error', error);
        }
    });

}

// append timestamp if required //
function timestamp() {
    var date = new Date();
    return date.getDate() + '-' + date.getMonth() + '-' + date.getUTCFullYear();
}

// compare the JSON //
function doCompare(endpoint) {

    request(endpoint.url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('fetched data from:: ', endpoint.url);
            obj1 = body;

            readRecordedFile(endpoint.name);
        } else {
            console.log('error', error);
        }
    });
}

// read recorded files for comparison //
function readRecordedFile(filename) {
    fs.readFile('./records/' + filename + '.json', 'utf8', function(error, data) {
        //console.log('~~~~~~~~~~~==>', data, obj1);
        obj2 = data;
        //console.log('~~~~~~~~~~~==>', obj1, obj2);

        // do final comparison //
        match();
    });
}

function match() {
    //console.log('match:: ', obj1, obj2);

    if (obj2 === undefined) {
      throw new Error('No recorded data found.');
    };

    var objectsToCompare = [sanitize(obj1, 'compare'), sanitize(obj2, 'compareTo')];
    //console.log(objectsToCompare);

    var errors = compare(objectsToCompare);

    if (errors !== null) {
        console.log(errors.length + ' problem(s), grr!');
        console.log(errors);
        //var msg = "'" + filter(errors[0].parent) + "' mismatch.";
        //throw new Error(msg);
    } else {
        console.log('no problem(s), yay!');
    }
}

function filter(str) {
    var arr = str.split(".");
    return arr[arr.length - 1];
}

function sanitize(obj, name) {
    var o = {
        parent: name
    }

    var content = {
        content: JSON.parse(obj)
    }

    return Object.assign(o, content);
}

//init();
init('play');
