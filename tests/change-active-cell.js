/* globals chai: false, describe: false, it: false, before: false, after: false, afterEach: false, each: false */
/* eslint camelcase: [0] */

var assert = chai.assert;

var grid;

describe('Change active cell', function() {

  before(function() {

    /** columns defination */
    var columns = [
      {id: 'col1', name: 'col 1', field: 'col1', width: 50,  editor: Slick.Editors.Text},
      {id: 'col2', name: 'col 2', field: 'col2', width: 80,  editor: Slick.Editors.Text},
      {id: 'col3', name: 'col 3', field: 'col3', width: 100, editor: Slick.Editors.Text},
      {id: 'col4', name: 'col 4', field: 'col4', width: 200, editor: Slick.Editors.Text},
      {id: 'col5', name: 'col 5', field: 'col5', width: 50,  editor: Slick.Editors.Text},
      {id: 'col6', name: 'col 6', field: 'col6', width: 300, editor: Slick.Editors.Text},
      {id: 'col7', name: 'col 7', field: 'col7', width: 100, editor: Slick.Editors.Text},
      {id: 'col8', name: 'col 8', field: 'col8', width: 200, editor: Slick.Editors.Text},
      {id: 'col9', name: 'col 9', field: 'col9', width: 100, editor: Slick.Editors.Text}
    ];

    /** grid options */
    var options = {
      autoEdit: false,
      editable: true,
      enableColumnReorder: false
    };

    /** data */
    var data = [];
    for (var i = 0; i < 500; i++) {
      data[i] = {
        id: i,
        col1: 'col 1-' + i,
        col2: 'col 2-' + i,
        col3: 'col 3-' + i,
        col4: 'col 4-' + i,
        col5: 'col 5-' + i,
        col6: 'col 6-' + i,
        col7: 'col 7-' + i,
        col8: 'col 8-' + i,
        col9: 'col 9-' + i
      };
    }

    /** SlickGrid */
    grid = new Slick.Grid('#my-grid', data, columns, options);

    // register colfix plguin
    grid.registerPlugin(new Slick.Plugins.ColFix('col2'));
  });

  after(function() {
    // grid.destroy();
  });

  describe('Two SlickGrid containers', function() {
    it('should exist, which one is for a fixed columns, other one is for a main', function() {
      assert.equal(document.querySelectorAll('.ui-widget[class*=slickgrid]').length, 2);
    });
  });

  describe('When active cell is changed,', function() {

    it('horizontal scroll are preserved', function(d) {
      grid.setActiveCell(0, 0);

      var mainViewportEl = document.querySelectorAll('.ui-widget[class*=slickgrid]')[1].querySelector('.slick-viewport');

      assert.equal(mainViewportEl.scrollLeft, 0);
      mainViewportEl.scrollLeft = 300;

      Promise.resolve().then(function() {
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            grid.setActiveCell(0, 2);
            resolve();
          }, 0);
        });
      }).then(function() {
        setTimeout(function() {
          assert.equal(mainViewportEl.scrollLeft, 0);
          d();
        }, 0);
      });

    });
  });

});
