// This file has been autogenerated.

var profile = require('../../../lib/util/profile');

exports.getMockedProfile = function () {
  var newProfile = new profile.Profile();

  newProfile.addSubscription(new profile.Subscription({
    id: 'bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948',
    name: 'CollaberaInteropTest',
    user: {
      name: 'user@domain.example',
      type: 'user'
    },
    tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
    state: 'Enabled',
    registeredProviders: [],
    isDefault: true
  }, newProfile.environments['AzureCloud']));

  return newProfile;
};

exports.setEnvironment = function() {
  process.env['AZURE_VM_TEST_LOCATION'] = 'eastus';
};

exports.scopes = [[function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGExpressRoute?api-version=2014-04-01-preview')
  .reply(404, "{\"error\":{\"code\":\"ResourceGroupNotFound\",\"message\":\"Resource group 'xplatTestGExpressRoute' could not be found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-ratelimit-remaining-subscription-reads': '14913',
  'x-ms-request-id': '74b5cfe7-ac2b-43d3-8510-8553b5ed9ff1',
  'x-ms-correlation-request-id': '74b5cfe7-ac2b-43d3-8510-8553b5ed9ff1',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113543Z:74b5cfe7-ac2b-43d3-8510-8553b5ed9ff1',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:35:43 GMT',
  connection: 'close',
  'content-length': '114' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGExpressRoute?api-version=2014-04-01-preview')
  .reply(404, "{\"error\":{\"code\":\"ResourceGroupNotFound\",\"message\":\"Resource group 'xplatTestGExpressRoute' could not be found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-ratelimit-remaining-subscription-reads': '14913',
  'x-ms-request-id': '74b5cfe7-ac2b-43d3-8510-8553b5ed9ff1',
  'x-ms-correlation-request-id': '74b5cfe7-ac2b-43d3-8510-8553b5ed9ff1',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113543Z:74b5cfe7-ac2b-43d3-8510-8553b5ed9ff1',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:35:43 GMT',
  connection: 'close',
  'content-length': '114' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGExpressRoute?api-version=2014-04-01-preview', '*')
  .reply(201, "{\"id\":\"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute\",\"name\":\"xplatTestGExpressRoute\",\"location\":\"eastus\",\"tags\":{},\"properties\":{\"provisioningState\":\"Succeeded\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '207',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-ratelimit-remaining-subscription-writes': '1167',
  'x-ms-request-id': '83f91fa8-7c53-4f67-a24e-84493daec25b',
  'x-ms-correlation-request-id': '83f91fa8-7c53-4f67-a24e-84493daec25b',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113547Z:83f91fa8-7c53-4f67-a24e-84493daec25b',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:35:46 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGExpressRoute?api-version=2014-04-01-preview', '*')
  .reply(201, "{\"id\":\"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute\",\"name\":\"xplatTestGExpressRoute\",\"location\":\"eastus\",\"tags\":{},\"properties\":{\"provisioningState\":\"Succeeded\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '207',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-ratelimit-remaining-subscription-writes': '1167',
  'x-ms-request-id': '83f91fa8-7c53-4f67-a24e-84493daec25b',
  'x-ms-correlation-request-id': '83f91fa8-7c53-4f67-a24e-84493daec25b',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113547Z:83f91fa8-7c53-4f67-a24e-84493daec25b',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:35:46 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute/?api-version=2015-06-15')
  .reply(404, "{\"error\":{\"code\":\"ResourceNotFound\",\"message\":\"The Resource 'Microsoft.Network/expressRouteCircuits/xplatExpressRoute' under resource group 'xplatTestGExpressRoute' was not found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-request-id': '5486e231-bb41-4c13-8aff-f18ea5bccce1',
  'x-ms-correlation-request-id': '5486e231-bb41-4c13-8aff-f18ea5bccce1',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113548Z:5486e231-bb41-4c13-8aff-f18ea5bccce1',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:35:48 GMT',
  connection: 'close',
  'content-length': '182' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute/?api-version=2015-06-15')
  .reply(404, "{\"error\":{\"code\":\"ResourceNotFound\",\"message\":\"The Resource 'Microsoft.Network/expressRouteCircuits/xplatExpressRoute' under resource group 'xplatTestGExpressRoute' was not found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-request-id': '5486e231-bb41-4c13-8aff-f18ea5bccce1',
  'x-ms-correlation-request-id': '5486e231-bb41-4c13-8aff-f18ea5bccce1',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113548Z:5486e231-bb41-4c13-8aff-f18ea5bccce1',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:35:48 GMT',
  connection: 'close',
  'content-length': '182' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute/?api-version=2015-06-15', '*')
  .reply(201, "{\r\n  \"name\": \"xplatExpressRoute\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute\",\r\n  \"etag\": \"W/\\\"9ebf561f-e404-4c54-9d0f-41106b669e73\\\"\",\r\n  \"type\": \"Microsoft.Network/expressRouteCircuits\",\r\n  \"location\": \"eastus\",\r\n  \"tags\": {\r\n    \"tag1\": \"val1\"\r\n  },\r\n  \"properties\": {\r\n    \"provisioningState\": \"Updating\",\r\n    \"resourceGuid\": \"e9969d42-ab4f-4a82-8edf-10e3ecfa6fff\",\r\n    \"peerings\": [],\r\n    \"authorizations\": [],\r\n    \"serviceProviderProperties\": {\r\n      \"serviceProviderName\": \"InterCloud\",\r\n      \"peeringLocation\": \"London\",\r\n      \"bandwidthInMbps\": 50\r\n    },\r\n    \"circuitProvisioningState\": \"Disabled\",\r\n    \"serviceKey\": \"00000000-0000-0000-0000-000000000000\",\r\n    \"serviceProviderProvisioningState\": \"NotProvisioned\"\r\n  },\r\n  \"sku\": {\r\n    \"name\": \"Standard_MeteredData\",\r\n    \"tier\": \"Standard\",\r\n    \"family\": \"MeteredData\"\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '974',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'retry-after': '10',
  'x-ms-request-id': 'b6039922-ad5d-4196-ad51-c7448987990d',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/b6039922-ad5d-4196-ad51-c7448987990d?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1166',
  'x-ms-correlation-request-id': '726ef5e9-b490-4e64-ac8c-7cd6d314e637',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113554Z:726ef5e9-b490-4e64-ac8c-7cd6d314e637',
  date: 'Tue, 29 Dec 2015 11:35:53 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute/?api-version=2015-06-15', '*')
  .reply(201, "{\r\n  \"name\": \"xplatExpressRoute\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute\",\r\n  \"etag\": \"W/\\\"9ebf561f-e404-4c54-9d0f-41106b669e73\\\"\",\r\n  \"type\": \"Microsoft.Network/expressRouteCircuits\",\r\n  \"location\": \"eastus\",\r\n  \"tags\": {\r\n    \"tag1\": \"val1\"\r\n  },\r\n  \"properties\": {\r\n    \"provisioningState\": \"Updating\",\r\n    \"resourceGuid\": \"e9969d42-ab4f-4a82-8edf-10e3ecfa6fff\",\r\n    \"peerings\": [],\r\n    \"authorizations\": [],\r\n    \"serviceProviderProperties\": {\r\n      \"serviceProviderName\": \"InterCloud\",\r\n      \"peeringLocation\": \"London\",\r\n      \"bandwidthInMbps\": 50\r\n    },\r\n    \"circuitProvisioningState\": \"Disabled\",\r\n    \"serviceKey\": \"00000000-0000-0000-0000-000000000000\",\r\n    \"serviceProviderProvisioningState\": \"NotProvisioned\"\r\n  },\r\n  \"sku\": {\r\n    \"name\": \"Standard_MeteredData\",\r\n    \"tier\": \"Standard\",\r\n    \"family\": \"MeteredData\"\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '974',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'retry-after': '10',
  'x-ms-request-id': 'b6039922-ad5d-4196-ad51-c7448987990d',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/b6039922-ad5d-4196-ad51-c7448987990d?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1166',
  'x-ms-correlation-request-id': '726ef5e9-b490-4e64-ac8c-7cd6d314e637',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113554Z:726ef5e9-b490-4e64-ac8c-7cd6d314e637',
  date: 'Tue, 29 Dec 2015 11:35:53 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/b6039922-ad5d-4196-ad51-c7448987990d?api-version=2015-06-15')
  .reply(200, "{\r\n  \"status\": \"InProgress\"\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '30',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': '5bc0b357-8cae-400f-b167-a8feca942aeb',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14904',
  'x-ms-correlation-request-id': '2904a56c-f3cf-49b1-8793-bb9a28f0cbc7',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113605Z:2904a56c-f3cf-49b1-8793-bb9a28f0cbc7',
  date: 'Tue, 29 Dec 2015 11:36:05 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/b6039922-ad5d-4196-ad51-c7448987990d?api-version=2015-06-15')
  .reply(200, "{\r\n  \"status\": \"InProgress\"\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '30',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': '5bc0b357-8cae-400f-b167-a8feca942aeb',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14904',
  'x-ms-correlation-request-id': '2904a56c-f3cf-49b1-8793-bb9a28f0cbc7',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113605Z:2904a56c-f3cf-49b1-8793-bb9a28f0cbc7',
  date: 'Tue, 29 Dec 2015 11:36:05 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/b6039922-ad5d-4196-ad51-c7448987990d?api-version=2015-06-15')
  .reply(200, "{\r\n  \"status\": \"Succeeded\"\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '29',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': '021fa8a4-3fa5-455f-a741-d6683c8fe6e0',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14912',
  'x-ms-correlation-request-id': '31222ae3-a6f4-4563-b102-084cf31e6084',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113637Z:31222ae3-a6f4-4563-b102-084cf31e6084',
  date: 'Tue, 29 Dec 2015 11:36:37 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/b6039922-ad5d-4196-ad51-c7448987990d?api-version=2015-06-15')
  .reply(200, "{\r\n  \"status\": \"Succeeded\"\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '29',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': '021fa8a4-3fa5-455f-a741-d6683c8fe6e0',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14912',
  'x-ms-correlation-request-id': '31222ae3-a6f4-4563-b102-084cf31e6084',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113637Z:31222ae3-a6f4-4563-b102-084cf31e6084',
  date: 'Tue, 29 Dec 2015 11:36:37 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute/?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"xplatExpressRoute\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute\",\r\n  \"etag\": \"W/\\\"d677b1b8-5e7b-48b9-b21e-6dd910dc2f4a\\\"\",\r\n  \"type\": \"Microsoft.Network/expressRouteCircuits\",\r\n  \"location\": \"eastus\",\r\n  \"tags\": {\r\n    \"tag1\": \"val1\"\r\n  },\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"e9969d42-ab4f-4a82-8edf-10e3ecfa6fff\",\r\n    \"peerings\": [],\r\n    \"authorizations\": [],\r\n    \"serviceProviderProperties\": {\r\n      \"serviceProviderName\": \"InterCloud\",\r\n      \"peeringLocation\": \"London\",\r\n      \"bandwidthInMbps\": 50\r\n    },\r\n    \"circuitProvisioningState\": \"Enabled\",\r\n    \"serviceKey\": \"b04f921c-df18-460c-81e9-b9bd7b45d11a\",\r\n    \"serviceProviderProvisioningState\": \"NotProvisioned\"\r\n  },\r\n  \"sku\": {\r\n    \"name\": \"Standard_MeteredData\",\r\n    \"tier\": \"Standard\",\r\n    \"family\": \"MeteredData\"\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '974',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': '8616e51b-9837-4baf-b30b-9e2e7fd83bc4',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14903',
  'x-ms-correlation-request-id': '68b777a6-d000-428d-aec2-5c84372cf510',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113639Z:68b777a6-d000-428d-aec2-5c84372cf510',
  date: 'Tue, 29 Dec 2015 11:36:38 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute/?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"xplatExpressRoute\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGExpressRoute/providers/Microsoft.Network/expressRouteCircuits/xplatExpressRoute\",\r\n  \"etag\": \"W/\\\"d677b1b8-5e7b-48b9-b21e-6dd910dc2f4a\\\"\",\r\n  \"type\": \"Microsoft.Network/expressRouteCircuits\",\r\n  \"location\": \"eastus\",\r\n  \"tags\": {\r\n    \"tag1\": \"val1\"\r\n  },\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"e9969d42-ab4f-4a82-8edf-10e3ecfa6fff\",\r\n    \"peerings\": [],\r\n    \"authorizations\": [],\r\n    \"serviceProviderProperties\": {\r\n      \"serviceProviderName\": \"InterCloud\",\r\n      \"peeringLocation\": \"London\",\r\n      \"bandwidthInMbps\": 50\r\n    },\r\n    \"circuitProvisioningState\": \"Enabled\",\r\n    \"serviceKey\": \"b04f921c-df18-460c-81e9-b9bd7b45d11a\",\r\n    \"serviceProviderProvisioningState\": \"NotProvisioned\"\r\n  },\r\n  \"sku\": {\r\n    \"name\": \"Standard_MeteredData\",\r\n    \"tier\": \"Standard\",\r\n    \"family\": \"MeteredData\"\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '974',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': '8616e51b-9837-4baf-b30b-9e2e7fd83bc4',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14903',
  'x-ms-correlation-request-id': '68b777a6-d000-428d-aec2-5c84372cf510',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T113639Z:68b777a6-d000-428d-aec2-5c84372cf510',
  date: 'Tue, 29 Dec 2015 11:36:38 GMT',
  connection: 'close' });
 return result; }]];