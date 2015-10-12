/* globals chai: false, describe: false, it: false, before: false, after: false, afterEach: false, each: false */
/* eslint camelcase: [0] */

var assert = chai.assert;

var grid;

describe('basic', function() {

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

    /** data */
    var data = [];
    for (var i = 0; i < 500; i++) {
      data[i] = {
        idx: i,
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

  describe('scroll', function() {
    it('of fixed grid should follow scroll of main grid stickly', function(done) {
      var containers = document.querySelectorAll('.ui-widget[class*=slickgrid]'),
          fixedContainer = containers[0],
          mainContainer = containers[1];

      new Promise(function(resolve, reject) {
        mainContainer.querySelector('.slick-viewport').scrollTop = 100;
        setTimeout(function() {
          assert.equal(fixedContainer.querySelector('.slick-viewport').scrollTop, 100);
          resolve();
        }, 100);
      }).then(function() {
        return new Promise(function(resolve, reject) {
          mainContainer.querySelector('.slick-viewport').scrollTop = 0;
          setTimeout(function() {
            assert.equal(fixedContainer.querySelector('.slick-viewport').scrollTop, 0);
            done();
          }, 100);
        });
      });
    });

    it('of main grid should follow scroll of fixed grid stickly', function(done) {
      var containers = document.querySelectorAll('.ui-widget[class*=slickgrid]'),
          fixedContainer = containers[0],
          mainContainer = containers[1];

      new Promise(function(resolve, reject) {
        fixedContainer.querySelector('.slick-viewport').scrollTop = 100;
        setTimeout(function() {
          assert.equal(mainContainer.querySelector('.slick-viewport').scrollTop, 100);
          resolve();
        }, 100);
      }).then(function() {
        return new Promise(function(resolve, reject) {
          fixedContainer.querySelector('.slick-viewport').scrollTop = 0;
          setTimeout(function() {
            assert.equal(mainContainer.querySelector('.slick-viewport').scrollTop, 0);
            done();
          }, 100);
        });
      });
    });
  });

  describe('acitve cell', function() {
    it('should be able to set in fixed grid', function() {
      var containers = document.querySelectorAll('.ui-widget[class*=slickgrid]'),
          fixedContainer = containers[0],
          mainContainer = containers[1];

      assert.equal(fixedContainer.querySelectorAll('.slick-row.active').length, 0);
      assert.equal(mainContainer.querySelectorAll('.slick-row.active').length, 0);

      // exercise
      grid.setActiveCell(0, 0);

      // verify active row
      var fixedActiveRows = fixedContainer.querySelectorAll('.slick-row.active');
      assert.equal(fixedActiveRows.length, 1);
      assert.equal(fixedActiveRows[0].style.top, '0px');

      var mainActiveRows = fixedContainer.querySelectorAll('.slick-row.active');
      assert.equal(mainActiveRows.length, 1);
      assert.equal(mainActiveRows[0].style.top, '0px');

      // verify active cell
      var fixedActiveCells = fixedContainer.querySelectorAll('.slick-cell.active');
      assert.equal(fixedActiveCells.length, 1);
      assert.equal(Array.prototype.indexOf.apply(fixedActiveCells[0].parentNode.childNodes, [fixedActiveCells[0]]), 0);

      var mainActiveCells = mainContainer.querySelectorAll('.slick-cell.active');
      assert.equal(mainActiveCells.length, 0);
    });

    it('should be able to set in main grid', function() {
      var containers = document.querySelectorAll('.ui-widget[class*=slickgrid]'),
          fixedContainer = containers[0],
          mainContainer = containers[1];

      assert.equal(fixedContainer.querySelectorAll('.slick-row.active').length, 1);
      assert.equal(mainContainer.querySelectorAll('.slick-row.active').length, 1);

      // exercise
      grid.setActiveCell(1, 2);

      // verify active row
      var fixedActiveRows = fixedContainer.querySelectorAll('.slick-row.active');
      assert.equal(fixedActiveRows.length, 1);
      assert.equal(fixedActiveRows[0].style.top, '25px');

      var mainActiveRows = fixedContainer.querySelectorAll('.slick-row.active');
      assert.equal(mainActiveRows.length, 1);
      assert.equal(mainActiveRows[0].style.top, '25px');

      // verify active cell
      var fixedActiveCells = fixedContainer.querySelectorAll('.slick-cell.active');
      assert.equal(fixedActiveCells.length, 0);

      var mainActiveCells = mainContainer.querySelectorAll('.slick-cell.active');
      assert.equal(mainActiveCells.length, 1);
      assert.equal(Array.prototype.indexOf.apply(mainActiveCells[0].parentNode.childNodes, [mainActiveCells[0]]), 1);
    });

    it('should be able to get', function() {
      var containers = document.querySelectorAll('.ui-widget[class*=slickgrid]'),
          fixedContainer = containers[0],
          mainContainer = containers[1];

      assert.equal(fixedContainer.querySelectorAll('.slick-row.active').length, 1);
      assert.equal(mainContainer.querySelectorAll('.slick-row.active').length, 1);

      // exercise 1
      grid.setActiveCell(0, 0);
      assert.equal(grid.getActiveCell().row, 0);
      assert.equal(grid.getActiveCell().cell, 0);

      // exercise 2
      grid.setActiveCell(1, 2);
      assert.equal(grid.getActiveCell().row, 1);
      assert.equal(grid.getActiveCell().cell, 2);
    });
  });

});
