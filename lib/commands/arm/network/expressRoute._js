var __ = require('underscore');
var constants = require('./constants');
var util = require('util');
var utils = require('../../../util/utils');
var $ = utils.getLocaleString;
var resourceUtils = require('../resource/resourceUtils');
var tagUtils = require('../tag/tagUtils');

function ExpressRoute(cli, networkResourceProviderClient) {
  this.networkResourceProviderClient = networkResourceProviderClient;
  this.output = cli.output;
  this.interaction = cli.interaction;
}

__.extend(ExpressRoute.prototype, {
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

    createPeering: function (resourceGroupName, circuitName, name, options, _) {
      var self = this;
      var circuit = self.get(resourceGroupName, circuitName, _);
      if (!circuit) {
        throw new Error(util.format($('An express route circuit with name "%s" not found in the resource group "%s"'), circuitName, resourceGroupName));
      }
      var circuitAuth = self.getPeering(resourceGroupName, circuitName, name, _);
      if (circuitAuth) {
        throw new Error(util.format($('An express route circuit authorization with name "%s" already exists in circuit "%s" in the resource group "%s"'), name, circuitName, resourceGroupName));
      }

      circuitAuth = {
        name: name
      };
      circuitAuth = self._parseCircuitPeering(circuitAuth, options, true);
      var progress = self.interaction.progress(util.format($('Creating express route circuit authorization "%s"'), circuitName));
      try {
        self.networkResourceProviderClient.expressRouteCircuitAuthorizations.createOrUpdate(resourceGroupName, circuitName, name, circuitAuth, _);
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
      var circuitAuth = self.getPeering(resourceGroupName, circuitName, name, _);
      if (!circuitAuth) {
        throw new Error(util.format($('An express route circuit authorization with name "%s" not found in circuit "%s" in the resource group "%s"'), name, circuitName, resourceGroupName));
      }

      circuitAuth = self._parseCircuitPeering(circuitAuth, options, false);
      var progress = self.interaction.progress(util.format($('Setting express route circuit authorization "%s"'), circuitName));
      try {
        self.networkResourceProviderClient.expressRouteCircuitAuthorizations.createOrUpdate(resourceGroupName, circuitName, name, circuitAuth, _);
      } finally {
        progress.end();
      }
      self.showPeering(resourceGroupName, circuitName, name, options, _);
    },

    showPeering: function (resourceGroupName, circuitName, name, options, _) {
      var self = this;
      var circuitAuth = self.getPeering(resourceGroupName, circuitName, name, _);
      if (!circuitAuth) {
        throw new Error(util.format($('An express route circuit authorization with name "%s" not found in the circuit "%s" in resource group "%s"'), name, circuitName, resourceGroupName));
      }

      self.interaction.formatOutput(circuitAuth, function (circuitAuth) {
        if (circuitAuth === null) {
          self.output.warn(util.format($('An express route circuit with name "%s" not found in the circuit "%s" in resource group "%s"'), name, circuitName, resourceGroupName));
        } else {
          var resourceInfo = resourceUtils.getResourceInformation(circuitAuth.id);
          self.output.nameValue($('Id'), circuitAuth.id);
          self.output.nameValue($('Name'), circuitAuth.name);
          self.output.nameValue($('Type'), resourceInfo.resourceType);
          self.output.nameValue($('Use state'), circuitAuth.authorizationUseStatus);
          self.output.nameValue($('Authorization Key'), circuitAuth.authorizationKey);
          self.output.nameValue($('Provisioning state'), circuitAuth.provisioningState);
          self.output.nameValue($('Tags'), tagUtils.getTagsInfo(circuitAuth.tags));
        }
      });
    },

    deletePeering: function (resourceGroupName, circuitName, name, options, _) {
      var self = this;

      var circuitAuth = self.getPeering(resourceGroupName, circuitName, name, _);
      if (!circuitAuth) {
        throw new Error(util.format($('An express route circuit authorization with name "%s" not found in the circuit "%s" in resource group "%s"'), name, circuitName, resourceGroupName));
      }

      if (!options.quiet && !self.interaction.confirm(util.format($('Delete express route circuit authorization "%s"? [y/n] '), circuitName), _)) {
        return;
      }

      var progress = self.interaction.progress(util.format($('Deleting express route circuit authorization "%s"'), name));
      try {
        self.networkResourceProviderClient.expressRouteCircuitAuthorizations.deleteMethod(resourceGroupName, circuitName, name, _);
      } finally {
        progress.end();
      }
    },

    listPeering: function (resourceGroupName, circuitName, options, _) {
      var self = this;
      var progress = self.interaction.progress($('Getting the express route circuit authorizations'));

      var circuits = null;
      try {
        circuits = self.networkResourceProviderClient.expressRouteCircuitAuthorizations.list(resourceGroupName, circuitName, _);
      } finally {
        progress.end();
      }
      self.interaction.formatOutput(circuits.authorizations, function (circuits) {
        if (circuits.length === 0) {
          self.output.warn($('No express route circuits found'));
        } else {
          self.output.table(circuits, function (row, circuitAuth) {
            row.cell($('Name'), circuitAuth.name);
            row.cell($('Use state'), circuitAuth.authorizationUseStatus);
            row.cell($('Provisioning state'), circuitAuth.provisioningState);
          });
        }
      });
    },

    getPeering: function (resourceGroupName, circuitName, name, _) {
      var self = this;
      var progress = self.interaction.progress(util.format($('Looking up the express route circuit authorization "%s"'), circuitName));

      try {
        var circuit = self.networkResourceProviderClient.expressRouteCircuitAuthorizations.get(resourceGroupName, circuitName, name, _);
        return circuit.authorization;
      } catch (e) {
        if (e.statusCode === 404) {
          return null;
        }
        throw e;
      } finally {
        progress.end();
      }
    },

    _parseCircuitPeering: function (circuitAuth, options, useDefaults) {
      if (options.key) {
        circuitAuth.authorizationKey = options.key.toString('base64');
      }
      if (options.status) {
        var status = utils.verifyParamExistsInCollection(constants.expressRouteAuthorization.status, options.status, '--status');
        circuitAuth.authorizationUseStatus = status;
      } else {
        if (useDefaults) {
          circuitAuth.authorizationUseStatus = constants.expressRouteAuthorization.status[0];
        }
      }
      return circuitAuth;
    }
  }
);

module.exports = ExpressRoute;