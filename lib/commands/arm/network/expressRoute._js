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
var util = require('util');
var utils = require('../../../util/utils');
var $ = utils.getLocaleString;
var constants = require('./constants');
var resourceUtils = require('../resource/resourceUtils');
var tagUtils = require('../tag/tagUtils');
var VNetUtil = require('../../../util/vnet.util');

function ExpressRoute(cli, networkResourceProviderClient) {
  this.networkResourceProviderClient = networkResourceProviderClient;
  this.output = cli.output;
  this.interaction = cli.interaction;
  this.vnetUtil = new VNetUtil();
}

__.extend(ExpressRoute.prototype, {

  /**
   * Circuit methods
   */
  create: function (resourceGroupName, circuitName, location, options, _) {
    var self = this;

    var parameters = {
      name: circuitName,
      location: location,
      sku: {},
      serviceProviderProperties: {
        serviceProviderName: options.serviceProviderName,
        peeringLocation: options.peeringLocation
      }
    };

    parameters = self._parseCircuit(parameters, options, true);

    var circuit = self.get(resourceGroupName, circuitName, _);
    if (circuit) {
      throw new Error(util.format($('An express route circuit with name "%s" already exists in the resource group "%s"'), circuitName, resourceGroupName));
    }

    var progress = self.interaction.progress(util.format($('Creating express route circuit "%s"'), circuitName));
    try {
      self.networkResourceProviderClient.expressRouteCircuits.createOrUpdate(resourceGroupName, circuitName, parameters, _);
    } finally {
      progress.end();
    }
    self.show(resourceGroupName, circuitName, options, _);
  },

  set: function (resourceGroupName, circuitName, options, _) {
    var self = this;

    var circuit = self.get(resourceGroupName, circuitName, _);
    if (!circuit) {
      throw new Error(util.format($('A express route circuit with name "%s" not found in the resource group "%s"'), circuitName, resourceGroupName));
    }

    circuit = self._parseCircuit(circuit, options, false);

    var progress = self.interaction.progress(util.format($('Updating express route circuit "%s"'), circuitName));
    try {
      self.networkResourceProviderClient.expressRouteCircuits.createOrUpdate(resourceGroupName, circuitName, circuit, _);
    } finally {
      progress.end();
    }
    self.show(resourceGroupName, circuitName, options, _);
  },

  list: function (resourceGroupName, options, _) {
    var self = this;
    var progress = self.interaction.progress($('Getting the express route circuits'));

    var circuits = null;
    try {
      circuits = self.networkResourceProviderClient.expressRouteCircuits.list(resourceGroupName, _);
    } finally {
      progress.end();
    }

    self.interaction.formatOutput(circuits.expressRouteCircuits, function (circuits) {
      if (circuits.length === 0) {
        self.output.warn($('No express route circuits found'));
      } else {
        self.output.table(circuits, function (row, circuit) {
          row.cell($('Name'), circuit.name);
          row.cell($('Location'), circuit.location);
          row.cell($('Provider name'), circuit.serviceProviderProperties.serviceProviderName);
          row.cell($('Peering location'), circuit.serviceProviderProperties.peeringLocation);
          row.cell($('Bandwidth, Mbps'), circuit.serviceProviderProperties.bandwidthInMbps);
          row.cell($('Circuit state'), circuit.circuitProvisioningState);
          row.cell($('SKU'), circuit.sku.name);
        });
      }
    });
  },

  show: function (resourceGroupName, circuitName, options, _) {
    var self = this;
    var circuit = self.get(resourceGroupName, circuitName, _);

    self.interaction.formatOutput(circuit, function (circuit) {
      if (circuit === null) {
        self.output.warn(util.format($('An express route circuit with name "%s" not found in the resource group "%s"'), circuitName, resourceGroupName));
      } else {
        var resourceInfo = resourceUtils.getResourceInformation(circuit.id);
        self.output.nameValue($('Id'), circuit.id);
        self.output.nameValue($('Name'), circuit.name);
        self.output.nameValue($('Type'), resourceInfo.resourceType);
        self.output.nameValue($('Location'), circuit.location);
        self.output.nameValue($('Provisioning state'), circuit.provisioningState);
        self.output.nameValue($('Tags'), tagUtils.getTagsInfo(circuit.tags));
        self.output.nameValue($('Circuit provisioning state'), circuit.circuitProvisioningState);
        self.output.nameValue($('Service Key'), circuit.serviceKey);

        self.output.header($('Service provider'));
        self.output.nameValue($('Name'), circuit.serviceProviderProperties.serviceProviderName, 2);
        self.output.nameValue($('Provisioning state'), circuit.serviceProviderProvisioningState, 2);
        self.output.nameValue($('Peering location'), circuit.serviceProviderProperties.peeringLocation, 2);
        self.output.nameValue($('Bandwidth in Mbps'), circuit.serviceProviderProperties.bandwidthInMbps, 2);

        self.output.header($('SKU'));
        self.output.nameValue($('Name'), circuit.sku.name, 2);
        self.output.nameValue($('Tier'), circuit.sku.tier, 2);
        self.output.nameValue($('Family'), circuit.sku.family, 2);
      }
    });
  },

  delete: function (resourceGroupName, circuitName, options, _) {
    var self = this;
    var circuit = self.get(resourceGroupName, circuitName, _);

    if (!circuit) {
      throw new Error(util.format($('An express route circuit with name "%s" not found in the resource group "%s"'), circuitName, resourceGroupName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete express route circuit "%s"? [y/n] '), circuitName), _)) {
      return;
    }

    var progress = self.interaction.progress(util.format($('Deleting express route circuit "%s"'), circuitName));
    try {
      self.networkResourceProviderClient.expressRouteCircuits.deleteMethod(resourceGroupName, circuitName, _);
    } finally {
      progress.end();
    }
  },

  get: function (resourceGroupName, circuitName, _) {
    var self = this;
    var progress = self.interaction.progress(util.format($('Looking up the express route circuit "%s"'), circuitName));

    try {
      var circuit = self.networkResourceProviderClient.expressRouteCircuits.get(resourceGroupName, circuitName, _);
      return circuit.expressRouteCircuit;
    } catch (e) {
      if (e.statusCode === 404) {
        return null;
      }
      throw e;
    } finally {
      progress.end();
    }
  },

  /**
   * Service provider methods
   */
  listProviders: function (options, _) {
    var self = this;
    var progress = self.interaction.progress($('Getting express route service providers'));

    var providers = null;
    try {
      providers = self.networkResourceProviderClient.expressRouteServiceProviders.list(_);
    } finally {
      progress.end();
    }

    self.interaction.formatOutput(providers.expressRouteServiceProviders, function (providers) {
      if (providers.length === 0) {
        self.output.warn($('No express route service providers found'));
        return;
      }
      self.output.table(providers, function (row, provider) {
        row.cell($('Name'), provider.name);
        var bandwidthRange = '';
        if (provider.bandwidthsOffered.length > 1) {
          bandwidthRange = util.format('%s-%s',
            provider.bandwidthsOffered.shift().offerName, provider.bandwidthsOffered.pop().offerName);
        } else if (provider.bandwidthsOffered.length == 1) {
          bandwidthRange = provider.bandwidthsOffered.shift().offerName;
        }
        row.cell($('Bandwidths offered'), bandwidthRange);
        row.cell($('Peering locations'), provider.peeringLocations.join());
      });
    });
  },

  /**
   * Circuid peering methods
   */

  createPeering: function (resourceGroupName, circuitName, name, options, _) {
    var self = this;
    var circuit = self.get(resourceGroupName, circuitName, _);
    if (!circuit) {
      throw new Error(util.format($('An express route circuit with name "%s" not found in the resource group "%s"'), circuitName, resourceGroupName));
    }
    var peering = self.getPeering(resourceGroupName, circuitName, name, _);
    if (peering) {
      throw new Error(util.format($('An express route circuit peering with name "%s" already exists in circuit "%s" in the resource group "%s"'), name, circuitName, resourceGroupName));
    }
    peering = {
      name: name
    };
    peering = self._parseCircuitPeering(peering, options, true);

    var progress = self.interaction.progress(util.format($('Creating express route peering "%s" in circuit "%s"'), name, circuitName));
    try {
      self.networkResourceProviderClient.expressRouteCircuitPeerings.createOrUpdate(resourceGroupName, circuitName, name, peering, _);
    } finally {
      progress.end();
    }
    self.showPeering(resourceGroupName, circuitName, name, options, _);
  },

  setPeering: function (resourceGroupName, circuitName, name, options, _) {
    var self = this;
    var circuit = self.get(resourceGroupName, circuitName, _);
    if (!circuit) {
      throw new Error(util.format($('An express route circuit with name "%s" not found in the resource group "%s"'), circuitName, resourceGroupName));
    }
    var peering = self.getPeering(resourceGroupName, circuitName, name, _);
    if (!peering) {
      throw new Error(util.format($('An express route circuit peering with name "%s" not found in circuit "%s" in the resource group "%s"'), name, circuitName, resourceGroupName));
    }

    peering = self._parseCircuitPeering(peering, options, false);
    var progress = self.interaction.progress(util.format($('Setting express route peering "%s" in circuit "%s"'), name, circuitName));
    try {
      self.networkResourceProviderClient.expressRouteCircuitPeerings.createOrUpdate(resourceGroupName, circuitName, name, peering, _);
    } finally {
      progress.end();
    }
    self.showPeering(resourceGroupName, circuitName, name, options, _);
  },

  showPeering: function (resourceGroupName, circuitName, name, options, _) {
    var self = this;
    var peering = self.getPeering(resourceGroupName, circuitName, name, _);
    if (!peering) {
      throw new Error(util.format($('An express route circuit peering with name "%s" not found in the circuit "%s" in resource group "%s"'), name, circuitName, resourceGroupName));
    }

    self.interaction.formatOutput(peering, function (peering) {
      if (peering === null) {
        self.output.warn(util.format($('An express route circuit peering with name "%s" not found in the circuit "%s" in resource group "%s"'), name, circuitName, resourceGroupName));
      } else {
        var resourceInfo = resourceUtils.getResourceInformation(peering.id);
        self.output.nameValue($('Name'), peering.name);
        self.output.nameValue($('Id'), peering.id);
        self.output.nameValue($('Type'), resourceInfo.resourceType);
        self.output.nameValue($('etag'), peering.etag);

        self.output.header($('Properties'));
        self.output.nameValue($('Provisioning State'), peering.provisioningState, 2);
        self.output.nameValue($('Peering Type'), peering.peeringType, 2);
        self.output.nameValue($('Peer ASN'), peering.peerASN, 2);
        self.output.nameValue($('Primary Peer Address Prefix'), peering.primaryPeerAddressPrefix, 2);
        self.output.nameValue($('Secondary Peer Address Prefix'), peering.secondaryPeerAddressPrefix, 2);
        self.output.nameValue($('Primary Azure Port'), peering.primaryAzurePort, 2);
        self.output.nameValue($('Secondary Azure Port'), peering.secondaryAzurePort, 2);
        self.output.nameValue($('State'), peering.state, 2);
        self.output.nameValue($('Azure ASN'), peering.azureASN, 2);
        self.output.nameValue($('Shared Key'), peering.sharedKey, 2);
        self.output.nameValue($('Vlan Id'), peering.vlanId, 2);

        if (peering.microsoftPeeringConfig) {
          self.output.header($('Microsoft Peering Config'), 2);
          self.output.list($('Advertised Public Prefixes'), peering.microsoftPeeringConfig.advertisedPublicPrefixes, 4);
          self.output.nameValue($('Advertised Public Prefix State'), peering.microsoftPeeringConfig.advertisedPublicPrefixesState, 4);
          self.output.nameValue($('Customer Asn'), peering.microsoftPeeringConfig.customerASN, 4);
          self.output.nameValue($('Routing Registry Name'), peering.microsoftPeeringConfig.routingRegistryName, 4);
        }
      }
    });
  },

  deletePeering: function (resourceGroupName, circuitName, name, options, _) {
    var self = this;

    var peering = self.getPeering(resourceGroupName, circuitName, name, _);
    if (!peering) {
      throw new Error(util.format($('An express route circuit peering with name "%s" not found in the circuit "%s" in resource group "%s"'), name, circuitName, resourceGroupName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete express route circuit peering "%s" from circuit "%s"? [y/n] '), name, circuitName), _)) {
      return;
    }

    var progress = self.interaction.progress(util.format($('Deleting express route circuit peering "%s"'), name));
    try {
      self.networkResourceProviderClient.expressRouteCircuitPeerings.deleteMethod(resourceGroupName, circuitName, name, _);
    } finally {
      progress.end();
    }
  },

  listPeering: function (resourceGroupName, circuitName, options, _) {
    var self = this;
    var progress = self.interaction.progress($('Getting the express route circuit peerings'));

    var peerings = null;
    try {
      peerings = self.networkResourceProviderClient.expressRouteCircuitPeerings.list(resourceGroupName, circuitName, _);
    } finally {
      progress.end();
    }

    self.interaction.formatOutput(peerings.peerings, function (peerings) {
      if (peerings.length === 0) {
        self.output.warn($('No express route circuits found'));
      } else {
        self.output.table(peerings, function (row, peering) {
          row.cell($('Name'), peering.name);
          row.cell($('Provisioning State'), peering.provisioningState);
          row.cell($('Peering Type'), peering.peeringType);
          row.cell($('State'), peering.state);
          row.cell($('Vlan Id'), peering.vlanId);
        });
      }
    });
  },

  getPeering: function (resourceGroupName, circuitName, name, _) {
    var self = this;
    var progress = self.interaction.progress(util.format($('Looking up the express route circuit "%s" peering "%s"'), circuitName, name));
    try {
      var peering = self.networkResourceProviderClient.expressRouteCircuitPeerings.get(resourceGroupName, circuitName, name, _);
      return peering.peering;
    } catch (e) {
      if (e.statusCode === 404) {
        return null;
      }
      throw e;
    } finally {
      progress.end();
    }
  },

  _parseCircuit: function (circuit, options, useDefaults) {
    var self = this;

    if (options.bandwidthInMbps) {
      if (isNaN(options.bandwidthInMbps)) {
        throw new Error($('--bandwidth-in-mbps parameter must be an integer'));
      }
      circuit.serviceProviderProperties.bandwidthInMbps = options.bandwidthInMbps;
    } else if (useDefaults) {
      var defBandwidth = constants.expressRoute.defBandwidthInMbps;
      self.output.warn(util.format($('Using default bandwidth: %s'), defBandwidth));
      circuit.serviceProviderProperties.bandwidthInMbps = defBandwidth;
    }

    if (options.skuTier) {
      circuit.sku.tier = utils.verifyParamExistsInCollection(constants.expressRoute.tier, options.skuTier, '--sku-tier');
    } else if (useDefaults) {
      var defTier = constants.expressRoute.tier[0];
      self.output.warn(util.format($('Using default sku tier: %s'), defTier));
      circuit.sku.tier = defTier;
    }

    if (options.skuFamily) {
      circuit.sku.family = utils.verifyParamExistsInCollection(constants.expressRoute.family, options.skuFamily, '--sku-family');
    } else if (useDefaults) {
      var defFamily = constants.expressRoute.family[0];
      self.output.warn(util.format($('Using default sku family: %s'), defFamily));
      circuit.sku.family = defFamily;
    }

    if (circuit.sku.tier && circuit.sku.family) {
      circuit.sku.name = circuit.sku.tier + '_' + circuit.sku.family;
    }

    if (options.tags) {
      circuit.tags = tagUtils.buildTagsParameter(null, options);
    }

    if (options.tags === false) {
      circuit.tags = {};
    }

    return circuit;
  },

  _parseCircuitPeering: function (peering, options, useDefaults) {
    var self = this;
    peering.properties = {};
    if (options.type) {
      peering.peeringType = utils.verifyParamExistsInCollection(constants.expressRoute.peering.type, options.type, '--type');
    } else {
      if (useDefaults) {
        peering.peeringType = constants.expressRoute.peering.type[0];
        self.output.warn(util.format($('Using default peering type: %s'), peering.peeringType));
      }
    }

    if (options.azureAsn) {
      peering.azureASN = options.azureAsn;
    }

    if (options.peerAsn) {
      peering.peerASN = options.peerAsn;
    }

    if (options.primaryAddressPrefix) {
      self._validateAddressPrefix(options.primaryAddressPrefix);
      peering.primaryPeerAddressPrefix = options.primaryAddressPrefix;
    }

    if (options.secondaryAddressPrefix) {
      self._validateAddressPrefix(options.secondaryAddressPrefix);
      peering.secondaryPeerAddressPrefix = options.secondaryAddressPrefix;
    }

    if (options.primaryAzurePort) {
      peering.primaryAzurePort = options.primaryAzurePort;
    }

    if (options.secondaryPeerAddressPrefix) {
      peering.secondaryPeerAddressPrefix = options.secondaryPeerAddressPrefix;
    }

    if (options.state) {
      peering.state = utils.verifyParamExistsInCollection(constants.expressRoute.peering.state, options.state, '--state');
    }

    if (options.sharedKey) {
      peering.sharedKey = options.sharedKey;
    }

    if (options.vlanId) {
      peering.vlanId = options.vlanId;
    }

    if (peering.peeringType.toLowerCase() !== 'microsoftpeering') {
      return peering;
    }

    peering.microsoftPeeringConfig = {};
    if (options.msAdvertisedPublicPrefixes) {
      var addressPrefixes = options.msAdvertisedPublicPrefixes.split(',');

      peering.microsoftPeeringConfig.advertisedPublicPrefixes = [];
      addressPrefixes.forEach(function (prefix) {
        prefix = prefix.trim();
        self._validateAddressPrefix(prefix);
        peering.microsoftPeeringConfig.advertisedPublicPrefixes.push(prefix);
      });
    }

    if (options.msAdvertisedPublicPrefixState) {
      peering.microsoftPeeringConfig.advertisedPublicPrefixesState = utils.verifyParamExistsInCollection(
        constants.expressRoute.peering.publicPrefixState, options.msAdvertisedPublicPrefixState, '--ms-advertised-public-prefix-state');
    } else {
      if (useDefaults) {
        peering.microsoftPeeringConfig.advertisedPublicPrefixesState = constants.expressRoute.peering.publicPrefixState[0];
        self.output.warn(util.format($('Using default peering config: %s'), peering.microsoftPeeringConfig.advertisedPublicPrefixState));
      }
    }

    if (options.msCustomerAsn) {
      peering.microsoftPeeringConfig.customerASN = options.msCustomerAsn;
    }

    if (options.msRoutingRegistryName) {
      peering.microsoftPeeringConfig.routingRegistryName = utils.verifyParamExistsInCollection(
        constants.expressRoute.peering.registryName, options.msRoutingRegistryName, '--ms-routing-registry-name');
    } else {
      if (useDefaults) {
        peering.microsoftPeeringConfig.routingRegistryName = constants.expressRoute.peering.registryName[0];
        self.output.warn(util.format($('Using default peering routing registry name: %s'), peering.microsoftPeeringConfig.routingRegistryName));
      }
    }
    return peering;
  },

  _validateAddressPrefix: function (addressPrefix) {
    var self = this;

    if (utils.stringIsNullOrEmpty(addressPrefix)) {
      throw new Error($('address prefix parameter must not be null or empty string'));
    }

    var ipValidationResult = self.vnetUtil.parseIPv4Cidr(addressPrefix);
    if (ipValidationResult.error) {
      throw new Error($(ipValidationResult.error));
    }
    if (ipValidationResult.cidr === null) {
      throw new Error($('The --address-prefix must be in cidr format (---.---.---.---/cidr)'));
    }
  }
});

module.exports = ExpressRoute;