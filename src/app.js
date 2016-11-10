const request = require('request');
const fs = require('fs');
const path = require('path');
const compare = require('json-structure-diff').compareJSONObjects;

const Utils = require('./utils');

const mode = process.env.NODE_MODE;
const lastRecorded;
const dirName = 'records';
var recordsDirPath = path.join(__dirname + '/../../../' + dirName + '/');
//console.log("==>", mode);

// smiliyes
const smile = "😀" ;
const sad = "🙁";
const force = "👮";

// holds all api endpoints //
var endpoints;
// holds object to compare temporarily //
var obj1,
    obj2;

//const contract = require('dev-contract-test');

const config =
  {
    frequency: "daily",
    last_recorded: "NA",
    apis :[
      {
        "url": "http://www.omdbapi.com/?t=frozen&y=&plot=short&r=json",
        "name": "Frozen"
      },
      {
        "url": "http://www.omdbapi.com/?t=terminator&y=&plot=short&r=json",
        "name": "Terminator"
      }]
  }


//contract.validateContract();
validateContract(config, false, true);

function validateContract(config, forceRecord, devMode) {

    devMode = arguments[2];

    if(devMode) {
      recordsDirPath = './records/';
    }

    //console.log(path.join(__dirname + '/../../..'));

    //console.log('validateContract==>', config);
    log(forceRecord);
    //console.log('validateContract==>', config.apis);

    if (!config || !config.apis || config.apis.length === 0) {
      throw new Error('Configuration not found. Configuration of api endponts is required.');
    }

    endpoints = config.apis;
    console.log(`Total endpoints ${endpoints.length}.`);

    var frequency = frequency || 1;

    // check if records folder is already there and has records in it //
    //console.log('checkIfRecordsExists ==>', checkIfRecordsExists());
    //var p = path.join(__dirname, '/../../../', 'records');
    //console.log(p);
    //console.log(fs.statSync(p));

    // gets boolean, if true - play, false - record //

    if (forceRecord) {
      log(`=======>forceRecord is ${forceRecord} ${force}`);
      doAction(false);
      //storeLastRecordedTime();
      return;
    }

    doAction(checkIfRecordsExists());

    // TODO read config from external file//
    // readConfigFromFile();
}

// checks if folder exists, then checks if files exists //
function checkIfRecordsExists() {
  try {

    //p = path.join(__dirname, '/../../../', 'records');
    //fs.statSync(path.join(__dirname, '/../../../', 'records'));

    p = path.join(recordsDirPath);
    fs.statSync(recordsDirPath);

    console.log(p, 'exists ========>', recordsDirPath);

    console.log(`Found records ${fs.readdirSync(p).length}.`);

    return fs.readdirSync(p).length !== 0;
  }
  catch(err) {
      console.log('Records folder does not exist or no records found.');
      return false;
  }
}

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
    //console.log("doAction", isRecord);

    if (!isRecord) {
        // create records directory to store responses //
        fs.mkdir('records', function(err, folder) {

            // for each item pass, record as files //
            endpoints.forEach(function(item, index) {
                //console.log(item);
                recordFiles(item, index);
            });
        })
    } else {
        log(`Starting Play...`);
        // for each item pass, compare data //
        endpoints.forEach(function(item) {
            //console.log(item);
            doCompare(item);
        });
    }
}

// get data from api endpoints and save them as files as per names from input files //
function recordFiles(endpoint, index) {
    console.log('recordFiles ==> ', endpoint, index);

    // get data //
    request(endpoint.url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('fetched data from:: ', endpoint.url);

            // write to files //
            //p = path.join(__dirname + '/../../../' + dirName + '/');

            console.log('recordsDirPath', recordsDirPath);

            fs.writeFile(recordsDirPath + endpoint.name + '.json', body, function(err) {
                if (err) throw err;
                console.log('Record created for', endpoint.name + '.json');
                //doAction(true);

                if (index === endpoints.length - 1) {
                  console.log(endpoints.length, 'Records created.');
                  doAction(true);
                }
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
            console.log('fetched data from:: ', endpoint.url);
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
      throw new Error(`No recorded data found. Please record the responses first. ${sad}  More info - http://google.com`);
    };

    var objectsToCompare = [Utils.sanitize(obj1, 'compare'), Utils.sanitize(obj2, 'compareTo')];
    //console.log(objectsToCompare);

    var errors = compare(objectsToCompare);

    if (errors !== null) {
        console.log(errors.length + ' problem(s), grr!');
        console.log(errors);
        var msg = "'" + Utils.filter(errors[0].parent) + "' mismatch.";
        throw new Error(msg);
    } else {
        console.log(`No problem(s) found in ${filename} ${smile}`);
    }
}

// TODO *** this function is not being used *** //
function configFromFile() {
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

function log(m) {
  console.log(m);
}

const storeLastRecordedTime = () => {
  //console.log(process.env.LAST_RECORDED_DATE, );

  if(!process.env.LAST_RECORDED_DATE){
    //process
  }
}

// expose the only method //
module.exports = {
  validateContract: validateContract
}
