var columns = [
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

var options = {
  enableCellNavigation: true,
  enableColumnReorder: false
};

var data = [];
for (var i = 0; i < 500; i++) {
  data[i] = {
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

var grid = new Slick.Grid('#my-grid', data, columns, options);
grid.registerPlugin(new Slick.Plugins.ColFix('col2'));
