/* globals chai: false, describe: false, it: false, afterEach: false, each: false */
/* eslint camelcase: [0] */

var assert = chai.assert;

/**
 * @param {Object} options SlickGrid grid options
 * @return {SlickGrid} SlickGrid object
 */
function createGrid(options) {
  $('<div id="grid" style="width: 400px; height: 300px;"></div>').appendTo(document.body);

  var columns = [
    {id: 'title', name: 'Title', field: 'title', group: '1'},
    {id: 'duration', name: 'Duration', field: 'duration', group: '1'},
    {id: '%', name: '% Complete', field: 'percentComplete', group: '2'},
    {id: 'start', name: 'Start', field: 'start', group: '2'},
    {id: 'finish', name: 'Finish', field: 'finish', group: '3'},
    {id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven', group: '3'}
  ];

  var defaultOptions = {
    enableCellNavigation: true,
    enableColumnReorder: false
  };
  options = $.extend({}, defaultOptions, options);

  var data = [];
  for (var i = 0; i < 500; i++) {
    data[i] = {
      title: 'Task ' + i,
      duration: '5 days',
      percentComplete: Math.round(Math.random() * 100),
      start: '01/01/2009',
      finish: '01/05/2009',
      effortDriven: (i % 5 === 0)
    };
  }

  return new Slick.Grid('#grid', data, columns, options);
}

describe('slickgrid-colfix-plugin', function() {

  afterEach(function() {
    $('#grid').remove();
  });

  it('ALL TESTS WILL BE PASSED', function() {
    assert.ok(true);
  });
});
