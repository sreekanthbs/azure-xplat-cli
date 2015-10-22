/**
 * Copyright (c) Microsoft.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var should = require('should');
var util = require('util');
var CLITest = require('../../../framework/arm-cli-test');
var testUtils = require('../../../util/util');
var testprefix = 'arm-cli-vm-image-list-tests';
var validPublisher = 'MicrosoftSQLServer';
var extPublisher = 'Microsoft.Compute';
var requiredEnvironment = [{
  name: 'AZURE_VM_TEST_LOCATION',
  defaultValue: 'eastus'
}];

var location, publisher, offer, sku, type, version;
var hasValue = false;
describe('arm', function() {
  describe('compute', function() {
    var suite, retry = 5;
    testUtils.TIMEOUT_INTERVAL = 5000;

    before(function(done) {
      suite = new CLITest(this, testprefix, requiredEnvironment);
      suite.setupSuite(function() {
        location = process.env.AZURE_VM_TEST_LOCATION;
        done();
      });
    });

    after(function(done) {

      suite.teardownSuite(done);

    });
    beforeEach(function(done) {

      suite.setupTest(done);
    });
    afterEach(function(done) {
      suite.teardownTest(done);
    });

    describe('vm', function() {
      it('image list-publishers ', function(done) {
        var cmd = util.format('vm image list-publishers %s --json', location).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          var allResources = JSON.parse(result.text);
          allResources.some(function(res) {
            publisher = res.name;
            return res.name === validPublisher;
          }).should.be.true;
          done();
        });
      });
      it('image list-offers ', function(done) {
        var cmd = util.format('vm image list-offers %s %s --json', location, publisher).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          var allResources = JSON.parse(result.text);
          offer = allResources[0].name;
          done();
        });
      });
      it('image list-skus ', function(done) {
        var cmd = util.format('vm image list-skus %s %s %s --json', location, publisher, offer).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          var allResources = JSON.parse(result.text);
          sku = allResources[0].name;
          done();
        });
      });
      it('image list ', function(done) {
        var cmd = util.format('vm image list %s %s %s %s --json', location, publisher, offer, sku).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          done();
        });
      });

      it('extension list-image-publishers ', function(done) {
        var cmd = util.format('vm extension list-image-publishers %s --json', location).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          var allResources = JSON.parse(result.text);
          allResources.some(function(res) {
            publisher = res.name;
            return res.name === extPublisher;
          }).should.be.true;
          // store the publisher result, and verify it in 'list-image-types' test
          publisher = extPublisher;
          done();
        });
      });

      it('extension list-image-types ', function(done) {
        var cmd = util.format('vm extension list-image-types %s %s --json', location, publisher).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          var allResources = JSON.parse(result.text);
          // store the type result, and verify it in 'list-image-versions' test
          type = allResources[0].name;
          done();
        });
      });

      it('extension list-image-versions ', function(done) {
        var cmd = util.format('vm extension list-image-versions %s %s %s --json', location, publisher, type).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          var allResources = JSON.parse(result.text);
          // store the version result, and verify it in 'get-image' test
          version = allResources[0].name;
          done();
        });
      });

      it('extension get-image ', function(done) {
        var cmd = util.format('vm extension get-image %s %s %s %s --json', location, publisher, type, version).split(' ');
        testUtils.executeCommand(suite, retry, cmd, function(result) {
          result.exitStatus.should.equal(0);
          done();
        });
      });
    });


  });
});