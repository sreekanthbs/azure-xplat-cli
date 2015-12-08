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

var util = require('util');
var utils = require('../../../util/utils');
var profile = require('../../../util/profile/index');
var constants = require('./constants');
var $ = utils.getLocaleString;

var AppGateway = require('./appGateway');
var VirtualNetwork = require('./virtualNetwork');
var Subnet = require('./subnet');
var LoadBalancer = require('./loadBalancer');
var PublicIp = require('./publicIp');
var Nic = require('./nic');
var Nsg = require('./nsg');
var DnsZone = require('./dnsZone');
var TrafficManager = require('./trafficManager');
var RouteTable = require('./routeTable');
var LocalNetworkGateway = require('./localNetworkGateway');
var VirtualNetworkGateway = require('./virtualNetworkGateway');
var ExpressRoute = require('./expressRoute');

exports.init = function (cli) {
  var network = cli.category('network')
    .description($('Commands to manage network resources'));

  var vnet = network.category('vnet')
    .description($('Commands to manage virtual networks'));

  vnet.command('create [resource-group] [name] [location]')
    .description('Create a virtual network')
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network'))
    .option('-l, --location <location>', $('the location'))
    .option('-a, --address-prefixes <address-prefixes>', $('the comma separated list of address prefixes for this virtual network.' +
    '\n     For example -a 10.0.0.0/24,10.0.1.0/24.' +
    '\n     Default value is 10.0.0.0/8'))
    .option('-d, --dns-servers <dns-servers>', $('the comma separated list of DNS servers IP addresses'))
    .option('-t, --tags <tags>', $('the tags set on this virtual network.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network name: '), name, _);
      location = cli.interaction.promptIfNotGiven($('Location: '), location, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var virtualNetwork = new VirtualNetwork(cli, networkResourceProviderClient);
      virtualNetwork.create(resourceGroup, name, location, options, _);
    });

  vnet.command('set [resource-group] [name]')
    .description('Set virtual network')
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network'))
    .option('-a, --address-prefixes <address-prefixes>', $('the comma separated list of address prefixes for this virtual network.' +
    '\n     For example -a 10.0.0.0/24,10.0.1.0/24.' +
    '\n     This list will be appended to the current list of address prefixes.' +
    '\n     The address prefixes in this list should not overlap between them.' +
    '\n     The address prefixes in this list should not overlap with existing address prefixes in the vnet.'))
    .option('-d, --dns-servers [dns-servers]', $('the comma separated list of DNS servers IP addresses.' +
    '\n     This list will be appended to the current list of DNS server IP addresses.'))
    .option('-t, --tags <tags>', $('the tags set on this virtual network.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional. For example, -t "tag1=value1;tag2".' +
    '\n     Existing tag values will be replaced by the values specified.'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var virtualNetwork = new VirtualNetwork(cli, networkResourceProviderClient);
      virtualNetwork.set(resourceGroup, name, options, _);
    });

  vnet.command('list [resource-group]')
    .description('Get all virtual networks')
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var virtualNetwork = new VirtualNetwork(cli, networkResourceProviderClient);
      virtualNetwork.list(resourceGroup, _);
    });

  vnet.command('show [resource-group] [name]')
    .description('Get a virtual network')
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var virtualNetwork = new VirtualNetwork(cli, networkResourceProviderClient);
      virtualNetwork.show(resourceGroup, name, null, _);
    });

  vnet.command('delete [resource-group] [name]')
    .description('Delete a virtual network')
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var virtualNetwork = new VirtualNetwork(cli, networkResourceProviderClient);
      virtualNetwork.delete(resourceGroup, name, options, _);
    });

  var subnet = vnet.category('subnet')
    .description($('Commands to manage virtual network subnets'));

  subnet.command('create [resource-group] [vnet-name] [name]')
    .description($('Create virtual network subnet'))
    .usage('[options] <resource-group> <vnet-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-n, --name <name>', $('the name of the subnet'))
    .option('-a, --address-prefix <address-prefix>', $('the address prefix'))
    .option('-w, --network-security-group-id <network-security-group-id>', $('the network security group identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/networkSecurityGroups/<nsg-name>'))
    .option('-o, --network-security-group-name <network-security-group-name>', $('the network security group name'))
    .option('-i, --route-table-id <route-table-id>', $('the route table identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/routeTables/<route-table-name>'))
    .option('-r, --route-table-name <route-table-name>', $('the route table name'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, vnetName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), vnetName, _);
      name = cli.interaction.promptIfNotGiven($('Subnet name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var subnet = new Subnet(cli, networkResourceProviderClient);
      subnet.create(resourceGroup, vnetName, name, options, _);
    });

  subnet.command('set [resource-group] [vnet-name] [name]')
    .description($('Set a virtual network subnet'))
    .usage('[options] <resource-group> <vnet-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-n, --name <name>', $('the name of the subnet'))
    .option('-a, --address-prefix <address-prefix>', $('the address prefix'))
    .option('-w, --network-security-group-id [network-security-group-id]', $('the network security group identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/networkSecurityGroups/<nsg-name>'))
    .option('-o, --network-security-group-name <network-security-group-name>', $('the network security group name'))
    .option('-i, --route-table-id <route-table-id>', $('the route table identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/routeTables/<route-table-name>'))
    .option('-r, --route-table-name <route-table-name>', $('the route table name'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, vnetName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), vnetName, _);
      name = cli.interaction.promptIfNotGiven($('Subnet name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var subnet = new Subnet(cli, networkResourceProviderClient);
      subnet.set(resourceGroup, vnetName, name, options, _);
    });

  subnet.command('list [resource-group] [vnet-name]')
    .description($('Get all virtual network subnets'))
    .usage('[options] <resource-group> <vnet-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, vnetName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), vnetName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var subnet = new Subnet(cli, networkResourceProviderClient);
      subnet.list(resourceGroup, vnetName, options, _);
    });

  subnet.command('show [resource-group] [vnet-name] [name]')
    .description($('Get a virtual network subnet'))
    .usage('[options] <resource-group> <vnet-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-n, --name <name>', $('the name of the subnet'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, vnetName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), vnetName, _);
      name = cli.interaction.promptIfNotGiven($('Subnet name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var subnet = new Subnet(cli, networkResourceProviderClient);
      subnet.show(resourceGroup, vnetName, name, options, _);
    });

  subnet.command('delete [resource-group] [vnet-name] [name]')
    .description($('Delete a subnet of a virtual network'))
    .usage('[options] <resource-group> <vnet-name> <subnet-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-n, --name <name>', $('the subnet name'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, vnetName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), vnetName, _);
      name = cli.interaction.promptIfNotGiven($('Subnet name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var subnet = new Subnet(cli, networkResourceProviderClient);
      subnet.delete(resourceGroup, vnetName, name, options, _);
    });

  var lb = network.category('lb')
    .description($('Commands to manage load balancers'));

  lb.command('create [resource-group] [name] [location]')
    .description($('Create a load balancer'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the load balancer'))
    .option('-l, --location <location>', $('the location'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional. For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Load balancer name: '), name, _);
      location = cli.interaction.promptIfNotGiven($('Location: '), location, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.create(resourceGroup, name, location, options, _);
    });

  lb.command('list [resource-group]')
    .description($('Get all load balancers'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.list(resourceGroup, _);
    });

  lb.command('show [resource-group] [name]')
    .description($('Get a load balancer'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Load balancer name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.show(resourceGroup, name, options, _);
    });

  lb.command('delete [resource-group] [name]')
    .description($('Delete a load balancer'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the load balancer'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Load balancer name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.delete(resourceGroup, name, options, _);
    });

  var lbProbe = lb.category('probe')
    .description($('Commands to manage probes of a load balancer'));

  lbProbe.command('create [resource-group] [lb-name] [name]')
    .description($('Add a probe to the load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the probe'))
    .option('-p, --protocol <protocol>', $('the probe protocol'))
    .option('-o, --port <port>', $('the probe port'))
    .option('-f, --path <path>', $('the probe path'))
    .option('-i, --interval <interval>', $('the probe interval in seconds'))
    .option('-c, --count <count>', $('the number of probes'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Probe name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.createProbe(resourceGroup, lbName, name, options, _);
    });

  lbProbe.command('set [resource-group] [lb-name] [name]')
    .usage('[options] <resource-group> <lb-name> <name>')
    .description($('Set a probe of a load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the probe'))
    .option('-e, --new-probe-name <new-probe-name>', $('the new name of the probe'))
    .option('-p, --protocol <protocol>', $('the new value for probe protocol'))
    .option('-o, --port <port>', $('the new value for probe port'))
    .option('-f, --path <path>', $('the new value for probe path'))
    .option('-i, --interval <interval>', $('the new value for probe interval in seconds'))
    .option('-c, --count <count>', $('the new value for number of probes'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Probe name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.setProbe(resourceGroup, lbName, name, options, _);
    });

  lbProbe.command('list [resource-group] [lb-name]')
    .description($('Get all probes in a load balancer'))
    .usage('[options] <resource-group> <lb-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.listProbes(resourceGroup, lbName, options, _);
    });

  lbProbe.command('delete [resource-group] [lb-name] [name]')
    .description($('Delete a probe from a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the probe name'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Probe name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.deleteProbe(resourceGroup, lbName, name, options, _);
    });

  var lbFrontendIP = lb.category('frontend-ip')
    .description('Commands to manage frontend ip configurations of a load balancer');

  lbFrontendIP.command('create [resource-group] [lb-name] [name]')
    .description($('Add a frontend ip configuration to the load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the frontend ip configuration'))
    .option('-a, --private-ip-address <private-ip-address>', $('the private ip address'))
    .option('-u, --public-ip-id <public-ip-id>', $('the public ip identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/publicIPAddresses/<public-ip-name>'))
    .option('-i, --public-ip-name <public-ip-name>', $('the public ip name.' +
    '\n     This public ip must exist in the same resource group as the lb.' +
    '\n     Please use public-ip-id if that is not the case.'))
    .option('-b, --subnet-id <subnet-id>', $('the subnet id.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/VirtualNetworks/<vnet-name>/subnets/<subnet-name>'))
    .option('-e, --subnet-name <subnet-name>', $('the subnet name'))
    .option('-m, --vnet-name <vnet-name>', $('the virtual network name.' +
    '\n     This virtual network must exist in the same resource group as the lb.' +
    '\n     Please use subnet-id if that is not the case.'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend ip configuration name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.createFrontendIP(resourceGroup, lbName, name, options, _);
    });

  lbFrontendIP.command('set [resource-group] [lb-name] [name]')
    .description($('Set a frontend ip configuration of a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the frontend ip configuration'))
    .option('-a, --private-ip-address <private-ip-address>', $('the private ip address'))
    .option('-u, --public-ip-id [public-ip-id]', $('the public ip identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/publicIPAddresses/<public-ip-name>'))
    .option('-i, --public-ip-name <public-ip-name>', $('the public ip name.' +
    '\n     This public ip must exist in the same resource group as the lb.' +
    '\n     Please use public-ip-id if that is not the case.'))
    .option('-b, --subnet-id [subnet-id]', $('the subnet id.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/VirtualNetworks/<vnet-name>/subnets/<subnet-name>'))
    .option('-e, --subnet-name <subnet-name>', $('the subnet name'))
    .option('-m, --vnet-name <vnet-name>', $('the virtual network name.' +
    '\n     This virtual network must exist in the same resource group as the lb.' +
    '\n     Please use subnet-id if that is not the case.'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend ip configuration name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.setFrontendIP(resourceGroup, lbName, name, options, _);
    });

  lbFrontendIP.command('list [resource-group] [lb-name]')
    .description($('Get all frontend ip configurations in the load balancer'))
    .usage('[options] <resource-group> <lb-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.listFrontendIPs(resourceGroup, lbName, options, _);
    });

  lbFrontendIP.command('delete [resource-group] [lb-name] [name]')
    .description($('Delete a frontend ip configuration from a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the frontend ip configuration'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend ip configuration name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.deleteFrontendIP(resourceGroup, lbName, name, options, _);
    });

  var lbAddressPool = lb.category('address-pool')
    .description('Commands to manage backend address pools of a load balancer');

  lbAddressPool.command('create [resource-group] [lb-name] [name]')
    .description($('Add an address pool to the load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the backend address pool'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Backend address pool name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.createBackendAddressPool(resourceGroup, lbName, name, options, _);
    });

  lbAddressPool.command('list [resource-group] [lb-name]')
    .description($('Get all address pools in the load balancer'))
    .usage('[options] <resource-group> <lb-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.listBackendAddressPools(resourceGroup, lbName, options, _);
    });

  lbAddressPool.command('delete [resource-group] [lb-name] [name]')
    .description($('Delete an address pool from a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the backend address pool'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Backend address pool name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.deleteBackendAddressPool(resourceGroup, lbName, name, options, _);
    });

  var lbRule = lb.category('rule')
    .description($('Commands to manage load balancer rules'));

  lbRule.command('create [resource-group] [lb-name] [name]')
    .description($('Add a load balancing rule to a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-p, --protocol <protocol>', $('the rule protocol'))
    .option('-f, --frontend-port <frontend-port>', $('the frontend port'))
    .option('-b, --backend-port <backend-port>', $('the backend port'))
    .option('-e, --enable-floating-ip <enable-floating-ip>', $('enable floating point ip'))
    .option('-i, --idle-timeout <idle-timeout>', $('the idle timeout specified in minutes'))
    .option('-a, --probe-name <probe-name>', $('the name of the probe defined in the same load balancer'))
    .option('-t, --frontend-ip-name <frontend-ip-name>', $('the name of the frontend ip configuration in the same load balancer'))
    .option('-o, --backend-address-pool <backend-address-pool>', $('name of the backend address pool defined in the same load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.createRule(resourceGroup, lbName, name, options, _);
    });

  lbRule.command('set [resource-group] [lb-name] [name]')
    .description($('Set a load balancing rule of a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-r, --new-rule-name <new-rule-name>', $('new rule name'))
    .option('-p, --protocol <protocol>', $('the rule protocol'))
    .option('-f, --frontend-port <frontend-port>', $('the frontend port'))
    .option('-b, --backend-port <backend-port>', $('the backend port'))
    .option('-e, --enable-floating-ip <enable-floating-ip>', $('enable floating point ip'))
    .option('-i, --idle-timeout <idle-timeout>', $('the idle timeout specified in minutes'))
    .option('-a, --probe-name [probe-name]', $('the name of the probe defined in the same load balancer'))
    .option('-t, --frontend-ip-name <frontend-ip-name>', $('the name of the frontend ip configuration in the same load balancer'))
    .option('-o, --backend-address-pool <backend-address-pool>', $('name of the backend address pool defined in the same load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.setRule(resourceGroup, lbName, name, options, _);
    });

  lbRule.command('list [resource-group] [lb-name]')
    .description($('Get all load balancing rules of a load balancer'))
    .usage('[options] <resource-group> <lb-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.listRules(resourceGroup, lbName, options, _);
    });

  lbRule.command('delete [resource-group] [lb-name] [name]')
    .description($('Delete a load balancing rule from a load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.deleteRule(resourceGroup, lbName, name, options, _);
    });

  var lbInboundNatRule = lb.category('inbound-nat-rule')
    .description($('Commands to manage load balancer inbound NAT rules'));

  lbInboundNatRule.command('create [resource-group] [lb-name] [name]')
    .description($('Add a load balancing inbound NAT rule to the load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the inbound NAT rule'))
    .option('-p, --protocol <protocol>', util.format($('the rule protocol [%s]'), constants.lb.protocols))
    .option('-f, --frontend-port <frontend-port>', util.format($('the frontend port %s'), utils.toRange(constants.portBounds)))
    .option('-b, --backend-port <backend-port>', util.format($('the backend port %s'), utils.toRange(constants.portBounds)))
    .option('-e, --enable-floating-ip <enable-floating-ip>', $('enable floating point ip [true,false]'))
    .option('-i, --frontend-ip <frontend-ip>', $('the name of the frontend ip configuration'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Inbound rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.createInboundNatRule(resourceGroup, lbName, name, options, _);
    });

  lbInboundNatRule.command('set [resource-group] [lb-name] [name]')
    .usage('[options] <resource-group> <lb-name> <name>')
    .description($('Set a load balancing inbound NAT rule of load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the inbound NAT rule'))
    .option('-p, --protocol <protocol>', util.format($('the rule protocol [%s]'), constants.lb.protocols))
    .option('-f, --frontend-port <frontend-port>', util.format($('the frontend port %s'), utils.toRange(constants.portBounds)))
    .option('-b, --backend-port <backend-port>', util.format($('the backend port %s'), utils.toRange(constants.portBounds)))
    .option('-e, --enable-floating-ip <enable-floating-ip>', $('enable floating point ip [true,false]'))
    .option('-i, --frontend-ip <frontend-ip>', $('the name of the frontend ip configuration'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Inbound rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.setInboundNatRule(resourceGroup, lbName, name, options, _);
    });

  lbInboundNatRule.command('list [resource-group] [lb-name]')
    .usage('[options] <resource-group> <lb-name>')
    .description($('Get all load balancing inbound NAT rules of load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.listInboundNatRules(resourceGroup, lbName, options, _);
    });

  lbInboundNatRule.command('delete [resource-group] [lb-name] [name]')
    .usage('[options] <resource-group> <lb-name> <name>')
    .description($('Delete a load balancing inbound NAT rule from a load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the inbound NAT rule'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Inbound rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.deleteInboundNatRule(resourceGroup, lbName, name, options, _);
    });

  var lbInboundNatPool = lb.category('inbound-nat-pool')
    .description($('Commands to manage load balancer inbound NAT pools'));

  lbInboundNatPool.command('create [resource-group] [lb-name] [name]')
    .description($('Add a load balancing inbound NAT pool to the load balancer'))
    .usage('[options] <resource-group> <lb-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the inbound NAT pool'))
    .option('-p, --protocol <protocol>', util.format($('the pool protocol [%s]'), constants.lb.protocols))
    .option('-f, --frontend-port-range-start  <frontend-port-range-start>', util.format($('the frontend port range start %s'), utils.toRange(constants.portBounds)))
    .option('-e, --frontend-port-range-end <frontend-port-range-end>', util.format($('the frontend port range end %s'), utils.toRange(constants.portBounds)))
    .option('-b, --backend-port <backend-port>', $('the backend port'))
    .option('-i, --frontend-ip <frontend-ip>', $('the name of the frontend ip configuration'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Inbound pool name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.createInboundNatPool(resourceGroup, lbName, name, options, _);
    });

  lbInboundNatPool.command('set [resource-group] [lb-name] [name]')
    .usage('[options] <resource-group> <lb-name> <name>')
    .description($('Set a load balancing inbound NAT pool of load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the inbound NAT pool'))
    .option('-p, --protocol <protocol>', util.format($('the pool protocol [%s]'), constants.lb.protocols))
    .option('-f, --frontend-port-range-start  <frontend-port-range-start>', util.format($('the frontend port range start %s'), utils.toRange(constants.portBounds)))
    .option('-e, --frontend-port-range-end <frontend-port-range-end>', util.format($('the frontend port range end %s'), utils.toRange(constants.portBounds)))
    .option('-b, --backend-port <backend-port>', $('the backend port'))
    .option('-i, --frontend-ip <frontend-ip>', $('the name of the frontend ip configuration'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Inbound pool name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.setInboundNatPool(resourceGroup, lbName, name, options, _);
    });

  lbInboundNatPool.command('list [resource-group] [lb-name]')
    .usage('[options] <resource-group> <lb-name>')
    .description($('Get all load balancing inbound NAT pools of load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.listInboundNatPools(resourceGroup, lbName, options, _);
    });

  lbInboundNatPool.command('delete [resource-group] [lb-name] [name]')
    .usage('[options] <resource-group> <lb-name> <name>')
    .description($('Delete a load balancing inbound NAT pool from a load balancer'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-l, --lb-name <lb-name>', $('the name of the load balancer'))
    .option('-n, --name <name>', $('the name of the inbound NAT pool'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, lbName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      lbName = cli.interaction.promptIfNotGiven($('Load balancer name: '), lbName, _);
      name = cli.interaction.promptIfNotGiven($('Inbound pool name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var loadBalancer = new LoadBalancer(cli, networkResourceProviderClient);
      loadBalancer.deleteInboundNatPool(resourceGroup, lbName, name, options, _);
    });

  var publicip = network.category('public-ip')
    .description($('Commands to manage public ip addresses'));

  publicip.command('create [resource-group] [name] [location]')
    .description($('Create a public ip'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the public ip'))
    .option('-l, --location <location>', $('the location'))
    .option('-d, --domain-name-label <domain-name-label>', $('the domain name label.' +
    '\n     This set DNS to <domain-name-label>.<location>.cloudapp.azure.com'))
    .option('-a, --allocation-method <allocation-method>', $('the allocation method [Static][Dynamic]'))
    .option('-i, --idletimeout <idletimeout>', $('the idle timeout specified in minutes'))
    .option('-f, --reverse-fqdn <reverse-fqdn>', $('the reverse fqdn'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Public IP name: '), name, _);
      options.location = cli.interaction.promptIfNotGiven($('Location: '), location, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var publicip = new PublicIp(cli, networkResourceProviderClient);
      publicip.create(resourceGroup, name, options, _);
    });

  publicip.command('set [resource-group] [name]')
    .description($('Set a public ip'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the public ip'))
    .option('-d, --domain-name-label [domain-name-label]', $('the domain name label.' +
    '\n     This set DNS to <domain-name-label>.<location>.cloudapp.azure.com'))
    .option('-a, --allocation-method <allocation-method>', $('the allocation method [Static][Dynamic]'))
    .option('-i, --idletimeout <idletimeout>', $('the idle timeout specified in minutes'))
    .option('-f, --reverse-fqdn [reverse-fqdn]', $('the reverse fqdn'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     Existing tag values will be replaced by the values specified.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Public ip address name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var publicip = new PublicIp(cli, networkResourceProviderClient);
      publicip.set(resourceGroup, name, options, _);
    });

  publicip.command('list [resource-group]')
    .description($('Get all public ips'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var publicip = new PublicIp(cli, networkResourceProviderClient);
      publicip.list(resourceGroup, options, _);
    });

  publicip.command('show [resource-group] [name]')
    .description($('Get a public ip'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the public IP'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Public IP name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var publicip = new PublicIp(cli, networkResourceProviderClient);
      publicip.show(resourceGroup, name, options, _);
    });

  publicip.command('delete [resource-group] [name]')
    .description($('Delete a public ip'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the public IP'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Public IP name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var publicip = new PublicIp(cli, networkResourceProviderClient);
      publicip.delete(resourceGroup, name, options, _);
    });

  var nic = network.category('nic')
    .description($('Commands to manage network interfaces'));

  nic.command('create [resource-group] [name] [location]')
    .description($('Create a network interface'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-l, --location <location>', $('the location'))
    .option('-w, --network-security-group-id <network-security-group-id>', $('the network security group identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/networkSecurityGroups/<nsg-name>'))
    .option('-o, --network-security-group-name <network-security-group-name>', $('the network security group name.' +
    '\n     This network security group must exist in the same resource group as the nic.' +
    '\n     Please use network-security-group-id if that is not the case.'))
    .option('-i, --public-ip-id <public-ip-id>', $('the public IP identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/publicIPAddresses/<public-ip-name>'))
    .option('-p, --public-ip-name <public-ip-name>', $('the public IP name.' +
    '\n     This public ip must exist in the same resource group as the nic.' +
    '\n     Please use public-ip-id if that is not the case.'))
    .option('-a, --private-ip-address <private-ip-address>', $('the private IP address'))
    .option('-u, --subnet-id <subnet-id>', $('the subnet identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/virtualNetworks/<vnet-name>/subnets/<subnet-name>'))
    .option('-k, --subnet-name <subnet-name>', $('the subnet name'))
    .option('-m, --subnet-vnet-name <subnet-vnet-name>', $('the vnet name under which subnet-name exists'))
    .option('-d, --lb-address-pool-ids <lb-address-pool-ids>', $('the comma separated list of load balancer address pool identifiers' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/backendAddressPools/<address-pool-name>'))
    .option('-e, --lb-inbound-nat-rule-ids <lb-inbound-nat-rule-ids>', $('the comma separated list of load balancer inbound NAT rule identifiers' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/inboundNatRules/<nat-rule-name>'))
    .option('-r, --internal-dns-name-label <internal-dns-name-label>', $('the internal DNS name label'))
    .option('-f, --enable-ip-forwarding <enable-ip-forwarding>', $('the ip forwarding, valid values are [true, false]'))
    .option('-t, --tags <tags>', $('the comma seperated list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);
      options.location = cli.interaction.promptIfNotGiven($('Location: '), location, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.create(resourceGroup, name, options, _);
    });

  nic.command('set [resource-group] [name]')
    .description($('Set a network interface'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-w, --network-security-group-id [network-security-group-id]>', $('the network security group identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/networkSecurityGroups/<nsg-name>'))
    .option('-o, --network-security-group-name <network-security-group-name>', $('the network security group name.' +
    '\n     This network security group must exist in the same resource group as the nic.' +
    '\n     Please use network-security-group-id if that is not the case.'))
    .option('-i, --public-ip-id [public-ip-id]', $('the public IP identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/publicIPAddresses/<public-ip-name>'))
    .option('-p, --public-ip-name <public-ip-name>', $('the public IP name.' +
    '\n     This public ip must exist in the same resource group as the nic.' +
    '\n     Please use public-ip-id if that is not the case.'))
    .option('-a, --private-ip-address <private-ip-address>', $('the private IP address'))
    .option('-u, --subnet-id <subnet-id>', $('the subnet identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/virtualNetworks/<vnet-name>/subnets/<subnet-name>'))
    .option('-k, --subnet-name <subnet-name>', $('the subnet name'))
    .option('-m, --subnet-vnet-name <subnet-vnet-name>', $('the vnet name under which subnet-name exists'))
    .option('-d, --lb-address-pool-ids [lb-address-pool-ids]', $('the comma separated list of load balancer address pool identifiers' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/backendAddressPools/<address-pool-name>'))
    .option('-e, --lb-inbound-nat-rule-ids [lb-inbound-nat-rule-ids]', $('the comma separated list of load balancer inbound NAT rule identifiers' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/inboundNatRules/<nat-rule-name>'))
    .option('-r, --internal-dns-name-label <internal-dns-name-label>', $('the internal DNS name label'))
    .option('-f, --enable-ip-forwarding <enable-ip-forwarding>', $('the ip forwarding, valid values are [true, false]'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     Existing tag values will be replaced by the values specified.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.set(resourceGroup, name, options, _);
    });

  nic.command('list [resource-group]')
    .description($('Get all network interfaces'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-m, --virtual-machine-scale-set <virtual-machine-scale-set>', $('the name of the virtual machine scale set'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.list(resourceGroup, options, _);
    });

  nic.command('show [resource-group] [name]')
    .description($('Get a network interface'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-m, --virtual-machine-scale-set <virtual-machine-scale-set>', $('the name of the virtual machine scale set'))
    .option('-i, --virtual-machine-index <virtual-machine-index>', $('the index of virtual machine in scale set'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.show(resourceGroup, name, options, _);
    });

  nic.command('delete [resource-group] [name]')
    .description($('Delete a network interface'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.delete(resourceGroup, name, options, _);
    });

  var nicAddressPool = nic.category('address-pool')
    .description($('Commands to manage backend address pools of the network interface'));

  nicAddressPool.command('add [resource-group] [name]')
    .description($('Add a backend address pool to a NIC'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-i, --lb-address-pool-id  <lb-address-pool-id>', $('the load balancer address pool identifier' +
    '\n   e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/backendAddressPools/<address-pool-name>'))
    .option('-l, --lb-name <lb-name>', $('the load balancer name.' +
    '\n   This load balancer must exists in the same resource group as the NIC.' +
    '\n   Please use --lb-address-pool-id if that is not the case.' +
    '\n   This parameter will be ignored if --lb-address-pool-id is specified'))
    .option('-a, --address-pool-name <address-pool-name>', $('the name of the address pool that exists in the load balancer identified by --lb-name' +
    '\n   This parameter will be ignored if --lb-address-pool-id is specified'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.addAddressPool(resourceGroup, name, options, _);
    });

  nicAddressPool.command('remove [resource-group] [name]')
    .description($('Remove a backend address pool from a NIC'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-i, --lb-address-pool-id  <lb-address-pool-id>', $('the load balancer address pool identifier' +
    '\n   e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/backendAddressPools/<address-pool-name>'))
    .option('-l, --lb-name <lb-name>', $('the load balancer name.' +
    '\n   This load balancer must exist in the same resource group as the NIC.' +
    '\n   Please use --lb-address-pool-id if that is not the case.' +
    '\n   This parameter will be ignored if --lb-address-pool-id is specified'))
    .option('-a, --address-pool-name <address-pool-name>', $('the name of the address pool that exists in the load balancer identified by --lb-name' +
    '\n   This parameter will be ignored if --lb-address-pool-id is specified'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.removeAddressPool(resourceGroup, name, options, _);
    });

  var nicInboundRule = nic.category('inbound-nat-rule')
    .description($('Commands to manage inbound rules of the network interface'));

  nicInboundRule.command('add [resource-group] [name]')
    .description($('Add an inbound NAT rule to a NIC'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-i, --inbound-nat-rule-id <inbound-nat-rule-id>', $('the inbound NAT rule identifier.' +
    '\n   e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/inboundNatRules/<nat-rule-name>'))
    .option('-l, --lb-name <lb-name>', $('the load balancer name.' +
    '\n   This load balancer must exists in the same resource group as the NIC.' +
    '\n   Please use --inbound-nat-rule-id if that is not the case.' +
    '\n   This parameter will be ignored if --inbound-nat-rule-id is specified'))
    .option('-r, --inbound-nat-rule-name <inbound-nat-rule-name>', $('the name of the NAT rule that exists in the load balancer identified by --lb-name'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.addInboundRule(resourceGroup, name, options, _);
    });

  nicInboundRule.command('remove [resource-group] [name]')
    .description($('Remove an inbound NAT rule from a NIC'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network interface'))
    .option('-i, --inbound-nat-rule-id <inbound-nat-rule-id>', $('the inbound NAT rule identifier.' +
    '\n   e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/loadbalancers/<lb-name>/inboundNatRules/<nat-rule-name>'))
    .option('-l, --lb-name <lb-name>', $('the load balancer name.' +
    '\n   This load balancer must exists in the same resource group as the NIC.' +
    '\n   Please use --inbound-nat-rule-id if that is not the case.' +
    '\n   This parameter will be ignored if --inbound-nat-rule-id is specified'))
    .option('-r, --inbound-nat-rule-name <inbound-nat-rule-name>', $('the name of the NAT rule that exists in the load balancer identified by --lb-name'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network interface name: '), name, _);

      var serviceClients = getServiceClients(options);
      var nic = new Nic(cli, serviceClients);
      nic.removeInboundRule(resourceGroup, name, options, _);
    });

  var nsg = network.category('nsg')
    .description($('Commands to manage network security groups'));

  nsg.command('create [resource-group] [name] [location]')
    .description($('Create a network security group'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network security group'))
    .option('-l, --location <location>', $('the location'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network security group name: '), name, _);
      location = cli.interaction.promptIfNotGiven($('Location: '), location, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.create(resourceGroup, name, location, options, _);
    });

  nsg.command('set [resource-group] [name]')
    .description($('Set a network security group'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network security group'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     Existing tag values will be replaced by the values specified.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network security group name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.set(resourceGroup, name, options, _);
    });

  nsg.command('list [resource-group]')
    .description($('Get all network security groups'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.list(resourceGroup, options, _);
    });

  nsg.command('show [resource-group] [name]')
    .description($('Get a network security group'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network security group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network security group name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.show(resourceGroup, name, options, _);
    });

  nsg.command('delete [resource-group] [name]')
    .description($('Delete a network security group'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the network security group'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Network security group name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.delete(resourceGroup, name, options, _);
    });

  var nsgRules = nsg.category('rule')
    .description($('Commands to manage network security group rules'));

  nsgRules.command('create [resource-group] [nsg-name] [name]')
    .description($('Create a network security group rule'))
    .usage('[options] <resource-group> <nsg-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-a, --nsg-name <nsg-name>', $('the name of the network security group'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-d, --description <description>', $('the description'))
    .option('-p, --protocol <protocol>', util.format($('the protocol [%s]'), constants.nsg.protocols))
    .option('-f, --source-address-prefix <source-address-prefix>', $('the source address prefix'))
    .option('-o, --source-port-range <source-port-range>', util.format($('the source port range [%s-%s]'), constants.nsg.portMin, constants.nsg.portMax))
    .option('-e, --destination-address-prefix <destination-address-prefix>', $('the destination address prefix'))
    .option('-u, --destination-port-range <destination-port-range>', util.format($('the destination port range [%s-%s]'), constants.nsg.portMin, constants.nsg.portMax))
    .option('-c, --access <access>', util.format($('the access mode [%s]'), constants.nsg.access))
    .option('-y, --priority <priority>', util.format($('the priority [%s-%s]'), constants.nsg.priorityMin, constants.nsg.priorityMax))
    .option('-r, --direction <direction>', util.format($('the direction [%s]'), constants.nsg.direction))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, nsgName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      nsgName = cli.interaction.promptIfNotGiven($('Network security group name: '), nsgName, _);
      name = cli.interaction.promptIfNotGiven($('The name of the security rule: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.createRule(resourceGroup, nsgName, name, options, _);
    });

  nsgRules.command('set [resource-group] [nsg-name] [name]')
    .description($('Set a network security group rule'))
    .usage('[options] <resource-group> <nsg-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-a, --nsg-name <nsg-name>', $('the name of the network security group'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-d, --description <description>', $('the description'))
    .option('-p, --protocol <protocol>', util.format($('the protocol [%s]'), constants.nsg.protocols))
    .option('-f, --source-address-prefix <source-address-prefix>', $('the source address prefix'))
    .option('-o, --source-port-range <source-port-range>', util.format($('the source port range [%s-%s]'), constants.nsg.portMin, constants.nsg.portMax))
    .option('-e, --destination-address-prefix <destination-address-prefix>', $('the destination address prefix'))
    .option('-u, --destination-port-range <destination-port-range>', util.format($('the destination port range [%s-%s]'), constants.nsg.portMin, constants.nsg.portMax))
    .option('-c, --access <access>', util.format($('the access mode [%s]'), constants.nsg.access))
    .option('-y, --priority <priority>', util.format($('the priority [%s-%s]'), constants.nsg.priorityMin, constants.nsg.priorityMax))
    .option('-r, --direction <direction>', util.format($('the direction [%s]'), constants.nsg.direction))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, nsgName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      nsgName = cli.interaction.promptIfNotGiven($('Network security group name: '), nsgName, _);
      name = cli.interaction.promptIfNotGiven($('The name of the security rule: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.setRule(resourceGroup, nsgName, name, options, _);
    });

  nsgRules.command('list [resource-group] [nsg-name]')
    .description($('Get all rules in a network security group'))
    .usage('[options] <resource-group> <nsg-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-a, --nsg-name <nsg-name>', $('the name of the network security group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, nsgName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      nsgName = cli.interaction.promptIfNotGiven($('Network security group name: '), nsgName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.listRules(resourceGroup, nsgName, options, _);
    });

  nsgRules.command('show [resource-group] [nsg-name] [name]')
    .description($('Get a rule in a network security group'))
    .usage('[options] <resource-group> <nsg-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-a, --nsg-name <nsg-name>', $('the name of the network security group'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, nsgName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      nsgName = cli.interaction.promptIfNotGiven($('Network security group name: '), nsgName, _);
      name = cli.interaction.promptIfNotGiven($('Rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.showRule(resourceGroup, nsgName, name, options, _);
    });

  nsgRules.command('delete [resource-group] [nsg-name] [name]')
    .description($('Delete a rule in a network security group'))
    .usage('[options] <resource-group> <nsg-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-a, --nsg-name <nsg-name>', $('the name of the network security group'))
    .option('-n, --name <name>', $('the name of the rule'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, nsgName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      nsgName = cli.interaction.promptIfNotGiven($('Network security group name: '), nsgName, _);
      name = cli.interaction.promptIfNotGiven($('Rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var nsg = new Nsg(cli, networkResourceProviderClient);
      nsg.deleteRule(resourceGroup, nsgName, name, options, _);
    });

  var dns = network.category('dns')
    .description($('Commands to manage DNS'));

  var dnsZone = dns.category('zone')
    .description($('Commands to manage DNS zone'));

  dnsZone.command('create [resource-group] [name]')
    .description($('Create a DNS zone'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the DNS zone'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('DNS zone name: '), name, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.create(resourceGroup, name, options, _);
    });

  dnsZone.command('set [resource-group] [name]')
    .description($('Set a DNS zone'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the DNS zone'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     Existing tag values will be replaced by the values specified.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('DNS zone name: '), name, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.set(resourceGroup, name, options, _);
    });

  dnsZone.command('list [resource-group]')
    .description($('Get all DNS zones'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.list(resourceGroup, options, _);
    });

  dnsZone.command('show [resource-group] [name]')
    .description($('Get a DNS zone'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the DNS zone' +
    '\n   You can specify "*" (in quotes) for this parameter'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('DNS zone name: '), name, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.show(resourceGroup, name, options, _);
    });

  dnsZone.command('delete [resource-group] [name]')
    .description($('Delete a DNS zone'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the DNS zone'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('DNS zone name: '), name, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.delete(resourceGroup, name, options, _);
    });

  dnsZone.command('import [resource-group] [name] [file-name]')
    .description($('Import a DNS zone'))
    .usage('[options] <resource-group> <name> <file-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the DNS zone'))
    .option('-f, --file-name <file-name>', $('the name of the zone file'))
    .option('--force', $('force overwrite of existing record sets. Otherwise, records are merged with existing record sets'))
    .option('--debug', $('output debug info'))
    .option('--parse-only', $('parse zone file only, without import')) // TODO remove
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, fileName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('DNS zone name: '), name, _);
      options.fileName = cli.interaction.promptIfNotGiven($('Zone file name: '), fileName, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.import(resourceGroup, name, options, _);
    });

  dnsZone.command('export [resource-group] [name] [file-name]')
    .description($('Export a DNS zone as a zone file'))
    .usage('[options] <resource-group> <name> <file-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the DNS zone'))
    .option('-f, --file-name <file-name>', $('the name of the zone file'))
    .option('-q, --quiet', $('quiet mode, do not ask for overwrite confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, fileName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('DNS zone name: '), name, _);
      options.fileName = cli.interaction.promptIfNotGiven($('Zone file name: '), fileName, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.export(resourceGroup, name, options, _);
    });

  var dnsRecordSet = dns.category('record-set')
    .description($('Commands to manage record sets in DNS zone'));

  dnsRecordSet.command('create [resource-group] [dns-zone-name] [name] [type]')
    .description($('Create a DNS zone record set'))
    .usage('[options] <resource-group> <dns-zone-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-n, --name <name>', $('the relative name of the record set within the DNS zone'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]'))
    .option('-l, --ttl <ttl>', $('time to live specified in seconds'))
    .option('-t, --tags <tags>', $('the tags set on this virtual network.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      name = cli.interaction.promptIfNotGiven($('Record set name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Type: '), type, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.createRecordSet(resourceGroup, dnsZoneName, name, options, _);
    });

  dnsRecordSet.command('set [resource-group] [dns-zone-name] [name] [type]')
    .description($('Set a DNS zone record set'))
    .usage('[options] <resource-group> <dns-zone-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-n, --name <name>', $('the relative name of the record set within the DNS zone'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]'))
    .option('-l, --ttl <ttl>', $('time to live specified in seconds'))
    .option('-t, --tags <tags>', $('the tags set on this virtual network.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional.' +
    '\n     Existing tag values will be replaced by the values specified.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      name = cli.interaction.promptIfNotGiven($('Record set name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Type: '), type, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.setRecordSet(resourceGroup, dnsZoneName, name, options, _);
    });

  dnsRecordSet.command('list [resource-group] [dns-zone-name] [type]')
    .description($('Get all record sets in a DNS zone'))
    .usage('[options] <resource-group> <dns-zone-name> [type]')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     If specified only record sets of this type will be listed.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      options.type = type || options.type;

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.listRecordSets(resourceGroup, dnsZoneName, options, _);
    });

  dnsRecordSet.command('show [resource-group] [dns-zone-name] [name] [type]')
    .description($('Get a record set in a DNS zone'))
    .usage('[options] <resource-group> <dns-zone-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-n, --name <name>', $('the relative name of the record set within the DNS zone'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      name = cli.interaction.promptIfNotGiven($('Record set name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Type: '), type, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.showRecordSet(resourceGroup, dnsZoneName, name, options, _);
    });

  dnsRecordSet.command('delete [resource-group] [dns-zone-name] [name] [type]')
    .description($('Delete a record set from a DNS zone'))
    .usage('[options] <resource-group> <dns-zone-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-n, --name <name>', $('the relative name of the record set within the DNS zone'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     If specified only record sets of this type will be listed.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      name = cli.interaction.promptIfNotGiven($('Record set name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Type: '), type, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.deleteRecordSet(resourceGroup, dnsZoneName, name, options, _);
    });

  dnsRecordSet.command('add-record [resource-group] [dns-zone-name] [record-set-name] [type]')
    .description($('Add a record in a record set under a DNS zone'))
    .usage('[options] <resource-group> <dns-zone-name> <record-set-name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-n, --record-set-name <record-set-name>', $('the name of the record set'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     If specified only record sets of this type will be listed.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]' +
    '\n\nThe record type A \n\n'))
    .option('-a  --ipv4-address <ipv4-address>', $('the IPv4 address attribute\n\n' +
    'Record type AAAA \n\n'))
    .option('-b  --ipv6-address <ipv6-address>', $('the IPv6 address attribute\n\n' +
    'Record type CNAME\n\n'))
    .option('-c  --cname <cname>', $('the canonical name (target)\n\n' +
    'Record type NS\n\n'))
    .option('-d  --nsdname <nsdname>', $('the domain name attribute\n\n' +
    'Record type MX\n\n'))
    .option('-f, --preference <preference>', $('preference attribute'))
    .option('-e, --exchange <exchange>', $('exchange attribute\n\n' +
    'Record type SRV\n\n'))
    .option('-p, --priority <priority>', $('the priority attribute'))
    .option('-w, --weight <weight>', $('the weight attribute'))
    .option('-o, --port <port>', $('the port'))
    .option('-u, --target <target>', $('the target attribute\n\n' +
    'Record type TXT\n\n'))
    .option('-x, --text <text>', $('the text attribute\n\n' +
    'Record type SOA\n\n'))
    .option('-l, --email <email>', $('the email attribute'))
    .option('-i, --expire-time <expire-time>', $('the expire time specified in seconds'))
    .option('-S, --serial-number <serial-number>', $('the serial number'))
    .option('-k, --host <host>', $('the host name attribute'))
    .option('-m, --minimum-ttl <minimum-ttl>', $('the minimum time to live specified in seconds'))
    .option('-r, --refresh-time <refresh-time>', $('the refresh time specified in seconds'))
    .option('-j, --retry-time <retry-time>', $('the retry time specified in seconds' +
    '\n\nRecord type PTR \n\n'))
    .option('-P, --ptrd-name <ptrd-name>', $('ptr domain name\n\n'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, recordSetName, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      recordSetName = cli.interaction.promptIfNotGiven($('Record set name: '), recordSetName, _);
      options.type = cli.interaction.promptIfNotGiven($('Type: '), type, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.promptRecordParameters(options.type, options, _);
      dnsZone.addRecord(resourceGroup, dnsZoneName, recordSetName, options, _);
    });

  dnsRecordSet.command('delete-record [resource-group] [dns-zone-name] [record-set-name] [type]')
    .description($('Delete a record from a record set under a DNS zone'))
    .usage('[options] <resource-group> <dns-zone> <record-set-name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-z, --dns-zone-name <dns-zone-name>', $('the name of the DNS zone'))
    .option('-n, --record-set-name <record-set-name>', $('the name of the record set'))
    .option('-y, --type <type>', $('the type of the record set.' +
    '\n     If specified only record sets of this type will be listed.' +
    '\n     Valid values are [A, AAAA, CNAME, MX, NS, SOA, SRV, TXT, PTR]' +
    '\n\nThe record type A \n\n'))
    .option('-a  --ipv4-address <ipv4-address>', $('the IPv4 address attribute\n\n' +
    'Record type AAAA \n\n'))
    .option('-b  --ipv6-address <ipv6-address>', $('the IPv6 address attribute\n\n' +
    'Record type CNAME\n\n'))
    .option('-c  --cname <cname>', $('the canonical name (target)\n\n' +
    'Record type NS\n\n'))
    .option('-d  --nsdname <nsdname>', $('the domain name attribute\n\n' +
    'Record type MX\n\n'))
    .option('-f, --preference <preference>', $('preference attribute'))
    .option('-e, --exchange <exchange>', $('exchange attribute\n\n' +
    'Record type SRV\n\n'))
    .option('-p, --priority <priority>', $('the priority attribute'))
    .option('-w, --weight <weight>', $('the weight attribute'))
    .option('-o, --port <port>', $('the port'))
    .option('-u, --target <target>', $('the target attribute\n\n' +
    'Record type TXT\n\n'))
    .option('-x, --text <text>', $('the text attribute' +
    '\n\nRecord type PTR \n\n'))
    .option('-P, --ptrd-name <ptrd-name>', $('ptr domain name\n\n'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, dnsZoneName, recordSetName, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      dnsZoneName = cli.interaction.promptIfNotGiven($('DNS zone name: '), dnsZoneName, _);
      recordSetName = cli.interaction.promptIfNotGiven($('Record set name: '), recordSetName, _);
      options.type = cli.interaction.promptIfNotGiven($('Type: '), type, _);

      var dnsManagementClient = getDnsManagementClient(options);
      var dnsZone = new DnsZone(cli, dnsManagementClient);
      dnsZone.promptRecordParameters(options.type, options, _);
      dnsZone.deleteRecord(resourceGroup, dnsZoneName, recordSetName, options, _);
    });

  var trafficManager = network.category('traffic-manager')
    .description($('Commands to manage Traffic Manager'));

  var trafficManagerProfile = trafficManager.category('profile')
    .description($('Commands to manage Traffic Manager profile'));

  trafficManagerProfile.command('create [resource-group] [name]')
    .description($('Create a Traffic Manager profile'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the profile'))
    .option('-u, --profile-status <profile-status> ', util.format($('the profile status, valid values are' +
    '\n     [%s], default is %s'), constants.trafficManager.status, constants.trafficManager.status[0]))
    .option('-m, --traffic-routing-method <traffic-routing-method>', util.format($('the traffic routing method for the profile,' +
    '\n     valid values are [%s], default is %s'), constants.trafficManager.routingMethod, constants.trafficManager.routingMethod[0]))
    .option('-r, --relative-dns-name <relative-dns-name>', $('relative DNS name of the profile e.g. .trafficmanager.net'))
    .option('-l, --ttl <ttl>', $('time to live in specified in seconds'))
    .option('-p, --monitor-protocol <monitor-protocol>', util.format($('the monitor protocol, valid values are' +
    '\n     [%s], default is %s'), constants.trafficManager.protocols, constants.trafficManager.protocols[0]))
    .option('-o, --monitor-port <monitor-port>', $('the monitoring port'))
    .option('-a, --monitor-path <monitor-path>', $('the monitoring path'))
    .option('-t, --tags <tags>', $('the tags set on this profile. Can be ' +
    '\n     multiple, in the format of \'name=value\'.' +
    '\n     Name is required and value is optional. ' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Profile name: '), name, _);
      options.relativeDnsName = cli.interaction.promptIfNotGiven($('Relative DNS name of the profile, e.g. .trafficmanager.net: '), options.relativeDnsName, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.createProfile(resourceGroup, name, options, _);
    });

  trafficManagerProfile.command('set [resource-group] [name]')
    .description($('Set a Traffic Manager profile'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the profile'))
    .option('-u, --profile-status <profile-status> ', util.format($('the profile status, valid values are' +
    '\n     [%s], default is %s'), constants.trafficManager.status, constants.trafficManager.status[0]))
    .option('-m, --traffic-routing-method <traffic-routing-method>', util.format($('the traffic routing method for the profile,' +
    '\n     valid values are [%s], default is %s'), constants.trafficManager.routingMethod, constants.trafficManager.routingMethod[0]))
    .option('-l, --ttl <ttl>', $('time to live specified in seconds'))
    .option('-p, --monitor-protocol <monitor-protocol>', util.format($('the monitor protocol, valid values are' +
    '\n     [%s], default is %s'), constants.trafficManager.protocols, constants.trafficManager.protocols[0]))
    .option('-o, --monitor-port <monitor-port>', $('the monitoring port'))
    .option('-a, --monitor-path <monitor-path>', $('the monitoring path'))
    .option('-t, --tags <tags>', $('the tags set on this profile. Can be ' +
    '\n     multiple, in the format of \'name=value\'.' +
    '\n     Name is required and value is optional. ' +
    '\n     Existing tag values will be replaced by the values specified.' +
    '\n     For example, -t "tag1=value1;tag2"'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Profile name: '), name, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.setProfile(resourceGroup, name, options, _);
    });

  trafficManagerProfile.command('list [resource-group]')
    .description($('Get all Traffic Manager profiles'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.listProfiles(resourceGroup, options, _);
    });

  trafficManagerProfile.command('show [resource-group] [name]')
    .description($('Get a Traffic Manager profile'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the profile'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Profile name: '), name, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.showProfile(resourceGroup, name, options, _);
    });

  trafficManagerProfile.command('delete [resource-group] [name]')
    .description($('Delete a Traffic Manager profile'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the profile'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Profile name: '), name, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.deleteProfile(resourceGroup, name, options, _);
    });

  trafficManagerProfile.command('is-dns-available [relative-dns-name]')
    .description($('Checks whether the specified DNS prefix is available for creating a Traffic Manager profile'))
    .usage('[options] <relative-dns-name>')
    .option('-r, --relative-dns-name <relative-dns-name>', $('the relative DNS name to check for availability'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (relativeDnsName, options, _) {
      relativeDnsName = cli.interaction.promptIfNotGiven($('Relative DNS name: '), relativeDnsName, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.checkDnsAvailability(relativeDnsName, options, _);
    });

  var trafficManagerEndpoint = trafficManager.category('endpoint')
    .description($('Commands to manage Traffic Manager endpoints'));

  trafficManagerEndpoint.command('create [resource-group] [profile-name] [name] [type]')
    .description($('Create an endpoint in Traffic Manager profile'))
    .usage('[options] <resource-group> <profile-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-f, --profile-name <profile-name>', $('the profile name'))
    .option('-n, --name <name>', $('the name of the endpoint'))
    .option('-y, --type <type>', util.format($('the endpoint type, valid values are:' +
    '\n       [%s], where ExternalEndpoints represents endpoint' +
    '\n       for a service with FQDN external to Azure' +
    '\n       e.g. foobar.contoso.com'), constants.trafficManager.endpointType))
    .option('-l, --location <location>', $('the endpoint location. This is only used if the Traffic Manager profile is configured to use the "Performance" traffic-routing method.' +
    '\n       This should only be specified on endpoints of type "ExternalEndpoints" and "NestedEndpoints".' +
    '\n       It is not applicable for endpoints of type "AzureEndpoints", since the location is taken from the resource specified in "--target-resource-id".'))
    .option('-u, --status <status>', util.format($('the endpoint status, valid values are:' +
    '\n       [%s] Default is %s'), constants.trafficManager.status, constants.trafficManager.status[0]))
    .option('-t, --target <target>', $('the domain name target of the endpoint,' +
    '\n       e.g. foobar.contoso.com. Only applicable to endpoints of type "ExternalEndpoints"'))
    .option('-i, --target-resource-id <target-resource-id>', $('the Azure Resource URI of the endpoint. Not applicable to endpoints of type "ExternalEndpoints"'))
    .option('-w, --weight <weight>', util.format($('the endpoint weight used in the traffic-routing method,' +
    '\n       valid range is [%s, %s] This is only used if the Traffic Manager profile is configured to use the "Weighted" traffic-routing method'), constants.trafficManager.weightMin, constants.trafficManager.weightMax))
    .option('-p, --priority <priority>', util.format($('the endpoint priority used in the traffic-routing method,' +
    '\n       valid range is [%s, %s] This is only used if the Traffic Manager profile is configured to use the "Priority" traffic-routing method.' +
    '\n       Lower values represent higher priority'), constants.trafficManager.priorityMin, constants.trafficManager.priorityMax))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, profileName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      profileName = cli.interaction.promptIfNotGiven($('Profile name: '), profileName, _);
      name = cli.interaction.promptIfNotGiven($('Endpoint name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Endpoint type: '), type, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.createEndpoint(resourceGroup, profileName, name, options, _);
    });

  trafficManagerEndpoint.command('set [resource-group] [profile-name] [name] [type]')
    .description($('Set an endpoint in a Traffic Manager profile'))
    .usage('[options] <resource-group> <profile-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-f, --profile-name <profile-name>', $('the profile name'))
    .option('-n, --name <name>', $('the name of the endpoint'))
    .option('-y, --type <type>', util.format($('the endpoint type, valid values are:' +
    '\n       [%s], where ExternalEndpoints represents endpoint' +
    '\n       for a service with FQDN external to Azure' +
    '\n       e.g. foobar.contoso.com'), constants.trafficManager.endpointType))
    .option('-l, --location <location>', $('the endpoint location. This is only used if the Traffic Manager profile is configured to use the "Performance" traffic-routing method.' +
    '\n       This should only be specified on endpoints of type "ExternalEndpoints" and "NestedEndpoints".' +
    '\n       It is not applicable for endpoints of type "AzureEndpoints", since the location is taken from the resource specified in "--target-resource-id".'))
    .option('-u, --status <status>', util.format($('the endpoint status, valid values are:' +
    '\n       [%s] Default is %s'), constants.trafficManager.status, constants.trafficManager.status[0]))
    .option('-t, --target <target>', $('the domain name target of the endpoint,' +
    '\n       e.g. foobar.contoso.com. Only applicable to endpoints of type "ExternalEndpoints"'))
    .option('-i, --target-resource-id <target-resource-id>', $('the Azure Resource URI of the endpoint. Not applicable to endpoints of type "ExternalEndpoints"'))
    .option('-w, --weight <weight>', util.format($('the endpoint weight used in the traffic-routing method,' +
    '\n       valid range is [%s, %s] This is only used if the Traffic Manager profile is configured to use the "Weighted" traffic-routing method'), constants.trafficManager.weightMin, constants.trafficManager.weightMax))
    .option('-p, --priority <priority>', util.format($('the endpoint priority used in the traffic-routing method,' +
    '\n       valid range is [%s, %s] This is only used if the Traffic Manager profile is configured to use the "Priority" traffic-routing method.' +
    '\n       Lower values represent higher priority'), constants.trafficManager.priorityMin, constants.trafficManager.priorityMax))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, profileName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      profileName = cli.interaction.promptIfNotGiven($('Profile name: '), profileName, _);
      name = cli.interaction.promptIfNotGiven($('Endpoint name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Endpoint type: '), type, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.setEndpoint(resourceGroup, profileName, name, options, _);
    });

  trafficManagerEndpoint.command('show [resource-group] [profile-name] [name] [type]')
    .description($('Get an endpoint in Traffic Manager profile'))
    .usage('[options] <resource-group> <profile-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-f, --profile-name <profile-name>', $('the profile name'))
    .option('-n, --name <name>', $('the name of the endpoint'))
    .option('-y, --type <type>', util.format($('the endpoint type, valid values are:' +
    '\n       [%s], where ExternalEndpoints represents endpoint' +
    '\n       for a service with FQDN external to Azure' +
    '\n       e.g. foobar.contoso.com'), constants.trafficManager.endpointType))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, profileName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      profileName = cli.interaction.promptIfNotGiven($('Profile name: '), profileName, _);
      name = cli.interaction.promptIfNotGiven($('Endpoint name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Endpoint type: '), type, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.showEndpoint(resourceGroup, profileName, name, options, _);
    });

  trafficManagerEndpoint.command('delete [resource-group] [profile-name] [name] [type]')
    .description($('Delete an endpoint from a Traffic Manager profile'))
    .usage('[options] <resource-group> <profile-name> <name> <type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-f, --profile-name <profile-name>', $('the profile name'))
    .option('-n, --name <name>', $('the name of the endpoint'))
    .option('-y, --type <type>', util.format($('the endpoint type, valid values are:' +
    '\n       [%s], where ExternalEndpoints represents endpoint' +
    '\n       for a service with FQDN external to Azure' +
    '\n       e.g. foobar.contoso.com'), constants.trafficManager.endpointType))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, profileName, name, type, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      profileName = cli.interaction.promptIfNotGiven($('Profile name: '), profileName, _);
      name = cli.interaction.promptIfNotGiven($('Endpoint name: '), name, _);
      options.type = cli.interaction.promptIfNotGiven($('Endpoint type: '), type, _);

      var trafficManagerProviderClient = getTrafficManagementClient(options);
      var trafficManager = new TrafficManager(cli, trafficManagerProviderClient);
      trafficManager.deleteEndpoint(resourceGroup, profileName, name, options, _);
    });

  var routeTable = network.category('route-table')
    .description($('Commands to manage Route Table'));

  routeTable.command('create [resource-group] [name] [location]')
    .description($('Create a Route Table'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the Route Table'))
    .option('-l, --location <location>', $('the location, this must be same as the location of the virtual network containing the subnet(s) on which this Route Table needs to be applied'))
    .option('-t, --tags <tags>', $('the list of tags.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional. For example, -t "tag1=value1;tag2"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Route Table name: '), name, _);
      location = cli.interaction.promptIfNotGiven($('Location: '), location, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.create(resourceGroup, name, location, options, _);
    });

  routeTable.command('show [resource-group] [name]')
    .description($('Get a Route Table'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the Route Table'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Route Table name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.show(resourceGroup, name, options, _);
    });

  routeTable.command('list [resource-group]')
    .description($('Get all Route Tables'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.list(resourceGroup, options, _);
    });

  routeTable.command('delete [resource-group] [name]')
    .description($('Delete a Route Table'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the Route Table'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Route Table name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.delete(resourceGroup, name, options, _);
    });

  var route = routeTable.category('route')
    .description($('Commands to manage Route Table routes'));

  route.command('create [resource-group] [route-table-name] [name] [address-prefix] [next-hop-type]')
    .description($('Create route in a Route Table'))
    .usage('[options] <resource-group> <route-table-name> <name> <address-prefix> <next-hop-type>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-r, --route-table-name <route-table-name>', $('the name of the Route Table'))
    .option('-n, --name <name>', $('the name of the route'))
    .option('-a, --address-prefix <address-prefix>', $('the route address prefix e.g. 0.0.0.0/0'))
    .option('-y, --next-hop-type <next-hop-type>', util.format($('the route next hop type, valid values are:' +
    '\n       [%s]'), constants.route.nextHopType))
    .option('-p, --next-hop-ip-address <next-hop-ip-address>', $('the route next hop ip addresses, this parameter is valid' +
    '\n       only for next hop type VirtualAppliance'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, routeTableName, name, addressPrefix, nextHopType, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      routeTableName = cli.interaction.promptIfNotGiven($('Route Table name: '), routeTableName, _);
      name = cli.interaction.promptIfNotGiven($('Route name: '), name, _);
      options.addressPrefix = cli.interaction.promptIfNotGiven($('Address prefix: '), addressPrefix, _);
      options.nextHopType = cli.interaction.promptIfNotGiven($('Next hop type: '), nextHopType, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.createRoute(resourceGroup, routeTableName, name, options, _);
    });

  route.command('set [resource-group] [route-table-name] [name]')
    .description($('Set route in a Route Table'))
    .usage('[options] <resource-group> <route-table-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-r, --route-table-name <route-table-name>', $('the name of the Route Table'))
    .option('-n, --name <name>', $('the name of the route'))
    .option('-a, --address-prefix <address-prefix>', $('the route address prefix e.g. 0.0.0.0/0'))
    .option('-y, --next-hop-type <next-hop-type>', util.format($('the route next hop type, valid values are:' +
    '\n       [%s]'), constants.route.nextHopType))
    .option('-p, --next-hop-ip-address <next-hop-ip-address>', $('the route next hop ip addresses, this parameter is valid' +
    '\n       only for next hop type VirualAppliance'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, routeTableName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      routeTableName = cli.interaction.promptIfNotGiven($('Route Table name: '), routeTableName, _);
      name = cli.interaction.promptIfNotGiven($('Route name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.setRoute(resourceGroup, routeTableName, name, options, _);
    });

  route.command('list [resource-group] [route-table-name]')
    .description($('List all routes in a Route Table'))
    .usage('[options] <resource-group> <route-table-name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-r, --route-table-name <route-table-name>', $('the name of the Route Table'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, routeTableName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      routeTableName = cli.interaction.promptIfNotGiven($('Route Table name: '), routeTableName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.listRoutes(resourceGroup, routeTableName, options, _);
    });

  route.command('show [resource-group] [route-table-name] [name]')
    .description($('Show details about route in a Route Table'))
    .usage('[options] <resource-group> <route-table-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-r, --route-table-name <route-table-name>', $('the name of the Route Table'))
    .option('-n, --name <name>', $('the name of the route'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, routeTableName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      routeTableName = cli.interaction.promptIfNotGiven($('Route Table name: '), routeTableName, _);
      name = cli.interaction.promptIfNotGiven($('Route name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.showRoute(resourceGroup, routeTableName, name, options, _);
    });

  route.command('delete [resource-group] [route-table-name] [name]')
    .description($('Delete route from a Route Table'))
    .usage('[options] <resource-group> <route-table-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-r, --route-table-name <route-table-name>', $('the name of the Route Table'))
    .option('-n, --name <name>', $('the name of the route'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, routeTableName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      routeTableName = cli.interaction.promptIfNotGiven($('Route Table name: '), routeTableName, _);
      name = cli.interaction.promptIfNotGiven($('Route name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var routeTable = new RouteTable(cli, networkResourceProviderClient);
      routeTable.deleteRoute(resourceGroup, routeTableName, name, options, _);
    });

  var localGateway = network.category('local-gateway')
    .description($('Commands to manage Local Network Gateways'));

  localGateway.command('create [resource-group] [name] [location]')
    .description($('Create a local network gateway'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the local network'))
    .option('-a, --address-space <address-space>', $('the local network site address space'))
    .option('-i, --ip-address <ip-address>', $('the IP address of the local network site'))
    .option('-l, --location <location>', $('the location'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .option('-t, --tags <tags>', $('the tags set on this local network gateway.' +
    '\n   Can be multiple, in the format of "name=value".' +
    '\n   Name is required and value is optional.' +
    '\n   For example, -t tag1=value1;tag2'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Local network name: '), name, _);
      options.location = cli.interaction.promptIfNotGiven($('Location: '), location, _);
      options.addressSpace = cli.interaction.promptIfNotGiven($('Address space: '), options.addressSpace, _);
      options.ipAddress = cli.interaction.promptIfNotGiven($('IP address: '), options.ipAddress, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var localNetwork = new LocalNetworkGateway(cli, networkResourceProviderClient);
      localNetwork.create(resourceGroup, name, options, _);
    });

  localGateway.command('set [resource-group] [name]')
    .description($('Set a local network gateway'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the local network'))
    .option('-a, --address-space <address-space>', $('the local network site address space'))
    .option('-t, --tags <tags>', $('the tags set on this local network gateway.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional. For example, -t "tag1=value1;tag2".' +
    '\n     Existing tag values will be replaced by the values specified.'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Local network name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var localNetwork = new LocalNetworkGateway(cli, networkResourceProviderClient);
      localNetwork.set(resourceGroup, name, options, _);
    });

  localGateway.command('list [resource-group]')
    .usage('[options] <resource-group>')
    .description($('Get all local networks gateways'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var localNetwork = new LocalNetworkGateway(cli, networkResourceProviderClient);
      localNetwork.list(resourceGroup, options, _);
    });

  localGateway.command('show [resource-group] [name]')
    .usage('[options] <resource-group> <name>')
    .description($('Get a local network gateway'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the local network'))
    .option('-s, --subscription <id>', $('the subscription id'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Local network name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var localNetwork = new LocalNetworkGateway(cli, networkResourceProviderClient);
      localNetwork.show(resourceGroup, name, options, _);
    });

  localGateway.command('delete [resource-group] [name]')
    .usage('[options] <resource-group> <name>')
    .description($('Delete a local network gateway'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the local network'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <id>', $('the subscription id'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Local network name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var localNetwork = new LocalNetworkGateway(cli, networkResourceProviderClient);
      localNetwork.delete(resourceGroup, name, options, _);
    });

  var vpnGateway = network.category('vpn-gateway')
    .description($('Commands to manage Virtual Network Gateways'));

  vpnGateway.command('create [resource-group] [name] [location]')
    .description($('Create a virtual network gateway'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network gateway'))
    .option('-l, --location <location>', $('the location'))
    .option('-y, --type <type>', util.format($('the gateway type' +
    '\n   Valid values are [%s]' +
    '\n   Default is RouteBased'), constants.vpnGateway.type))
    .option('-u, --public-ip-id <public-ip-id>', $('the public ip identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/publicIPAddresses/<public-ip-name>'))
    .option('-p, --public-ip-name <public-ip-name>', $('the public ip name. This public ip must exists in the same resource group as the vnet gateway. Please use public-ip-id if that is not the case.'))
    .option('-f, --subnet-id <subnet-id>', $('the subnet identifier.' +
    '\n     e.g. /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.Network/virtualNetworks/MyTestNetwork/subnets/<subnet-name>'))
    .option('-m, --vnet-name <vnet-name>', $('the virtual network name. This virtual network must exists in the same resource group as the vnet gateway. Please use sunet-id if that is not the case.'))
    .option('-e, --subnet-name <subnet-name>', $('the subnet name'))
    .option('-a, --private-ip-address <private-ip-address>', $('the private ip address'))
    .option('-b, --enable-bgp <enable-bgp>', $('enables BGP flag' +
    '\n   Valid values are [True, False]' +
    '\n   Default is False'))
    .option('-t, --tags <tags>', $('the tags set on this virtual network gateway.' +
    '\n   Can be multiple, in the format of "name=value".' +
    '\n   Name is required and value is optional.' +
    '\n   For example, -t tag1=value1;tag2'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network gateway name: '), name, _);
      options.location = cli.interaction.promptIfNotGiven($('Location: '), location, _);
      options.privateIpAddress = cli.interaction.promptIfNotGiven($('Private IP address: '), options.privateIpAddress, _);

      if (!options.publicIpId && !options.publicIpName) {
        options.publicIpName = cli.interaction.prompt($('Public IP name: '), _);
      }

      if (!options.subnetId && (!options.vnetName || !options.subnetName)) {
        options.vnetName = cli.interaction.prompt($('Virtual network name: '), _);
        options.subnetName = cli.interaction.prompt($('Subnet name: '), _);
      }

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vnetGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vnetGateway.create(resourceGroup, name, options, _);
    });

  vpnGateway.command('set [resource-group] [name]')
    .description($('Set a virtual network gateway'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network gateway'))
    .option('-t, --tags <tags>', $('the tags set on this virtual network gateway.' +
    '\n     Can be multiple. In the format of "name=value".' +
    '\n     Name is required and value is optional. For example, -t "tag1=value1;tag2".' +
    '\n     Existing tag values will be replaced by the values specified.'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vnetGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vnetGateway.set(resourceGroup, name, options, _);
    });

  vpnGateway.command('list [resource-group]')
    .description($('List virtual network gateways'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vnetGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vnetGateway.list(resourceGroup, options, _);
    });

  vpnGateway.command('show [resource-group] [name]')
    .description($('Get a virtual network gateway'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network gateway'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vnetGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vnetGateway.show(resourceGroup, name, options, _);
    });

  vpnGateway.command('delete [resource-group] [name]')
    .description($('Delete a virtual network gateway'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the virtual network gateway'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Virtual network gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vnetGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vnetGateway.delete(resourceGroup, name, options, _);
    });

  var gatewayConnection = network.category('vpn-connection')
    .description($('Commands to manage gateway connections'));

  gatewayConnection.command('create [resource-group] [name] [location]')
    .description($('Create a gateway connection'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the gateway connection'))
    .option('-l, --location <location>', $('the location'))
    .option('-i, --vnet-gateway1 <vnet-gateway1>', $('the name of the virtual network gateway'))
    .option('-e, --vnet-gateway2 <vnet-gateway2>', $('the name of the connected virtual network gateway'))
    .option('-d, --lnet-gateway2 <lnet-gateway2>', $('the name of the connected local network gateway'))
    .option('-y, --type <type>', util.format($('the connection type' +
    '\n   Valid values are [%s]'), constants.vpnGateway.connectionType))
    .option('-w, --routing-weight <routing-weight>', $('the routing weight'))
    .option('-k, --shared-key <shared-key>', $('the IPsec shared key'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .option('-t, --tags <tags>', $('the tags set on this connection.' +
    '\n   Can be multiple, in the format of "name=value".' +
    '\n   Name is required and value is optional.' +
    '\n   For example, -t tag1=value1;tag2'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Connection name: '), name, _);
      options.location = cli.interaction.promptIfNotGiven($('Location: '), location, _);
      options.vnetGateway1 = cli.interaction.promptIfNotGiven($('Virtual network gateway: '), options.vnetGateway1, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vpnGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vpnGateway.createConnection(resourceGroup, name, options, _);
    });

  gatewayConnection.command('list [resource-group]')
    .description($('Get all gateway connections'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vpnGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vpnGateway.listConnections(resourceGroup, options, _);
    });

  gatewayConnection.command('show [resource-group] [name]')
    .description($('Get details about gateway connection'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the gateway connection'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Connection name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vpnGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vpnGateway.showConnection(resourceGroup, name, options, _);
    });

  gatewayConnection.command('delete [resource-group] [name]')
    .usage('[options] <resource-group> <name>')
    .description($('Delete a gateway connection'))
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the gateway connection'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <id>', $('the subscription id'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Connection name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var vpnGateway = new VirtualNetworkGateway(cli, networkResourceProviderClient);
      vpnGateway.deleteConnection(resourceGroup, name, options, _);
    });

  var appGateway = network.category('application-gateway')
    .description($('Commands to manage Application gateways'));

  appGateway.command('create [resource-group] [name] [location]')
    .description($('Create an Application Gateway'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the Application Gateway'))
    .option('-l, --location <location>', $('the location'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network Application Gateway should be deployed in'))
    .option('-m, --subnet-name <subnet-name>', $('the name of subnet in the virtual network identified by --vnet-name'))
    .option('-с, --cert-file <cert-file>', $('the path to the certificate'))
    .option('-x, --cert-password <cert-password>', $('the certificate password'))
    .option('-r, --servers <servers>', $('comma separated list of IP addresses or DNS names corresponding to backend servers'))
    .option('-i, --http-settings-protocol <http-settings-protocol>', util.format($('the HTTP settings protocol, valid value is "%s"'),
      constants.appGateway.settings.protocol))
    .option('-o, --http-settings-port <http-settings-port>', util.format($('the HTTP settings port, valid range is'),
      utils.toRange(constants.appGateway.settings.port)))
    .option('-f, --http-settings-cookie-based-affinity <http-settings-cookie-based-affinity>', util.format($('Enable or disable HTTP settings cookie based affinity, valid values are' +
      '\n     [%s],' +
      '\n     default value is "%s"'), constants.appGateway.settings.affinity, constants.appGateway.settings.affinity[0]))
    .option('-j, --frontend-port <frontend-port>', util.format($('the frontend port value, valid range is'),
      utils.toRange(constants.appGateway.settings.port)))
    .option('-k, --public-ip-name <public-ip-name>', $('the name of the public ip'))
    .option('-t, --routing-rule-type <routing-rule-type>', $('the request routing rule type, default is "Basic"'))
    .option('-a, --sku-name <sku-name>', $('the name of the sku'))
    .option('-t, --sku-tier <sku-tier>', $('the sku tier'))
    .option('-z, --capacity <capacity>', util.format($('application gateway instance count in range \[%s\]. Default value is %s.'),
      constants.appGateway.sku.capacity, constants.appGateway.sku.capacity[0]))
    .option('-d, --description <description>', $('the description for the Application Gateway'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Application Gateway name: '), name, _);
      location = cli.interaction.promptIfNotGiven($('Location: '), location, _);
      options.vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), options.vnetName, _);
      options.subnetName = cli.interaction.promptIfNotGiven($('Comma separated subnet names: '), options.subnetName, _);
      options.servers = cli.interaction.promptIfNotGiven($('Comma separated backend server IPs: '), options.servers, _);

      if (options.httpSettingsProtocol === 'https' || options.certFile) {
        options.certFile = cli.interaction.promptIfNotGiven($('SSL certificate full path: '), options.certFile, _);
        options.password = cli.interaction.promptIfNotGiven($('SSL certificate password: '), options.password, _);
      }

      var networkManagementClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkManagementClient);
      appGateway.create(resourceGroup, name, location, options, _);
    });

  appGateway.command('set [resource-group] [name]')
    .description($('Set an Application Gateway'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the Application Gateway'))
    .option('-l, --sku-name <sku-name>', $('the name of the sku'))
    .option('-t, --sku-tier <sku-tier>', $('the sku tier'))
    .option('-z, --capacity <capacity>', util.format($('application gateway instance count in range \[%s\]. Default value is %s.'),
      constants.appGateway.sku.capacity, constants.appGateway.sku.capacity[0]))
    .option('-d, --description <description>', $('the description for the Application Gateway'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Application Gateway name: '), name, _);

      var networkManagementClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkManagementClient);
      appGateway.set(resourceGroup, name, options, _);
    });

  appGateway.command('list-all')
    .description($('List subscription application gateways'))
    .usage('[options]')
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (options, _) {
      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.listAll(_);
    });

  appGateway.command('list [resource-group]')
    .description($('List resource group application gateways'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.list(resourceGroup, options, _);
    });

  appGateway.command('show [resource-group] [name]')
    .description($('List application gateways'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the application gateway'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Application gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.show(resourceGroup, name, options, _);
    });

  appGateway.command('delete [resource-group] [name]')
    .description($('Delete application gateways'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the application gateway'))
    .option('-q, --quiet', $('quiet mode, do not ask for unregister confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Application gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.delete(resourceGroup, name, options, _);
    });

  appGateway.command('start [resource-group] [name]')
    .description($('Start application gateways'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the application gateway'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Application gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.start(resourceGroup, name, options, _);
    });

  appGateway.command('stop [resource-group] [name]')
    .description($('Stop application gateways'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the application gateway'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Application gateway name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.stop(resourceGroup, name, options, _);
    });

  var appGatewaySslCert = appGateway.category('ssl-cert')
    .description($('Commands to manage Application Gateway SSL certificates'));

  appGatewaySslCert.command('add [resource-group] [gateway-name] [name]')
    .description($('Add Application Gateway SSL certificate'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-c, --name <name>', $('the name of the certificate'))
    .option('-f, --cert-file <cert-file>', $('the path to the certificate'))
    .option('-p, --password <password>', $('the certificate password'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Certificate name: '), name, _);
      options.certFile = cli.interaction.promptIfNotGiven($('Certificate file path: '), options.certFile, _);
      options.password = cli.interaction.promptIfNotGiven($('Certificate password: '), options.password, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.addSsl(resourceGroup, gatewayName, name, options, _);
    });

  appGatewaySslCert.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove Application Gateway SSL certificate'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-c, --name <name>', $('the name of the certificate'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Certificate name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.removeSsl(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayIpConfig = appGateway.category('ip-config')
    .description('Commands to manage Application Gateway ip config');

  appGatewayIpConfig.command('set [resource-group] [gateway-name] [name]')
    .description($('Add an ip config to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the application gateway ip config'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-u, --subnet-name <subnet-name>', $('the name of the subnet'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Ip config name: '), name, _);

      var networkManagementClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkManagementClient);
      appGateway.setIpConfig(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayFrontendIp = appGateway.category('frontend-ip')
    .description($('Commands to manage Application Gateway frontend ip'));

  appGatewayFrontendIp.command('add [resource-group] [gateway-name] [name]')
    .description($('Add a frontend ip configuration to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the frontend IP address name'))
    .option('-e, --vnet-name <vnet-name>', $('the name of the virtual network'))
    .option('-u, --subnet-name <subnet-name>', $('the name of the subnet'))
    .option('-i, --subnet-id <subnet-id>', $('the id of the subnet'))
    .option('-a, --static-ip-address <static-ip-address>', $('the static IP address name'))
    .option('-p, --public-ip-name <public-ip-name>', $('the name of the public ip name'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend IP name: '), name, _);

      if (options.vnetName || options.subnetName) {
        options.vnetName = cli.interaction.promptIfNotGiven($('Virtual network name: '), options.vnetName, _);
        options.subnetName = cli.interaction.promptIfNotGiven($('Subnet name: '), options.subnetName, _);
      } else {
        if(!options.subnetId) {
          options.publicIpName = cli.interaction.promptIfNotGiven($('Public IP name: '), options.publicIpName, _);
        }
      }

      var networkManagementClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkManagementClient);
      appGateway.addFrontendIp(resourceGroup, gatewayName, name, options, _);
    });

  appGatewayFrontendIp.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove a frontend ip configuration from an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the frontend IP configuration'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend IP name: '), name, _);

      var networkManagementClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkManagementClient);
      appGateway.removeFrontendIp(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayFrontendPort = appGateway.category('frontend-port')
    .description('Commands to manage Application Gateway frontend port');

  appGatewayFrontendPort.command('add [resource-group] [gateway-name] [name]')
    .description($('Add a frontend port to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-p, --name <name>', $('the name of the frontend port'))
    .option('-o, --port <port>', util.format($('the port, valid range is'),
      utils.toRange(constants.appGateway.settings.port)))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend port name: '), name, _);
      options.port = cli.interaction.promptIfNotGiven($('Frontend port: '), options.port, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.addFrontendPort(resourceGroup, gatewayName, name, options, _);
    });

  appGatewayFrontendPort.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove a frontend port from an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-p, --name <name>', $('the name of the frontend port'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend port name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.removeFrontendPort(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayAddressPool = appGateway.category('address-pool')
    .description($('Commands to manage Application Gateway backend address pool'));

  appGatewayAddressPool.command('add [resource-group] [gateway-name] [name]')
    .description($('Add a backend address pool to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-p, --name <name>', $('the name of the backend address pool'))
    .option('-r, --servers <servers>', $('comma separated list of IP addresses or DNS names' +
      '\n     corresponding to backend servers'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Backend address pool name: '), name, _);
      options.servers = cli.interaction.promptIfNotGiven($('List of IP addresses or DNS names: '), options.servers, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.addBackendAddressPool(resourceGroup, gatewayName, name, options, _);
    });

  appGatewayAddressPool.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove a backend address pool from an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-p, --name <name>', $('the name of the backend address pool'))
    .option('-q, --quiet', $('quiet mode, do not ask for unregister confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Backend address pool name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.removeBackendAddressPool(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayHttpListener = appGateway.category('http-listener')
    .description('Commands to manage Application Gateway http listener');

  appGatewayHttpListener.command('add [resource-group] [gateway-name] [name]')
    .description($('Add an http listener to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the HTTP listener'))
    .option('-i, --frontend-ip-name <frontend-ip-name>', $('the name of an existing frontend ip configuration'))
    .option('-p, --frontend-port-name <frontend-port-name>', $('the name of an existing frontend port'))
    .option('-t, --protocol <protocol>', util.format($('the protocol, supported values are \[%s\]'), constants.appGateway.httpListener.protocol))
    .option('-c, --ssl-cert <ssl-cert>', $('the name of an existing SSL certificate, this parameter is required when --protocol is Https'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, frontendPortName, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('The HTTP listener name: '), name, _);
      options.frontendIpName = cli.interaction.promptIfNotGiven($('Fronetend Ip Configuration name: '), options.frontendIpName, _);
      options.frontendPortName = cli.interaction.promptIfNotGiven($('Fronetend Port name: '), options.frontendPortName, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.addHttpListener(resourceGroup, gatewayName, name, options, _);
    });

  appGatewayHttpListener.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove an http listener from an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the HTTP listener'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Frontend port name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.removeHttpListener(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayHttpSettings = appGateway.category('http-settings')
    .description($('Commands to manage Application Gateway http settings'));

  appGatewayHttpSettings.command('add [resource-group] [gateway-name] [name]')
    .description($('Add a backend address pool to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-b, --name <name>', $('the name of the HTTP settings'))
    .option('-p, --protocol <protocol>', util.format($('the protocol, valid value is [%s]'),
      constants.appGateway.settings.protocol))
    .option('-o, --port <port>', util.format($('the port, valid range is'),
      utils.toRange(constants.appGateway.settings.port)))
    .option('-c, --cookie-based-affinity <cookie-based-affinity>', util.format($('enable or disable cookie based affinity, valid values are' +
      '\n     [%s],' +
      '\n     default value is [%s]'), constants.appGateway.settings.affinity, constants.appGateway.settings.affinity[0]))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Http settings name: '), name, _);
      options.port = cli.interaction.promptIfNotGiven($('Port: '), options.port, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.addHttpSettings(resourceGroup, gatewayName, name, options, _);
    });

  appGatewayHttpSettings.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove a backend address pool to an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-b, --name <name>', $('the name of the HTTP settings'))
    .option('-q, --quiet', $('quiet mode, do not ask for unregister confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Http settings name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.removeHttpSettings(resourceGroup, gatewayName, name, options, _);
    });

  var appGatewayRoutingRule = appGateway.category('rule')
    .description('Commands to manage Application Gateway request routing rule');

  appGatewayRoutingRule.command('add [resource-group] [gateway-name] [name]')
    .description($('Add request routing rule to Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the request routing rule'))
    .option('-i, --http-settings <http-settings>', $('the name of an existing backend HTTP settings'))
    .option('-l, --http-listener <http-listener>', $('the name of an existing HTTP listener'))
    .option('-p, --address-pool <address-pool>', $('the name of an existing backend address pool'))
    .option('-t, --type <type>', $('the type, default is "Basic"'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Request routing rule name: '), name, _);
      options.httpSettings = cli.interaction.promptIfNotGiven($('HTTP settings name: '), options.httpSettings, _);
      options.httpListener = cli.interaction.promptIfNotGiven($('HTTP listener name: '), options.httpListener, _);
      options.addressPool = cli.interaction.promptIfNotGiven($('The address pool name: '), options.addressPool, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.addRequestRoutingRule(resourceGroup, gatewayName, name, options, _);
    });

  appGatewayRoutingRule.command('remove [resource-group] [gateway-name] [name]')
    .description($('Remove a request routing rule from an Application Gateway'))
    .usage('[options] <resource-group> <gateway-name> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-w, --gateway-name <gateway-name>', $('the name of the Application Gateway'))
    .option('-n, --name <name>', $('the name of the load balancing rule'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, gatewayName, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      gatewayName = cli.interaction.promptIfNotGiven($('Application Gateway name: '), gatewayName, _);
      name = cli.interaction.promptIfNotGiven($('Request routing rule name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var appGateway = new AppGateway(cli, networkResourceProviderClient);
      appGateway.removeRequestRoutingRule(resourceGroup, gatewayName, name, options, _);
    });

  var expressRoute = network.category('express-route')
    .description($('Commands to manage express routes'));

  expressRoute.command('create [resource-group] [name] [location] [service-provider-name] [peering-location]')
    .description($('Create express route circuit'))
    .usage('[options] <resource-group> <name> <location>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the express route circuit'))
    .option('-l, --location <location>', $('the location'))
    .option('-p, --service-provider-name <service-provider-name>', $('the service provider name'))
    .option('-i, --peering-location <peering-location>', $('the service provider peering location'))
    .option('-b, --bandwidth-in-mbps <bandwidth-in-mbps>', $('the bandwidth in Mbps'))
    .option('-e, --sku-tier <sku-tier>', $('the sku tier'))
    .option('-f, --sku-family <sku-family>', $('the sku family'))
    .option('-t, --tags <tags>', $('the tags set on express route.' +
    '\n   Can be multiple, in the format of "name=value".' +
    '\n   Name is required and value is optional.' +
    '\n   For example, -t tag1=value1;tag2'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, serviceProviderName, peeringLocation, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Express route name: '), name, _);
      location = cli.interaction.promptIfNotGiven($('Location: '), location, _);
      options.serviceProviderName = cli.interaction.promptIfNotGiven($('Service provider name: '), serviceProviderName, _);
      options.peeringLocation = cli.interaction.promptIfNotGiven($('Peering location: '), peeringLocation, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var expressRoute = new ExpressRoute(cli, networkResourceProviderClient);
      expressRoute.create(resourceGroup, name, location, options, _);
    });

  expressRoute.command('set [resource-group] [name]')
    .description($('Set an express route circuit'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the express route circuit'))
    .option('-b, --bandwidth-in-mbps <bandwidth-in-mbps>', $('the bandwidth in Mbps'))
    .option('-e, --sku-tier <sku-tier>', $('the sku tier'))
    .option('-f, --sku-family <sku-family>', $('the sku family'))
    .option('-t, --tags <tags>', $('the tags set on express route.' +
    '\n   Can be multiple, in the format of "name=value".' +
    '\n   Name is required and value is optional.' +
    '\n   For example, -t tag1=value1;tag2'))
    .option('--no-tags', $('remove all existing tags'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Express route name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var expressRoute = new ExpressRoute(cli, networkResourceProviderClient);
      expressRoute.set(resourceGroup, name, options, _);
    });

  expressRoute.command('list [resource-group]')
    .description($('Get all express route circuits'))
    .usage('[options] <resource-group>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var expressRoute = new ExpressRoute(cli, networkResourceProviderClient);
      expressRoute.list(resourceGroup, options, _);
    });

  expressRoute.command('show [resource-group] [name]')
    .description($('Create express route circuit'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the express route circuit'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, location, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Express route name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var expressRoute = new ExpressRoute(cli, networkResourceProviderClient);
      expressRoute.show(resourceGroup, name, options, _);
    });

  expressRoute.command('delete [resource-group] [name]')
    .description($('Delete an express route circuit'))
    .usage('[options] <resource-group> <name>')
    .option('-g, --resource-group <resource-group>', $('the name of the resource group'))
    .option('-n, --name <name>', $('the name of the express route circuit'))
    .option('-q, --quiet', $('quiet mode, do not ask for delete confirmation'))
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (resourceGroup, name, options, _) {
      resourceGroup = cli.interaction.promptIfNotGiven($('Resource group name: '), resourceGroup, _);
      name = cli.interaction.promptIfNotGiven($('Express route name: '), name, _);

      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var expressRoute = new ExpressRoute(cli, networkResourceProviderClient);
      expressRoute.delete(resourceGroup, name, options, _);
    });

  var expressRouteProvider = expressRoute.category('provider')
    .description($('Commands to manage express route service providers'));

  expressRouteProvider.command('list')
    .description($('List express route service providers'))
    .usage('[options]')
    .option('-s, --subscription <subscription>', $('the subscription identifier'))
    .execute(function (options, _) {
      var networkResourceProviderClient = getNetworkResourceProviderClient(options);
      var expressRoute = new ExpressRoute(cli, networkResourceProviderClient);
      expressRoute.listProviders(options, _);
    });

  function getServiceClients(options) {
    return {
      computeManagementClient: getComputeManagementClient(options),
      networkResourceProviderClient: getNetworkResourceProviderClient(options),
      trafficManagerProviderClient: getTrafficManagementClient(options)
    };
  }

  function getNetworkResourceProviderClient(options) {
    var subscription = profile.current.getSubscription(options.subscription);
    return utils.createNetworkResourceProviderClient(subscription);
  }

  function getComputeManagementClient(options) {
    var subscription = profile.current.getSubscription(options.subscription);
    return utils.createComputeResourceProviderClient(subscription);
  }

  function getTrafficManagementClient(options) {
    var subscription = profile.current.getSubscription(options.subscription);
    return utils.createTrafficManagerResourceProviderClient(subscription);
  }

  function getDnsManagementClient(options) {
    var subscription = profile.current.getSubscription(options.subscription);
    return utils.createDnsResourceProviderClient(subscription);
  }
};