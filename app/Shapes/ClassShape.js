/*
Handles navigation of object/class data (in JSON notation) 
*/
var ClassShape = fabric.util.createClass(fabric.Group, {
    type: 'classShape',
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
        this.childRows = [];
        this.classNameRect = null;
        this.className = null;
        this.classValue = null;
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
            classId: -1, // Do NOT referr to any existing class upon creation
            value: "E",  // will be updated from table data, according to tableId
            children:[]
        };
    },

    isInvalid:function(shapeData){
        if(shapeData.data.classId == -1 || shapeData.data.name == "" || shapeData.data.name == null)
            return true;
        else
            return false;
    },

    updateContents: function(incomingShapeData) {
        
        var shapeData = incomingShapeData;

        // delete all the old content
        for(f of this.childRows){
            if(f.fieldName != undefined) this.remove(f.fieldName);
            if(f.colRect != undefined) this.remove(f.colRect); 
            if(f.valueText!=undefined) this.remove(f.valueText);
        }
        
        this.childRows = [];

        if(this.bg != null){
            this.remove(this.bg);
            this.remove(this.classNameRect);
            this.remove(this.className);
            this.remove(this.classValue);
        }
    
        var startx = this.left;
        var starty = this.top;
        var incomingx = startx;
        var incomingy = starty;

        // get the class definition
        var classDef = app.getClass(shapeData.classId);
        
        // can be used to show a preview-shape, if shape does not have filled in data yet
        if(classDef != undefined)
            shapeData.name = classDef.name;
        else
        {
            classDef = {
                name:"rootClass", 
                value:"R", 
                fields:[
                    {name:"Field1",type:"int"}, 
                    {name:"Field2", type: "string"},
                    {name:"AnArray", type: "int", parent:true}
                ]};
        }
        var isPreview = false;
        if(this.isInvalid({data:shapeData}, null)){
            isPreview = true;
            // set temporary preview-values
            shapeData = {
                name:"Example",
                value: "E",
                children:[
                    {field: "Field1", value:"Nr"}, 
                    {field: "Field2", value:"text"},
                    {field: "AnArray", value:"", parent: true},
                    {index: "1", typeName:"int", value:"A1"}
                ]
            };
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

        // create class name row
        this.classNameRect = new RoundedRect({fill:'#000000',topLeft:[5,5],topRight:[5,5]});
        this.className = new fabric.Text(classDef.name,{fontSize:11, objectCaching: false, fontFamily:'arial'});
        this.classValue = new fabric.Text(shapeData.value,{fontSize:11, objectCaching: false, fontFamily:'arial'});

        if(isPreview){
            this.classNameRect.set({fill:'#000000', opacity:0.5});
            this.className.set({opacity:0.5, fontStyle:'italic'});
            this.classValue.set({opacity:0.5, fontStyle:'italic'});
        }

        leftMax = this.className.width + padding * 2;
        totHeight += this.className.height + 2*padding;
        bgStartY = totHeight;

        topWidth = this.className.width + 2*padding;

        
        var valueIndex = 0;

        // TODO: This doesn't work properly when the number of columns is LESS
        // than that in the shape.. figure out complete solution later 

        // create controls and gather maxwidths ()
        for(child of shapeData.children) {
            // so we never run out of bounds in the shape data..
            if(valueIndex < shapeData.children.length ){
                // get the set value for the row
                var Field = shapeData.children[valueIndex];

                if(Field.val == undefined || Field.val == "")
                    Field.val = "_";

                var bottomLeft = [0,0];
                if(valueIndex+1 == shapeData.children.length)
                    bottomLeft = [5,5];
                
                var colRect = new RoundedRect({fill:'#000000',bottomLeft:bottomLeft}); // color COULD be used to show some extra info..? 
                
                var colName;
                if(Field.field != undefined)
                    colName = new fabric.Text(Field.field,{fill:'green',fontSize:10, objectCaching: false,fontFamily:'arial'});
                else 
                    colName = new fabric.Text(Field.index + " ("+Field.type+")",{fill:'green',fontSize:10, objectCaching: false,fontFamily:'arial'});
                
                if(colName.width > leftMax)
                    leftMax = colName.width;
                colRect.height = colName.height + padding * 2;
                totHeight += colName.height + padding *2;

                var valueText = new PrologText(Field.val,{fontSize:10, fontFamily:'arial',isPreview:isPreview});
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

                this.childRows.push(controlRow);
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

        
        this.classNameRect.height = this.className.height + padding * 2;
        this.classNameRect.top = starty;
        this.classNameRect.left = startx;
        this.classNameRect.width = totWidth; // this.tableName.width + padding * 2;

        this.addWithUpdate(this.classNameRect);

        this.className.left = startx + padding * 1;

        this.className.top = starty + top + padding;
        top += this.className.height + padding * 2;
        this.addWithUpdate(this.className);

        for(c of this.childRows) {
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

    buildInputPanel: function(view, figure, externalClassNr){
        
        // bygg HTML för panel
        var userData = app.view.getShapeModel(figure.id).data;
        view.html("");
        
        // select among available tables
        view.append('<div id="formula_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Class'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+		
            '		<hr>');

        // if there is an externalClassNr it means we are previewing a change of class
        var usedClassId = userData.classId;
        if(externalClassNr != undefined)
            usedClassId = externalClassNr;

        var tableString = "";

        // If there are classes, let user select
        if(Model.classes.length > 0) {

            tableString += 
            '<table id="class_table" cellPadding="0">'+
            '	<tbody>';

        
            tableString += '<SELECT id="class_selector" tabIndex="1001">';
            var classRefs = Model.classes;

             // empty sel
            tableString +='<option value="" ';
            // if no selection made
            if(usedClassId == -1)    
                tableString += "selected";
            tableString += '></option>';
            
            // available tables
            for(classRef of classRefs){
                tableString +='<option value="' + classRef.id + '" ';
                if(usedClassId == classRef.id)
                    tableString += "selected";
                
                tableString += ">" + classRef.name + '</option>';
            }
            tableString +='</SELECT>';

            // show class-variable
            var classVarName = htmlPrologEncode(userData.value);
            tableString += '<INPUT id="classValue" value="' + classVarName + '" />';
            
            // if no table is selected, show comment with instructions
            if(usedClassId == -1)
                tableString += "<div class='comment'>Select a class to navigate</div>";
                

        } else {
            tableString += "<div class='comment'>There are no classes defined in this model. Create by right-clicking target node in the Model tree.</div>";
        }

        if(usedClassId > -1) // If a class is actually selected.. show it
        {
            var rowNr = 0
            var usedClass = classRefs.find(t=>t.id == usedClassId);

            // first, display all previously selected fields, above the active class (active class = the one which is the last class in the list, displaying All its fields, even without value)
            // find the last class-row of the list
            var activeClassId
            
            
            for(field of usedClass.fields){
                var valueString = "";
                //if(externalTableNr != undefined && 
                if(userData.children.length > rowNr)
                    valueString = userData.children[rowNr].value;

                    /*var isParentRow = $("#isParentRow_"+row)[0].innerText;
                    var rowIndex = $("#rowIndex_"+row).val();*/
                
                tableString += '<tr>';

                tableString += 
                '<td width="*">'+
                    '<label id=fieldType_' + rowNr + '>'+field.type+'</label>' + 
                '</td>'+
                '<td>'+
                    '<label id=fieldName_' + rowNr + '>'+field.name+'</label>' + 
                    '<label hidden id=isParentRow_' + rowNr + '>'+field.parent+'</label>' +  
                '</td>';

                if(field.index != null){
                    tableString += 
                        '<td width="*">'+
                            this.getIndexString(rowNr, field.index) +
                        '</td>';
                }

                valueString = "";
                tableString += 
                    '<td>' +
                        this.getValueString(rowNr, valueString)
                    +'</td>';

                tableString += '</tr>';
                rowNr++;
            };

            tableString += '</tbody></table>';
        } 


        view.append(tableString);

        // Only show buttons if there are classes
        if(classRefs.length > 0){
            view.append('<button id="cancel_button">Cancel</button>'+
            '			<button id="ok_button">Ok</button>');
        }

        view.append(
        '   </div>'+
        ' </div>'+
        '</div>');
        
        $("#class_selector").on("change", function(){
            var externalClassNr =  this.value;
            figure.buildInputPanel(view,figure,externalClassNr);
        });

        $("#ok_button").on("click", function(){
            var shapeModel = app.view.getShapeModel(figure.id);
        
            if(externalClassNr != undefined) // externalTableNr is table-id of newly selected table
                shapeModel.data.classId = externalClassNr;

            if(usedClassId == -1)
            {
                // set shape data to empty
                shapeModel.data.name = "";
            }
            else {
                var usedClass = Model.classes.find(t=>t.id == usedClassId);
                
                var children = shapeModel.data.children;
                children = []; // this path-structured array will have to be rebuilt for each save
                var targetRow = 0; // the row of the possibly saved shape-field-data

                var row = 0;
                do{
                    // look for all possible values on each row
                    var fieldNameLabel = document.getElementById('fieldName_'+row);
                    var fieldName = null;
                    if(fieldNameLabel != undefined)
                        fieldName = fieldNameLabel.innerText;

                    var isParentRowLabel = document.getElementById('isParentRow_'+row);
                    var isParentRow = false;
                    if(isParentRowLabel != undefined)
                        isParentRow = isParentRowLabel.innerText;

                    var rowIndexInput = document.getElementById('index_'+row);
                    var rowIndex = undefined;
                    if(rowIndexInput != undefined)
                        rowIndex = rowIndexInput.value;

                    var fieldTypeLabel = document.getElementById('fieldType_'+row);
                    var className = undefined;
                    if(fieldTypeLabel != undefined) 
                        className = fieldTypeLabel.innerText;
                    
                    var matchInput = document.getElementById('value_'+row);
                    var matchValue = undefined;
                    if(matchInput != undefined && matchInput.value != undefined)    
                        matchValue = matchInput.value;

                    // copy to shapeData
                    if(matchValue != undefined || rowIndex != undefined) // only SAVE rows that carry information
                    {
                        var newRow = {};
                        if(fieldName != undefined)
                            newRow.field = fieldName;
                        if(rowIndex != undefined)
                        {
                            newRow.index = rowIndex;
                        }
                        if(matchValue != undefined)
                            newRow.value = matchValue;
                        if(className != undefined)
                            newRow.type = className;

                        children.push(newRow);

                        targetRow++;
                    }

                    row++;
                    // go on until we are out of rows with meaningful content
                } while (rowIndex != undefined || className != undefined) // a valid row has One of these..

                shapeModel.data.children = children;

                // go through all the rows of the rendered and possibly edited classShape
                //for(i = 0; i < size; i++)
                //{
                //    shapeModel.data.values.push($("#value_"+i).val());
                //}
            }
            
            app.view.updateShapeContents(shapeModel);
            app.view.canvas.renderAll();
        });

        //#FOCUS 
        //var elem = $("#table_selector");  // focus on this
        //window.setTimeout(() => elem.focus().select(), 0);
       
    },

    getValueString: function(rowNr, value){
        var printString = "";
        if(value != "")
            printString = htmlPrologEncode(value);
        return '<input id="value_' + rowNr + '" tabIndex="' + (1002 + rowNr) + '" "type="text" value="'+ printString +'"/>';
    },
    getIndexString: function(rowNr, value){
        var printString = "";
        if(value != "")
            printString = htmlPrologEncode(value);
        return '<input id="index_' + rowNr + '" type="text" value="'+ printString +'"/>';
    },

    parseToExpression:function(shapeData, rpc){
        var data = shapeData.data;
        var name = data.name;
        // first, parse all the prolog-texts in the arguments
        var argumentExpressions = [];
        data.values.forEach(a=>{
            // experimental parsing-code - later, make it so we don't have to create a new parser for each argument :) 
            // - store a parser in rpc
            var tokens = Lexer.GetTokens(a);
            tokens = tokens.filter(t=>t.type != TokenType.Blankspace);
            var parser = new PrologParser(tokens);
            var res = parser.parseThis();
            argumentExpressions.push(res);
        });

        // build and return a RuleExpression
        var body = ShapeParsing.parseAllBelow(shapeData, rpc);
        return new RuleExpression(library,name,argumentExpressions,body);
    }

});