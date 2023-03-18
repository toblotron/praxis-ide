/*
This class handles the Table view
*/

praxis.TableView = Class.extend({
	
	init:function(element_id){
		this.self = this;
    this.html = $("#"+element_id);
    this.elem = document.getElementById(element_id);
    /*this.elem.onkeydown = function(e) {
      switch (e.keyCode) {
      case 46: // delete 
        // try to delete selected rows
        var grid = app.tableView.grid;

        var data = grid.getData();
        var rows= grid.getSelectedRows();

        for (var i = 0; i < rows.length; i += 1) {
            data.splice(rows[i], 1);
        }
        grid.setData(data, true);
        grid.render();
        break;
      }
	  }*/
  },
	
    hide: function(){
        this.elem.style.display = "none";
        // copy column widths to table model
        if(app.tableView.grid != undefined && app.tableView.tableData != undefined)
        {
            var columns = app.tableView.grid.getColumns();
            var tableData = app.tableView.tableData;
            
            //#DRAGROW - save the widths of non-dragrow-columns, to the data model
            columns.forEach(element => {
                // find named columns - not the dragrow column
                if(element.name != undefined){
                    var modelColumn = tableData.columns.find(c => c.name == element.name);
                    if(modelColumn != undefined)
                      modelColumn.width = element.width;
                }
            });
        }
    },

    show: function(){
        this.elem.style.display = "block";
    },

    table_options : {
        editable: true,
        enableCellNavigation: true,
        enableColumnReorder: false,
        enableAddRow: true,
        autoEdit: false
    },

    showTable: function(tableData){
        
        var options = app.tableView.table_options;
    
        // make deep copy of columns to avoid the table putting a lot of extra stuff there
        var copiedColumns = JSON.parse(JSON.stringify(tableData.columns));
       
        var undoRedoBuffer = {
          commandQueue : [],
          commandCtr : 0,
    
          queueAndExecuteCommand : function(editCommand) {
            this.commandQueue[this.commandCtr] = editCommand;
            this.commandCtr++;
            editCommand.execute();
          },
    
          undo : function() {
            if (this.commandCtr == 0) { return; }
    
            this.commandCtr--;
            var command = this.commandQueue[this.commandCtr];
    
            if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
              command.undo();
            }
          },
          redo : function() {
            if (this.commandCtr >= this.commandQueue.length) { return; }
            var command = this.commandQueue[this.commandCtr];
            this.commandCtr++;
            if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
              command.execute();
            }
          }
        }

        var newRowIds = 0;

        var pluginOptions = {
          clipboardCommandHandler: function(editCommand){ undoRedoBuffer.queueAndExecuteCommand.call(undoRedoBuffer,editCommand); },
          readOnlyMode : false,
          includeHeaderWhenCopying : false,
          newRowCreator: function(count) {
            for (var i = 0; i < count; i++) {
              var item = {
                id: "newRow_" + newRowIds++
              }
              grid.getData().addItem(item);
            }
          }
        };

        // try moving rows
        copiedColumns.unshift({
            id: "#",
            name: "",
            width: 40,
            behavior: "selectAndMove",
            selectable: false,
            resizable: false,
            cssClass: "slickgrid-cell-reorder"
          },);
          /*
          copiedColumns.unshift({
            id: "selector",
            name: "",
            field: "num",
              width: 30
          },);
          */
        grid = new Slick.Grid("#tableView", tableData.datarows, copiedColumns, options);
      
        app.tableView.grid = grid;
        app.tableView.tableData = tableData;

        var size = tableData.columns.length;
        for(i = 0; i < size; i++)
        {
            var colname = $("#col_"+i+"_name").val();
            var coltype = $("#col_"+i+"_type").val();
    
            // save these if the col already exists
            if(copiedColumns[i+1].id == undefined) {
                copiedColumns[i+1].id = colname.toLowerCase();
                copiedColumns[i+1].field = colname.toLowerCase();
            }
    
            // ps - add 1 to never target the added dragrow-column
            copiedColumns[i+1].name = colname;
            copiedColumns[i+1].content = coltype;
            copiedColumns[i+1].editor = Slick.Editors.Text;
    
            // {id: "name", name: "Name", field: "name", content:"string"},
        }
    
        
        /*grid.setSelectionModel(new Slick.RowSelectionModel({
            dragToSelect: true
          }));
        */
          grid.setSelectionModel(new Slick.CellSelectionModel());
          var moveRowsPlugin = new Slick.RowMoveManager({
            cancelEditOnDrag: true
          });
        
          grid.registerPlugin(new Slick.AutoTooltips());

          // set keyboard focus on the grid
          grid.getCanvasNode().focus();

          //var copyManager = new Slick.CellCopyManager();
          //grid.registerPlugin(copyManager);

          grid.registerPlugin(new Slick.CellExternalCopyManager(pluginOptions));

          /*
          copyManager.onPasteCells.subscribe(function (e, args) {
            if (args.from.length !== 1 || args.to.length !== 1) {
              throw "This implementation only supports single range copy and paste operations";
            }

            var data = tableData.datarows;

            var from = args.from[0];
            var to = args.to[0];
            var val;
            var col;
            for (var i = 0; i <= from.toRow - from.fromRow; i++) {
              for (var j = 0; j <= from.toCell - from.fromCell; j++) {
                if (i <= to.toRow - to.fromRow && j <= to.toCell - to.fromCell) {
                  val = data[from.fromRow + i];
                  col = tableData.columns[from.fromCell + j -1].field;  // -1 because we have an "unoffical" column for dragging
                  val = val[col];
                  data[to.fromRow + i][tableData.columns[to.fromCell + j -1].field] = val; // -1 because we have an "unoffical" column for dragging
                  grid.invalidateRow(to.fromRow + i);
                }
              }
            }
            grid.render();
          });
          */
         
          moveRowsPlugin.onBeforeMoveRows.subscribe(function (e, data) {
            for (var i = 0; i < data.rows.length; i++) {
              // no point in moving before or after itself
              if (data.rows[i] == data.insertBefore || data.rows[i] == data.insertBefore - 1) {
                e.stopPropagation();
                console.log('false   ' + getEventDataAsString(data));
                return false;
              }
            }
            console.log('true    ' + getEventDataAsString(data));
            return true;
          });
        
          function getEventDataAsString(data) {
            var s = "";
            s += "insertBefore: " + data.insertBefore;
            s += ", rows: ["
            for (var i=0; i<data.rows.length; i++) { s += (i===0?"":",") + data.rows[i]; }
            s += "]"
            return s;
          }
          
          moveRowsPlugin.onMoveRows.subscribe(function (e, args) {
            var data = tableData.datarows;
            var extractedRows = [], left, right;
            var rows = args.rows;
            var insertBefore = args.insertBefore;
            left = data.slice(0, insertBefore);
            right = data.slice(insertBefore, data.length);
        
            rows.sort(function(a,b) { return a-b; });
        
            for (var i = 0; i < rows.length; i++) {
              extractedRows.push(data[rows[i]]);
            }
        
            rows.reverse();
        
            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              if (row < insertBefore) {
                left.splice(row, 1);
              } else {
                right.splice(row - insertBefore, 1);
              }
            }
        
            data = left.concat(extractedRows.concat(right));
        
            var selectedRows = [];
            for (var i = 0; i < rows.length; i++)
              selectedRows.push(left.length + i);
        
            app.tableView.tableData.datarows = data;

            grid.resetActiveCell();
            grid.setData(data);
            grid.setSelectedRows(selectedRows);
            grid.render();
          });
        
          grid.registerPlugin(moveRowsPlugin);

        grid.onAddNewRow.subscribe(function (e, args) {
            var item = args.item;
            grid.invalidateRow(tableData.datarows.length);
            tableData.datarows.push(item);
            grid.updateRowCount();
            grid.render();
        });
    },


});