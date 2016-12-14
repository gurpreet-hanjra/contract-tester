# dev-contract-tester

Tool to do contract testing from frontend perspective. 

# Installation

`npm install dev-contract-test`

## Require the module

`const contract = require('dev-contract-test');`

## Add configuration
`const config = {
  apis :[
      {
        "url": "http://www.omdbapi.com/?t=frozen&y=&plot=short&r=json",        
        "name": "Frozen"
      }
}`

## call the method 

`contract.validateContract(config);`

## options

Force to record the response, irrespective of time
`contract.validateContract(config, true);`

## Why contract testing?
With rise of popular Javascript frameworks like Angular, React, Ember and more. Single page applications work with REST backend over JSON. And there is always a chance that something time to time changed from backend, be it part of change in functionality, refactoring or any other reason. And when something is changed, contract between fronend and backend fails. Boom!

Your applications is not working or some data is not displaying and you wonder WTF! I haven't changed anything, why the hell is not working?

Yay! dev-contract-test is here to rescue. Just install it, configure your endpoints and initialize it. 
 
For example: 

As a front-end developer, your frontend app consumes JSON exposed by REST api. JSON schema as contract is in agreement between frontend and backend, and app is working just fine.
But suddenly, for some reason the frontend app is behaving wierd. Data in your app/component is not rendering properly or not rendering at all. But you havn't changed a bit in your code.
Is this due to something changed in api from backend?

dev-contract-tester is here to help.

## How does it works?

dev-contract-tester works in 2 modes - 

1. Record - Records the JSON from backend api and saves it as physcial JSON file.
2. Play - Compares the JSON saved (that worked fine) with the api now (that has something changed).

In case of discrepancies, tool with throw error and notifies where the mismatch is.

## Example?

This is when things worked - 

{
  "Title":"Frozen",
  "Year":"2013"
}

But when schema changed -

{
  "Title":"Frozen",
  "YearOfRelease":"2013"
}

from 'Year' to 'YearOfRelease', things BROKE.



