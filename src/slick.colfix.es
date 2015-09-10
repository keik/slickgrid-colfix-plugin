/**
 * https://github.com/keik/slickgrid-colfix-plugin
 * @version $VERSION
 * @author keik <k4t0.kei@gmail.com>
 * @license MIT
 */

// register namespace
$.extend(true, window, {
  Slick: {
    Plugins: {
      ColFix
    }
  }
});

/**
 * A SlickGrid plugin to make fixed columns for horizontal scroll.
 *
 * USAGE:
 *
 * Register plugin, with one argument to specify a column ID which you want to make fixed:
 *
 *   grid.registerPlugin(new Slick.Plugins.ColFix(colId));
 *
 * @class Slick.Plugins.ColFix
 * @constructor
 */
function ColFix() {
  let _grid;

  function init(grid) {
    _grid = grid;

    console.log('aww');
  }

  $.extend(this, {
    init
  });
}
