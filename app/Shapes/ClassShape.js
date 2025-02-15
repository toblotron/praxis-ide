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
        this.classValueRect = null;
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
        var data = shapeData.data;
        if(data == undefined)
            return true;

        var classId = parseInt(data.classId);
        if(classId == -1 || data.name == "" || data.name == null)
            return true;
        else
            return false;
    },

    updateContents: function(incomingShapeData) {
        
        var shapeData = incomingShapeData;

        // delete all the old content
        for(f of this.childRows){
            if(f.colName != undefined) this.remove(f.colName);
            if(f.colRect != undefined) this.remove(f.colRect); 
            if(f.valueText!=undefined) this.remove(f.valueText);
            if(f.expansionRect != undefined) this.remove(f.expansionRect);
        }
        
        this.childRows = [];

        if(this.bg != null){
            this.remove(this.bg);
            this.remove(this.classNameRect);
            this.remove(this.className);
            this.remove(this.classValueRect);
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
                    {name:"AnArray", type: "int"}
                ]};
        }
        var isPreview = false;
        if(this.isInvalid({data:shapeData}, null)){
            isPreview = true;
            // set temporary preview-values
            shapeData = {
                name:"ClassName",
                value: "I",
                children:[
                    {field: "Field", level: 0, value:"Nr"}, 
                    {field: "Unexpanded", level: 1, value:"M"},
                    {field: "Expanded", level: 2, value:""},
                    {field: "SubField", level: 0, value:"text"}
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
        // space for expansion-indication
        var expansionWidth = 7;

        // create class name row
        this.classNameRect = new RoundedRect({fill:'#000000',topLeft:[5,5]});
        this.className = new fabric.Text(classDef.name,{fontSize:11, fill: 'white', objectCaching: false, fontFamily:'arial'});
        this.classValueRect = new RoundedRect({fill:'#ffffff',topRight:[5,5]});
        this.classValue = new fabric.Text(shapeData.value,{fontSize:11, fill: 'blue', objectCaching: false, fontFamily:'arial'});

        if(isPreview){
            this.classNameRect.set({fill:'#000000', opacity:0.5});
            this.className.set({opacity:0.5, fontStyle:'italic'});
            this.classValueRect.set({fill:'#ffffff', opacity:0.5});
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

                if(Field.value == undefined || Field.value == "")
                    Field.value = "_";

                var bottomLeft = [0,0];
                if(valueIndex+1 == shapeData.children.length)
                    bottomLeft = [5,5];
                
                var backgroundCol = '#000000';
                var textCol = '#ffffff';
                var sideCol = '#000000';

                switch(parseInt(Field.level)){
                    case 0: // field
                        backgroundCol = '#f3e7c9';
                        textCol = '#000000';
                        sideCol = '#f3e7c9';
                        break;
                    case 1: // unexpanded
                        backgroundCol = '#7282c8';
                        textCol = '#000000';
                        sideCol = '#f3e7c9';
                    case 2: // expanded
                        backgroundCol = '#7282c8';
                        textCol = '#000000';
                        sideCol = '#000000';
                        break;
                }

                var colRect = new RoundedRect({fill:backgroundCol,bottomLeft:bottomLeft}); // color COULD be used to show some extra info..? 
                
                var colName;
                if(Field.field != undefined){                   
                    colName = new fabric.Text(Field.field,{fill:textCol,fontSize:10, objectCaching: false,fontFamily:'arial'});
                }
                else{ 
                    colName = new fabric.Text(Field.index + " ("+Field.type+")",{fill:'white',fontSize:10, objectCaching: false,fontFamily:'arial'});
                }

                if(colName.width > leftMax)
                    leftMax = colName.width;
                colRect.height = colName.height + padding * 2;
                totHeight += colName.height + padding *2;

                var valueText = new PrologText(Field.value,{fontSize:10, fontFamily:'arial',isPreview:isPreview});
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

                if(Field.level == 2)
                    controlRow.expansionRect = new RoundedRect({fill:sideCol, bottomLeft:[0,0]});

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

        leftMax += expansionWidth;

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
        this.classNameRect.width = leftMax + padding *2; //totWidth; // this.tableName.width + padding * 2;
        

        this.className.left = expansionWidth + startx + padding * 1;
        this.className.top = starty + top + padding;

        this.classValueRect.height = this.className.height + padding * 2;
        this.classValueRect.top = starty;
        this.classValueRect.left = startx + this.classNameRect.width; //startx;
        this.classValueRect.width = totWidth - leftMax - padding *2;

        this.classValue.top = starty + top + padding;
        this.classValue.left = this.classValueRect.left + padding;//      startx + this.className.width + padding;

        top += this.className.height + padding * 2;
        this.addWithUpdate(this.classNameRect);
        this.addWithUpdate(this.classValueRect);
        this.addWithUpdate(this.className);
        this.addWithUpdate(this.classValue);



        for(c of this.childRows) {
            c.colRect.left = startx;
            c.colRect.top = starty + top;
            c.colRect.width = leftMax + padding *2;
            
            if(c.expansionRect != undefined){
                c.expansionRect.left = startx;
                c.expansionRect.top = starty + top;
                c.expansionRect.width = expansionWidth;
                c.expansionRect.height = c.colRect.height;
            }

            c.colName.left = expansionWidth + c.colRect.left + padding;
            c.colName.top = starty + top + padding;

            c.valueText.left = c.colRect.left + c.colRect.width + padding;
            c.valueText.top = starty + top + padding;
            
            top += c.colRect.height
 
            this.addWithUpdate(c.colRect);  
            this.addWithUpdate(c.colName); 
            this.addWithUpdate(c.valueText);
            if(c.expansionRect != undefined)
                this.addWithUpdate(c.expansionRect);
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

    /* take the shapedata, and build a model of all the rows that should be used in the UI (path + all fields of the latest class)
    */
    buildRowModelFromShape: function(userData, usedClassId){

        var rowsModel = [];
        var classRefs = Model.classes;

        if(usedClassId > -1) // If a class is selected as root.. show the entire path
        {
            var rowNr = 0
            var usedClass = classRefs.find(t=>t.id == usedClassId); // this is the class where we expect to find fields

            // show the path of the (possible) children ("path") //////////////////////////////////////////////////
            var lastParentRowOfPath = -1;
            userData.children.forEach(c=> {
                if(c.level == 2 || c.level == 5) // expanded object or indexrow
                    lastParentRowOfPath = rowNr; 
                rowNr++;
            });

            rowNr = 0; // reset
            var rootRow = {
                type: usedClass.name,
                field: "{root}",
                level: -1, // special value for rootrow
                value: htmlPrologEncode(userData.value),
                rowNr: rowNr
            };
            rowsModel.push(rootRow);
            rowNr++;

            var childRow = 0;
            if(userData.children != undefined && userData.children.length > 0){
                while(lastParentRowOfPath >= childRow){
                    var rowModel = {};

                    var child = userData.children[childRow];
                    // find the typename of this field, from the current usedClass
                    var fieldTypeName = null;
                    if(child.level != 5){
                        fieldTypeName = usedClass.fields.find(f=>f.name == child.field).type;
                    } else
                        fieldTypeName = child.type; // for indexrows we expect the child to have a type, for possible subclassing

                    rowModel.type = fieldTypeName;
                    if(child.field) // indexrows do not have field-properties
                        rowModel.field = child.field;
                    if(child.level)
                        rowModel.level = child.level;
                    if(child.index)
                        rowModel.index = child.index;
                    if(child.value)
                        rowModel.value = child.value; // keep it in raw form, not adjusted for rendering
                    
                    // if this child is parent, or "in an expanded state", go down into it
                    if(child.level == 2 || child.level == 5) // expanded object or index-row
                    {
                        // if it is an array, object or an index-row
                        var newClass = classRefs.find(t=>t.name == fieldTypeName);
                        if(newClass != undefined)
                            usedClass = newClass;
                    }

                    rowsModel.push(rowModel);
                    rowNr++;
                    childRow++;
                }
            }
            
            // get the list of children of the final parent, which we may use to fill some field-values here below
            var finalChildren = userData.children.filter((c,index,arr)=>index > lastParentRowOfPath);

            // add the fields of the currently expanded class /////////////////////////////////
            for(field of usedClass.fields){
                var valueString = "";
                //if(externalTableNr != undefined && 
                if(userData.children.length > rowNr)
                    valueString = userData.children[rowNr].value;

                var rowModel = {};
                rowModel.type = field.type;
                rowModel.field = field.name;
                
                // set level of new row - if it is expandable or not
                rowModel.level = 0
                if(field.fieldType == "Array")
                    rowModel.level = 3; // unexpanded array
                else if(Model.classes.find(t=>t.name == field.type) != undefined)
                    rowModel.level = 1; // expandable class/array..?

                // can we take a value from the incoming path?
                var thisChild = finalChildren.find(c=>c.field == field.name);
                if(thisChild != undefined)
                    valueString = thisChild.value;

                if(valueString != "")
                    rowModel.value = valueString;
                
                rowsModel.push(rowModel);

                rowNr++;
            }
        }

        return rowsModel;
    },
    usedClassId:0,
    self:null, // reference to figure?.. 
    myView:null, // html view element
    // build html for the classrows
    renderRowsModel: function(model){
        var htmlCode = "";
        
        var rowNr = 0; 
        model.forEach(row=> {
            htmlCode += '<tr>';

            var fieldTypeStyle = "";
            var sideTypeStyle = "";
            var typeStyle ="";

            var levelInt = parseInt(row.level);
            switch(levelInt){
                case 0: // normal field
                    fieldTypeStyle = "background:#f3e7c9; color:black";
                    sideTypeStyle = "background:#f3e7c9; color:black";
                    typeStyle = "background:#f3e7c9; color:black";
                    break;
                case 1: // unexpanded class
                case 3: // unexpanded array
                    fieldTypeStyle = "background: #7282c8; color:black";
                    sideTypeStyle = "background:#f3e7c9; color:black";
                    typeStyle = "background:black; color:white";
                    break;
                case 2: // expanded class
                case 4: // expanded array
                    fieldTypeStyle = "background:#7282c8; color:black";
                    sideTypeStyle = "background:black; color:white";
                    typeStyle = "background:black; color:white";
                    break;
                case 5: // indexrow of array
                case -1: // root-row
                    fieldTypeStyle = "background:black; color:white";
                    sideTypeStyle = "background:black; color:white";
                    typeStyle = "background:black; color:white";
                    break;
            }
               
            htmlCode += '<td style="' + sideTypeStyle + '; width=10px">&nbsp;</td>' +
            '<td width="*" style="' + typeStyle + '">' 

            if(levelInt == 5){
                htmlCode += 
                '# '+ this.getIndexString(rowNr, row.index) +
                '</td>'+'<td style="' + fieldTypeStyle + '">'+
                '<label style="' + fieldTypeStyle + ';width:70%">(' + row.type + ')</label>' + 
                '<label hidden id=level_' + rowNr + '>'+row.level+'</label>'+
                '<label hidden id=fieldType_' + rowNr + '>'+row.type+'</label>';
            } else if(levelInt == 3 || levelInt == 4) {
                htmlCode += '<label style="' + typeStyle + '" class="classrow" id=fieldType_' + rowNr + '>' + row.type + '</label>' + 
                '</td>'+'<td style="' + fieldTypeStyle + '">'+
                '<label style="' + fieldTypeStyle + '">' + row.field + ' []</label>' + 
                '<label hidden id=level_' + rowNr + '>'+ row.level+'</label>'+
                '<label hidden id=fieldName_' + rowNr + '>' + row.field+'</label>';  
            } else {
                htmlCode += '<label style="' + typeStyle + '" class="classrow" id=fieldType_' + rowNr + '>' + row.type + '</label>' + 
                '</td>'+'<td style="' + fieldTypeStyle + '">'+
                '<label style="' + fieldTypeStyle + '" id=fieldName_' + rowNr + '>' + row.field + '</label>' + 
                '<label hidden id=level_' + rowNr + '>'+row.level+'</label>';  
            }
            
            htmlCode += '</td>';

            htmlCode += 
            '<td>' +
                this.getValueString(rowNr, row.value);
            +'</td>';


            htmlCode += '</tr>';

            rowNr++;
        });

        return htmlCode;
    },

    rebuildPanelUI: function(view, figure, externalClassNr){
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
        usedClassId = userData.classId;
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

        var rowsModel = figure.buildRowModelFromShape(userData, usedClassId);

        var rowsCode = figure.renderRowsModel(rowsModel);

        tableString += '<table cellPadding="0"><tbody id="rowstable_body">';
        tableString += rowsCode;
        tableString += '</tbody></table>';



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
    },

    onClickClassRow : function () {
        var clickedRowNr = this.id.split("_")[1]; // pickout "X" from "fieldName_X"

        var rowsModel = self.harvestRowData();
        // find the closest expanded class above the clicked row
        var currentParentClass = null;
        var parentRowIndex = parseInt(clickedRowNr);
        while(currentParentClass == null && parentRowIndex > -1){
            if(rowsModel[parentRowIndex].level == 2 || rowsModel[parentRowIndex].level == 4 || rowsModel[parentRowIndex].level == 5 || rowsModel[parentRowIndex].level == -1) // only look after expanded rows/ root-row
                currentParentClass = Model.classes.find(t=>t.name == rowsModel[parentRowIndex].type);
            else 
                parentRowIndex--;
        }
        // was one found? in other case, take the root class
        if(currentParentClass == undefined)
            currentParentClass = Model.classes.find(t=>t.id == usedClassId);

        // is clicked row expandable?
        var clickedClass = Model.classes.find(t=>t.name == rowsModel[clickedRowNr].type);

        // get index of last expanded parent 
        var lastParentRowOfPath = -1;
        var rowNr = 0;
        rowsModel.forEach(c=> {
            if(c.level == 2) 
                lastParentRowOfPath = rowNr; 
            rowNr++;
        });

        var clickedRowLevel = rowsModel[clickedRowNr].level;
        // 1 - go down into an unexpanded class? (the clicked row is the same where we found the closest above class, and that node is unexpanded)
        if(clickedRowNr > parentRowIndex && clickedRowNr > lastParentRowOfPath  && clickedClass != undefined && (clickedRowLevel == 1 || clickedRowLevel == 3)) // 1 = expandable unexpanded, 3 = array unexpanded
        {
            // gather all the visible data from DOM
            var newModel = self.harvestRowData();
            
            // save the clicked parent row
            var newParentRow = newModel[clickedRowNr];
            // remove it from the model
            newModel = newModel.filter(r => r != newParentRow);
            // remove all rows below the old parent-row that do not carry value
            var toBeRemoved = [];
            for(i=0; i<newModel.length; i++)
            {
                if(newModel[i].rowNr > (parentRowIndex) && newModel[i].value == '') // empty value
                    toBeRemoved.push(newModel[i]);
            }
            newModel = newModel.filter(e => !toBeRemoved.includes(e));
            // add clicked row as expanded parent
            if(clickedRowLevel == 1)
                newParentRow.level = 2; // mark it as expanded parent
            else if(clickedRowLevel == 3)
                newParentRow.level = 4; // mark it as expanded array

            newModel.push(newParentRow);

            // add indexrow, if appropriate
            if(clickedRowLevel == 3){
                var indexRow = {
                    index: "_",
                    level: 5, // index-row
                    type: newParentRow.type // to begin with, indexrows always have the same type/subclass as their parent array-row (it's the default, even if subclassing can occur later)
                };
                newModel.push(indexRow); // insert index-row
            }

            // add leaves of newly expanded parent
            // show the fields of the currently expanded class /////////////////////////////////
            var newParentClass = Model.classes.find(t=>t.name == newParentRow.type);
            for(field of newParentClass.fields){
                var rowModel = {};
                rowModel.type = field.type;
                rowModel.field = field.name;
                rowModel.level = 0;  // the fields of the last class are never expanded, and thus never parents                    
                if(field.fieldType == "Array")
                    rowModel.level = 3; // unexpanded array
                else if(Model.classes.find(t=>t.name == field.type) != undefined)
                    rowModel.level = 1; // unexpanded object
                newModel.push(rowModel);
                //rowNr++;
            }

            // show the new rowsModel!
            var rowsTableHTML = self.renderRowsModel(newModel);
            var rowsTableBodyElem = $("#rowstable_body")[0];
            rowsTableBodyElem.innerHTML = rowsTableHTML;
            rowsModel = newModel;

        }
        // 2 - clicking an unexpandable field-row; take the closest above expanded parent, and list its fields
        // or: click an already opened parent, or rootrow, and go "back" up to showing them as lowest parent
        else if(rowsModel[clickedRowNr].level == 0 || rowsModel[clickedRowNr].level == 1 || (clickedClass != undefined && (rowsModel[clickedRowNr].level == 2 ||rowsModel[clickedRowNr].level == 4 || rowsModel[clickedRowNr].level == -1)))
        {
            // gather all the visible data from DOM
            var newModel = self.harvestRowData();
        
            // if clicking an expanded parent array- count as if the indexrow below was clicked, instead - should save some bother
            if(rowsModel[clickedRowNr].level == 4) // expanded array
                parentRowIndex++; // step down to the indexrow, so we get ITS children

            // get any rowmodel-siblings of clicked field - they may contain values that we should keep when building up the view again   
            var siblinghood = []; // step past the parent
            var currRow = parentRowIndex+1; 
            foundParent = false;
            while(currRow < newModel.length && foundParent == false){
                siblinghood.push(newModel[currRow]);
                if(newModel[currRow].level == 2 // expanded instance
                    || newModel[currRow].level == 4) // expanded array) // indexrow of expanded array
                    foundParent = true; // we want to save any Value of (the possibly) One sibling who is also an expanded parent
                currRow++;
            }
        
            // remove all rows below the old parent-row
            var toBeRemoved = [];
            for(i=0; i<newModel.length; i++)
            {
                if(newModel[i].rowNr > (parentRowIndex)) // empty value
                    toBeRemoved.push(newModel[i]);
            }
            newModel = newModel.filter(e => !toBeRemoved.includes(e));
            
            
            // add leaves of the (old) expanded parent
            // show the fields of the currently expanded class /////////////////////////////////
            // add old values
            //var newParentClass = Model.classes.find(t=>t.name == newParentRow.type);
            for(field of currentParentClass.fields){
                var foundValueRow = siblinghood.find(row=>row.field == field.name);
                var foundValueString = foundValueRow != undefined ? foundValueRow.value : undefined;
                
                var rowModel = {};
                rowModel.type = field.type;
                rowModel.field = field.name;
                rowModel.level = 0;  // the fields of the last class are never expanded, and thus never parents                    
                if(field.fieldType == "Array")
                    rowModel.level = 3; // unexpanded array
                else if(Model.classes.find(t=>t.name == field.type) != undefined)
                    rowModel.level = 1;
                
                if(foundValueString != undefined && foundValueString != '')
                    rowModel.value = foundValueString;

                newModel.push(rowModel);
            }

            // show the new rowsModel!
            var rowsTableHTML = self.renderRowsModel(newModel);
            var rowsTableBodyElem = $("#rowstable_body")[0];
            rowsTableBodyElem.innerHTML = rowsTableHTML;
            rowsModel = newModel;
        }
    },

    
    buildInputPanel: function(view, figure, externalClassNr){
        self = figure; // try storing? :E
        myView = view;
        figure.rebuildPanelUI(view, figure, externalClassNr);

        // a classrow was clicked, containing a line of the path
        // if an unexpanded class was clicked, expand it and show its children
        // if something above the downmost expanded class was clicked, "back up" to the closest expanded class above, and show its children
        // this method should construct a new rowsmodel to render, just like when we are first opening a shape for editing
        $(document.body).off();
        $(document.body).on("click", '.classrow', this.onClickClassRow);
        $(document.body).on("change", '#class_selector', this.onChangeClassSelector);
        $(document.body).on("click", '#ok_button', this.onClickOkButton);
   
    },

    onClickOkButton : function(){
        var shapeModel = app.view.getShapeModel(self.id);
    
        if(usedClassId == -1)
        {
            // set shape data to empty
            shapeModel.data.name = "";
        }
        else {
            var usedClass = Model.classes.find(t=>t.id == usedClassId);
            
            var children = shapeModel.data.children;
            children = []; // this path-structured array will have to be rebuilt for each save
            
            //var targetRow = 0; // the row of the possibly saved shape-field-data

            var saveModel = self.harvestRowData();
            var rootRow = saveModel[0];
            
            shapeModel.data.name = usedClass.name;
            shapeModel.data.value = rootRow.value;
            shapeModel.data.classId = usedClassId;

            // copy necessary lines to children of shapedata
            for(i = 0; i < saveModel.length; i++){
                var row = saveModel[i];
                if(row.level != -1 && (row.level == 2 || row.value != '')){
                    children.push(
                        {
                            field: row.field,
                            level: row.level,
                            value: row.value
                        }
                    )
                }
            }

            shapeModel.data.children = children;
        }
        
        app.view.updateShapeContents(shapeModel);
        app.view.canvas.renderAll();
    },

    onChangeClassSelector : function(){
        //$("#class_selector").on("change", function(){
        var externalClassNr =  this.value;
        self.rebuildPanelUI(myView,self,externalClassNr);
    },

    // harvest the row-data from the DOM
    harvestRowData:function(){
        var rows = [];
        var row = 0;
        var endReached = false;
        do{
            // look for all possible values on each row
            var fieldNameLabel = document.getElementById('fieldName_'+row);
            var fieldName = null;
            if(fieldNameLabel != undefined)
                fieldName = fieldNameLabel.innerText;

            var levelLabel = document.getElementById('level_'+row);
            var level = false;
            if(levelLabel != undefined)
                level = levelLabel.innerText;

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

            // copy EVERYTHING to rowData
            
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

            newRow.level = level;
            newRow.rowNr = row;
            
            // when both these are undefined, the row was invalid
            endReached = rowIndex == undefined && className == undefined;

            if(!endReached)
                rows.push(newRow);

            row++;
            // go on until we are out of rows with meaningful content
        } while (!endReached) // a valid row has One of these..

        return rows;
    },

    getValueString: function(rowNr, value){
        var printString = "";
        if(value != "" && value != undefined)
            printString = htmlPrologEncode(value);
        return '<input id="value_' + rowNr + '" tabIndex="' + (1002 + rowNr) + '" type="text" value="'+ printString +'"/>';
    },
    getIndexString: function(rowNr, index){
        var printString = "";
        if(index != "")
            printString = htmlPrologEncode(index);
        return '<input id="index_' + rowNr + '" style="width:70%" type="text" value="'+ printString +'"/>';
    },

    parseToExpression:function(shapeData, rpc){
        var data = shapeData.data;
        var parentString = data.value;

        // first, parse all the rows into rule-calls
        var pathExpressions = [];

        var argIndex = 0;

        tokens = Lexer.GetTokens(":");
        var opToken = tokens[0];

        var parentExpression = new VariableExpression(parentString);

        data.children.forEach(a=>{

            var level = parseInt(a.level);
            var field = null;
            var valueExpression = null;

            field = new AtomExpression("'" + a.field + "'");

            if(a.value != undefined)
                valueExpression = ShapeParsing.parseShapePrologText(rpc, shapeData, "Argument #" + argIndex, a.value);

            var res = null; 

            switch(level){
                case 0:
                case 1:
                    var matchExpression = new OperatorExpression(field, opToken, valueExpression); 
                    res = new RuleExpression(null, "praxis_field_in", [matchExpression, parentExpression]);
                    break;
                case 2:
                    if(valueString == undefined || valueString == ''){
                        var valueString = "VAR_" + rpc.idCounter++;
                        valueExpression = new VariableExpression(valueString);
                    }
                    var matchExpression = new OperatorExpression(field, opToken, valueExpression); 
                    res = new RuleExpression(null, "praxis_field_in", [matchExpression, parentExpression]);
                    
                    parentString = valueString;
                    parentExpression = new VariableExpression(parentString);
                    break;
            }

            argIndex++;

            pathExpressions.push(res);
        });

        // build and return a RuleExpression
        var body = ShapeParsing.parseAllBelow(shapeData, rpc);
        return new ClassExpression(pathExpressions, body);
    }

});