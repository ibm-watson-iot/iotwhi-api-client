# Node.js Client Library for IoT Worker and Home Insights API
The node.js client is used for simplifying the interaction with the IoT Worker
and Home Insights API. The client helps you to interact with shields and
shield-codes, etc within your tenant.


# Usage
```
const IoTWHIApiClient = require('iotwhi-api-client').IoTWHIApiClient;

const iotwhiApiHost = 'https://iotworkerinsights.ibm.com';
const iotwhiApiPath = 'api/v1';
const tenantId = 'te_asd37mm9';
const bearerToken = 'Bearer ...';
const iotwhiApiClient = new IoTWHIApiClient(iotwhiApiHost, iotwhiApiPath, tenantId, bearerToken);

const myShieldId = 'sh_qod5rebg';
const desiredRole = 'administrator';

iotwhiApiClient.findRecord('shield', myShieldId, desiredRole)
  .then((myShield) => {
    console.log(myShield);
  });
```

# Contributing
The client code is in the lib folder and the tests are in the test folder.

- `npm install` - install the dependencies
- `npm run test` - run the tests once



# IoT Worker and Home Insights APIs
The API documentation can be found [here](https://iotworkerinsights.ibm.com/docs/).
