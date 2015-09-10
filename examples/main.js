var columns = [
  {id: 'col1', name: 'col 1', field: 'col1', width: 100},
  {id: 'col2', name: 'col 2', field: 'col2', width: 100},
  {id: 'col3', name: 'col 3', field: 'col3', width: 100},
  {id: 'col4', name: 'col 4', field: 'col4', width: 100},
  {id: 'col5', name: 'col 5', field: 'col5', width: 100},
  {id: 'col6', name: 'col 6', field: 'col6', width: 100},
  {id: 'col7', name: 'col 7', field: 'col7', width: 100},
  {id: 'col8', name: 'col 8', field: 'col8', width: 100},
  {id: 'col9', name: 'col 9', field: 'col9', width: 100}
];

var options = {
  enableCellNavigation: true,
  enableColumnReorder: false
};

var data = [];
for (var i = 0; i < 500; i++) {
  data[i] = {
    col1: 'col ' + i,
    col2: 'col ' + i,
    col3: 'col ' + i,
    col4: 'col ' + i,
    col5: 'col ' + i,
    col6: 'col ' + i,
    col7: 'col ' + i,
    col8: 'col ' + i,
    col9: 'col ' + i
  };
}

var grid = new Slick.Grid('#myGrid', data, columns, options);
grid.registerPlugin(new Slick.Plugins.ColFix('col1'));
