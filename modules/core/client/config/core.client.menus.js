(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    // Should be changed to not be both the parent and child (hacked for it to show in header nav user dropdown)
    menuService.addSubMenuItem('account', 'settings', {
      title: 'Account',
      state: 'settings.profile'
    });

//    menuService.addSubMenuItem('account', 'settings', {
//      title: 'Edit profile',
//      state: 'settings.profile'
//    });

//    menuService.addSubMenuItem('account', 'settings', {
//      title: 'Edit profile picture',
//      state: 'settings.picture'
//    });

//    menuService.addSubMenuItem('account', 'settings', {
//      title: 'Change password',
//      state: 'settings.password'
//    });

//    menuService.addSubMenuItem('account', 'settings', {
//      title: 'Manage Social Accounts',
//      state: 'settings.accounts'
//    });
  }
}());
