// imports modules //
const request = require('request');
const fs = require('fs');
const path = require('path');
const compare = require('json-structure-diff').compareJSONObjects;
const store = require('node-persist');
const isToday = require('date-fns/is_today');

// common utilities //
const Utils = require('./utils');

// helpful for debugging in various moves //
const mode = process.env.NODE_MODE;
const defaultConfig = Utils.defaultConfig;

// directory to hold the records //
const dirName = 'records';

// directory path //
let recordsDirPath = path.join(__dirname + '/../../../' + dirName + '/');

// smiliyes to add some life //
const emojis = {
  smile: '😀',
  sad: '🙁',
  force: '👮'
}

// holds all api endpoints //
let endpoints;

// count to keep track of comparisons done to exit from process //
let count = 0;

// holds object to compare temporarily //
let obj1,
    obj2;

// initiate the store in sync mode //
store.initSync();

//console.log("==>", mode);

// exit the process //
const exit = () => {
  process.exit();
}

// intiate the debug mode //
if (mode === 'debug') {
  recordsDirPath = path.join(__dirname + '/../' + dirName + '/');
  //exit();
  validateContract(defaultConfig);
}

// validateContract with config and options to force the record //
function validateContract(config, forceRecord) {

    //console.log('validateContract');

    // throw error if configuration is not there //
    if (!config || !config.apis || config.apis.length === 0) {
      throw new Error('Configuration not found. Configuration of api endponts is required.');
    }

    // store endpoints //
    endpoints = config.apis;
    //console.log(`Total endpoints ${endpoints.length}.`);
    //console.log(`Last recorded at ${store.getItemSync('lastrun')}.`);

    // gets boolean, if true - play, false - record //
    if (forceRecord) {
      console.log(`forceRecord is ${forceRecord} ${emojis.force}`);
      doAction(false);
      return;
    }

    //console.log('INITIAL CHECK', checkIfRecordsExists());

    // if records folders doesn't exists, then create fresh recrds //
    if (!checkIfRecordsExists()) {
      doAction(false);
      return;
    } else {
      doAction(true);
    }

    // create records if they are stale //
    if (!isToday(store.getItemSync('lastrun')) && store.getItemSync('lastrun') !== undefined) {
      doAction(false);
      return;
    }
}

// checks if folder exists, then checks if files exists //
function checkIfRecordsExists() {
  //console.log('==>', 'checkIfRecordsExists')
  try {

    //p = path.join(__dirname, '/../../../', 'records');
    //fs.statSync(path.join(__dirname, '/../../../', 'records'));

    p = path.join(recordsDirPath);
    fs.statSync(path.join(recordsDirPath));

    //console.log(p, 'exists ~~~~~~~~~~~~~~~~');
    //console.log(`Found records ${fs.readdirSync(p).length}.`);

    return fs.readdirSync(p).length !== 0;
  }
  catch(err) {
      console.log('Records folder does not exist or no records found.', p);
      return false;
  }
}

// feature to read config from external file //
function readConfigFromFile() {
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
function doAction(isRecord) {
    //console.log("function called ==> doAction", isRecord);

    if (!isRecord) {
        console.log(`Starting Record...`);
        // create records directory to store responses //
        fs.mkdir('records', function(err, folder) {

            // for each item pass, record as files //
            endpoints.forEach(function(item, index) {
                //console.log(item);
                recordFiles(item, index);
            });
        })
    } else {
        console.log(`Starting Play...`);
        // for each item pass, compare data //
        endpoints.forEach(function(item) {
            //console.log(item);
            doCompare(item);
        });
    }
}

// get data from api endpoints and save them as files as per names from input files //
function recordFiles(endpoint, index) {
    //console.log('Recording files', endpoint, index);

    // get data //
    request(endpoint.url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log('fetched data from:: ', endpoint.url);

            //console.log(recordsDirPath);
            //exit();

            fs.writeFile(recordsDirPath + endpoint.name + '.json', body, function(err) {
                if (err) throw err;
                //console.log('Record created for', endpoint.name + '.json');
                //doAction(true);

                if (index === endpoints.length - 1) {
                  //console.log(endpoints.length, 'Records created.');
                  doAction(true);
                }

                storeLastRecordedTime();
            });

        } else {
            console.log('error', error);
        }
    });

}

// compare the JSON //
function doCompare(endpoint) {
    //console.log('doCompare ==> ', endpoint);
    request(endpoint.url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log('fetched data from:: ', endpoint.url);
            obj1 = body;

            readRecordedFile(endpoint.name);
        } else {
            console.log('error', error);
        }
    });
}

// read recorded files for comparison in memory //
function readRecordedFile(filename) {

    fs.readFile('./records/' + filename + '.json', 'utf8', function(error, data) {
        //console.log('~~~~~~~~~~~==>', data, obj1);
        obj2 = data;
        //console.log('~~~~~~~~~~~==>', obj1, obj2);

        // do final comparison //
        match(filename);
    });
}

// do the comparsion //
function match(filename) {
    //console.log('match:: ', obj1, obj2);

    /* TODO Add reference how to run in record mode */

    if (obj2 === undefined) {
      throw new Error(`No recorded data found. Please record the responses first. ${emojis.sad}  More info - http://google.com`);
    };

    var objectsToCompare = [Utils.sanitize(obj1, 'compare'), Utils.sanitize(obj2, 'compareTo')];
    //console.log(objectsToCompare);

    var errors = compare(objectsToCompare);

    if (errors !== null) {
        //console.log(errors.length + ' problem(s), grr!');
        //console.log(errors);
        var msg = "'" + Utils.filter(errors[0].parent) + "' mismatch.";
        throw new Error(msg);
    } else {
        console.log(`No problem(s) found in ${filename} ${emojis.smile}`);
        //exit();
    }

    count++;

    if (endpoints.length === count) {
      exit();
    }

    //exit();
}

// TODO *** this function is not being used *** //
function configFromFile() {
  // make queue from input file //
  fs.readFile('input.json', 'UTF8', function(err, data) {
      //console.log('data', data);
      // store all endponts //
      endpoints = JSON.parse(data).compare;
      //console.log("endpoints length ==> ", endpoints.length);

      // perfom action based upon mode //
      doAction(mode);
  });
}

// store the last run info //
const storeLastRecordedTime = () => {
  //console.log('storeLastRecordedTime ==>', store.getItemSync('lastrun'));
    store.setItemSync('lastrun', new Date());
}

// expose the only method //
module.exports = {
  validateContract: validateContract
}
