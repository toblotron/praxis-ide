var TableShape = fabric.util.createClass(fabric.Group, {
    type: 'tableShape',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { originX:'center' });

        this.callSuper('initialize',[], options);
        this.set({ 
            originX: 'center',
            originY: 'center',
            objectCaching: false
         });

        // to store refs to the rows of displayitems
        this.columnRows = [];
        this.tableNameRect = null;
        this.tableName = null;
        this.isDataShape = true;
          
    },

    // gather all ports, with positions relative to the shape
    gatherPorts: function(){
        // top and bottom ports
        var topPort = {parent:this, shapeId:this.id, role:"in",x:0,y:-this.height/2};
        
        var bottomPort = {parent:this, shapeId:this.id, role:"out",x:0,y:this.height/2};
        
        return [topPort, bottomPort];
    },

    defaultContent: function(){
        return {
            tableId: -1, // Do NOT referr to any existing table upon creation
            name: "",  // will be updated from table data, according to tableId
            values:[]
        };
    },

    updateContents: function(incomingShapeData) {
        
        var shapeData = incomingShapeData;

        // delete all the old content
        for(f of this.columnRows){
            this.remove(f.colName);
            this.remove(f.colRect); 
            this.remove(f.valueText);
        }
        
        this.columnRows = [];

        if(this.bg != null){
            this.remove(this.bg);
            this.remove(this.tableNameRect);
            this.remove(this.tableName);
        }
        
        
        var startx = this.left;
        var starty = this.top;
        var incomingx = startx;
        var incomingy = starty;

        // get the table definition, in order to get the column titles
        var table = app.getDataTable(shapeData.tableId);
        //this.tableName.setText(table.name);
        if(table != undefined)
            shapeData.name = table.name;
        else
        {
            table = {name:"tableName",columns:[{name:"Col1"}, {name:"Col2"}]};
        }
        var isPreview = false;
        if(pb.TableShape.isInvalid({data:shapeData}, null)){
            isPreview = true;
            // set temporary preview-values
            shapeData = {name:"tableName", values:["Val1", "Val2"]};
        }

        var leftMax = 0;
        var midMax = 0;
        var rightMax = 0;

        var totHeight = 0;
        var totWidth = 0;
        var topWidth = 0;
        var padding = 4;
        var bgStartY = 0;
        var bottomPad = 2; // extra padding after last row
        var linePad =3;

        // create table name row
        this.tableNameRect = new RoundedRect({fill:'#99dd88',topLeft:[5,5],topRight:[5,5]});
        this.tableName = new fabric.Text(table.name,{fontSize:11, objectCaching: false, fontFamily:'arial'});

        if(isPreview){
            this.tableNameRect.set({fill:'#555555', opacity:0.5});
            this.tableName.set({opacity:0.5, fontStyle:'italic'});
        }

        leftMax = this.tableName.width + padding * 2;
        totHeight += this.tableName.height + 2*padding;
        bgStartY = totHeight;

        topWidth = this.tableName.width + 2*padding;

        
        var valueIndex = 0;

        // TODO: This doesn't work properly when the number of columns is LESS
        // than that in the shape.. figure out complete solution later 

        // create controls and gather maxwidths
        for(column of table.columns) {
            // so we never run out of bounds in the shape data..
            if(valueIndex < shapeData.values.length ){
                // get the set value for the row
                var TextValue = shapeData.values[valueIndex];

                if(TextValue == undefined)
                    TextValue = "_";

                var bottomLeft = [0,0];
                if(valueIndex+1 == table.columns.length)
                    bottomLeft = [5,5];
                
                var colRect = new RoundedRect({fill:'#000000',bottomLeft:bottomLeft}); // color COULD be used to show some extra info..? 
                var colName = new fabric.Text(column.name,{fill:'green',fontSize:10, objectCaching: false,fontFamily:'arial'});
                if(colName.width > leftMax)
                    leftMax = colName.width;
                colRect.height = colName.height + padding * 2;
                totHeight += colName.height + padding *2;

                var valueText = new PrologText(TextValue,{fontSize:10, fontFamily:'arial',isPreview:isPreview});
                if(valueText.width > rightMax)
                    rightMax = valueText.width;

                if(isPreview){
                    colRect.set({opacity:0.5});
                    colName.set({opacity:0.5, fontStyle:'italic'});
                }

                var controlRow = {
                    colRect:colRect,
                    colName:colName,
                    valueText:valueText};

                this.columnRows.push(controlRow);
            }
            valueIndex++;
        };

        // place controls
        var top = 0;

        this.bg = new RoundedRect({
            top: this.top,
            left: this.left,
            width: 30,
            height: 30,
            fill: 'white',
            bottomRight:[5,5]
          });
        var bg = this.bg;

        if(isPreview)
          bg.set({opacity:0.5});

        var totWidth = leftMax + rightMax + 4*padding;
        if(topWidth > totWidth)
          totWidth = topWidth;
        if(totWidth < 100)  // set minWidth
          totWidth = 100;

        var bgStartX = leftMax + 2 * padding;
        var bgWidth = totWidth - bgStartX;

        // center the bg rect on midpoint
        bg.width = totWidth;
        bg.height = totHeight;
        bg.left = this.left - bg.width/2;
        bg.top = this.top - bg.height/2;
        startx = bg.left;
        starty = bg.top;

        var bgHeight = totHeight - bgStartY;

        this.addWithUpdate(bg);

        
        this.tableNameRect.height = this.tableName.height + padding * 2;
        this.tableNameRect.top = starty;
        this.tableNameRect.left = startx;
        this.tableNameRect.width = totWidth; // this.tableName.width + padding * 2;

        this.addWithUpdate(this.tableNameRect);

        this.tableName.left = startx + padding * 1;

        this.tableName.top = starty + top + padding;
        top += this.tableName.height + padding * 2;
        this.addWithUpdate(this.tableName);

        for(c of this.columnRows) {
            c.colRect.left = startx;
            c.colRect.top = starty + top;
            c.colRect.width = leftMax + padding *2;
            
            c.colName.left = c.colRect.left + padding;
            c.colName.top = starty + top + padding;

            c.valueText.left = c.colRect.left + c.colRect.width + padding;
            c.valueText.top = starty + top + padding;
            
            top += c.colRect.height
 
            this.addWithUpdate(c.colRect);  
            this.addWithUpdate(c.colName); 
            this.addWithUpdate(c.valueText);
     
        };
        
        // finally - set proper dimensions of bg - should just be background
        // for table arguments
        bg.top = bg.top+ bgStartY;
        bg.height = bgHeight;
        bg.left = bg.left + bgStartX;
        bg.width = bgWidth;

        this.left = incomingx;
        this.top = incomingy;
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#333';
    },

    buildInputPanel: function(view, figure, externalTableNr){
        
        // bygg HTML för panel
        var userData = app.view.getShapeModel(figure.id).data;
        view.html("");
        
        // select among available tables
        view.append('<div id="formula_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Table'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+		
            '		<hr>');

        // if there is an externalTableNr it means we are previewing a change of table
        var usedTableId = userData.tableId;
        if(externalTableNr != undefined)
            usedTableId = externalTableNr;

        var tableString = "";

        // If there are tables, let user select
        if(Model.dataTables.length > 0) {

            tableString += 
            '<table id="arguments_table" cellPadding="0">'+
            '	<tbody>';

        
            tableString += '<SELECT id="table_selector" tabIndex="1001">';
            var tables = Model.dataTables;

             // empty sel
            tableString +='<option value="" ';
            // if no selection made
            if(usedTableId == -1)    
                tableString += "selected";
            tableString += '></option>';
            
            // available tables
            for(table of tables){
                tableString +='<option value="' + table.id + '" ';
                if(usedTableId == table.id)
                    tableString += "selected";
                
                tableString += ">" + table.name + '</option>';
            }
            tableString +='</SELECT>';

            
            // if no table is selected, show comment with instructions
            if(usedTableId == -1)
                tableString += "<div class='comment'>Select a table to consult</div>";
                

        } else {
            tableString += "<div class='comment'>There are no tables defined in this model. Create by right-clicking target node in the Model tree.</div>";
        }

        if(usedTableId > -1) // If a table is actually selected.. show it
        {
            var rowNr = 0
            var usedTable = tables.find(t=>t.id == usedTableId);

            for(column of usedTable.columns){
                var valueString = "_";
                //if(externalTableNr != undefined && 
                if(userData.values.length > rowNr)
                    valueString = userData.values[rowNr];

                tableString += 
                    '<tr>'+
                        '<td width="*">'+
                            this.getLeftHtml(rowNr,usedTable.columns[rowNr].name) + 
                        '</td>'+
                        '<td>'+
                        this.getRightHtml(rowNr,valueString) + 
                        '</td>'+
                    '</tr>';
                rowNr++;
            };

            tableString += '</tbody></table>';
        } 


        view.append(tableString);

        // Only show buttons if there are tables
        if(Model.dataTables.length > 0){
            view.append('<button id="cancel_button">Cancel</button>'+
            '			<button id="ok_button">Ok</button>');
        }

        view.append(
        '   </div>'+
        ' </div>'+
        '</div>');
        
        $("#table_selector").on("change", function(){
            var externalTableNr =  this.value;
            figure.buildInputPanel(view,figure,externalTableNr);
        });

        $("#ok_button").on("click", function(){
            var shapeModel = app.view.getShapeModel(figure.id);
        
            if(externalTableNr != undefined) // externalTableNr is table-id of newly selected table
                shapeModel.data.tableId = externalTableNr;

            if(usedTableId == -1)
            {
                // set shape data to empty
                shapeModel.data.name = "";
            }
            else {
                var usedTable = tables.find(t=>t.id == usedTableId);
                var size = usedTable.columns.length; //userData.values.length;
                shapeModel.data.values = [];

                for(i = 0; i < size; i++)
                {
                    shapeModel.data.values.push($("#value_"+i).val());
                }
            }
            
            app.view.updateShapeContents(shapeModel);
            app.view.canvas.renderAll();
        });

        //#FOCUS 
        //var elem = $("#table_selector");  // focus on this
        //window.setTimeout(() => elem.focus().select(), 0);
       
    },

    getLeftHtml: function(rowNr, value){
        return  '<label>'+value+'</label>' ;
    },

    getRightHtml: function(rowNr, value){
        return '<input id="value_' + rowNr + '" tabIndex="' + (1002 + rowNr) + '" "type="text" value="'+ htmlPrologEncode(value) +'"/>';
    },

});