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

var __ = require('underscore');
var constants = require('./constants');
var fs = require('fs');
var moment = require('moment');
var util = require('util');
var utils = require('../../../util/utils');
var $ = utils.getLocaleString;
var recordSetUtils = require('./recordSetUtils');
var tagUtils = require('../tag/tagUtils');
var ZoneFile = require('./zoneFile');

function DnsZone(cli, dnsManagementClient) {
  this.dnsManagementClient = dnsManagementClient;
  this.zoneFile = new ZoneFile(cli.output);
  this.output = cli.output;
  this.interaction = cli.interaction;
}

__.extend(DnsZone.prototype, {

  /**
   * Zone methods
   */
  create: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    zoneName = utils.trimTrailingChar(zoneName, '.');

    var parameters = {
      zone: {
        properties: {},
        location: constants.dnsZone.defLocation
      },
      ifNoneMatch: '*'
    };

    if (options.tags) {
      parameters.zone.tags = tagUtils.buildTagsParameter(null, options);
    }

    var progress = self.interaction.progress(util.format($('Creating dns zone "%s"'), zoneName));
    try {
      self.dnsManagementClient.zones.createOrUpdate(resourceGroupName, zoneName, parameters, _);
    } finally {
      progress.end();
    }
    self.show(resourceGroupName, zoneName, options, _);
  },

  list: function (resourceGroupName, params, _) {
    var self = this;
    var progress = self.interaction.progress($('Getting the dns zones'));
    var dnsZones = null;

    try {
      dnsZones = self.dnsManagementClient.zones.list(resourceGroupName, _);
      var nextLink = dnsZones.nextLink;
      while (nextLink !== undefined) {
        self.output.silly('Following nextLink');
        var nextZones = self.dnsManagementClient.zones.listNext(nextLink, _);
        dnsZones.zones = dnsZones.zones.concat(nextZones.zones);
        nextLink = nextZones.nextLink;
      }
    } finally {
      progress.end();
    }

    self.interaction.formatOutput(dnsZones.zones, function (outputData) {
      if (outputData.length === 0) {
        self.output.warn($('No dns zones found'));
      } else {
        self.output.table(outputData, function (row, zone) {
          row.cell($('Name'), zone.name);
          row.cell($('Resource group'), resourceGroupName);
        });
      }
    });
  },

  get: function (resourceGroupName, zoneName, _) {
    var self = this;
    zoneName = utils.trimTrailingChar(zoneName, '.');
    var progress = self.interaction.progress(util.format($('Looking up the dns zone "%s"'), zoneName));
    try {
      var dnsZone = self.dnsManagementClient.zones.get(resourceGroupName, zoneName, _);
      return dnsZone.zone;
    } catch (e) {
      if (e.statusCode === 404) {
        return null;
      }
      throw e;
    } finally {
      progress.end();
    }
  },

  set: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    zoneName = utils.trimTrailingChar(zoneName, '.');
    var dnsZone = self.get(resourceGroupName, zoneName, _);
    if (!dnsZone) {
      throw new Error(util.format($('A dns zone with name "%s" not found in the resource group "%s"'), zoneName, resourceGroupName));
    }

    if (options.tags) {
      var tags = tagUtils.buildTagsParameter(null, options);
      tagUtils.appendTags(dnsZone, tags);
    }

    if (options.tags === false) {
      dnsZone.tags = {};
    }

    self.update(resourceGroupName, zoneName, dnsZone, _);
    self.show(resourceGroupName, zoneName, options, _);
  },

  show: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    zoneName = utils.trimTrailingChar(zoneName, '.');

    var dnsZone = self.get(resourceGroupName, zoneName, _);
    self.interaction.formatOutput(dnsZone, function (zone) {
      if (zone === null) {
        self.output.warn(util.format($('A dns zone with name "%s" not found in the resource group "%s"'), zoneName, resourceGroupName));
      } else {
        self.output.nameValue($('Id'), zone.id);
        self.output.nameValue($('Name'), zone.name);
        self.output.nameValue($('Type'), zone.type);
        self.output.nameValue($('Location'), zone.location);
        self.output.nameValue($('Number of record sets'), zone.properties.numberOfRecordSets);
        self.output.nameValue($('Max number of record sets'), zone.properties.maxNumberOfRecordSets);
        self.output.nameValue($('Tags'), tagUtils.getTagsInfo(zone.tags));
      }
    });
  },

  delete: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    zoneName = utils.trimTrailingChar(zoneName, '.');

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete dns zone "%s"? [y/n] '), zoneName), _)) {
      return;
    }

    var parameters = {
      ifMatch: '*'
    };

    var progress = self.interaction.progress(util.format($('Deleting dns zone "%s"'), zoneName));
    var response;
    try {
      response = self.dnsManagementClient.zones.deleteMethod(resourceGroupName, zoneName, parameters, _);
    } finally {
      progress.end();
    }

    if (response.statusCode === 204) {
      throw new Error(util.format($('A dns zone with name "%s" not found in the resource group "%s"'), zoneName, resourceGroupName));
    }
  },

  update: function (resourceGroupName, zoneName, dnsZone, _) {
    var self = this;
    zoneName = utils.trimTrailingChar(zoneName, '.');
    var progress = self.interaction.progress(util.format($('Updating dns zone "%s"'), zoneName));
    try {
      self.dnsManagementClient.zones.createOrUpdate(resourceGroupName, zoneName, {zone: dnsZone}, _);
    } catch (e) {
      throw e;
    } finally {
      progress.end();
    }
  },

  import: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    zoneName = zoneName.toLowerCase();

    if (options.debug) console.time('Time elapsed');

    var text = fs.readFileSync(options.fileName, 'utf8');
    var zfile = self.zoneFile.parse(zoneName, text);

    if (options.debug) {
      console.log(JSON.stringify(zfile, null, 2));
    }
    if (options.parseOnly) return;

    var dnsZone = self.get(resourceGroupName, zoneName, _);
    if (!dnsZone) {
      self.create(resourceGroupName, zoneName, options, _);
    }

    var totalSetsCount = zfile.sets.length;
    var importedSetsCount = 0;

    for (var i = 0; i < zfile.sets.length; i++) {
      var recordSet = zfile.sets[i];
      importedSetsCount += self.importRecordSet(resourceGroupName, zoneName, recordSet, options, _);
      self.output.info(util.format($('%d record sets of %d imported'), importedSetsCount, totalSetsCount));
    }

    if (options.debug) console.timeEnd('Time elapsed');
  },

  export: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    zoneName = zoneName.toLowerCase();
    zoneName = utils.trimTrailingChar(zoneName, '.');

    if (fs.existsSync(options.fileName)) {
      if (!options.quiet && !self.interaction.confirm(util.format($('Overwrite file "%s"? [y/n] '), options.fileName), _)) {
        return;
      }
    }

    var dnsZone = self.get(resourceGroupName, zoneName, _);
    if (!dnsZone) {
      throw new Error(util.format($('DNS zone "%s" not found in resource group "%s"'), zoneName, resourceGroupName));
    }
    var recordSets = self.dnsManagementClient.recordSets.listAll(resourceGroupName, zoneName, options, _);

    var nextLink = recordSets.nextLink;
    while (nextLink !== undefined) {
      self.output.silly('Following nextLink');
      var nextRecordSets = self.dnsManagementClient.recordSets.listNext(nextLink, _);
      recordSets.recordSets = recordSets.recordSets.concat(nextRecordSets.recordSets);
      nextLink = nextRecordSets.nextLink;
    }

    var soaRecordSet = recordSets.recordSets[0];
    var fileData = util.format($('$TTL %s \n'), soaRecordSet.properties.ttl);
    fileData += util.format($('$ORIGIN %s. \n'), zoneName);
    fileData += '; Exported zone file from Azure DNS';
    fileData += util.format($('; Resource Group Name: %s \n'), resourceGroupName);
    fileData += util.format($('; Zone name: %s \n'), zoneName);
    fileData += util.format($('; Date and time (UTC): %s \n'), new Date().toUTCString());

    fileData = self.generateRecordSetsData(fileData, recordSets);
    var progress = self.interaction.progress(util.format($('Exporting dns zone "%s" from resource group "%s"'), zoneName, resourceGroupName));
    try {
      fs.writeFileSync(options.fileName, fileData);
    } finally {
      progress.end();
    }
  },

  /**
   * Record Set methods
   */
  importRecordSet: function (resourceGroupName, zoneName, recordSet, options, _) {
    var self = this;

    var zoneSuffix = zoneName;
    if (!utils.stringEndsWith(zoneName, '.', true)) zoneSuffix += '.';

    // converting record set FQDN to relative name
    if (recordSet.name === zoneSuffix) {
      recordSet.name = '@';
    } else {
      var relativeName = recordSet.name.replace('.' + zoneSuffix, '');
      recordSet.name = relativeName;
    }
    zoneName = utils.trimTrailingChar(zoneName, '.');

    var parameters = recordSetUtils.covertToAzureFormat(recordSet);

    if (options.force) {
      parameters.ifNoneMatch = undefined;
    } else {
      parameters.ifNoneMatch = '*';
    }

    var progress = self.interaction.progress(util.format($('Importing record set "%s" of type "%s"'), recordSet.name, recordSet.type));
    var res = self.tryImportRecordSet(resourceGroupName, zoneName, recordSet.name, recordSet.type, parameters, _);
    if (res.statusCode === 412) {
      var existingSet = self.getRecordSet(resourceGroupName, zoneName, recordSet.name, recordSet.type, _);
      parameters = recordSetUtils.merge(parameters, existingSet, recordSet.type, options, self.output);
      self.tryImportRecordSet(resourceGroupName, zoneName, recordSet.name, recordSet.type, parameters, _);
    }
    progress.end();

    return 1;
  },

  tryImportRecordSet: function (resourceGroupName, zoneName, setName, setType, parameters, _) {
    var self = this;
    var res = {};
    try {
      self.dnsManagementClient.recordSets.createOrUpdate(resourceGroupName, zoneName, setName, setType, parameters, _);
      res.statusCode = 200;
    } catch (e) {
      res.statusCode = e.statusCode;
      if (e.statusCode !== 412) {
        self.output.warn(e.message);
      }
    }
    return res;
  },

  generateRecordSetsData: function (fileData, recordSets) {
    var self = this;
    var name = '';
    var indent = 0;
    recordSets.recordSets.forEach(function (item) {
      if (item.name !== name) {
        name = item.name;
        fileData += item.name;
        indent = 0;
      } else {
        indent = item.name.length;
      }

      var typeIndex = 0;
      if (!__.isEmpty(item.properties.aRecords)) {
        for (var aRecordNum in item.properties.aRecords) {
          var aRecord = item.properties.aRecords[aRecordNum];
          fileData += self._buildRecord(aRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.aaaaRecords)) {
        for (var aaaaRecordNum in item.properties.aaaaRecords) {
          var aaaaRecord = item.properties.aaaaRecords[aaaaRecordNum];
          fileData += self._buildRecord(aaaaRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.cnameRecord)) {
        var cNameRecord = item.properties.cnameRecord;
        if (!utils.stringEndsWith(cNameRecord.cname, '.', true)) cNameRecord.cname += '.';
        fileData += self._buildRecord(cNameRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.mxRecords)) {
        for (var mxRecordNum in item.properties.mxRecords) {
          var mxRecord = item.properties.mxRecords[mxRecordNum];
          if (!utils.stringEndsWith(mxRecord.exchange, '.', true)) mxRecord.exchange += '.';
          fileData += self._buildRecord(mxRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.nsRecords)) {
        for (var nsRecordNum in item.properties.nsRecords) {
          var nsRecord = item.properties.nsRecords[nsRecordNum];
          if (!utils.stringEndsWith(nsRecord.nsdname, '.', true)) nsRecord.nsdname += '.';
          fileData += self._buildRecord(nsRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.srvRecords)) {
        for (var srvRecordNum in item.properties.srvRecords) {
          var srvRecord = item.properties.srvRecords[srvRecordNum];
          if (!utils.stringEndsWith(srvRecord.target, '.', true)) srvRecord.target += '.';
          fileData += self._buildRecord(srvRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.txtRecords)) {
        for (var txtRecordNum in item.properties.txtRecords) {
          var txtRecord = item.properties.txtRecords[txtRecordNum];
          fileData += self._buildRecord(txtRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.soaRecord)) {
        var soaRecord = item.properties.soaRecord;
        if (!utils.stringEndsWith(soaRecord.host, '.', true)) soaRecord.host += '.';
        if (!utils.stringEndsWith(soaRecord.email, '.', true)) soaRecord.email += '.';
        fileData += self._buildRecord(soaRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
      }
      typeIndex++;

      if (!__.isEmpty(item.properties.ptrRecords)) {
        for (var ptrRecordNum in item.properties.ptrRecords) {
          var ptrRecord = item.properties.ptrRecords[ptrRecordNum];
          fileData += self._buildRecord(ptrRecord, constants.dnsZone.recordTypes[typeIndex], item.properties.ttl, indent);
          indent = name.length;
        }
      }
      fileData += '\n';
    });

    return fileData;
  },

  createRecordSet: function (resourceGroupName, zoneName, setName, options, _) {
    var self = this;
    var parameters = {ifNoneMatch: '*'};

    self._handleRecordSetOptions(parameters, options, true);

    var progress = self.interaction.progress(util.format($('Creating DNS record set "%s"'), setName));
    var recordSet;
    try {
      recordSet = self.dnsManagementClient.recordSets.createOrUpdate(resourceGroupName, zoneName, setName, options.type, parameters, _);
    } finally {
      progress.end();
    }
    self._showRecordSet(recordSet.recordSet);
  },

  setRecordSet: function (resourceGroupName, zoneName, setName, options, _) {
    var self = this;
    var dnsZone = self.get(resourceGroupName, zoneName, _);
    if (!dnsZone) {
      throw new Error(util.format($('A DNS zone with name "%s" not found in the resource group "%s"'), zoneName, resourceGroupName));
    }

    options.type = self._validateType(options.type);

    var existingSet = self.getRecordSet(resourceGroupName, zoneName, setName, options.type, _);
    if (!existingSet) {
      throw new Error(util.format($('A record set with name "%s" of type "%s" not found in the resource group "%s"'), setName, options.type, resourceGroupName));
    }

    self._handleRecordSetOptions(existingSet, options, false);
    recordSetUtils.removeEmptyRecords(existingSet.recordSet);

    existingSet = self.updateRecordSet(resourceGroupName, zoneName, setName, options.type, existingSet, _);
    self._showRecordSet(existingSet.recordSet);
  },

  deleteRecordSet: function (resourceGroupName, zoneName, setName, options, _) {
    var self = this;
    options.type = self._validateType(options.type);

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete DNS record set "%s"? [y/n] '), setName), _)) {
      return;
    }

    var progress = self.interaction.progress(util.format($('Deleting DNS record set "%s"'), setName));
    var result;
    try {
      result = self.dnsManagementClient.recordSets.deleteMethod(resourceGroupName, zoneName, setName, options.type, options, _);
    } finally {
      progress.end();
    }

    if (result.code === 204) {
      throw new Error(util.format($('DNS Record set "%s" of type "%s" not found in the resource group "%s"'), setName, options.type, resourceGroupName));
    }
  },

  listRecordSets: function (resourceGroupName, zoneName, options, _) {
    var self = this;
    var dnsRecords = null;

    var progress = self.interaction.progress($('Looking up the DNS Record Sets'));
    try {
      if (options.type) {
        options.type = self._validateType(options.type);
        dnsRecords = self.dnsManagementClient.recordSets.list(resourceGroupName, zoneName, options.type, options, _);
      } else {
        dnsRecords = self.dnsManagementClient.recordSets.listAll(resourceGroupName, zoneName, options, _);
      }
    } finally {
      progress.end();
    }

    var nextLink = dnsRecords.nextLink;
    while (nextLink !== undefined) {
      self.output.silly('Following nextLink');
      var nextRecordSets = self.dnsManagementClient.recordSets.listNext(nextLink, _);
      dnsRecords.recordSets = dnsRecords.recordSets.concat(nextRecordSets.recordSets);
      nextLink = nextRecordSets.nextLink;
    }

    self.interaction.formatOutput(dnsRecords.recordSets, function (outputData) {
      if (outputData.length === 0) {
        self.output.warn($('No DNS records sets found'));
      } else {
        self.output.table(outputData, function (row, recordSet) {
          row.cell($('Name'), recordSet.name);
          row.cell($('TTL'), recordSet.properties.ttl);
          row.cell($('Type'), recordSetUtils.getShortType(recordSet.id));
          row.cell($('Tags'), tagUtils.getTagsInfo(recordSet.tags) || '');
        });
      }
    });
  },

  getRecordSet: function (resourceGroupName, zoneName, setName, type, _) {
    var self = this;
    type = self._validateType(type);
    var progress = self.interaction.progress(util.format($('Looking up the DNS Record Set "%s" of type "%s"'), setName, type));
    try {
      var recordSet = self.dnsManagementClient.recordSets.get(resourceGroupName, zoneName, setName, type, _);
      return recordSet;
    } catch (e) {
      if (e.statusCode === 404) {
        return null;
      }
      throw e;
    } finally {
      progress.end();
    }
  },

  showRecordSet: function (resourceGroupName, zoneName, setName, options, _) {
    var self = this;
    options.type = self._validateType(options.type);

    var recordSet = self.getRecordSet(resourceGroupName, zoneName, setName, options.type, _);
    self.interaction.formatOutput(recordSet.recordSet, function (recordSet) {
      if (recordSet === null) {
        self.output.warn(util.format($('A DNS record with name "%s" not found in the resource group "%s"'), setName, resourceGroupName));
      } else {
        self._showRecordSet(recordSet);
      }
    });
  },

  addRecord: function (resourceGroupName, zoneName, setName, options, _) {
    var self = this;
    options.type = self._validateType(options.type);

    var dnsZone = self.get(resourceGroupName, zoneName, _);
    if (!dnsZone) {
      throw new Error(util.format($('A DNS zone with name "%s" not found in the resource group "%s"'), zoneName, resourceGroupName));
    }

    var existingSet = self.getRecordSet(resourceGroupName, zoneName, setName, options.type, _);
    if (!existingSet) {
      throw new Error(util.format($('A record set with name "%s" of type "%s" not found in the resource group "%s"'), setName, options.type, resourceGroupName));
    }

    self._handleRecordSetOptions(existingSet, options, false);
    self._handleRecordParameters(existingSet.recordSet, options, true);

    existingSet = self.updateRecordSet(resourceGroupName, zoneName, setName, options.type, existingSet, _);
    self._showRecordSet(existingSet.recordSet);
  },

  deleteRecord: function (resourceGroupName, zoneName, setName, options, _) {
    var self = this;
    options.type = self._validateType(options.type);

    var existingSet = self.getRecordSet(resourceGroupName, zoneName, setName, options.type, _);
    if (!existingSet) {
      throw new Error(util.format($('A record set with name "%s" of type "%s" not found in the resource group "%s"'), setName, options.type, resourceGroupName));
    }

    self._handleRecordParameters(existingSet.recordSet, options, false);

    if (!options.quiet && !self.interaction.confirm($('Delete DNS Record? [y/n] '), _)) {
      return;
    }

    existingSet = self.updateRecordSet(resourceGroupName, zoneName, setName, options.type, existingSet, _);
    self._showRecordSet(existingSet.recordSet);
  },

  updateRecordSet: function (resourceGroupName, zoneName, setName, setType, parameters, _) {
    var self = this;
    var progress = self.interaction.progress(util.format($('Updating record set "%s"'), setName));
    try {
      var recordSet = self.dnsManagementClient.recordSets.createOrUpdate(resourceGroupName, zoneName, setName, setType, parameters, _);
      return recordSet;
    } catch (e) {
      if (e.statusCode === 404) {
        return null;
      }
      throw e;
    } finally {
      progress.end();
    }
  },

  promptRecordParameters: function (type, options, _) {
    var self = this;
    var lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'a':
        options.ipv4Address = self.interaction.promptIfNotGiven($('IPv4 address for A record type: '), options.ipv4Address, _);
        break;
      case 'aaaa':
        options.ipv6Address = self.interaction.promptIfNotGiven($('IPv6 address for AAAA record type: '), options.ipv6Address, _);
        break;
      case 'cname':
        options.cname = self.interaction.promptIfNotGiven($('Canonical name for CNAME record type: '), options.cname, _);
        break;
      case 'mx':
        options.preference = self.interaction.promptIfNotGiven($('Preference for MX record type: '), options.preference, _);
        options.exchange = self.interaction.promptIfNotGiven($('Exchange for MX record type: '), options.exchange, _);
        break;
      case 'ns':
        options.nsdname = self.interaction.promptIfNotGiven($('Domain name for NS record type: '), options.nsdname, _);
        break;
      case 'srv':
        options.priority = self.interaction.promptIfNotGiven($('Priority for SRV record type: '), options.priority, _);
        options.weight = self.interaction.promptIfNotGiven($('Weight for SRV record type: '), options.weight, _);
        options.port = self.interaction.promptIfNotGiven($('Port for SRV record type: '), options.port, _);
        options.target = self.interaction.promptIfNotGiven($('Target for SRV record type: '), options.target, _);
        break;
      case 'soa':
        options.email = self.interaction.promptIfNotGiven($('Email for SOA record type: '), options.email, _);
        options.expireTime = self.interaction.promptIfNotGiven($('Expire time for SOA record type: '), options.expireTime, _);
        options.serialNumber = self.interaction.promptIfNotGiven($('Serial number for SOA record type: '), options.serialNumber, _);
        options.host = self.interaction.promptIfNotGiven($('Host for SOA record type: '), options.host, _);
        options.minimumTtl = self.interaction.promptIfNotGiven($('Minimum TTL for SOA record type: '), options.minimumTtl, _);
        options.refreshTime = self.interaction.promptIfNotGiven($('Refresh time for SOA record type: '), options.refreshTime, _);
        options.retryTime = self.interaction.promptIfNotGiven($('Retry time for SOA record type: '), options.retryTime, _);
        break;
      case 'txt':
        options.text = self.interaction.promptIfNotGiven($('Text for TXT record type: '), options.text, _);
        break;
      case 'ptr':
        options.ptrdName = self.interaction.promptIfNotGiven($('Ptr domain name for PTR record type: '), options.ptrdName, _);
        break;
      default:
        break;
    }
  },

  /**
   * Internal methods
   */

  _buildRecord: function (recordItem, type, ttl, indent) {
    var inClass = constants.dnsZone.recordClasses[0];
    switch (type) {
      case constants.dnsZone.recordTypes[0]:
        return util.format($(' %s%s %s %s %s \n'), utils.setIndent(indent), ttl, inClass, type, recordItem.ipv4Address);
      case constants.dnsZone.recordTypes[1]:
        return util.format($(' %s%s %s %s %s \n'), utils.setIndent(indent), ttl, inClass, type, recordItem.ipv6Address);
      case constants.dnsZone.recordTypes[2]:
        return util.format($(' %s%s %s %s %s \n'), utils.setIndent(indent), ttl, inClass, type, recordItem.cname);
      case constants.dnsZone.recordTypes[3]:
        return util.format($(' %s%s %s %s %s %s\n'), utils.setIndent(indent), ttl, inClass, type, recordItem.preference, recordItem.exchange);
      case constants.dnsZone.recordTypes[4]:
        return util.format($(' %s%s %s %s %s \n'), utils.setIndent(indent), ttl, inClass, type, recordItem.nsdname);
      case constants.dnsZone.recordTypes[5]:
        return util.format($(' %s%s %s %s %s %s %s %s\n'), utils.setIndent(indent), ttl, inClass, type, recordItem.priority,
          recordItem.weight, recordItem.port, recordItem.target);
      case constants.dnsZone.recordTypes[6]:
        return util.format($(' %s%s %s %s "%s" \n'), utils.setIndent(indent), ttl, inClass, type, recordItem.value);
      case constants.dnsZone.recordTypes[7]:
        var defaultNumber = '00';
        return util.format($(' %s%s %s %s %s %s %s %s %s %s %s'), utils.setIndent(indent), ttl, inClass, type, recordItem.host, recordItem.email,
          recordItem.serialNumber || util.format($('%s%s'), moment().format('YYYYMMDD'), defaultNumber), recordItem.refreshTime,
          recordItem.retryTime, recordItem.expireTime, recordItem.minimumTtl);
      case constants.dnsZone.recordTypes[8]:
        return util.format($('%s%s %s %s %s \n'), utils.setIndent(indent), ttl, inClass, type, recordItem.ptrdname);
      default:
        output.warn(util.format($('record "%j" type "%s" is not supported', recordItem, type)));
        return '';
    }
  },

  _handleRecordSetOptions: function (recordSet, options, useDefaults) {
    var self = this;
    options.type = self._validateType(options.type, useDefaults);

    if (recordSet.recordSet === null || recordSet.recordSet === undefined) {
      recordSet.recordSet = {
        location: constants.dnsZone.defLocation,
        properties: {}
      };
    }

    if (options.ttl) {
      var ttlAsInt = utils.parseInt(options.ttl);
      if (isNaN(ttlAsInt) || (ttlAsInt < 0)) {
        throw new Error($('--ttl value must be positive integer'));
      }
      recordSet.recordSet.properties.ttl = ttlAsInt;
    } else if (useDefaults) {
      var defTtl = constants.dnsZone.defTtl;
      self.output.warn(util.format($('using default TTL of %s seconds'), defTtl));
      recordSet.recordSet.properties.ttl = defTtl;
    }

    if (options.tags === false || !recordSet.recordSet.tags) {
      recordSet.recordSet.tags = {};
    }

    if (options.tags) {
      var tags = tagUtils.buildTagsParameter(recordSet.recordSet.tags, options);
      for (var key in tags) {
        recordSet.recordSet.tags[key] = tags[key];
      }
    }
  },

  _validateType: function (type, useDefaults) {
    var self = this;
    if (type) {
      var index = constants.dnsZone.recordTypes.indexOf(type.toUpperCase());
      if (index < 0) {
        throw new Error(util.format($('DNS Record Set type "%s" is not valid. Use -h to see valid Record Set types.'), type));
      }
    } else if (useDefaults) {
      type = constants.dnsZone.recordTypes[0];
      self.output.info(util.format($('using default type of "%s"'), type));
    } else {
      throw new Error($('--type parameter must be specified for this operation'));
    }
    return type;
  },

  _handleRecordParameters: function (recordSet, options, isAddingRecord) {
    var self = this;
    // A records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[0]) {
      if (options.ipv4Address) {
        self.output.info(util.format($('--ipv4-address parameter will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.aRecords;
    } else if (options.ipv4Address) {
      if (isAddingRecord) {
        recordSet.properties.aRecords.push({ipv4Address: options.ipv4Address});
      } else {
        var aRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.aRecords, {ipv4Address: options.ipv4Address});
        if (aRecordIndex === -1) {
          self.output.warn($('Record A not found in the record set with parameters specified.'));
        } else {
          recordSet.properties.aRecords.splice(aRecordIndex, 1);
        }
      }
    }

    // AAAA records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[1]) {
      if (options.ipv6Address) {
        self.output.info(util.format($('--ipv6-address parameter will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.aaaaRecords;
    } else if (options.ipv6Address) {
      if (isAddingRecord) {
        recordSet.properties.aaaaRecords.push({ipv6Address: options.ipv6Address});
      } else {
        var aaaaRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.aaaaRecords, {ipv6Address: options.ipv6Address});
        if (aaaaRecordIndex === -1) {
          self.output.warn($('Record AAAA not found in the record set with parameters specified.'));
        } else {
          recordSet.properties.aaaaRecords.splice(aaaaRecordIndex, 1);
        }
      }
    }

    // CNAME record
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[2]) {
      if (options.cname) {
        self.output.info(util.format($('--cname parameter will be ignored due to type of this DNS record - "%s"'), options.type));
      }
    } else if (options.cname) {
      if (isAddingRecord) {
        options.cname = utils.trimTrailingChar(options.cname, '.');
        recordSet.properties.cnameRecord = {cname: options.cname};
      } else {
        var cnameRecord = recordSet.properties.cnameRecord.cname === options.cname;
        if (!cnameRecord) {
          self.output.warn($('Record CNAME not found in the record set with parameters specified.'));
        } else {
          delete recordSet.properties.cnameRecord;
        }
      }
    }

    // MX records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[3]) {
      if (options.preference || options.exchange) {
        self.output.info(util.format($('MX parameters will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.mxRecords;
    } else if (options.preference || options.exchange) {
      if (!(options.preference && options.exchange)) {
        throw new Error($('--preference and --exchange parameters must be specified together'));
      }

      if (isNaN(options.preference) || options.preference < 0) {
        throw new Error($('--preference parameter must be positive integer'));
      }

      options.exchange = utils.trimTrailingChar(options.exchange, '.');

      if (isAddingRecord) {
        recordSet.properties.mxRecords.push({preference: options.preference, exchange: options.exchange});
      } else {
        var mxRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.mxRecords, {
          preference: parseInt(options.preference),
          exchange: options.exchange
        });
        if (mxRecordIndex === -1) {
          self.output.warn($('Record MX not found in the record set with parameters specified.'));
        } else {
          recordSet.properties.mxRecords.splice(mxRecordIndex, 1);
        }
      }
    }

    // NS records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[4]) {
      if (options.nsdname) {
        self.output.info(util.format($('--nsdname parameter will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.nsRecords;
    } else if (options.nsdname) {
      if (isAddingRecord) {
        recordSet.properties.nsRecords.push({nsdname: options.nsdname});
      } else {
        var nsRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.nsRecords, {nsdname: options.nsdname});
        if (nsRecordIndex === -1) {
          self.output.warn($('Record NS not found in the record set with parameters specified.'));
        } else {
          recordSet.properties.nsRecords.splice(nsRecordIndex, 1);
        }
      }
    }

    // SRV records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[5]) {
      if (options.priority || options.weight || options.port || options.target) {
        self.output.info(util.format($('SRV parameters will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.srvRecords;
    } else if (options.priority || options.weight || options.port || options.target) {
      if (!(options.priority && options.weight && options.port && options.target)) {
        throw new Error($('You must specify all SRV parameters if even one is specified'));
      }

      if (isNaN(options.priority) || options.priority < 0) {
        throw new Error($('--priority parameter must be positive integer'));
      }

      if (isNaN(options.weight) || options.weight < 0) {
        throw new Error($('--weight parameter must be positive integer'));
      }

      if (isNaN(options.port) || options.port < 0) {
        throw new Error($('--port parameter must be positive integer'));
      }

      options.target = utils.trimTrailingChar(options.target, '.');

      if (isAddingRecord) {
        recordSet.properties.srvRecords.push({
          priority: options.priority,
          weight: options.weight,
          port: options.port,
          target: options.target
        });
      } else {
        var srvRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.srvRecords, {
          priority: parseInt(options.priority),
          weight: parseInt(options.weight),
          port: parseInt(options.port),
          target: options.target
        });
        if (srvRecordIndex === -1) {
          self.output.warn($('Record SRV not found in the record set with parameters specified.'));
        } else {
          recordSet.properties.srvRecords.splice(srvRecordIndex, 1);
        }
      }
    }

    // TXT records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[6]) {
      if (options.text) {
        self.output.info(util.format($('--text parameter will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.txtRecords;
    } else if (options.text) {
      if (isAddingRecord) {
        recordSet.properties.txtRecords.push({value: options.text});
      } else {
        var txtRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.txtRecords, {value: options.text});
        if (txtRecordIndex === -1) {
          self.output.warn($('Record TXT not found in the record set with parameters specified.'));
        } else {
          recordSet.properties.txtRecords.splice(txtRecordIndex, 1);
        }
      }
    }

    // SOA records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[7]) {
      if (options.email || options.expireTime || options.host || options.minimumTtl || options.refreshTime || options.retryTime) {
        self.output.info(util.format($('SOA parameters will be ignored due to type of this DNS record - "%s"'), options.type));
      }
    } else if (options.email || options.expireTime || options.host || options.minimumTtl || options.refreshTime || options.retryTime) {
      if (options.email && options.expireTime && options.host && options.minimumTtl && options.refreshTime && options.retryTime) {
        throw new Error($('You must specify all SOA parameters if even one is specified'));
      }

      if (isNaN(options.expireTime) || options.expireTime < 0) {
        throw new Error($('--expire-time parameter must be positive integer'));
      }

      if (isNaN(options.refreshTime) || options.refreshTime < 0) {
        throw new Error($('--refresh-time parameter must be positive integer'));
      }

      if (isNaN(options.retryTime) || options.retryTime < 0) {
        throw new Error($('--retry-time parameter must be positive integer'));
      }

      if (isNaN(options.minimumTtl) || options.minimumTtl < 255) {
        throw new Error($('--minimumTtl parameter must be in the range [0,255]'));
      }

      if (isAddingRecord) {
        recordSet.properties.soaRecord = {
          email: options.email,
          expireTime: options.expireTime,
          host: options.host,
          minimumTtl: options.minumumTtl,
          refreshTime: options.refreshTime,
          retryTime: options.retryTime
        };
      } else {
        var soaRecord = ((recordSet.properties.soaRecord.email === options.email) && (recordSet.properties.soaRecord.expireTime === parseInt(options.expireTime)) && (recordSet.properties.soaRecord.host === options.host) &&
        (recordSet.properties.soaRecord.minimumTtl === parseInt(options.minimumTtl)) && (recordSet.properties.soaRecord.refreshTime === parseInt(options.refreshTime)) && (recordSet.properties.soaRecord.retryTime === parseInt(options.retryTime)));
        if (!soaRecord) {
          self.output.warn($('Record SOA not found in the record set with parameters specified.'));
        } else {
          delete recordSet.properties.soaRecord;
        }
      }
    }

    // PTR records
    if (options.type.toUpperCase() !== constants.dnsZone.recordTypes[8]) {
      if (options.ptrdName) {
        self.output.info(util.format($('--ptrd-name parameter will be ignored due to type of this DNS record - "%s"'), options.type));
      }
      delete recordSet.properties.ptrRecords;
    } else {
      if (options.ptrdName) {
        if (isAddingRecord) {
          options.ptrdName = utils.trimTrailingChar(options.ptrdName, '.');
          recordSet.properties.ptrRecords.push({ptrdname: options.ptrdName});
        } else {
          var ptrRecordIndex = utils.indexOfCaseIgnore(recordSet.properties.ptrRecords, {ptrdname: options.ptrdname});
          if (ptrRecordIndex === -1) {
            self.output.warn($('Record PTR not found in the record set with parameters specified.'));
          } else {
            recordSet.properties.ptrRecords.splice(ptrRecordIndex, 1);
          }
        }
      }
    }
  },

  _showRecordSet: function (recordSet) {
    var self = this;

    self.interaction.formatOutput(recordSet, function (record) {
      self.output.nameValue($('Id'), record.id);
      self.output.nameValue($('Name'), record.name);
      self.output.nameValue($('Type'), record.type);
      self.output.nameValue($('Location'), record.location);
      self.output.nameValue($('TTL'), record.properties.ttl);
      self.output.nameValue($('Tags'), tagUtils.getTagsInfo(record.tags));
      if (!__.isEmpty(record.properties.aRecords)) {
        self.output.header($('A records'));
        for (var aRecordNum in record.properties.aRecords) {
          var aRecord = record.properties.aRecords[aRecordNum];
          self.output.nameValue($('IPv4 address'), aRecord.ipv4Address, 4);
        }
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.aaaaRecords)) {
        self.output.header($('AAAA records'));
        for (var aaaaRecordNum in record.properties.aaaaRecords) {
          var aaaaRecord = record.properties.aaaaRecords[aaaaRecordNum];
          self.output.nameValue($('IPv6 address'), aaaaRecord.ipv6Address, 4);
        }
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.cnameRecord)) {
        self.output.header($('CNAME record'));
        self.output.nameValue($('CNAME'), record.properties.cnameRecord.cname, 2);
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.mxRecords)) {
        self.output.header($('MX records'));
        for (var mxRecordNum in record.properties.mxRecords) {
          var mxRecord = record.properties.mxRecords[mxRecordNum];
          self.output.nameValue($('Preference'), mxRecord.preference, 4);
          self.output.nameValue($('Mail exchange'), mxRecord.exchange, 4);
        }
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.nsRecords)) {
        self.output.data($('NS records'));
        for (var nsRecordNum in record.properties.nsRecords) {
          var nsRecord = record.properties.nsRecords[nsRecordNum];
          self.output.nameValue($('Name server domain name'), nsRecord.nsdname, 4);
        }
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.srvRecords)) {
        self.output.header($('SRV records'));
        for (var srvRecordNum in record.properties.srvRecords) {
          var srvRecord = record.properties.srvRecords[srvRecordNum];
          self.output.nameValue($('Priority'), srvRecord.priority, 4);
          self.output.nameValue($('Weight'), srvRecord.weight, 4);
          self.output.nameValue($('Port'), srvRecord.port, 4);
          self.output.nameValue($('Target'), srvRecord.target, 4);
        }
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.txtRecords)) {
        self.output.header($('TXT records'));
        for (var txtRecordNum in record.properties.txtRecords) {
          var txtRecord = record.properties.txtRecords[txtRecordNum];
          self.output.nameValue($('Text'), txtRecord.value, 4);
        }
        self.output.data($(''), '');
      }
      if (!__.isEmpty(record.properties.soaRecord)) {
        var soaRecord = record.properties.soaRecord;
        self.output.header($('SOA record'));
        self.output.nameValue($('Email'), soaRecord.email, 2);
        self.output.nameValue($('Expire time'), soaRecord.expireTime, 2);
        self.output.nameValue($('Host'), soaRecord.host, 2);
        self.output.nameValue($('Serial number'), soaRecord.serialNumber, 2);
        self.output.nameValue($('Minimum TTL'), soaRecord.minimumTtl, 2);
        self.output.nameValue($('Refresh time'), soaRecord.refreshTime, 2);
        self.output.nameValue($('Retry time'), soaRecord.retryTime, 2);
        self.output.nameValue($(''), '');
      }
      if (!__.isEmpty(record.properties.ptrRecords)) {
        self.output.header($('PTR records'));
        for (var ptrRecordNum in record.properties.ptrRecords) {
          var ptrRecord = record.properties.ptrRecords[ptrRecordNum];
          self.output.nameValue($('PTR domain name'), ptrRecord.ptrdname, 4);
        }
        self.output.data($(''), '');
      }
    });
  }
});

module.exports = DnsZone;