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
var PublicIp = require('./publicIp');
var profile = require('../../../util/profile');
var Subnet = require('./subnet');
var tagUtils = require('../tag/tagUtils');
var util = require('util');
var utils = require('../../../util/utils');
var VNetUtil = require('../../../util/vnet.util');
var $ = utils.getLocaleString;

function AppGateways(cli, networkResourceProviderClient) {
  this.interaction = cli.interaction;
  this.networkResourceProviderClient = networkResourceProviderClient;
  this.output = cli.output;
  this.publicIpCrud = new PublicIp(cli, networkResourceProviderClient);
  this.subnetCrud = new Subnet(cli, networkResourceProviderClient);
  this.vnetUtil = new VNetUtil();
}

__.extend(AppGateways.prototype, {
  create: function (resourceGroup, appGatewayName, location, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (appGateway) {
      throw new Error(util.format($('Application Gateway "%s" already exists in resource group "%s"'), appGatewayName, resourceGroup));
    }
    var subnet = self.subnetCrud.get(resourceGroup, options.vnetName, options.subnetName, _);
    if (!subnet) {
      throw new Error(util.format($('Subnet "%s" not found in virtual network "%s"'), options.subnetName, options.vnetName));
    }
    var parameters = self._setDefaultAttributes(options);
    self.subscriptionId = self._getSubscriptionId(options);
    var frontendIpID = self._getResourceId(resourceGroup, appGatewayName, 'frontendIPConfigurations', parameters.frontendIpName);
    var frontendPortID = self._getResourceId(resourceGroup, appGatewayName, 'frontendPorts', parameters.frontendPortName);
    var poolID = self._getResourceId(resourceGroup, appGatewayName, 'backendAddressPools', parameters.addressPoolName);
    var settingsID = self._getResourceId(resourceGroup, appGatewayName, 'backendHttpSettingsCollection', parameters.httpSettingsName);
    var listenerID = self._getResourceId(resourceGroup, appGatewayName, 'httpListeners', parameters.httpListenerName);

    appGateway = {
      name: appGatewayName,
      location: location,
      sku: {
        name: parameters.skuName,
        tier: parameters.skuTier,
        capacity: parameters.capacity
      },
      gatewayIPConfigurations: [{
        name: parameters.gatewayIpName,
        subnet: {id: subnet.id}
      }],
      frontendPorts: [{
        name: parameters.frontendPortName,
        port: parameters.frontendPort
      }],
      backendAddressPools: [{
        name: parameters.addressPoolName,
        backendAddresses: self._parseDnsServers(options),
        backendIPConfiguration: []
      }],
      backendHttpSettingsCollection: [{
        name: parameters.httpSettingsName,
        protocol: parameters.httpSettingsProtocol,
        port: parameters.httpSettingsPort,
        cookieBasedAffinity: parameters.httpSettingsCookieBasedAffinity
      }],
      httpListeners: [{
        name: parameters.httpListenerName,
        frontendIPConfiguration: {id: frontendIpID},
        frontendPort: {id: frontendPortID},
        protocol: parameters.httpSettingsProtocol
      }],
      requestRoutingRules: [{
        name: parameters.routingRuleName,
        ruleType: parameters.routingRuleType,
        backendAddressPool: {id: poolID},
        backendHttpSettings: {id: settingsID},
        httpListener: {id: listenerID}
      }]
    };

    appGateway.frontendIPConfigurations = [];
    appGateway.frontendIPConfigurations.push(self._parseFrontendIp(resourceGroup, parameters.frontendIpName, parameters, _));

    if (parameters.certName) {
      appGateway.sslCertificates = [];
      var data = fs.readFileSync(parameters.certFile);
      appGateway.sslCertificates.push({
        name: parameters.sslCertName,
        password: parameters.password,
        data: data.toString('base64')
      });
      appGateway.httpListeners.sslCertificate = {};
      var certID = self._getResourceId(resourceGroup, appGatewayName, 'sslCertificates', parameters.frontendPortName);
      appGateway.httpListeners.sslCertificate.id = certID;
    }

    var progress = self.interaction.progress(util.format($('Creating configuration for an Application Gateway "%s"'), appGatewayName));
    try {
      self.networkResourceProviderClient.applicationGateways.createOrUpdate(resourceGroup, appGatewayName, appGateway, _);
    } catch (e) {
      var code = e.code.toLowerCase();

      // TODO: Remove workaround when such issues in long-running operations would be fixed.
      if (code === 'econnreset' || code === 'etimedout') {
        self.output.error('Operation connection  was cancelled. Please wait for updating would be finished on the server side.');
        return null;
      }
      throw e;
    }
    finally {
      progress.end();
    }

    self.show(resourceGroup, appGatewayName, options, _);
  },

  set: function (resourceGroup, appGatewayName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;

    if (!options.skuName && !options.skuTier && !options.capacity) {
      throw new Error(util.format($('There are no parameters to update in specified application gateway "%s"'), appGatewayName));
    }

    if (options.skuName) {
      appGateway.sku.name = options.skuName;
    }
    if (options.skuTier) {
      appGateway.sku.tier = options.skuTier;
    }
    if (options.capacity) {
      appGateway.sku.capacity = options.capacity;
    }

    self.output.warn('Application gateway set command is a long-running process. It may take up to 15-20 minutes to complete.');
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  get: function (resourceGroup, appGatewayName, _) {
    var self = this;
    var appGateway;
    var progress = self.interaction.progress(util.format($('Looking up an Application Gateway "%s"'), appGatewayName));
    try {
      appGateway = self.networkResourceProviderClient.applicationGateways.get(resourceGroup, appGatewayName, _);
    } catch (error) {
      if (error.statusCode === 404) {
        appGateway = null;
      } else {
        throw error;
      }
    } finally {
      progress.end();
    }
    return appGateway;
  },

  listAll: function (_) {
    var self = this;
    var progress = self.interaction.progress(util.format($('Looking up subscription Application Gateways')));
    var appGateways;
    try {
      appGateways = self.networkResourceProviderClient.applicationGateways.listAll(_);
    } finally {
      progress.end();
    }

    if (!appGateways) {
      self.output.warn(util.format($('No application gateways found in resource group "%s"'), resourceGroup));
    }

    self.interaction.formatOutput(appGateways.applicationGateways, function (data) {
      if (data.length === 0) {
        self.output.warn(util.format($('No application gateways found in subscription')));
      } else {
        self.output.table(data, function (row, gateway) {
          row.cell($('Name'), gateway.name);
          row.cell($('Provisioning state'), gateway.provisioningState);
          row.cell($('Location'), gateway.location);
          row.cell($('Resource group'), self._getResourceGroupFromId(gateway));
        });
      }
    });
  },

  list: function (resourceGroup, options, _) {
    var self = this;

    var progress = self.interaction.progress(util.format($('Looking up Application Gateways in resource group "%s"'),
      resourceGroup));
    var appGateways;
    try {
      appGateways = self.networkResourceProviderClient.applicationGateways.list(resourceGroup, _);
    } finally {
      progress.end();
    }

    if (!appGateways) {
      self.output.warn(util.format($('No application gateways found in resource group "%s"'), resourceGroup));
    }

    self.interaction.formatOutput(appGateways.applicationGateways, function (data) {
      if (data.length === 0) {
        self.output.warn(util.format($('No application gateways found in resource group "%s"'), resourceGroup));
      } else {
        self.output.table(data, function (row, gateway) {
          row.cell($('Name'), gateway.name);
          row.cell($('Provisioning state'), gateway.provisioningState);
          row.cell($('Location'), gateway.location);
        });
      }
    });
  },

  show: function (resourceGroup, appGatewayName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);

    if (appGateway) {
      self._showAppGateway(appGateway);
    } else {
      if (self.output.format().json) {
        self.output.json({});
      } else {
        self.output.warn(util.format($('An Application Gateway with name "%s" not found in resource group "%s"'),
          appGatewayName, resourceGroup));
      }
    }
  },

  delete: function (resourceGroup, appGatewayName, options, _) {
    var self = this;

    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      self.output.warn(util.format($('An Application Gateway with name "%s" not found in resource group "%s"'),
        appGatewayName, resourceGroup));
      return;
    }
    if (!options.quiet && !self.interaction.confirm(util.format($('Delete a backend address pool "%s?" [y/n] '), appGatewayName), _)) {
      return;
    }

    var progress = self.interaction.progress(util.format($('Deleting an Application Gateway "%s"'), appGatewayName));
    try {
      self.networkResourceProviderClient.applicationGateways.deleteMethod(resourceGroup, appGatewayName, _);
    } finally {
      progress.end();
    }
    self.list(resourceGroup, options, _);
  },

  start: function (resourceGroup, appGatewayName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('An Application Gateway with name "%s" not found in resource group "%s"'),
        appGatewayName, resourceGroup));
    }

    self.output.warn('Application gateway start command is a long-running process. It may take up to 15-20 minutes to complete.');
    var progress = self.interaction.progress(util.format($('Starting an Application Gateway "%s"'), appGatewayName));
    try {
      self.networkResourceProviderClient.applicationGateways.start(resourceGroup, appGatewayName, _);
    } catch (e) {
      if (e.statusCode === 200) {
        self.output.warn(util.format($('An Application Gateway with name "%s" in resource group "%s" is already started'), appGatewayName, resourceGroup));
      }
    } finally {
      progress.end();
    }
  },

  stop: function (resourceGroup, appGatewayName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('An Application Gateway with name "%s" not found in resource group "%s"'),
        appGatewayName, resourceGroup));
    }
    var progress = self.interaction.progress(util.format($('Stopping an Application Gateway "%s"'), appGatewayName));
    try {
      self.networkResourceProviderClient.applicationGateways.stop(resourceGroup, appGatewayName, _);
    } finally {
      progress.end();
    }
  },

  addSsl: function (resourceGroup, appGatewayName, certName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;

    if (utils.stringIsNullOrEmpty(options.certFile)) {
      throw new Error($('--cert-file parameter must not be empty'));
    }

    if (utils.stringIsNullOrEmpty(options.password)) {
      throw new Error($('--password parameter must not be empty'));
    }

    var certificateObject = {password: options.password, name: certName};
    var data = fs.readFileSync(options.certFile);
    certificateObject.data = data.toString('base64');
    appGateway.sslCertificates.push(certificateObject);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  removeSsl: function (resourceGroup, appGatewayName, certName, options, _) {
    var self = this;

    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;

    var index = utils.indexOfCaseIgnore(appGateway.sslCertificates, {name: certName});
    if (index !== -1) {
      if (!options.quiet && !self.interaction.confirm(util.format($('Delete an http settings "%s"? [y/n] '), certName), _)) {
        return;
      }
      appGateway.sslCertificates.splice(index, 1);
      self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
      self.show(resourceGroup, appGatewayName, options, _);
    } else {
      throw new Error(util.format($('SSL certificate with name "%s" not found for an Application Gateway "%s"'), certName, appGatewayName));
    }
  },

  setIpConfig: function (resourceGroup, appGatewayName, name, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }

    appGateway = appGateway.applicationGateway;
    var ipConfig = utils.findFirstCaseIgnore(appGateway.gatewayIPConfigurations, {name: name});
    if (!ipConfig) {
      throw new Error(util.format($('An application gateway ip config with name "%s" not found in Application Gateway "%s"'), name, appGatewayName));
    }

    var subnet = self.subnetCrud.get(resourceGroup, options.vnetName, options.subnetName, _);
    if (!subnet) {
      throw new Error(util.format($('Subnet "%s" not found in virtual network "%s"'), options.subnetName, options.vnetName));
    }

    if (subnet.id.toLowerCase() != ipConfig.subnet.id.toLowerCase()) {
      ipConfig.subnet = subnet;
      appGateway.gatewayIPConfigurations = [ipConfig];
      self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
      self.show(resourceGroup, appGatewayName, options, _);
    } else {
      throw new Error(util.format($('Current gateway ip config already has the same subnet with Id: "%s"'), subnet.id));
    }
  },

  addHttpListener: function (resourceGroup, appGatewayName, httpListenerName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;

    if (!appGateway.httpListeners || !appGateway.httpListeners.length) {
      appGateway.httpListeners = [];
    }

    if (utils.findFirstCaseIgnore(appGateway.httpListeners, {name: httpListenerName})) {
      throw new Error(util.format($('An http listener with name "%s" already exists for an Application Gateway "%s"'), httpListenerName, appGatewayName));
    }

    var httpListener = {
      name: httpListenerName,
      protocol: 'Http'
    };

    if (options.frontendIpName) {
      var frontendIp = utils.findFirstCaseIgnore(appGateway.frontendIPConfigurations, {name: options.frontendIpName});
      if (!frontendIp) {
        throw new Error(util.format($('Frontend ip with name "%s" not found for an Application Gateway "%s'), options.frontendIpName, appGatewayName));
      }
      httpListener.frontendIPConfiguration = frontendIp;
    }

    if (options.frontendPortName) {
      var frontendPort = utils.findFirstCaseIgnore(appGateway.frontendPorts, {name: options.frontendPortName});
      if (!frontendPort) {
        throw new Error(util.format($('Frontend ip with name "%s" not found for an Application Gateway "%s'), options.frontendPortName, appGatewayName));
      }
      httpListener.frontendPort = frontendPort;
    }

    if (options.protocol) {
      var formatedProtocol = options.protocol.toLowerCase();
      if (formatedProtocol === 'https' && !options.sslCert) {
        throw new Error($('--ssl-cert parameter is required when "--protocol Https" parameter is specified'));
      }
      if (formatedProtocol !== 'http' && formatedProtocol != 'https') {
        throw new Error(util.format($('"%s" port is not valid. Valid values are [%s]'), constants.appGateway.httpListener.protocol));
      }

      var protocol = options.protocol.toLowerCase();
      httpListener.protocol = utils.capitalizeFirstLetter(protocol);
    }

    if (options.sslCert) {
      var sslCert = utils.findFirstCaseIgnore(appGateway.sslCertificates, {name: options.sslCert});
      if (!sslCert) {
        throw new Error(util.format($('Frontend ip with name "%s" not found for an Application Gateway "%s'), options.sslCert, appGatewayName));
      }
      httpListener.sslCertificate = sslCert;
    }

    self.output.warn('Application gateway add new http listener command is a long-running process. It may take up to 15-20 minutes to complete.');
    appGateway.httpListeners.push(httpListener);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  removeHttpListener: function (resourceGroup, appGatewayName, httpListenerName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;

    var index = utils.indexOfCaseIgnore(appGateway.httpListeners, {name: httpListenerName});
    if (index === -1) {
      throw new Error(util.format($('Http listener with name "%s" not found for an Application Gateway "%s'), httpListenerName, appGatewayName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete http listener "%s?" [y/n] '), httpListenerName), _)) {
      return;
    }

    self.output.warn('Application gateway remove http listener command is a long-running process. It may take up to 15-20 minutes to complete.');
    appGateway.httpListeners.splice(index, 1);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  addFrontendIp: function (resourceGroup, appGatewayName, frontendIpName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;

    var frontendIp = utils.findFirstCaseIgnore(appGateway.frontendIPConfigurations, {name: frontendIpName});
    if (frontendIp) {
      throw new Error(util.format($('A frontend ip with name "%s" already exists for an Application Gateway "%s"'), frontendIpName, appGatewayName));
    }

    frontendIp = self._parseFrontendIp(resourceGroup, frontendIpName, options, _);
    appGateway.frontendIPConfigurations.push(frontendIp);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  removeFrontendIp: function (resourceGroup, appGatewayName, frontendIpName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;
    var index = utils.indexOfCaseIgnore(appGateway.frontendIPConfigurations, {name: frontendIpName});
    if (index === -1) {
      throw new Error(util.format($('A frontend ip with name "%s" not found for an Application Gateway "%s"'), frontendIpName, appGatewayName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete a frontend ip "%s?" [y/n] '), frontendIpName), _)) {
      return;
    }

    appGateway.frontendIPConfigurations.splice(index, 1);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  addFrontendPort: function (resourceGroup, appGatewayName, frontendPortName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }

    appGateway = appGateway.applicationGateway;
    var frontendPort = utils.findFirstCaseIgnore(appGateway.frontendPorts, {name: frontendPortName});
    if (frontendPort) {
      throw new Error(util.format($('A frontend port with name "%s" already exists for an Application Gateway "%s"'), frontendPortName, appGatewayName));
    }
    frontendPort = {
      name: frontendPortName,
      port: options.port
    };

    self.output.warn('Application gateway add new frontend port command is a long-running process. It may take up to 15-20 minutes to complete.');
    appGateway.frontendPorts.push(frontendPort);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  removeFrontendPort: function (resourceGroup, appGatewayName, frontendPortName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }

    appGateway = appGateway.applicationGateway;
    var index = utils.indexOfCaseIgnore(appGateway.frontendPorts, {name: frontendPortName});
    if (index === -1) {
      throw new Error(util.format($('Frontend port with name "%s" not found for an Application Gateway "%s'), frontendPortName, appGatewayName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete a frontend port "%s?" [y/n] '), frontendPortName), _)) {
      return;
    }

    self.output.warn('Application gateway remove frontend port command is a long-running process. It may take up to 15-20 minutes to complete.');
    appGateway.frontendPorts.splice(index, 1);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  addBackendAddressPool: function (resourceGroup, appGatewayName, poolName, options, _) {
    var self = this;
    var dnsServers = self._parseDnsServers(options);
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }

    appGateway = appGateway.applicationGateway;
    var pool = utils.findFirstCaseIgnore(appGateway.backendAddressPools, {name: poolName});
    if (pool) {
      throw new Error(util.format($('A backend address pool with name "%s" already exists for an Application Gateway "%s"'), poolName, appGatewayName));
    } else {
      var addressPool = {
        name: poolName,
        backendAddresses: dnsServers
      };
      appGateway.backendAddressPools.push(addressPool);

      self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
      self.show(resourceGroup, appGatewayName, options, _);
    }
  },

  removeBackendAddressPool: function (resourceGroup, appGatewayName, poolName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }

    appGateway = appGateway.applicationGateway;
    var index = utils.indexOfCaseIgnore(appGateway.backendAddressPools, {name: poolName});
    if (index !== -1) {
      if (!options.quiet && !self.interaction.confirm(util.format($('Delete a backend address pool "%s?" [y/n] '), poolName), _)) {
        return;
      }
      appGateway.backendAddressPools.splice(index, 1);
      self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
      self.show(resourceGroup, appGatewayName, options, _);
    } else {
      throw new Error(util.format($('A backend address pool with name "%s" not found for an Application Gateway "%s"'), poolName, appGatewayName));
    }
  },

  addHttpSettings: function (resourceGroup, appGatewayName, httpSettingsName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;
    var httpSettings = self._parseHttpSettings(httpSettingsName, options, true);

    var settings = utils.findFirstCaseIgnore(appGateway.backendHttpSettingsCollection, {name: httpSettingsName});
    if (settings) {
      throw new Error(util.format($('A http settings with name "%s" already exists for an Application Gateway "%s"'), httpSettingsName, appGatewayName));
    } else {
      appGateway.backendHttpSettingsCollection.push(httpSettings);
      self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
      self.show(resourceGroup, appGatewayName, options, _);
    }
  },

  removeHttpSettings: function (resourceGroup, appGatewayName, httpSettingsName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found in resource group "%s"'), appGatewayName, resourceGroup));
    }
    appGateway = appGateway.applicationGateway;
    var index = utils.indexOfCaseIgnore(appGateway.backendHttpSettingsCollection, {name: httpSettingsName});
    if (index !== -1) {
      if (!options.quiet && !self.interaction.confirm(util.format($('Delete an http settings "%s"? [y/n] '), httpSettingsName), _)) {
        return;
      }
      appGateway.backendHttpSettingsCollection.splice(index, 1);
      self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
      self.show(resourceGroup, appGatewayName, options, _);
    } else {
      throw new Error(util.format($('An http settings with name "%s" not found for an Application Gateway "%s"'), httpSettingsName, appGatewayName));
    }
  },

  addRequestRoutingRule: function (resourceGroup, appGatewayName, ruleName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found'), appGatewayName));
    }
    appGateway = appGateway.applicationGateway;

    if (utils.findFirstCaseIgnore(appGateway.requestRoutingRules, {name: ruleName})) {
      throw new Error(util.format($('A request routing rule with name "%s" not found in Application Gateway "%s"'), ruleName, appGatewayName));
    }

    var backendHttpSettings = utils.findFirstCaseIgnore(appGateway.backendHttpSettingsCollection, {name: options.httpSettings});
    if (!backendHttpSettings) {
      throw new Error(util.format($('A backend http settings with name "%s" not found in Application Gateway "%s"'), options.httpSettings, appGatewayName));
    }

    var httpListener = utils.findFirstCaseIgnore(appGateway.httpListeners, {name: options.httpListener});
    if (!httpListener) {
      throw new Error(util.format($('Http listener with name "%s" not found for an Application Gateway "%s'), options.httpListener, appGatewayName));
    }

    var backendAddressPool = utils.findFirstCaseIgnore(appGateway.backendAddressPools, {name: options.addressPool});
    if (!backendAddressPool) {
      throw new Error(util.format($('Address pool with name "%s" not found for an Application Gateway "%s'), options.addressPool, appGatewayName));
    }

    var rule = {
      name: ruleName,
      type: 'Basic',
      backendHttpSettings: backendHttpSettings,
      httpListener: httpListener,
      backendAddressPool: backendAddressPool
    };

    if (options.type) {
      rule.type = options.type;
    }

    appGateway.requestRoutingRules.push(rule);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  removeRequestRoutingRule: function (resourceGroup, appGatewayName, ruleName, options, _) {
    var self = this;
    var appGateway = self.get(resourceGroup, appGatewayName, _);
    if (!appGateway) {
      throw new Error(util.format($('Application Gateway "%s" not found'), appGatewayName));
    }
    appGateway = appGateway.applicationGateway;

    var index = utils.indexOfCaseIgnore(appGateway.requestRoutingRules, {name: ruleName});
    if (index === -1) {
      throw new Error(util.format($('An request routing rule with name "%s" not found for an Application Gateway "%s'), ruleName, appGatewayName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete request routing rule "%s?" [y/n] '), ruleName), _)) {
      return;
    }
    appGateway.requestRoutingRules.splice(index, 1);
    self._setAppGateway(resourceGroup, appGatewayName, appGateway, _);
    self.show(resourceGroup, appGatewayName, options, _);
  },

  _getAttributeNames: function (list) {
    var namesString = '[';
    var counter = 0;
    list.forEach(function (item) {
      if (counter > 0) {
        namesString += ', ';
      }
      namesString += item.name;
      counter++;
    });
    namesString += ']';
    return namesString;
  },

  _getResourceGroupFromId: function (appGateway) {
    if (appGateway.id) {
      var idArray = appGateway.id.split('/');
      var index;
      for (var i = 0; i < idArray.length; i++) {
        if (idArray[i] === 'resourceGroups') {
          index = i;
        }
      }
      return idArray[index + 1];
    }
  },

  _getResourceId: function (resourceGroup, appGatewayName, resourceType, resourceName) {
    var id = '';
    id += '/subscriptions/';
    id += encodeURIComponent(this.subscriptionId);
    id += '/resourceGroups/';
    id += encodeURIComponent(resourceGroup);
    id += '/providers/';
    id += 'Microsoft.Network';
    id += '/applicationGateways/';
    id += encodeURIComponent(appGatewayName);
    id += util.format($('/%s'), resourceType);
    id += util.format($('/%s'), resourceName);
    return id;
  },

  _getSubscriptionId: function (options) {
    var subscription = profile.current.getSubscription(options.subscription);
    var client = utils.createResourceClient(subscription);
    return client.credentials.subscriptionId;
  },

  _parseDnsServers: function (options) {
    var self = this;

    var ipAddresses = options.servers.split(',');
    var dnsServers = [];

    ipAddresses.forEach(function (address) {
      address = address.trim();
      var ipValidationResult = self.vnetUtil.parseIPv4(address);
      if (ipValidationResult.error) {
        var dnsValidationResult = self.vnetUtil.isValidDns(address);
        if (dnsValidationResult === false) {
          throw new Error(util.format($('Address "%s" is not valid IPv4 or DNS name'), address));
        }
      }
      var dns = {ipAddress: address};
      dnsServers.push(dns);
    });

    return dnsServers;
  },

  _parseFrontendIp: function (resourceGroup, frontendIpName, options, _) {
    var self = this;
    var frontendIp = {
      id: self._getResourceId(resourceGroup, 'appgw03', 'frontendIPConfigurations', options.frontendIpName),
      name: frontendIpName
    };

    if (options.publicIpName) {
      var publicIp = self.publicIpCrud.get(resourceGroup, options.publicIpName, _);
      if (!publicIp) {
        throw new Error(util.format($('Public IP "%s" not found in resource group "%s"'), options.publicIpName, resourceGroup));
      }
      frontendIp.publicIPAddress = {id: publicIp.id};
    } else {
      if (options.vnetName && options.subnetName) {
        var subnet = self.subnetCrud.get(resourceGroup, options.vnetName, options.subnetName, _);
        if (!subnet) {
          throw new Error(util.format($('Subnet "%s" not found in virtual network "%s" resource group "%s"'), options.subnetName, options.vnetName, resourceGroup));
        }
        frontendIp.subnet = {id: subnet.id};
      }
    }

    if (options.subnetId) {
      frontendIp.subnet = {id: options.subnetId};
    }

    if (options.staticIpAddress) {
      var ipValidationResult = self.vnetUtil.parseIPv4(options.staticIpAddress);
      if (ipValidationResult.error) {
        throw new Error(util.format($('IPv4 %s static ip address is not valid'), options.staticIpAddress));
      }
      frontendIp.privateIPAddress = options.staticIpAddress;
    }

    frontendIp.privateIPAllocationMethod = 'Dynamic';
    return frontendIp;
  },

  _parseHttpSettings: function (httpSettingsName, options, useDefaults) {
    var self = this;

    var httpSettings = {
      name: httpSettingsName
    };

    if (options.protocol) {
      var protocol = utils.verifyParamExistsInCollection(constants.appGateway.settings.protocol,
        options.protocol, 'protocol');
      httpSettings.protocol = utils.capitalizeFirstLetter(protocol);
    } else if (useDefaults) {
      self.output.warn(util.format($('Using default protocol: %s'), constants.appGateway.settings.protocol[0]));
      httpSettings.protocol = constants.appGateway.settings.protocol[0];
    }

    if (options.port) {
      var portAsInt = utils.parseInt(options.port);
      if (isNaN(portAsInt) || portAsInt < constants.appGateway.settings.port[0] || portAsInt > constants.appGateway.settings.port[1]) {
        throw new Error(util.format($('port parameter must be an integer in range %s'),
          utils.toRange(constants.appGateway.settings.port)));
      }
      httpSettings.port = portAsInt;
    }

    if (options.cookieBasedAffinity) {
      var cookieBasedAffinity = utils.verifyParamExistsInCollection(constants.appGateway.settings.affinity,
        options.cookieBasedAffinity, 'cookie based affinity');
      httpSettings.cookieBasedAffinity = utils.capitalizeFirstLetter(cookieBasedAffinity);
    } else if (useDefaults) {
      self.output.warn(util.format($('Using default cookie based affinity: %s'), constants.appGateway.settings.affinity[0]));
      httpSettings.cookieBasedAffinity = constants.appGateway.settings.affinity[0];
    }

    return httpSettings;
  },

  _setAppGateway: function (resourceGroup, appGatewayName, appGateway, _) {
    var self = this;

    var progress = self.interaction.progress(util.format($('Setting configuration for an Application Gateway "%s"'), appGatewayName));
    try {
      self.networkResourceProviderClient.applicationGateways.createOrUpdate(resourceGroup, appGatewayName, appGateway, _);
    } catch (e) {
      var code = e.code.toLowerCase();

      // TODO: Remove workaround when such issues in long-running operations would be fixed.
      if (code === 'econnreset' || code === 'etimedout') {
        self.output.error('Operation connection  was cancelled. Please wait for updating would be finished on the server side.');
        return null;
      }
      throw e;
    }
    finally {
      progress.end();
    }
  },

  _setDefaultAttributes: function (options) {
    var self = this;
    if (options.certName) {
      if (utils.stringIsNullOrEmpty(options.certFile)) {
        throw new Error($('--cert-file parameter must not be empty'));
      }
      if (utils.stringIsNullOrEmpty(options.password)) {
        throw new Error($('--password parameter must not be empty'));
      }
    }
    if (!options.gatewayIpName) {
      options.gatewayIpName = 'ipConfig1';
      self.output.warn(util.format($('Using default gateway ip name: %s'), options.gatewayIpName));
    }
    if (!options.skuName) {
      options.skuName = 'Standard_Small';
      self.output.warn(util.format($('Using default sku name: %s'), options.skuName));
    }
    if (!options.skuTier) {
      options.skuTier = 'Standard';
      self.output.warn(util.format($('Using default sku tier: %s'), options.skuTier));
    }
    if (!options.capacity) {
      options.capacity = 2;
      self.output.warn(util.format($('Using default sku capacity: %s'), options.capacity));
    } else {
      if (options.capacity < 2 || options.capacity > 10) {
        throw new Error(util.format($('Application gateway instance count must be in range "[%s]"'), constants.appGateway.sku.capacity));
      }
    }
    if (!options.frontendIpName) {
      options.frontendIpName = 'frontendIp01';
      self.output.warn(util.format($('Using default frontend ip name: %s'), options.frontendIpName));
    }
    if (!options.frontendPortName) {
      options.frontendPortName = 'frontendPort01';
      self.output.warn(util.format($('Using default frontend port name: %s'), options.frontendPortName));
    }
    if (!options.frontendPort) {
      options.frontendPort = 80;
      self.output.warn(util.format($('Using default frontend port: %s'), options.frontendPort));
    }
    if (!options.addressPoolName) {
      options.addressPoolName = 'pool01';
      self.output.warn(util.format($('Using default address pool name: %s'), options.addressPoolName));
    }
    if (!options.httpSettingsName) {
      options.httpSettingsName = 'httpSettings01';
      self.output.warn(util.format($('Using default http settings name: %s'), options.httpSettingsName));
    }
    if (!options.httpSettingsProtocol) {
      options.httpSettingsProtocol = 'Http';
      self.output.warn(util.format($('Using default http settings protocol: %s'), options.httpSettingsProtocol));
    }
    if (!options.httpSettingsPort) {
      options.httpSettingsPort = 80;
      self.output.warn(util.format($('Using default http settings port: %s'), options.httpSettingsPort));
    }
    if (!options.httpSettingsCookieBasedAffinity) {
      options.httpSettingsCookieBasedAffinity = constants.appGateway.settings.affinity[0];
      self.output.warn(util.format($('Using default http settings cookie based affinity: %s'), options.httpSettingsCookieBasedAffinity));
    }
    if (!options.httpListenerName) {
      options.httpListenerName = 'listener01';
      self.output.warn(util.format($('Using default http listener name: %s'), options.httpListenerName));
    }
    if (!options.sslCertName) {
      options.sslCertName = 'certName1';
      self.output.warn(util.format($('Using default ssl certificate name: %s'), options.httpListenerName));
    }
    if (!options.routingRuleName) {
      options.routingRuleName = 'rule01';
      self.output.warn(util.format($('Using default request routing rule name: %s'), options.routingRuleName));
    }
    if (!options.routingRuleType) {
      options.routingRuleType = 'Basic';
      self.output.warn(util.format($('Using default request routing rule type: %s'), options.routingRuleType));
    }
    return options;
  },

  _showAppGateway: function (appGateway) {
    var self = this;
    self.interaction.formatOutput(appGateway.applicationGateway, function (appGateway) {
      self.output.nameValue($('Id'), appGateway.id);
      self.output.nameValue($('Name'), appGateway.name);
      self.output.nameValue($('Location'), appGateway.location);
      self.output.nameValue($('Provisioning state'), appGateway.provisioningState);
      self.output.nameValue($('Sku'), appGateway.sku.name);
      self.output.nameValue($('Resource Group'), self._getResourceGroupFromId(appGateway));
      self.output.nameValue($('Tags'), tagUtils.getTagsInfo(appGateway.tags));
      self.output.nameValue($('Gateway IP configations'), self._getAttributeNames(appGateway.gatewayIPConfigurations));
      self.output.nameValue($('SSL cerificates'), self._getAttributeNames(appGateway.sslCertificates));
      self.output.nameValue($('Frontend ip configurations'), self._getAttributeNames(appGateway.frontendIPConfigurations));
      self.output.nameValue($('Frontend ports'), self._getAttributeNames(appGateway.frontendPorts));
      self.output.nameValue($('Backend address pools'), self._getAttributeNames(appGateway.backendAddressPools));
      self.output.nameValue($('Backend http settings'), self._getAttributeNames(appGateway.backendHttpSettingsCollection));
      self.output.nameValue($('Http listeners'), self._getAttributeNames(appGateway.httpListeners));
      self.output.nameValue($('Request routing rules'), self._getAttributeNames(appGateway.requestRoutingRules));

      self.output.nameValue($('GatewayIpConfigurationText'), JSON.stringify(appGateway.gatewayIPConfigurations, null, 4));
      self.output.nameValue($('SslCertificateText'), JSON.stringify(appGateway.sslCertificates, null, 4));
      self.output.nameValue($('FrontendIpConfigurationText'), JSON.stringify(appGateway.frontendIPConfigurations, null, 4));
      self.output.nameValue($('FrontendPortText'), JSON.stringify(appGateway.frontendPorts, null, 4));
      self.output.nameValue($('BackendAddressPoolText'), JSON.stringify(appGateway.backendAddressPools, null, 4));
      self.output.nameValue($('BackendHttpSettingsText'), JSON.stringify(appGateway.backendHttpSettingsCollection, null, 4));
      self.output.nameValue($('HttpListenersText'), JSON.stringify(appGateway.httpListeners, null, 4));
      self.output.nameValue($('RequestRoutingRulesText'), JSON.stringify(appGateway.requestRoutingRules, null, 4));
      self.output.nameValue($('Sku'), JSON.stringify(appGateway.sku, null, 4));
    });
  }
});

module.exports = AppGateways;