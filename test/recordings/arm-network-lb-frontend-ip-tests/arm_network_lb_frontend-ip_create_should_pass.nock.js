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
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGCreateFronIp?api-version=2014-04-01-preview')
  .reply(404, "{\"error\":{\"code\":\"ResourceGroupNotFound\",\"message\":\"Resource group 'xplatTestGCreateFronIp' could not be found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-ratelimit-remaining-subscription-reads': '14906',
  'x-ms-request-id': 'f631c381-8f6b-47c9-b025-2729a37a5f73',
  'x-ms-correlation-request-id': 'f631c381-8f6b-47c9-b025-2729a37a5f73',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112255Z:f631c381-8f6b-47c9-b025-2729a37a5f73',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:22:54 GMT',
  connection: 'close',
  'content-length': '114' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGCreateFronIp?api-version=2014-04-01-preview')
  .reply(404, "{\"error\":{\"code\":\"ResourceGroupNotFound\",\"message\":\"Resource group 'xplatTestGCreateFronIp' could not be found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-ratelimit-remaining-subscription-reads': '14906',
  'x-ms-request-id': 'f631c381-8f6b-47c9-b025-2729a37a5f73',
  'x-ms-correlation-request-id': 'f631c381-8f6b-47c9-b025-2729a37a5f73',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112255Z:f631c381-8f6b-47c9-b025-2729a37a5f73',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:22:54 GMT',
  connection: 'close',
  'content-length': '114' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGCreateFronIp?api-version=2014-04-01-preview', '*')
  .reply(201, "{\"id\":\"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp\",\"name\":\"xplatTestGCreateFronIp\",\"location\":\"eastus\",\"tags\":{},\"properties\":{\"provisioningState\":\"Succeeded\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '207',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-ratelimit-remaining-subscription-writes': '1168',
  'x-ms-request-id': '141c01dd-da2e-4af6-adbf-6ebf777e107c',
  'x-ms-correlation-request-id': '141c01dd-da2e-4af6-adbf-6ebf777e107c',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112257Z:141c01dd-da2e-4af6-adbf-6ebf777e107c',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:22:56 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourcegroups/xplatTestGCreateFronIp?api-version=2014-04-01-preview', '*')
  .reply(201, "{\"id\":\"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp\",\"name\":\"xplatTestGCreateFronIp\",\"location\":\"eastus\",\"tags\":{},\"properties\":{\"provisioningState\":\"Succeeded\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '207',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-ratelimit-remaining-subscription-writes': '1168',
  'x-ms-request-id': '141c01dd-da2e-4af6-adbf-6ebf777e107c',
  'x-ms-correlation-request-id': '141c01dd-da2e-4af6-adbf-6ebf777e107c',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112257Z:141c01dd-da2e-4af6-adbf-6ebf777e107c',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:22:56 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15')
  .reply(404, "{\"error\":{\"code\":\"ResourceNotFound\",\"message\":\"The Resource 'Microsoft.Network/publicIPAddresses/xplatTestIp' under resource group 'xplatTestGCreateFronIp' was not found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-request-id': 'd4de15b4-14bb-4ef1-b41d-d097d781f074',
  'x-ms-correlation-request-id': 'd4de15b4-14bb-4ef1-b41d-d097d781f074',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112257Z:d4de15b4-14bb-4ef1-b41d-d097d781f074',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:22:57 GMT',
  connection: 'close',
  'content-length': '173' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15')
  .reply(404, "{\"error\":{\"code\":\"ResourceNotFound\",\"message\":\"The Resource 'Microsoft.Network/publicIPAddresses/xplatTestIp' under resource group 'xplatTestGCreateFronIp' was not found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-request-id': 'd4de15b4-14bb-4ef1-b41d-d097d781f074',
  'x-ms-correlation-request-id': 'd4de15b4-14bb-4ef1-b41d-d097d781f074',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112257Z:d4de15b4-14bb-4ef1-b41d-d097d781f074',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:22:57 GMT',
  connection: 'close',
  'content-length': '173' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15', '*')
  .reply(201, "{\r\n  \"name\": \"xplatTestIp\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\",\r\n  \"etag\": \"W/\\\"78e5398e-80b4-407f-b787-456d1ec6c905\\\"\",\r\n  \"type\": \"Microsoft.Network/publicIPAddresses\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Updating\",\r\n    \"resourceGuid\": \"337e7282-9152-43ec-841c-95fe87031718\",\r\n    \"publicIPAllocationMethod\": \"Dynamic\",\r\n    \"idleTimeoutInMinutes\": 4\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '520',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'retry-after': '10',
  'x-ms-request-id': '8ea28a66-53c7-4dde-ad98-0869a67e52a2',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/8ea28a66-53c7-4dde-ad98-0869a67e52a2?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1161',
  'x-ms-correlation-request-id': '6c5e2b17-f0f6-4e33-8a1c-c6ffabaf3c45',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112303Z:6c5e2b17-f0f6-4e33-8a1c-c6ffabaf3c45',
  date: 'Tue, 29 Dec 2015 11:23:03 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15', '*')
  .reply(201, "{\r\n  \"name\": \"xplatTestIp\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\",\r\n  \"etag\": \"W/\\\"78e5398e-80b4-407f-b787-456d1ec6c905\\\"\",\r\n  \"type\": \"Microsoft.Network/publicIPAddresses\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Updating\",\r\n    \"resourceGuid\": \"337e7282-9152-43ec-841c-95fe87031718\",\r\n    \"publicIPAllocationMethod\": \"Dynamic\",\r\n    \"idleTimeoutInMinutes\": 4\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '520',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'retry-after': '10',
  'x-ms-request-id': '8ea28a66-53c7-4dde-ad98-0869a67e52a2',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/8ea28a66-53c7-4dde-ad98-0869a67e52a2?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1161',
  'x-ms-correlation-request-id': '6c5e2b17-f0f6-4e33-8a1c-c6ffabaf3c45',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112303Z:6c5e2b17-f0f6-4e33-8a1c-c6ffabaf3c45',
  date: 'Tue, 29 Dec 2015 11:23:03 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/8ea28a66-53c7-4dde-ad98-0869a67e52a2?api-version=2015-06-15')
  .reply(200, "{\r\n  \"status\": \"Succeeded\"\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '29',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': 'f223feeb-6609-4dee-ad61-f37f9eac1392',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14922',
  'x-ms-correlation-request-id': 'e3271416-1dfd-450c-9951-2dc5ad2fcca2',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112314Z:e3271416-1dfd-450c-9951-2dc5ad2fcca2',
  date: 'Tue, 29 Dec 2015 11:23:14 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/8ea28a66-53c7-4dde-ad98-0869a67e52a2?api-version=2015-06-15')
  .reply(200, "{\r\n  \"status\": \"Succeeded\"\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '29',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': 'f223feeb-6609-4dee-ad61-f37f9eac1392',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14922',
  'x-ms-correlation-request-id': 'e3271416-1dfd-450c-9951-2dc5ad2fcca2',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112314Z:e3271416-1dfd-450c-9951-2dc5ad2fcca2',
  date: 'Tue, 29 Dec 2015 11:23:14 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"xplatTestIp\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\",\r\n  \"etag\": \"W/\\\"c31c36d3-e6a7-4118-8213-d3d1c8bd1814\\\"\",\r\n  \"type\": \"Microsoft.Network/publicIPAddresses\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"337e7282-9152-43ec-841c-95fe87031718\",\r\n    \"publicIPAllocationMethod\": \"Dynamic\",\r\n    \"idleTimeoutInMinutes\": 4\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '521',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  etag: 'W/"c31c36d3-e6a7-4118-8213-d3d1c8bd1814"',
  'x-ms-request-id': 'be124b24-20d7-4f68-b482-a8aabcf5814e',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14921',
  'x-ms-correlation-request-id': '2e1e24c2-d1e5-489c-aba6-d48f48ec55b1',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112316Z:2e1e24c2-d1e5-489c-aba6-d48f48ec55b1',
  date: 'Tue, 29 Dec 2015 11:23:15 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"xplatTestIp\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\",\r\n  \"etag\": \"W/\\\"c31c36d3-e6a7-4118-8213-d3d1c8bd1814\\\"\",\r\n  \"type\": \"Microsoft.Network/publicIPAddresses\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"337e7282-9152-43ec-841c-95fe87031718\",\r\n    \"publicIPAllocationMethod\": \"Dynamic\",\r\n    \"idleTimeoutInMinutes\": 4\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '521',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  etag: 'W/"c31c36d3-e6a7-4118-8213-d3d1c8bd1814"',
  'x-ms-request-id': 'be124b24-20d7-4f68-b482-a8aabcf5814e',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14921',
  'x-ms-correlation-request-id': '2e1e24c2-d1e5-489c-aba6-d48f48ec55b1',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112316Z:2e1e24c2-d1e5-489c-aba6-d48f48ec55b1',
  date: 'Tue, 29 Dec 2015 11:23:15 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"xplatTestIp\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\",\r\n  \"etag\": \"W/\\\"c31c36d3-e6a7-4118-8213-d3d1c8bd1814\\\"\",\r\n  \"type\": \"Microsoft.Network/publicIPAddresses\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"337e7282-9152-43ec-841c-95fe87031718\",\r\n    \"publicIPAllocationMethod\": \"Dynamic\",\r\n    \"idleTimeoutInMinutes\": 4\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '521',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  etag: 'W/"c31c36d3-e6a7-4118-8213-d3d1c8bd1814"',
  'x-ms-request-id': '3cfa08d2-1c68-405e-aff0-a67f61a7b42d',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14920',
  'x-ms-correlation-request-id': 'a11c4ee6-bfd7-44bf-b6cd-919133e76767',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112318Z:a11c4ee6-bfd7-44bf-b6cd-919133e76767',
  date: 'Tue, 29 Dec 2015 11:23:17 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp/?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"xplatTestIp\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\",\r\n  \"etag\": \"W/\\\"c31c36d3-e6a7-4118-8213-d3d1c8bd1814\\\"\",\r\n  \"type\": \"Microsoft.Network/publicIPAddresses\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"337e7282-9152-43ec-841c-95fe87031718\",\r\n    \"publicIPAllocationMethod\": \"Dynamic\",\r\n    \"idleTimeoutInMinutes\": 4\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '521',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  etag: 'W/"c31c36d3-e6a7-4118-8213-d3d1c8bd1814"',
  'x-ms-request-id': '3cfa08d2-1c68-405e-aff0-a67f61a7b42d',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14920',
  'x-ms-correlation-request-id': 'a11c4ee6-bfd7-44bf-b6cd-919133e76767',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112318Z:a11c4ee6-bfd7-44bf-b6cd-919133e76767',
  date: 'Tue, 29 Dec 2015 11:23:17 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15')
  .reply(404, "{\"error\":{\"code\":\"ResourceNotFound\",\"message\":\"The Resource 'Microsoft.Network/loadBalancers/armEmptyLB' under resource group 'xplatTestGCreateFronIp' was not found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-request-id': 'b27d7233-14bc-454a-ae77-3b34817bad40',
  'x-ms-correlation-request-id': 'b27d7233-14bc-454a-ae77-3b34817bad40',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112319Z:b27d7233-14bc-454a-ae77-3b34817bad40',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:23:19 GMT',
  connection: 'close',
  'content-length': '168' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15')
  .reply(404, "{\"error\":{\"code\":\"ResourceNotFound\",\"message\":\"The Resource 'Microsoft.Network/loadBalancers/armEmptyLB' under resource group 'xplatTestGCreateFronIp' was not found.\"}}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-failure-cause': 'gateway',
  'x-ms-request-id': 'b27d7233-14bc-454a-ae77-3b34817bad40',
  'x-ms-correlation-request-id': 'b27d7233-14bc-454a-ae77-3b34817bad40',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112319Z:b27d7233-14bc-454a-ae77-3b34817bad40',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  date: 'Tue, 29 Dec 2015 11:23:19 GMT',
  connection: 'close',
  'content-length': '168' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15', '*')
  .reply(201, "{\r\n  \"name\": \"armEmptyLB\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB\",\r\n  \"etag\": \"W/\\\"675432a6-00f0-4182-8fd7-cc1a7edeb3a2\\\"\",\r\n  \"type\": \"Microsoft.Network/loadBalancers\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"801cfbbc-9746-403a-becd-24a5967f2042\",\r\n    \"frontendIPConfigurations\": [],\r\n    \"backendAddressPools\": [],\r\n    \"loadBalancingRules\": [],\r\n    \"probes\": [],\r\n    \"inboundNatRules\": [],\r\n    \"outboundNatRules\": [],\r\n    \"inboundNatPools\": []\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '639',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': 'c8a1ed2a-db9d-49c5-9185-2065a11d346d',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/c8a1ed2a-db9d-49c5-9185-2065a11d346d?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1168',
  'x-ms-correlation-request-id': '2c089bc6-5da6-48d4-8258-4a8e2754d1c3',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112326Z:2c089bc6-5da6-48d4-8258-4a8e2754d1c3',
  date: 'Tue, 29 Dec 2015 11:23:26 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15', '*')
  .reply(201, "{\r\n  \"name\": \"armEmptyLB\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB\",\r\n  \"etag\": \"W/\\\"675432a6-00f0-4182-8fd7-cc1a7edeb3a2\\\"\",\r\n  \"type\": \"Microsoft.Network/loadBalancers\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"801cfbbc-9746-403a-becd-24a5967f2042\",\r\n    \"frontendIPConfigurations\": [],\r\n    \"backendAddressPools\": [],\r\n    \"loadBalancingRules\": [],\r\n    \"probes\": [],\r\n    \"inboundNatRules\": [],\r\n    \"outboundNatRules\": [],\r\n    \"inboundNatPools\": []\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '639',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': 'c8a1ed2a-db9d-49c5-9185-2065a11d346d',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/c8a1ed2a-db9d-49c5-9185-2065a11d346d?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1168',
  'x-ms-correlation-request-id': '2c089bc6-5da6-48d4-8258-4a8e2754d1c3',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112326Z:2c089bc6-5da6-48d4-8258-4a8e2754d1c3',
  date: 'Tue, 29 Dec 2015 11:23:26 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"armEmptyLB\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB\",\r\n  \"etag\": \"W/\\\"675432a6-00f0-4182-8fd7-cc1a7edeb3a2\\\"\",\r\n  \"type\": \"Microsoft.Network/loadBalancers\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"801cfbbc-9746-403a-becd-24a5967f2042\",\r\n    \"frontendIPConfigurations\": [],\r\n    \"backendAddressPools\": [],\r\n    \"loadBalancingRules\": [],\r\n    \"probes\": [],\r\n    \"inboundNatRules\": [],\r\n    \"outboundNatRules\": [],\r\n    \"inboundNatPools\": []\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '639',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  etag: 'W/"675432a6-00f0-4182-8fd7-cc1a7edeb3a2"',
  'x-ms-request-id': '216e8420-1566-46ea-9553-3a27860682b5',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14912',
  'x-ms-correlation-request-id': '5e53a494-e943-495b-982d-57a5f038e167',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112328Z:5e53a494-e943-495b-982d-57a5f038e167',
  date: 'Tue, 29 Dec 2015 11:23:28 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .get('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15')
  .reply(200, "{\r\n  \"name\": \"armEmptyLB\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB\",\r\n  \"etag\": \"W/\\\"675432a6-00f0-4182-8fd7-cc1a7edeb3a2\\\"\",\r\n  \"type\": \"Microsoft.Network/loadBalancers\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"801cfbbc-9746-403a-becd-24a5967f2042\",\r\n    \"frontendIPConfigurations\": [],\r\n    \"backendAddressPools\": [],\r\n    \"loadBalancingRules\": [],\r\n    \"probes\": [],\r\n    \"inboundNatRules\": [],\r\n    \"outboundNatRules\": [],\r\n    \"inboundNatPools\": []\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '639',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  etag: 'W/"675432a6-00f0-4182-8fd7-cc1a7edeb3a2"',
  'x-ms-request-id': '216e8420-1566-46ea-9553-3a27860682b5',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-reads': '14912',
  'x-ms-correlation-request-id': '5e53a494-e943-495b-982d-57a5f038e167',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112328Z:5e53a494-e943-495b-982d-57a5f038e167',
  date: 'Tue, 29 Dec 2015 11:23:28 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('http://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15', '*')
  .reply(200, "{\r\n  \"name\": \"armEmptyLB\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB\",\r\n  \"etag\": \"W/\\\"9eaa0aae-369e-4f46-ac87-f8b5ded8e0be\\\"\",\r\n  \"type\": \"Microsoft.Network/loadBalancers\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"801cfbbc-9746-403a-becd-24a5967f2042\",\r\n    \"frontendIPConfigurations\": [\r\n      {\r\n        \"name\": \"xplattestFrontendIpName\",\r\n        \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB/frontendIPConfigurations/xplattestFrontendIpName\",\r\n        \"etag\": \"W/\\\"9eaa0aae-369e-4f46-ac87-f8b5ded8e0be\\\"\",\r\n        \"properties\": {\r\n          \"provisioningState\": \"Succeeded\",\r\n          \"privateIPAllocationMethod\": \"Dynamic\",\r\n          \"publicIPAddress\": {\r\n            \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\"\r\n          }\r\n        }\r\n      }\r\n    ],\r\n    \"backendAddressPools\": [],\r\n    \"loadBalancingRules\": [],\r\n    \"probes\": [],\r\n    \"inboundNatRules\": [],\r\n    \"outboundNatRules\": [],\r\n    \"inboundNatPools\": []\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '1326',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': 'd2a8084c-5ad2-4472-9c54-e0bf0137e267',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/d2a8084c-5ad2-4472-9c54-e0bf0137e267?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1167',
  'x-ms-correlation-request-id': '947a0f3b-c274-43a1-9b25-dc6ec1b8ddd9',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112330Z:947a0f3b-c274-43a1-9b25-dc6ec1b8ddd9',
  date: 'Tue, 29 Dec 2015 11:23:30 GMT',
  connection: 'close' });
 return result; },
function (nock) { 
var result = 
nock('https://management.azure.com:443')
  .filteringRequestBody(function (path) { return '*';})
.put('/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB?api-version=2015-06-15', '*')
  .reply(200, "{\r\n  \"name\": \"armEmptyLB\",\r\n  \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB\",\r\n  \"etag\": \"W/\\\"9eaa0aae-369e-4f46-ac87-f8b5ded8e0be\\\"\",\r\n  \"type\": \"Microsoft.Network/loadBalancers\",\r\n  \"location\": \"eastus\",\r\n  \"properties\": {\r\n    \"provisioningState\": \"Succeeded\",\r\n    \"resourceGuid\": \"801cfbbc-9746-403a-becd-24a5967f2042\",\r\n    \"frontendIPConfigurations\": [\r\n      {\r\n        \"name\": \"xplattestFrontendIpName\",\r\n        \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/loadBalancers/armEmptyLB/frontendIPConfigurations/xplattestFrontendIpName\",\r\n        \"etag\": \"W/\\\"9eaa0aae-369e-4f46-ac87-f8b5ded8e0be\\\"\",\r\n        \"properties\": {\r\n          \"provisioningState\": \"Succeeded\",\r\n          \"privateIPAllocationMethod\": \"Dynamic\",\r\n          \"publicIPAddress\": {\r\n            \"id\": \"/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/resourceGroups/xplatTestGCreateFronIp/providers/Microsoft.Network/publicIPAddresses/xplatTestIp\"\r\n          }\r\n        }\r\n      }\r\n    ],\r\n    \"backendAddressPools\": [],\r\n    \"loadBalancingRules\": [],\r\n    \"probes\": [],\r\n    \"inboundNatRules\": [],\r\n    \"outboundNatRules\": [],\r\n    \"inboundNatPools\": []\r\n  }\r\n}", { 'cache-control': 'no-cache',
  pragma: 'no-cache',
  'content-length': '1326',
  'content-type': 'application/json; charset=utf-8',
  expires: '-1',
  'x-ms-request-id': 'd2a8084c-5ad2-4472-9c54-e0bf0137e267',
  'azure-asyncoperation': 'https://management.azure.com/subscriptions/bfb5e0bf-124b-4d0c-9352-7c0a9f4d9948/providers/Microsoft.Network/locations/eastus/operations/d2a8084c-5ad2-4472-9c54-e0bf0137e267?api-version=2015-06-15',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  server: 'Microsoft-HTTPAPI/2.0, Microsoft-HTTPAPI/2.0',
  'x-ms-ratelimit-remaining-subscription-writes': '1167',
  'x-ms-correlation-request-id': '947a0f3b-c274-43a1-9b25-dc6ec1b8ddd9',
  'x-ms-routing-request-id': 'WESTINDIA:20151229T112330Z:947a0f3b-c274-43a1-9b25-dc6ec1b8ddd9',
  date: 'Tue, 29 Dec 2015 11:23:30 GMT',
  connection: 'close' });
 return result; }]];