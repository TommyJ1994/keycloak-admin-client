'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module roles
 */

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove
};

/**
  A function to get the list of role or a role for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} [options] - The options object
  @param {string} [options.roleId] - use this options to get a role by an id. If this value is populated, it overrides the querystring param options
  @returns {Promise} A promise that will resolve with an Array of role objects or just the 1 role object if a roleId is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.roles.find(realmName)
        .then((roleList) => {
        console.log(roleList) // [{...},{...}, ...]
      })
    })
 */
function find (client) {
  return function find (realm, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      const req = {
        auth: {
          bearer: privates.get(client).accessToken
        },
        json: true
      };

      if (options.roleId) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/roles/${options.roleId}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/roles`;
        req.qs = options;
      }

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 200) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to create a new role for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} role - The JSON representation of a role - http://www.keycloak.org/docs-api/3.1/rest-api/index.html#_rolerepresentation
  @returns {Promise} A promise that will resolve with the role object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.roles.create(realmName, role)
        .then((createdrole) => {
        console.log(createdrole) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, role) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/roles`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: role,
        method: 'POST',
        json: true
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 201) {
          return reject(body);
        }

        // Since the create Endpoint returns an empty body, go get what we just imported.
        // But since we don't know the roleId, we need to search based on the roles name, since it will be unique
        // Then get the first element in the Array returned
        return resolve(client.roles.find(realm, {name: role.name})
          .then((role) => {
            return role[0];
          }));
      });
    });
  };
}

/**
  A function to update a role in a realm
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {object} role - The JSON representation of the fields to update for the role - This must include the role.id field.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.roles.update(realmName, role)
        .then(() => {
          console.log('success')
      })
    })
 */
function update (client) {
  return function update (realmName, role) {
    return new Promise((resolve, reject) => {
      role = role || {};
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/roles/${role.id}`,
        auth: { bearer: privates.get(client).accessToken },
        json: true,
        method: 'PUT',
        body: role
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}

/**
  A function to delete a role in a realm
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @param {string} roleId - The id of the role to delete
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.roles.remove(realmName, roleId)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName, roleId) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/roles/${roleId}`,
        auth: { bearer: privates.get(client).accessToken },
        method: 'DELETE'
      };

      request(req, (err, resp, body) => {
        if (err) {
          return reject(err);
        }

        if (resp.statusCode !== 204) {
          return reject(body);
        }

        return resolve(body);
      });
    });
  };
}
