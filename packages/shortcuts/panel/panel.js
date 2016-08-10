'use strict';

Editor.Panel.extend({
  style: `
    :host {
    }

    .view {
      outline: none;
      padding: 15px;
      border: 1px solid black;
      margin: 5px;
    }

    .view:focus {
      border: 1px solid #09f;
    }

    .root {
      padding: 15px;
    }
  `,

  template: `
    <div class="fit layout vertical" >
      <div class="root">
        <p>
        This package demonstrate keyboard shortcuts usage and event bubbling in Fireball. Click to select a focusable area. There'll be different event handling when focus different area.
        </p>
        <p>
        Press "A" in Root (no area is focused).
        </p>
      </div>
      <div class="layout horizontal flex-1" >
        <div id="foo" class="flex-1 view" tabindex="-1"
          on-mousedown="focusFoo"
          >
          Press "A" in foo and stopPropagation
        </div>
        <div id="bar" class="flex-1 view" tabindex="-1"
          on-mousedown="focusBar"
          >
          Press "A" in bar without event.stopPropagation()
        </div>
      </div>
    </div>
  `,

  $: {
    foo: '#foo',
    bar: '#bar'
  },

  pressA () {
    Editor.log('Pressed A in root');
  },

  focusFoo () {
    this.$foo.focus();
  },

  focusBar () {
    this.$bar.focus();
  },

  fooPressA ( event ) {
    event.stopPropagation();
    Editor.log('Pressed A in #foo');
  },

  barPressA ( event ) {
    unused(event);
    Editor.log('Pressed A in #bar');
  },
});
