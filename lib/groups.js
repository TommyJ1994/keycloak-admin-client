'use strict';

const privates = require('./private-map');
const request = require('request');

/**
 * @module groups
 */

module.exports = {
  find: find,
  create: create,
  update: update,
  remove: remove
};

/**
  A function to get the list of groups or a group for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} [options] - The options object
  @param {string} [options.groupId] - use this options to get a group by an id. If this value is populated, it overrides the querystring param options
  @returns {Promise} A promise that will resolve with an Array of group objects or just the 1 group object if a groupId is used
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.groups.find(realmName)
        .then((groupList) => {
        console.log(groupList) // [{...},{...}, ...]
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

      if (options.groupId) {
        req.url = `${client.baseUrl}/admin/realms/${realm}/groups/${options.groupId}`;
      } else {
        req.url = `${client.baseUrl}/admin/realms/${realm}/groups`;
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
  A function to create a new group for a realm.
  @param {string} realmName - The name of the realm(not the realmID) - ex: master
  @param {object} group - The JSON representation of a group - http://www.keycloak.org/docs-api/3.1/rest-api/index.html#_grouprepresentation
  @returns {Promise} A promise that will resolve with the group object
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.groups.create(realmName, group)
        .then((createdGroup) => {
        console.log(createdGroup) // [{...}]
      })
    })
 */
function create (client) {
  return function create (realm, group) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realm}/groups`,
        auth: {
          bearer: privates.get(client).accessToken
        },
        body: group,
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
        // But since we don't know the groupId, we need to search based on the groups name, since it will be unique
        // Then get the first element in the Array returned
        return resolve(client.groups.find(realm, {name: group.name})
          .then((group) => {
            return group[0];
          }));
      });
    });
  };
}

/**
  A function to update a group in a realm
  @param {string} realmName - The name of the realm(not the realmID) - ex: master,
  @param {object} group - The JSON representation of the fields to update for the group - This must include the group.id field.
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.groups.update(realmName, group)
        .then(() => {
          console.log('success')
      })
    })
 */
function update (client) {
  return function update (realmName, group) {
    return new Promise((resolve, reject) => {
      group = group || {};
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/groups/${group.id}`,
        auth: { bearer: privates.get(client).accessToken },
        json: true,
        method: 'PUT',
        body: group
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
  A function to delete a group in a realm
  @param {string} realmName - The name of the realm(not the realmID) to delete - ex: master,
  @param {string} groupId - The id of the group to delete
  @returns {Promise} A promise that resolves.
  @example
  keycloakAdminClient(settings)
    .then((client) => {
      client.groups.remove(realmName, groupId)
        .then(() => {
          console.log('success')
      })
    })
 */
function remove (client) {
  return function remove (realmName, groupId) {
    return new Promise((resolve, reject) => {
      const req = {
        url: `${client.baseUrl}/admin/realms/${realmName}/groups/${groupId}`,
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
