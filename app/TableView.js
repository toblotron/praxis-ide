/*
This class handles the Table view
*/

praxis.TableView = Class.extend({
	
	init:function(element_id){
		this.self = this;
        this.html = $("#"+element_id);
        this.elem = document.getElementById(element_id);
	},
	
    hide: function(){
        this.elem.style.display = "none";
        // copy column widths to table model
        if(app.tableView.grid != undefined && app.tableView.tableData != undefined)
        {
            var columns = app.tableView.grid.getColumns();
            var tableData = app.tableView.tableData;
            var i = 0;
            columns.forEach(element => {
                    tableData.columns[i].width = element.width;
                i++;
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
        enableAddRow: true
    },

    showTable: function(tableData){
        
        var options = app.tableView.table_options;
    
        // make deep copy of columns to avoid the table putting a lot of extra stuff there
        var copiedColumns = JSON.parse(JSON.stringify(tableData.columns));
        grid = new Slick.Grid("#tableView", tableData.datarows, copiedColumns, options);
        app.tableView.grid = grid;
        app.tableView.tableData = tableData;

        var size = tableData.columns.length;
        for(i = 0; i < size; i++)
        {
            var colname = $("#col_"+i+"_name").val();
            var coltype = $("#col_"+i+"_type").val();
    
            // save these if the col already exists
            if(copiedColumns[i].id == undefined) {
                copiedColumns[i].id = colname.toLowerCase();
                copiedColumns[i].field = colname.toLowerCase();
            }
    
            copiedColumns[i].name = colname;
            copiedColumns[i].content = coltype;
            copiedColumns[i].editor = Slick.Editors.Text;
    
            // {id: "name", name: "Name", field: "name", content:"string"},
        }
    
        grid.onAddNewRow.subscribe(function (e, args) {
            var item = args.item;
            grid.invalidateRow(tableData.datarows.length);
            tableData.datarows.push(item);
            grid.updateRowCount();
            grid.render();
        });
    },


});