'use strict';

const test = require('blue-tape');
const keycloakAdminClient = require('../index');

const settings = {
  baseUrl: 'http://127.0.0.1:8080/auth',
  username: 'admin',
  password: 'admin',
  grant_type: 'password',
  client_id: 'admin-cli'
};

test('Test getting the list of Roles', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    t.equal(typeof client.roles.find, 'function', 'The client object returned should have a roles.find function');

    return client.roles.find('master').then((listOfRoles) => {
      // The listOfRoles should be an Array
      t.equal(listOfRoles instanceof Array, true, 'the list of roles should be an array');
    });
  });
});

test('Test finding a single role', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    return client.roles.find('master', {'roleId': 'offline_access'}).then((role) => {
      // The role returned should be an object and be the testRole2 role
      t.equal(role instanceof Object, true, 'The role returned should be an object');
      t.equal(role.name, 'testRole2', 'The role should be named testRole2');
    });
  });
});

test('Test finding a role that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  return kca.then((client) => {
    return t.shouldFail(client.roles.find('master', {'roleId': 'not-a-role'}), 'Role not found.', 'Role not found should be returned if the Role wasn\'t found');
  });
});

test('Test creating a realm role', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a role,  just using the name property
  const roleToAdd = {
    name: 'newRealmRole'
  };

  return kca.then((client) => {
    t.equal(typeof client.roles.create, 'function', 'The client object returned should have a create function');

    return client.roles.create('master', roleToAdd).then((addedRole) => {
      return client.roles.find('master', {'roleId': addedRole.name}).then((role) => {
        // The role returned should be an object and be the 'newRole' role
        t.equal(role instanceof Object, true, 'The role returned should be an object');
        t.equal(role.name, addedRole.name, 'The role should be named newRole');

        // clean up the role we just added.
        client.roles.remove('master', {'roleId': addedRole.name});
      });
    });
  });
});

test('Test create a new role with a non-unique name', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a role with just using the name property
  const roleToAdd = {
    name: 'offline_access'
  };

  return kca.then((client) => {
    return t.shouldFail(client.roles.create('master', roleToAdd), 'Role with same name exists', 'Error message should be returned when using a non-unique role name');
  });
});

test('Test delete a role', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a role, just using the name property
  const roleToAdd = {
    name: 'roleToDelete'
  };

  return kca.then((client) => {
    return client.roles.create('master', roleToAdd).then((addedRole) => {
      // check that the role has been created

      return client.roles.find('master', {'roleId': addedRole.name}).then((role) => {
        // The role returned should be an object and be the 'newRole' role
        t.equal(role instanceof Object, true, 'The role returned should be an object');
        t.equal(role.name, addedRole.name, 'The role should be named newRole');

        // delete the role we just added
        client.roles.remove('master', {'roleId': roleToAdd.name});

        // ensure that the role now no longer exists
        return t.shouldFail(client.roles.find('master', {'roleId': addedRole.name}), 'Role not found.', 'Role not found should be returned if the Role wasn\'t found');
      });
    });
  });
});

test('Test delete a role that doesn\'t exist', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a role that shouldn't exist
  const roleToAdd = {
    name: 'testDeleteNonExistingRole'
  };

  return kca.then((client) => {
    // Call the roles.remove api to remove this role
    return t.shouldFail(client.roles.remove('master', {'roleId': roleToAdd.name}), 'Role not found.', 'Role not found should be returned if the role wasn\'t found to delete');
  });
});

test('Test updating a role', (t) => {
  const kca = keycloakAdminClient(settings);

  // A minimal JSON representation of a role with just using the name property
  const addedRole = {
    name: 'testRoleForUpdating'
  };

  return kca.then((client) => {
    client.roles.create('master', addedRole).then((addedRole) => {
      // just a quick quick that the role is there
      return client.roles.find('master', {'roleId': addedRole.name}).then((role) => {
        // The role returned should be an object and be the 'newRole' role
        t.equal(role instanceof Object, true, 'The role returned should be an object');
        t.equal(role.name, addedRole.name, 'The role should be named newRole');

        // Update a property in the role we just created
        addedRole.scopeParamRequired = true;
        // Call the roles.update api to update just the role
        return client.roles.update('master', addedRole).then(() => {
          // There is no return value on an update
          // Get the role we just updated to test
          return client.roles.find('master', {'roleId': addedRole.name}).then(() => {
            return client.roles.find('master', {'roleId': addedRole.name}).then((role) => {
              console.log('>>>>>>>>>>>>>>>>>', role);
              // The role returned should be an object and be the 'addedRole' role
              t.equal(role instanceof Object, true, 'The role returned should be an object');
              t.equal(role.name, addedRole.name, 'The role should be named newRole');
              client.roles.remove('master', {'roleId': addedRole.name});
            });
          });
        });
      });
    });
  });
});
