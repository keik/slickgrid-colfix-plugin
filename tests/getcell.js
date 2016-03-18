/* globals chai: false, describe: false, it: false, before: false, after: false, afterEach: false, each: false */
/* eslint camelcase: [0] */

var assert = chai.assert;

var grid;

describe('getcell', function() {

  before(function() {

    /** columns defination */
    var columns = [
      {id: '#',    name: '',      field: 'idx',  width: 50, cssClass: 'idx'},
      {id: 'col1', name: 'col 1', field: 'col1', width: 50},
      {id: 'col2', name: 'col 2', field: 'col2', width: 80},
      {id: 'col3', name: 'col 3', field: 'col3', width: 100},
      {id: 'col4', name: 'col 4', field: 'col4', width: 200},
      {id: 'col5', name: 'col 5', field: 'col5', width: 50},
      {id: 'col6', name: 'col 6', field: 'col6', width: 300},
      {id: 'col7', name: 'col 7', field: 'col7', width: 100},
      {id: 'col8', name: 'col 8', field: 'col8', width: 200},
      {id: 'col9', name: 'col 9', field: 'col9', width: 100}
    ];

    /** grid options */
    var options = {
      enableColumnReorder: false
    };

    var dataView = new Slick.Data.DataView();

    /** SlickGrid */
    grid = new Slick.Grid('#my-grid', dataView, columns, options);

    // register colfix plguin
    grid.registerPlugin(new Slick.Plugins.ColFix('#'));
  });

  after(function() {
    grid.destroy();
  });

  describe('Two SlickGrid containers', function() {
    it('should exist, which one is for a fixed columns, other one is for a main', function() {
      assert.equal(document.querySelectorAll('.ui-widget[class*=slickgrid]').length, 2);
    });
  });

  describe('Get cell from illegal event', function() {
    it('should be null', function() {
      var evt = document.createEvent('HTMLEvents');
      evt.initEvent('click', true, true);

      var cell = grid.getCellFromEvent(evt);
      assert.equal(cell, null);
    });
  });
});
