/*
This class handles the Table view
*/

praxis.TablePanel = Class.extend({
	
	init:function(element_id){
		this.self = this;
        this.html = $("#"+element_id);
        this.elem = document.getElementById(element_id);
	},
	
    hide: function(){
        this.html.html("");
        this.elem.style.display = "none";
    },

    show: function(){
        this.elem.style.display = "block";
    },

    showPanel: function(tableData, treeNode){
        
        
        //var options = app.tableView.table_options;

        this.html.html("");
        this.html.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div  class="panel-heading ">Table</div> <input id="property_name" type="text" class="form-control" value="'+tableData.name+'"/>'+		
            '		<hr>');
    
        var tableString = 
            '<table id="arguments_table" cellPadding="0">'+
            '	<tbody>' +
            '       <tr>'+
                        '<th>Type</th>'+
                        '<th>Name</th>'+
                    '</tr>';
    
        var row = 0
        for(arg of tableData.columns){
            tableString += 
                '<tr>'+
                    '<td>';
            tableString += this.getColumnTypeComboHTML(row,arg.content);
            tableString += '</td>'+
                    '<td>'+
                        '<input id="col_' + row + '_name" type="text" class="form-control" value="'+ arg.name +'"/>' +
                    '</td>'+
                '</tr>';
            row++;
        };
    
        tableString += '</tbody></table>';
        this.html.append(tableString);
        this.html.append(
        '			<button id="plus_button">+</button>'+
        '			<button id="minus_button">-</button>'+
        '			<button id="cancel_button">Cancel</button>'+
        '			<button id="ok_button">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');

        $("#ok_button").on("click", function(){
            
            tableData.name=$("#property_name").val();
            //var size = tableData.columns.length;
            
    
            // to handle possibly added column/s we must(?) look at the HTML - if we want to make this editing cancellable, and we do
            var i = -1;
            do {
                i++;
                var colname = $("#col_"+i+"_name").val();
                var coltype = $("#col_"+i+"_type").val();
    
                if(colname != undefined){
                    // save these if the col already exists
                    if(i >= tableData.columns.length){
                        var newColumn = 
                        {
                            id: colname.toLowerCase(),
                            field: colname.toLowerCase()
                        };
                        tableData.columns.push(newColumn);
                    }
    
                    tableData.columns[i].name = colname;
                    tableData.columns[i].content = coltype;
                    tableData.columns[i].editor = Slick.Editors.Text;
                }
            } while(colname != undefined);
            
            var newSize = tableData.columns.length;
            treeNode.setTitle(tableData.name + " /"+newSize);
            app.updateHeading(treeNode);
            
            app.tableView.showTable(tableData);
            
            /*
            // make deep copy of columns to avoid the table putting a lot of extra stuff there
            var copiedColumns = JSON.parse(JSON.stringify(tableData.columns));
            grid = new Slick.Grid("#tableView", tableData.datarows, copiedColumns, options);
    
            // grid.setSelectionModel(new Slick.CellSelectionModel());
    
            grid.onAddNewRow.subscribe(function (e, args) {
                var item = args.item;
                grid.invalidateRow(tableData.datarows.length);
                tableData.datarows.push(item);
                grid.updateRowCount();
                grid.render();
            });*/
    
        });
    
        // add column at the bottom
        $("#plus_button").on("click", function(){
            console.log("plus clicked");
            // add row in table 
            var table = document.getElementById("arguments_table");
            var row = table.insertRow(-1); // adds last?
    
            //var colNum = (tableData.columns.length); // new index should be last data content index + 1
            // better way of finding out nr of columns - stored dynamically in HTML
            var numCols = -1;
            do {
                numCols++;
                var colname = $("#col_"+numCols+"_name").val();
            } while(colname != undefined);

            // Insert new cells (<td> elements)
            var cell1 = row.insertCell(0);
            // Add some text to the new cells:
            var cell1Contents = app.tablePanel.getColumnTypeComboHTML(numCols,"string"); // '<input id="col_' + numCols + '_type" type="text" class="form-control" value="string"/>';
            //console.log(cellContents);
            cell1.innerHTML = cell1Contents;
    
            // Insert new cells (<td> elements)
            var cell2 = row.insertCell(1);
            // Add some text to the new cells:
            var cell2Contents = '<input id="col_' + numCols + '_name" type="text" class="form-control" value="Column' + (numCols+1) + '"/>';
            //console.log(cellContents);
            cell2.innerHTML = cell2Contents;
    
    
            //tableData.columns.push(0);
        });
            
        // remove column from the bottom
        $("#minus_button").on("click", function(){
            console.log("minus clicked");
            var table = document.getElementById("arguments_table");
            var row = table.deleteRow(-1);
            tableData.columns.pop();
            // userData.arguments.pop();
        });
        
    },

    getColumnTypeComboHTML:function(colNr,currSel) {
        var res = '<SELECT id="col_' + colNr + '_type">';
        //'<input id="col_' + numCols + '_type" type="text" class="form-control" value="string"/>';
        var typenames = ["string", "atom", "int", "float", "bool", "term"];
        // available types
        
        for(typename of typenames){
            res +='<option ';
            if(typename == currSel)
                res += "selected";
            res += ">" + typename + '</option>';
        }
        res +='</SELECT>';
        return res;
    }


});