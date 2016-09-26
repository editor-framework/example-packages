'use strict';

const Editor = require('../index');

Editor.App.extend({
  init ( opts, cb ) {
    Editor.init({
      'package-search-path': [
        'app://packages/',
      ],
      'selection': [ 'normal' ],
    });

    cb ();
  },

  run () {
    // create main window
    Editor.run('app://index.html', {
      title: 'Example Packages',
      width: 900,
      height: 700,
      minWidth: 900,
      minHeight: 700,
      show: false,
      resizable: true,
    });
  },
});
