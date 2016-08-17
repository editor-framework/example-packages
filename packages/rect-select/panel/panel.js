'use strict';

Editor.Panel.extend({
  dependencies: [
    'packages://rect-select/svg.min.js'
  ],

  style: `
    :host {
      margin: 5px;
    }

    svg {
      border: 2px solid black;
      background: #333;
      shape-rendering: crispEdges;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    svg rect.node {
      fill: #f00;
      stroke: #fff;
      stroke-width: 2;
      cursor: pointer;
    }

    svg rect.node.selected {
      fill: black;
      stroke: #0f0;
    }

    svg text {
      pointer-events: none;
    }

    svg .rect-select {
      fill: rgba( 0, 128, 255, 0.4);
      stroke-width: 1;
      stroke: #09f;
    }
  `,

  template: `
    <svg id="svg"></svg>
  `,

  $: {
    svg: '#svg'
  },

  listeners: {
    'panel-resize' () {
      const list = [
        'extrajudicially',
        'duse',
        'appleton',
        'aborning',
        'evacuee',
        'impecunious',
        'overrude',
        'subrange',
        'hamlet',
        'subtranslucency',
      ];

      let rect = this.$svg.getBoundingClientRect();
      let index = 0;
      this._scene.clear();

      list.forEach(name => {
        let x = Editor.Math.randomRange(100, rect.width - 100);
        let y = Editor.Math.randomRange(100, rect.height - 100);
        let node = this._scene.group();
        let rectNode = node.rect(15, 15)
          .move(-5, 0)
          .translate(x, y)
          .addClass('node')
        ;
        rectNode.selectable = true;
        rectNode.index = index;

        node
          .plain(name)
          .font({
            size: 15,
            anchor: 'middle',
          })
          .fill({
            color: '#999'
          })
          .translate(x, y - 5);

        this._rectNodes.push(rectNode);
        ++index;
      });
    },
  },

  ready () {
    this._svg = window.SVG(this.$svg);

    this._scene = this._svg.group();
    this._foreground = this._svg.group();
    this._rectNodes = [];

    this.$svg.addEventListener('mousedown', this._onMousedown.bind(this));

    // =================
    // IPC
    // =================

    let ipc = new Editor.IpcListener();

    ipc.on('selection:changed', ( event, type ) => {
      for ( let i = 0; i < this._rectNodes.length; ++i ) {
        this._rectNodes[i].removeClass('selected');
      }

      let selection = Editor.Selection.curSelection(type);
      selection.forEach(id => {
        this._rectNodes[id].addClass('selected');
      });
    });
  },

  updateSelectRect (x, y, w, h) {
    if (!this._selectRect) {
      this._selectRect = this._foreground.rect();
    }

    this._selectRect
      .addClass('rect-select')
      .move(x, y)
      .size(w, h);
  },

  fadeoutSelectRect () {
    if (!this._selectRect) {
      return;
    }

    let _selectRect = this._selectRect;
    this._selectRect = null;

    _selectRect.animate(100, '-').opacity(0.0).after(() => {
      _selectRect.remove();
    });
  },

  rectHitTest (x, y, w, h) {
    let rect = this._svg.node.createSVGRect();
    rect.x = x;
    rect.y = y;
    rect.width = w;
    rect.height = h;

    let els = this._svg.node.getIntersectionList(rect, null);
    let results = [];

    for (let i = 0; i < els.length; ++i) {
      let el = els[i];
      let node = el.instance;
      if (node && node.selectable) {
        results.push(node);
      }
    }

    return results;
  },

  _onMousedown (event) {
    if (event.which !== 1) {
      return;
    }

    event.stopPropagation();

    let toggleMode = false;
    if (event.metaKey || event.ctrlKey) {
      toggleMode = true;
    }
    let lastSelection = Editor.Selection.curSelection('normal');

    let rect = this.$svg.getBoundingClientRect();
    let pressx = event.clientX;
    let pressy = event.clientY;

    let mousemoveHandle = event => {
      event.stopPropagation();

      // process selection
      let startx = pressx - rect.left;
      let starty = pressy - rect.top;
      let offsetx = event.clientX - pressx;
      let offsety = event.clientY - pressy;

      let magSqr = offsetx * offsetx + offsety * offsety;
      if (magSqr < 2.0 * 2.0) {
        return;
      }

      if (offsetx < 0.0) {
        startx += offsetx;
        offsetx = -offsetx;
      }
      if (offsety < 0.0) {
        starty += offsety;
        offsety = -offsety;
      }

      this.updateSelectRect(startx, starty, offsetx, offsety);
      let results = this.rectHitTest(startx, starty, offsetx, offsety);
      let indices = results.map(node => {
        return node.index;
      });
      if (toggleMode) {
        for (let i = 0; i < lastSelection.length; ++i) {
          if (indices.indexOf(lastSelection[i]) === -1)
            indices.push(lastSelection[i]);
        }
      }
      Editor.Selection.select('normal', indices, true, true);
    };

    let mouseupHandle = event => {
      event.stopPropagation();

      document.removeEventListener('mousemove', mousemoveHandle);
      document.removeEventListener('mouseup', mouseupHandle);

      Editor.UI.removeDragGhost();
      this.style.cursor = '';
      this.fadeoutSelectRect();

      // process selection
      let startx = pressx - rect.left;
      let starty = pressy - rect.top;
      let offsetx = event.clientX - pressx;
      let offsety = event.clientY - pressy;

      let magSqr = offsetx * offsetx + offsety * offsety;
      if (magSqr >= 2.0 * 2.0) {
        Editor.Selection.confirm();
      } else {
        let results = this.rectHitTest(startx, starty, 1, 1);
        if (toggleMode) {
          if (results.length > 0) {
            if (lastSelection.indexOf(results[0].name) === -1) {
              Editor.Selection.select('normal', results[0].name, false, true);
            } else {
              Editor.Selection.unselect('normal', results[0].name, true);
            }
          }
        } else {
          if (results.length > 0) {
            Editor.Selection.select('normal', results[0].name, true, true);
          } else {
            Editor.Selection.clear('normal');
          }
        }
      }
    };

    //
    Editor.UI.addDragGhost();
    document.addEventListener('mousemove', mousemoveHandle);
    document.addEventListener('mouseup', mouseupHandle);
  },
});
