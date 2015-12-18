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
var EndPointUtil = require('../../../util/endpointUtil')
var VNetUtil = require('../../../util/vnet.util');
var PublicIp = require('./publicIp');
var Subnet = require('./subnet');

function LoadBalancer(cli, networkManagementClient) {
  this.networkManagementClient = networkManagementClient;
  this.publicIpCrud = new PublicIp(cli, networkManagementClient);
  this.subnetCrud = new Subnet(cli, networkManagementClient);
  this.endpointUtil = new EndPointUtil();
  this.vnetUtil = new VNetUtil();
  this.output = cli.output;
  this.interaction = cli.interaction;
}

__.extend(LoadBalancer.prototype, {

  /**
   * Load Balancer methods
   */
  create: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var parameters = {
      location: options.location
    };

    parameters = self._parseLoadBalancer(parameters, options);

    var lb = self.get(resourceGroupName, lbName, _);
    if (lb) {
      throw new Error(util.format($('A load balancer with name "%s" already exists in the resource group "%s"'), lbName, resourceGroupName));
    }

    var progress = self.interaction.progress(util.format($('Creating load balancer "%s"'), lbName));
    try {
      lb = self.networkManagementClient.loadBalancers.createOrUpdate(resourceGroupName, lbName, parameters, _);
    } finally {
      progress.end();
    }
    self._showLoadBalancer(lb);
  },

  set: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    lb = self._parseLoadBalancer(lb, options);

    lb = self.update(resourceGroupName, lbName, lb, _);
    self._showLoadBalancer(lb);
  },

  list: function (options, _) {
    var self = this;

    var progress = self.interaction.progress($('Looking up load balancers'));
    var lbs = null;

    try {
      if (options.resourceGroup) {
        lbs = self.networkManagementClient.loadBalancers.list(options.resourceGroup, _);
      } else {
        lbs = self.networkManagementClient.loadBalancers.listAll(_);
      }
    } finally {
      progress.end();
    }

    self.interaction.formatOutput(lbs, function (lbs) {
      if (lbs.length === 0) {
        self.output.warn($('No load balancers found'));
      } else {
        self.output.table(lbs, function (row, lb) {
          row.cell($('Name'), lb.name);
          row.cell($('Location'), lb.location);
          var resInfo = resourceUtils.getResourceInformation(lb.id);
          row.cell($('Resource group'), resInfo.resourceGroup);
          row.cell($('Provisioning state'), lb.provisioningState);
          row.cell($('Probe'), lb.probes.length);
          row.cell($('FIP'), lb.frontendIPConfigurations.length);
          row.cell($('Backend pool'), lb.backendAddressPools.length);
          row.cell($('Rule'), lb.loadBalancingRules.length);
          row.cell($('Inbound NAT rule'), lb.inboundNatRules.length);
          row.cell($('Inbound NAT pool'), lb.inboundNatPools.length);
          row.cell($('Outbound NAT rule'), lb.outboundNatRules.length);
        });
      }
    });
  },

  show: function (resourceGroupName, lbName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    self.interaction.formatOutput(lb, function (lb) {
      if (lb === null) {
        self.output.warn(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
      } else {
        self._showLoadBalancer(lb);
      }
    });
  },

  get: function (resourceGroupName, lbName, _) {
    var self = this;
    var progress = self.interaction.progress(util.format($('Looking up the load balancer "%s"'), lbName));
    try {
      var lb = self.networkManagementClient.loadBalancers.get(resourceGroupName, lbName, _);
      return lb;
    } catch (e) {
      if (e.statusCode === 404) {
        return null;
      }
      throw e;
    } finally {
      progress.end();
    }
  },

  delete: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete load balancer "%s"? [y/n] '), lbName), _)) {
      return;
    }

    var progress = self.interaction.progress(util.format($('Deleting load balancer "%s"'), lbName));
    try {
      self.networkManagementClient.loadBalancers.deleteMethod(resourceGroupName, lbName, _);
    } finally {
      progress.end();
    }
  },

  update: function (resourceGroupName, lbName, parameters, _) {
    var self = this;
    var progress = self.interaction.progress(util.format($('Updating load balancer "%s"'), lbName));
    try {
      var lb = self.networkManagementClient.loadBalancers.createOrUpdate(resourceGroupName, lbName, parameters, _);
      return lb;
    } finally {
      progress.end();
    }
  },

  /**
   * Frontend IP Configuration methods
   */
  createFrontendIP: function (resourceGroupName, lbName, fipName, options, _) {
    var self = this;

    if (!options.publicIpName && !options.subnetName && !options.subnetVnetName) {
      throw new Error($('You must specify --public-ip-name or --subnet-name, --subnet-vnet-name'), lbName, resourceGroupName);
    }

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var fip = {
      name: fipName,
      privateIPAllocationMethod: 'Dynamic'
    };

    fip = self._parseFrontendIP(resourceGroupName, fip, options, _);

    if (utils.findFirstCaseIgnore(lb.frontendIPConfigurations, {name: fipName})) {
      throw new Error(util.format($('Frontend IP configuration with name "%s" already exists in the load balancer "%s"'), fipName, lbName));
    }

    console.log('%j', fip);
    lb.frontendIPConfigurations.push(fip);

    lb = self.update(resourceGroupName, lbName, lb, _);

    fip = utils.findFirstCaseIgnore(lb.frontendIPConfigurations, {name: fipName});
    self._showFrontendIP(fip);
  },

  setFrontendIP: function (resourceGroupName, lbName, fipName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var fipConfiguration = utils.findFirstCaseIgnore(lb.frontendIpConfigurations, {name: fipName});
    if (!fipConfiguration) {
      throw new Error(util.format($('Frontend IP configuration with name "%s" not found in the load balancer "%s"'), ruleName, lbName));
    }

    self._parseFrontendIP(resourceGroupName, fipConfiguration, options, _);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedFip = utils.findFirstCaseIgnore(updatedLb.frontendIpConfigurations, {name: fipName});
    self.showFrontendIP(updatedFip);
  },

  listFrontendIPs: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    self.interaction.formatOutput(lb.frontendIPConfigurations, function (fips) {
      if (fips.length === 0) {
        self.output.warn($('No frontend IP configurations found'));
      } else {
        self._listFrontendIP(fips);
      }
    });
  },

  deleteFrontendIP: function (resourceGroupName, lbName, fipName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var index = utils.indexOfCaseIgnore(lb.frontendIPConfigurations, {name: fipName});
    if (index === -1) {
      throw new Error(util.format($('Frontend IP configuration with name "%s" not found in the load balancer "%s"'), fipName, lbName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete frontend IP configuration "%s" ? [y/n] '), fipName), _)) {
      return;
    }

    lb.frontendIPConfigurations.splice(index, 1);
    self.update(resourceGroupName, lbName, lb, _);
  },

  /**
   * Probe methods
   */
  createProbe: function (resourceGroupName, lbName, probeName, options, _) {
    var self = this;

    var probe = {
      name: probeName
    };

    probe = self._parseProbe(probe, options, true);
    console.log('%j', probe);

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    if (utils.findFirstCaseIgnore(lb.probes, {name: probeName})) {
      throw new Error(util.format($('A probe with name "%s" already exists in the load balancer "%s"'), probeName, lbName));
    }

    lb.probes.push(probe);
    lb = self.update(resourceGroupName, lbName, lb, _);

    probe = utils.findFirstCaseIgnore(lb.probes, {name: probeName});
    self._showProbe(probe);
  },

  setProbe: function (resourceGroupName, lbName, probeName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var probe = utils.findFirstCaseIgnore(lb.probes, {
      name: probeName
    });
    if (!probe) {
      throw new Error(util.format($('A probe with name "%s" not found in the load balancer "%s"'), probeName, lbName));
    }

    probe = self._parseProbe(probe, options, false);
    console.log('%j', probe);
    lb = self.update(resourceGroupName, lbName, lb, _);

    probe = utils.findFirstCaseIgnore(lb.probes, {name: probeName});
    self._showProbe(probe);
  },

  listProbes: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    self.interaction.formatOutput(lb.probes, function (probes) {
      if (probes.length === 0) {
        self.output.warn($('No probes found'));
      } else {
        self._listProbes(probes);
      }
    });
  },

  deleteProbe: function (resourceGroupName, lbName, probeName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var index = utils.indexOfCaseIgnore(lb.probes, {name: probeName});
    if (index === -1) {
      throw new Error(util.format($('A probe with name with name "%s" not found in the load balancer "%s"'), probeName, lbName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete probe "%s" ? [y/n] '), probeName), _)) {
      return;
    }

    lb.probes.splice(index, 1);
    self.update(resourceGroupName, lbName, lb, _);
  },

  /**
   * Backend Address Pool methods
   */
  createBackendAddressPool: function (resourceGroupName, lbName, poolName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    if (utils.findFirstCaseIgnore(lb.backendAddressPools, {name: poolName})) {
      throw new Error(util.format($('A backend address pool with name "%s" already exists in the load balancer "%s"'), ruleName, lbName));
    }

    var backendAddressPool = {
      name: poolName,
      properties: {}
    };

    lb.backendAddressPools.push(backendAddressPool);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedPool = utils.findFirstCaseIgnore(updatedLb.backendAddressPools, {name: poolName});
    self.showBackendAddressPool(updatedPool);
  },

  listBackendAddressPools: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    self.interaction.formatOutput(lb.backendAddressPools, function (pools) {
      if (pools.length === 0) {
        self.output.warn($('No backend address pools found'));
      } else {
        self._listBackendAddressPools(pools);
      }
    });
  },

  deleteBackendAddressPool: function (resourceGroupName, lbName, poolName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var poolIndex = utils.indexOfCaseIgnore(lb.backendAddressPools, {name: poolName});
    if (poolIndex === -1) {
      throw new Error(util.format($('Backend address pool with name with name "%s" not found in the load balancer "%s"'), poolName, lbName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete backend address pool "%s" ? [y/n] '), poolName), _)) {
      return;
    }

    lb.backendAddressPools.splice(poolIndex, 1);
    self.update(resourceGroupName, lbName, lb, _);
  },

  /**
   * Rules methods
   */
  createBalancingRule: function (resourceGroupName, lbName, ruleName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var lbRule = utils.findFirstCaseIgnore(lb.loadBalancingRules, {name: ruleName});
    if (lbRule) {
      throw new Error(util.format($('Load balancing rule with name "%s" already exists in load balancer "%s"'), ruleName, lbName));
    }

    var rule = {
      name: ruleName
    };
    rule = self._parseRule(lb, rule, options, true);

    lb.loadBalancingRules.push(rule);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedRule = utils.findFirstCaseIgnore(updatedLb.loadBalancingRules, {name: ruleName});
    self.showRule(updatedRule);
  },

  setBalancingRule: function (resourceGroupName, lbName, ruleName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var lbRule = utils.findFirstCaseIgnore(lb.loadBalancingRules, {name: ruleName});
    if (!lbRule) {
      throw new Error(util.format($('Rule with the name "%s" not found in load balancer "%s"'), ruleName, lbName));
    }

    lbRule.name = options.newRuleName || ruleName;
    lbRule = self._parseRule(lb, lbRule, options, false);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedRule = utils.findFirstCaseIgnore(updatedLb.loadBalancingRules, {name: ruleName});
    self.showRule(updatedRule);
  },

  listBalancingRules: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    self.interaction.formatOutput(lb.loadBalancingRules, function (rules) {
      if (rules.length === 0) {
        self.output.warn($('No load balancing rules found'));
      } else {
        self._listBalancingRules(rules);
      }
    });
  },

  deleteBalancingRule: function (resourceGroupName, lbName, ruleName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var index = utils.indexOfCaseIgnore(lb.loadBalancingRules, {name: ruleName});
    if (index === -1) {
      throw new Error(util.format($('A load balancing rule with name "%s" not found in the load balancer "%s"'), ruleName, lbName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete load balancing rule "%s" ? [y/n] '), ruleName), _)) {
      return;
    }

    lb.loadBalancingRules.splice(index, 1);
    self.update(resourceGroupName, lbName, lb, _);
  },

  /**
   * Inbound NAT Rules methods
   */
  createInboundNatRule: function (resourceGroupName, lbName, ruleName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var inboundRule = {
      name: ruleName
    };
    inboundRule = self._parseInboundNatRule(resourceGroupName, lb, inboundRule, options, true);

    if (utils.findFirstCaseIgnore(lb.inboundNatRules, {name: ruleName})) {
      throw new Error(util.format($('An inbound NAT rule with name "%s" already exists in the load balancer "%s"'), ruleName, lbName));
    }

    lb.inboundNatRules.push(inboundRule);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedRule = utils.findFirstCaseIgnore(updatedLb.inboundNatRules, {name: ruleName});
    self.showInboundNatRule(updatedRule);
  },

  setInboundNatRule: function (resourceGroupName, lbName, ruleName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var inboundRule = utils.findFirstCaseIgnore(lb.inboundNatRules, {name: ruleName});
    if (!inboundRule) {
      throw new Error(util.format($('An inbound NAT rule with name "%s" not found in the load balancer "%s"'), ruleName, lbName));
    }

    self._parseInboundNatRule(resourceGroupName, lb, inboundRule, options, false);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedRule = utils.findFirstCaseIgnore(updatedLb.inboundNatRules, {name: ruleName});
    self.showInboundNatRule(updatedRule);
  },

  listInboundNatRules: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    self.interaction.formatOutput(lb.inboundNatRules, function (inboundNatRules) {
      if (inboundNatRules.length === 0) {
        self.output.warn($('No inbound NAT rules found'));
      } else {
        self._listInboundNatRules(inboundNatRules);
      }
    });
  },

  deleteInboundNatRule: function (resourceGroupName, lbName, ruleName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var ruleIndex = utils.indexOfCaseIgnore(lb.inboundNatRules, {name: ruleName});
    if (ruleIndex === -1) {
      throw new Error(util.format($('An inbound NAT rule with name "%s" not found in the load balancer "%s"'), ruleName, lbName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete inbound NAT rule "%s" ? [y/n] '), ruleName), _)) {
      return;
    }

    lb.inboundNatRules.splice(ruleIndex, 1);
    self.update(resourceGroupName, lbName, lb, _);
  },

  /**
   * Inbound NAT Pools methods
   */
  createInboundNatPool: function (resourceGroupName, lbName, poolName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var inboundPool = {
      name: poolName
    };
    inboundPool = self._parseInboundNatPool(resourceGroupName, lb, inboundPool, options, true);

    if (utils.findFirstCaseIgnore(lb.inboundNatPools, {name: poolName})) {
      throw new Error(util.format($('An inbound NAT pool with name "%s" already exists in the load balancer "%s"'), poolName, lbName));
    }

    lb.inboundNatPools.push(inboundPool);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedPool = utils.findFirstCaseIgnore(updatedLb.inboundNatPools, {name: poolName});
    if (!updatedPool) throw new Error(util.format($('An inbound NAT pool with name "%s" not found in the resource group "%s"'), poolName, resourceGroupName));

    self.showInboundNatPool(updatedPool);
  },

  setInboundNatPool: function (resourceGroupName, lbName, poolName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var inboundPool = utils.findFirstCaseIgnore(lb.inboundNatPools, {name: poolName});
    if (!inboundPool) {
      throw new Error(util.format($('An inbound NAT pool with name "%s" not found in the load balancer "%s"'), poolName, lbName));
    }

    self._parseInboundNatPool(resourceGroupName, lb, inboundPool, options, false);
    self.update(resourceGroupName, lbName, lb, _);

    var updatedLb = self.get(resourceGroupName, lbName, _);
    var updatedPool = utils.findFirstCaseIgnore(updatedLb.inboundNatPools, {name: poolName});
    self.showInboundNatPool(updatedPool);
  },

  listInboundNatPools: function (resourceGroupName, lbName, options, _) {
    var self = this;

    var lb = self.get(resourceGroupName, lbName, _);
    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    self.interaction.formatOutput(lb.inboundNatPools, function (inboundNatPools) {
      if (inboundNatPools.length === 0) {
        self.output.warn($('No inbound NAT pools found'));
      } else {
        self._listInboundNatPools(inboundNatPools);
      }
    });
  },

  deleteInboundNatPool: function (resourceGroupName, lbName, poolName, options, _) {
    var self = this;
    var lb = self.get(resourceGroupName, lbName, _);

    if (!lb) {
      throw new Error(util.format($('A load balancer with name "%s" not found in the resource group "%s"'), lbName, resourceGroupName));
    }

    var poolIndex = utils.indexOfCaseIgnore(lb.inboundNatPools, {name: poolName});
    if (poolIndex === -1) {
      throw new Error(util.format($('An inbound NAT pool with name "%s" not found in the load balancer "%s"'), poolName, lbName));
    }

    if (!options.quiet && !self.interaction.confirm(util.format($('Delete inbound NAT pool "%s" ? [y/n] '), poolName), _)) {
      return;
    }

    lb.inboundNatPools.splice(poolIndex, 1);
    self.update(resourceGroupName, lbName, lb, _);
  },

  /**
   * Private methods
   */
  _parseLoadBalancer: function (lb, options) {
    if (options.tags) {
      if (utils.argHasValue(options.tags)) {
        tagUtils.appendTags(lb, options);
      } else {
        lb.tags = {};
      }
    }

    return lb;
  },

  _parseFrontendIP: function (resourceGroupName, fip, options, _) {
    var self = this;

    if (options.privateIpAddress) {
      if (utils.argHasValue(options.privateIpAddress)) {
        var ipValidation = self.vnetUtil.parseIPv4(options.privateIpAddress);
        if (ipValidation.error) throw new Error(ipValidation.error);
        fip.privateIPAddress = options.privateIpAddress;
        fip.privateIPAllocationMethod = 'Static';
      } else {
        delete fip.privateIPAddress;
        fip.privateIPAllocationMethod = 'Dynamic';
      }
    }

    if (options.publicIpName) {
      var publicip = self.publicIpCrud.get(resourceGroupName, options.publicIpName, _);
      if (!publicip) {
        throw new Error(util.format($('A public ip address with name "%s" not found in the resource group "%s"'), options.publicIpName, resourceGroupName));
      }
      fip.publicIPAddress = publicip;
      delete fip.subnet;
    }

    if (options.subnetName && options.subnetVnetName) {
      var subnet = self.subnetCrud.get(resourceGroupName, options.subnetVnetName, options.subnetName, _);
      if (!subnet) {
        throw new Error(util.format($('A subnet with name "%s" not found in the resource group "%s"'), options.subnetName, resourceGroupName));
      }
      fip.subnet = subnet;
      delete fip.publicIPAddress;
    }

    return fip;
  },

  _parseProbe: function (probe, options, useDefaults) {
    var self = this;

    if (options.path) {
      if (utils.stringIsNullOrEmpty(options.path)) {
        throw new Error($('--path must not be null or empty string'));
      }
      probe.requestPath = options.path;
    }

    if (options.protocol) {
      var protocolValidation = self.endpointUtil.validateProbProtocol(options.protocol, '--protocol');
      if (protocolValidation.error) {
        throw new Error(protocolValidation.error);
      }

      if (utils.ignoreCaseEquals(options.protocol, self.endpointUtil.protocols.TCP) && options.path) {
        self.output.warn($('--path will be ignored when probe protocol is TCP'));
        delete probe.requestPath;
      }

      if (utils.ignoreCaseEquals(options.protocol, self.endpointUtil.protocols.HTTP) && !options.path) {
        throw new Error($('--path is required when probe protocol is HTTP'));
      }

      probe.protocol = protocolValidation.protocol;
    } else if (useDefaults) {
      self.output.warn(util.format($('Using default probe protocol: %s'), constants.lb.defProtocol));
      probe.protocol = constants.lb.defProtocol;
    }

    if (options.port) {
      var portValidation = self.endpointUtil.validatePort(options.port, '--port');
      if (portValidation.error) throw new Error(portValidation.error);
      probe.port = portValidation.port;
    } else if (useDefaults) {
      self.output.warn(util.format($('Using default probe port: %s'), constants.lb.defPort));
      probe.port = constants.lb.defPort;
    }

    if (options.interval) {
      var intervalValidation = self.endpointUtil.validateProbInterval(options.interval, '--interval');
      if (intervalValidation.error) throw new Error(intervalValidation.error);
      probe.intervalInSeconds = intervalValidation.interval;
    }

    if (options.count) {
      var countAsInt = utils.parseInt(options.count);
      if (isNaN(countAsInt)) {
        throw new Error(util.format($('Count parameter must be an integer'), countAsInt));
      }
      probe.numberOfProbes = countAsInt;
    }

    return probe;
  },

  _parseRule: function (lb, rule, options, useDefaults) {
    var self = this;

    if (options.protocol) {
      var protocolValidation = self.endpointUtil.validateProtocol(options.protocol, 'protocol');
      if (protocolValidation.error) {
        throw new Error(protocolValidation.error);
      }

      rule.protocol = options.protocol;
    } else if (useDefaults) {
      options.protocol = constants.lb.defProtocol;
      self.output.warn(util.format($('Using default protocol: %s'), options.protocol));
      rule.protocol = options.protocol;
    }

    if (options.frontendPort) {
      var frontendPortValidation = self.endpointUtil.validatePort(options.frontendPort, 'front end port');
      if (frontendPortValidation.error) {
        throw new Error(frontendPortValidation.error);
      }

      rule.frontendPort = options.frontendPort;
    } else if (useDefaults) {
      options.frontendPort = constants.lb.defPort;
      self.output.warn(util.format($('Using default frontend port: %s'), options.frontendPort));
      rule.frontendPort = options.frontendPort;
    }

    if (options.backendPort) {
      var backendPortValidation = self.endpointUtil.validatePort(options.backendPort, 'back end port');
      if (backendPortValidation.error) {
        throw new Error(backendPortValidation.error);
      }

      rule.backendPort = options.backendPort;
    } else if (useDefaults) {
      options.backendPort = constants.lb.defPort;
      self.output.warn(util.format($('Using default backend port: %s'), options.backendPort));
      rule.backendPort = options.backendPort;
    }

    if (options.idleTimeout) {
      var parsed = utils.parseInt(options.idleTimeout);
      if (isNaN(parsed)) {
        throw new Error($('Idle timeout must be posivite integer'));
      }

      rule.idleTimeoutInMinutes = options.idleTimeout;
    } else if (useDefaults) {
      options.idleTimeout = constants.lb.defTimeout;
      self.output.warn(util.format($('Using default idle timeout: %s'), options.idleTimeout));
      rule.idleTimeoutInMinutes = options.idleTimeout;
    }

    if (options.enableFloatingIp) {

      // Enable floating IP must be boolean.
      if (!utils.ignoreCaseEquals(options.enableFloatingIp, 'true') && !utils.ignoreCaseEquals(options.enableFloatingIp, 'false')) {
        throw new Error($('Enable floating IP parameter must be boolean'));
      }

      rule.enableFloatingIP = options.enableFloatingIp;
    } else if (useDefaults) {
      options.enableFloatingIp = constants.lb.defFloatingIp;
      self.output.warn(util.format($('Using default enable floating ip: %s'), options.enableFloatingIp));
      rule.enableFloatingIP = options.enableFloatingIp;
    }

    var backendAddressPool = null;
    if (options.backendAddressPool) {
      backendAddressPool = utils.findFirstCaseIgnore(lb.backendAddressPools, {
        name: options.backendAddressPool
      });
      if (!backendAddressPool) {
        throw new Error(util.format($('Backend address pool "%s" not found'), options.backendAddressPool));
      }

      rule.backendAddressPool = {
        id: backendAddressPool.id
      };
    } else if (useDefaults) {
      if (!lb.backendAddressPools || lb.backendAddressPools.length === 0) {
        throw new Error($('Load balancer must have at least one backend address pool if --backend-address-pool parameter is not specified.'));
      }

      self.output.warn(util.format($('Using first backend address pool: %s'), lb.backendAddressPools[0].name));
      backendAddressPool = lb.backendAddressPools[0];
      rule.backendAddressPool = {
        id: backendAddressPool.id
      };
    }

    if (options.frontendIpName) {
      rule.frontendIPConfiguration = {};
      ipConfigFound = utils.findFirstCaseIgnore(lb.frontendIpConfigurations, {
        name: options.frontendIpName
      });
      if (!ipConfigFound) {
        throw new Error(util.format($('Frontend IP config "%s" not found'), options.frontendIpName));
      }

      rule.frontendIPConfiguration.id = ipConfigFound.id;
    } else if (useDefaults) {
      rule.frontendIPConfiguration = {};
      if (!lb.frontendIpConfigurations || lb.frontendIpConfigurations.length === 0) {
        throw new Error($('Load balancer must have at least one frontend IP configuration if --frontend-ip-name parameter is not specified.'));
      }

      self.output.warn(util.format($('Using first frontend IP config: %s'), lb.frontendIpConfigurations[0].name));
      defaultIpConfig = lb.frontendIpConfigurations[0];
      rule.frontendIPConfiguration.id = defaultIpConfig.id;
    }

    var optionalProbe = utils.getOptionalArg(options.probeName);
    if (optionalProbe.hasValue) {
      if (optionalProbe.value !== null) {
        // probes must exist
        if (!lb.probes || lb.probes.length === 0) {
          throw new Error(util.format($('No probes found for the load balancer "%s"'), lb.name));
        }

        // probe with provided name must exist
        var probe = utils.findFirstCaseIgnore(lb.probes, {
          name: options.probeName
        });
        if (!probe) {
          throw new Error(util.format($('Probe "%s" not found in the load balancer "%s"'), options.probeName, lb.name));
        }

        rule.probe = {
          id: probe.id
        };
      } else {
        self.output.warn($('Clearing probe'));
        if (rule.probe) {
          delete rule.probe;
        }
      }
    }

    return rule;
  },

  _parseInboundNatRule: function (resourceGroupName, lb, inboundRule, options, useDefaults) {
    var self = this;

    if (options.protocol) {
      var protocolValidation = self.endpointUtil.validateProtocol(options.protocol, 'protocol');
      if (protocolValidation.error) {
        throw new Error(protocolValidation.error);
      }
      inboundRule.protocol = options.protocol;
    } else if (useDefaults) {
      options.protocol = constants.lb.defProtocol;
      self.output.warn(util.format($('Using default protocol: %s'), options.protocol));
      inboundRule.protocol = options.protocol;
    }

    if (options.frontendPort) {
      var frontendPortValidation = self.endpointUtil.validatePort(options.frontendPort, 'front end port');
      if (frontendPortValidation.error) {
        throw new Error(frontendPortValidation.error);
      }
      inboundRule.frontendPort = options.frontendPort;
    } else if (useDefaults) {
      options.frontendPort = constants.lb.defPort;
      self.output.warn(util.format($('Using default frontend port: %s'), options.frontendPort));
      inboundRule.frontendPort = options.frontendPort;
    }

    if (options.backendPort) {
      var backendPortValidation = self.endpointUtil.validatePort(options.backendPort, 'back end port');
      if (backendPortValidation.error) {
        throw new Error(backendPortValidation.error);
      }
      inboundRule.backendPort = options.backendPort;
    } else if (useDefaults) {
      options.backendPort = constants.lb.defPort;
      self.output.warn(util.format($('Using default backend port: %s'), options.backendPort));
      inboundRule.backendPort = options.backendPort;
    }

    if (options.enableFloatingIp) {

      // Enable floating IP must be boolean.
      if (!utils.ignoreCaseEquals(options.enableFloatingIp, 'true') && !utils.ignoreCaseEquals(options.enableFloatingIp, 'false')) {
        throw new Error($('Enable floating IP parameter must be boolean'));
      }

      inboundRule.enableFloatingIP = options.enableFloatingIp;
    } else if (useDefaults) {
      self.output.warn(util.format($('Using default enable floating ip: %s'), constants.lb.defFloatingIp));
      inboundRule.enableFloatingIP = constants.lb.defFloatingIp;
    }

    if (options.frontendIp) {
      var ipConfigurations = options.frontendIp.split(',');
      for (var num in ipConfigurations) {
        var frontendIpConf = ipConfigurations[num];
        var frontendIpConfFound = utils.findFirstCaseIgnore(lb.frontendIpConfigurations, {
          name: frontendIpConf
        });
        if (!frontendIpConfFound) {
          throw new Error(util.format($('Frontend IP config "%s" not found'), frontendIpConf));
        }
        inboundRule.frontendIPConfiguration = {
          id: frontendIpConfFound.id
        };
      }
    } else if (useDefaults) {
      if (!inboundRule.frontendIPConfiguration) {
        if (lb.frontendIpConfigurations.length === 0) {
          throw new Error(util.format($('Load balancer with name "%s" has no frontend IP configurations'), lb.name));
        }
        inboundRule.frontendIPConfiguration = {
          id: lb.frontendIpConfigurations[0].id
        };
        self.output.warn($('Setting default inbound rule frontend IP configuration'));
      }
    }

    return inboundRule;
  },

  _parseInboundNatPool: function (resourceGroupName, lb, inboundPool, options, useDefaults) {
    var self = this;

    if (options.protocol) {
      utils.verifyParamExistsInCollection(constants.lb.protocols, options.protocol, '--protocol');
      inboundPool.protocol = options.protocol;
    } else if (useDefaults) {
      var defProtocol = constants.lb.protocols[0];
      self.output.warn(util.format($('Using default protocol: %s'), defProtocol));
      inboundPool.protocol = defProtocol;
    }

    if (options.frontendPortRangeStart) {
      var portStartValidation = self.endpointUtil.validatePort(options.frontendPortRangeStart, '--frontend-port-range-start');
      if (portStartValidation.error) {
        throw new Error(portStartValidation.error);
      }
      inboundPool.frontendPortRangeStart = options.frontendPortRangeStart;
    } else if (useDefaults) {
      var defPortRangeStart = constants.portBounds[0];
      self.output.warn(util.format($('Using default frontend port range start: %s'), defPortRangeStart));
      inboundPool.frontendPortRangeStart = defPortRangeStart;
    }

    if (options.frontendPortRangeEnd) {
      var portEndValidation = self.endpointUtil.validatePort(options.frontendPortRangeEnd, '--frontend-port-range-end');
      if (portEndValidation.error) {
        throw new Error(portEndValidation.error);
      }
      inboundPool.frontendPortRangeEnd = options.frontendPortRangeEnd;
    } else if (useDefaults) {
      var defPortRangeEnd = constants.portBounds[1];
      self.output.warn(util.format($('Using default frontend port range end: %s'), defPortRangeEnd));
      inboundPool.frontendPortRangeEnd = defPortRangeEnd;
    }

    if (options.frontendPortRangeStart && options.frontendPortRangeEnd) {
      if (options.frontendPortRangeStart > options.frontendPortRangeEnd) {
        throw new Error($('The frontend port range start should be less or equal to frontend port range end'));
      }
    }

    if (options.backendPort) {
      var backendPortValidation = self.endpointUtil.validatePort(options.backendPort, '--backend-port');
      if (backendPortValidation.error) {
        throw new Error(backendPortValidation.error);
      }
      inboundPool.backendPort = options.backendPort;
    } else if (useDefaults) {
      self.output.warn(util.format($('Using default backend port: %s'), constants.lb.defPort));
      inboundPool.backendPort = constants.lb.defPort;
    }

    if (options.frontendIp) {
      var frontendIpConfig = utils.findFirstCaseIgnore(lb.frontendIpConfigurations, {name: options.frontendIp});
      if (!frontendIpConfig) {
        throw new Error(util.format($('Frontend IP configuration with name "%s" not found in load balancer "%s"'), options.frontendIp, lb.name));
      }
      inboundPool.frontendIPConfiguration = {
        id: frontendIpConfig.id
      };
    } else if (useDefaults) {
      if (!inboundPool.frontendIPConfiguration) {
        if (lb.frontendIpConfigurations.length === 0) {
          throw new Error(util.format($('Load balancer with name "%s" has no frontend IP configurations'), lb.name));
        }
        inboundPool.frontendIPConfiguration = {
          id: lb.frontendIpConfigurations[0].id
        };
        self.output.warn($('Setting default inbound NAT pool frontend IP configuration'));
      }
    }

    return inboundPool;
  },

  _showLoadBalancer: function (lb) {
    var self = this;
    self.output.nameValue($('Id'), lb.id);
    self.output.nameValue($('Name'), lb.name);
    self.output.nameValue($('Type'), lb.type);
    self.output.nameValue($('Location'), lb.location);
    self.output.nameValue($('Provisioning state'), lb.provisioningState);
    self.output.nameValue($('Tags'), tagUtils.getTagsInfo(lb.tags));
    if (lb.frontendIPConfigurations.length > 0) {
      self.output.header($('Frontend IP configurations'));
      self._listFrontendIP(lb.frontendIPConfigurations);
    }
    if (lb.probes.length > 0) {
      self.output.header($('Probes'));
      self._listProbes(lb.probes);
    }
    if (lb.backendAddressPools.length > 0) {
      self.output.header($('Backend Address Pools'));
      self._listBackendAddressPools(lb.backendAddressPools);
    }
    if (lb.loadBalancingRules.length > 0) {
      self.output.header($('Load Balancing Rules'));
      self._listBalancingRules(lb.loadBalancingRules);
    }
    if (lb.inboundNatRules.length > 0) {
      self.output.header($('Inbound NAT Rules'));
      self._listInboundNatRules(lb.inboundNatRules);
    }
    if (lb.inboundNatPools.length > 0) {
      self.output.header($('Inbound NAT Pools'));
      self._listInboundNatPools(lb.inboundNatPools);
    }
  },

  _showFrontendIP: function (fip) {
    var self = this;
    self.output.nameValue('Name', fip.name, indent);
    self.output.nameValue('Provisioning state', fip.provisioningState, indent);
    self.output.nameValue('Private IP address', fip.privateIpAddress, indent);
    self.output.nameValue('Private IP allocation method', fip.privateIpAllocationMethod, indent);
    if (fip.publicIpAddress) {
      self.output.nameValue('Public IP address id', fip.publicIpAddress.id, indent);
    }
    if (fip.subnet) {
      self.output.nameValue($('Subnet id'), fip.subnet.id, indent);
    }
  },

  _showProbe: function (probe) {
    var self = this;
    self.output.nameValue($('Name'), probe.name, indent);
    self.output.nameValue($('Provisioning state'), probe.provisioningState, indent);
    self.output.nameValue($('Protocol'), probe.protocol, indent);
    self.output.nameValue($('Port'), probe.port, indent);
    self.output.nameValue($('Interval in seconds'), probe.intervalInSeconds, indent);
    self.output.nameValue($('Number of probes'), probe.numberOfProbes, indent);
    if (!__.isEmpty(probe.loadBalancingRules)) {
      self.output.header($('Load balancing rules'), indent);
      indent += 2;
      probe.loadBalancingRules.forEach(function (probeRule) {
        self.output.listItem(probeRule.id, indent);
      });
      indent -= 2;
    }
  },

  _showBackendAddressPool: function (pool) {
    var self = this;
    self.output.nameValue($('Name'), pool.name, indent);
    self.output.nameValue($('Provisioning state'), pool.provisioningState, indent);
    if (!__.isEmpty(pool.backendIpConfigurations)) {
      self.output.header($('Backend IP configurations'), indent);
      indent += 2;
      pool.backendIpConfigurations.forEach(function (backendIpConfig) {
        self.output.listItem(backendIpConfig.id, indent);
      });
      indent -= 2;
    }
  },

  _showBalancingRule: function (rule) {
    var self = this;
    self.output.nameValue($('Name'), rule.name, indent);
    self.output.nameValue($('Provisioning state'), rule.provisioningState, indent);
    self.output.nameValue($('Protocol'), rule.protocol, indent);
    self.output.nameValue($('Frontend port'), rule.frontendPort, indent);
    self.output.nameValue($('Backend port'), rule.backendPort, indent);
    self.output.nameValue($('Enable floating IP'), rule.enableFloatingIP.toString(), indent);
    self.output.nameValue($('Idle timeout in minutes'), rule.idleTimeoutInMinutes, indent);
    if (rule.frontendIPConfiguration) {
      self.output.nameValue($('Frontend IP configuration'), rule.frontendIPConfiguration.id, indent);
    }
    if (rule.backendAddressPool) {
      self.output.nameValue($('Backend address pool'), rule.backendAddressPool.id, indent);
    }
    if (rule.probe) {
      self.output.nameValue($('Probe'), rule.probe.id, indent);
    }
  },

  _showInboundNatRule: function (rule) {
    var self = this;
    self.output.nameValue($('Name'), rule.name, indent);
    self.output.nameValue($('Provisioning state'), rule.provisioningState, indent);
    self.output.nameValue($('Protocol'), rule.protocol, indent);
    self.output.nameValue($('Frontend port'), rule.frontendPort, indent);
    self.output.nameValue($('Backend port'), rule.backendPort, indent);
    self.output.nameValue($('Enable floating IP'), rule.enableFloatingIP.toString(), indent);
    self.output.nameValue($('Idle timeout in minutes'), rule.idleTimeoutInMinutes, indent);
    if (rule.frontendIPConfiguration) {
      self.output.nameValue($('Frontend IP configuration'), rule.frontendIPConfiguration.id, indent);
    }
    if (rule.backendIPConfiguration) {
      self.output.nameValue($('Backend IP Configuration:  '), rule.backendIPConfiguration.id, indent);
    }
  },

  _showInboundNatPool: function (pool) {
    var self = this;
    self.interaction.formatOutput(pool, function (pool) {
      self.output.nameValue($('Name'), pool.name);
      self.output.nameValue($('Provisioning state'), pool.provisioningState);
      self.output.nameValue($('Protocol'), pool.protocol);
      self.output.nameValue($('Frontend port range start'), pool.frontendPortRangeStart);
      self.output.nameValue($('Frontend port range end'), pool.frontendPortRangeEnd);
      self.output.nameValue($('Backend port'), pool.backendPort);
      self.output.nameValue($('Frontend IP configuration'), pool.frontendIPConfiguration.id);
    });
  },

  _listFrontendIP: function (fips) {
    var self = this;
    self.output.table(fips, function (row, fip) {
      row.cell($('Name'), fip.name);
      row.cell($('Provisioning state'), fip.provisioningState);
      row.cell($('Private IP allocation'), fip.privateIPAllocationMethod);
      row.cell($('Private IP '), fip.privateIPAddress || '');
      var subnetName = '';
      if (fip.subnet) {
        subnetName = resourceUtils.getResourceInformation(fip.subnet.id).resourceName;
      }
      row.cell($('Subnet'), subnetName);
      var publicipName = '';
      if (fip.publicIPAddress) {
        publicipName = resourceUtils.getResourceInformation(fip.publicIPAddress.id).resourceName;
      }
      row.cell($('Public IP'), publicipName);
    });
  },

  _listProbes: function (probes) {
    var self = this;
    self.output.table(probes, function (row, probe) {
      row.cell($('Name'), probe.name);
      row.cell($('Provisioning state'), probe.provisioningState);
      row.cell($('Protocol'), probe.protocol);
      row.cell($('Port'), probe.port);
      row.cell($('Path'), probe.requestPath || '');
      row.cell($('Interval'), probe.intervalInSeconds);
      row.cell($('Count'), probe.numberOfProbes);
    });
  },

  _listBackendAddressPools: function (pools) {
    var self = this;
    self.output.table(pools, function (row, pool) {
      row.cell($('Name'), pool.name);
      row.cell($('Provisioning state'), pool.provisioningState);
    });
  },

  _listBalancingRules: function (rules) {
    var self = this;
    self.output.table(rules, function (row, rule) {
      row.cell($('Name'), rule.name);
      row.cell($('Provisioning state'), rule.provisioningState);
      row.cell($('Load distribution'), rule.loadDistribution);
      row.cell($('Protocol'), rule.protocol);
      row.cell($('Frontend port'), rule.frontendPort);
      row.cell($('Backend port'), rule.backendPort);
      row.cell($('Enable floating IP'), rule.enableFloatingIP);
      row.cell($('Idle timeout in minutes'), rule.idleTimeoutInMinutes);
    });
  },

  _listInboundNatRules: function (rules) {
    var self = this;
    self.output.table(rules, function (row, rule) {
      row.cell($('Name'), rule.name);
      row.cell($('Provisioning state'), rule.provisioningState);
      row.cell($('Protocol'), rule.protocol);
      row.cell($('Frontend port'), rule.frontendPort);
      row.cell($('Backend port'), rule.backendPort);
      row.cell($('Enable floating IP'), rule.enableFloatingIP);
      row.cell($('Idle timeout in minutes'), rule.idleTimeoutInMinutes);
    });
  },

  _listInboundNatPools: function (pools) {
    var self = this;
    self.output.table(pools, function (row, pool) {
      row.cell($('Name'), pool.name);
      row.cell($('Provisioning state'), pool.provisioningState);
      row.cell($('Protocol'), pool.protocol);
      row.cell($('Port range start'), pool.frontendPortRangeStart);
      row.cell($('Port range end'), pool.frontendPortRangeEnd);
      row.cell($('Backend port'), pool.backendPort);
      var fipInfo = resourceUtils.getResourceInformation(pool.frontendIPConfiguration.id);
      row.cell($('Frontend IP configuration'), fipInfo.resourceName);
    });
  }

});

module.exports = LoadBalancer;
