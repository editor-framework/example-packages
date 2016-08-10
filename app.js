'use strict';

const Editor = require('../index');

Editor.App.extend({
  init ( opts, cb ) {
    Editor.init({
      'package-search-path': [
        'app://packages/',
      ],
    });

    cb ();
  },

  run () {
    // create main window
    let mainWin = new Editor.Window('main', {
      title: 'Example Packages',
      width: 900,
      height: 700,
      minWidth: 900,
      minHeight: 700,
      show: false,
      resizable: true,
    });
    Editor.Window.main = mainWin;

    // restore window size and position
    mainWin.restorePositionAndSize();

    // page-level test case
    mainWin.load( 'app://index.html' );

    // load and show main window
    mainWin.show();

    // open dev tools if needed
    if ( Editor.argv.showDevtools ) {
      // NOTE: open dev-tools before did-finish-load will make it insert an unused <style> in page-level
      mainWin.nativeWin.webContents.once('did-finish-load', function () {
        mainWin.openDevTools();
      });
    }
    mainWin.focus();
  },
});
