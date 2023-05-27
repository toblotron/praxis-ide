var FormulaShape = fabric.util.createClass(fabric.Group, {
    type: 'formulaShape',
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
        this.formulaRows = [];
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
            rows:[
            {
                left: '' ,
                op:'',
                right:''
            }
        ]};

    },

    updateContents: function(incomingShapeData) {
        
        var shapeData = incomingShapeData;

        // delete all the old content
        for(f of this.formulaRows){
            this.remove(f.left);
            this.remove(f.mRect); 
            this.remove(f.mid);
            this.remove(f.right);
        }
        this.formulaRows = [];
        if(this.bg != null)
            this.remove(this.bg);
        
        
        
        var startx = this.left;
        var starty = this.top;
        var incomingx = startx;
        var incomingy = starty;


        var isPreview = pb.FormulaShape.isInvalid({data:shapeData}, null);
        if(isPreview){
            // set temporary preview-values
            shapeData = {rows:[
                {
                    left: 'LeftVal' ,
                    op:'=',
                    right:'RightVal'
                }]};
        }


        var leftMax = 0;
        var midMax = 0;
        var rightMax = 0;

        var totHeight = 0;


        var padding = 2;        // pad everything
        var sidePadding = 3;    // add to sides
        var bottomPadding = 1;  // add below last row

        // create controls and gather maxwidths
        for(rowData of shapeData.rows) {
            //var leftRect = new fabric.Rect({fill:'beige'});
            var leftText = new PrologText(rowData.left,{isPreview: isPreview});
            if(leftText.width > leftMax)
                leftMax = leftText.width;

            var fill = '#00a8f0'; // lightblue
            if(rowData.op == "is")
                fill = '#fd4720'; // orange

            var midRect = new fabric.Rect({fill:fill});
            var midText = new fabric.Text(rowData.op,{fontSize:12, fontFamily:'arial', fill:'white'});
            if(midText.width > midMax)
                midMax = midText.width;
            totHeight += midText.height + padding*2;
            
            //var rightRect = new fabric.Rect({fill:'beige'});
            var rightText = new PrologText(rowData.right,{isPreview:isPreview});
            if(rightText.width > rightMax)
                rightMax = rightText.width;

            var controlRow = {
                //lRect:leftRect,
                left:leftText,
                mRect:midRect, 
                mid:midText,
                //rRect:rightRect, 
                right:rightText};
            
            if(isPreview){
                midRect.set({opacity:0.5});
                midText.set({opacity:0.5, fontStyle:'italic'});
            }

            this.formulaRows.push(controlRow);


        };

        // place controls
        var top = 0;

        this.bg = new fabric.Rect({
            top: this.top,
            left: this.left,
            width: 30,
            height: 30,
            fill: 'white',
            rx: 5,
            ry: 5
          });
        var bg = this.bg;

        if(isPreview)
            bg.set({opacity:0.5});

        // add sidePadding
        totHeight += sidePadding * 2 + bottomPadding;
                
        // center the bg rect on midpoint
        bg.width = leftMax + midMax + rightMax + 7*padding + (2*2) + sidePadding*2;
        bg.height = totHeight;
        bg.left = this.left - bg.width/2;
        bg.top = this.top - bg.height/2;
        startx = bg.left + sidePadding;
        starty = bg.top;

        this.addWithUpdate(bg);
        var index = 0;
        for(c of this.formulaRows) {
            
          
            var textTop = starty + ((c.mid.height+padding*2) * index) + padding + sidePadding +2;  
            c.left.left = startx + padding;
            c.left.top = textTop;

            c.mRect.left = startx + leftMax + (padding * 3);//c.lRect.left + c.lRect.width;
            c.mRect.top = starty + top;
            c.mid.left = c.mRect.left + padding + 2; 
            c.mid.top = textTop;
            
            var rectHeight = c.mid.height + (padding * 2);
            if(index == 0){
                rectHeight += sidePadding;
            }
            if(index == this.formulaRows.length-1){
                rectHeight += sidePadding + bottomPadding;
            }

            c.mRect.height = rectHeight;
            c.mRect.width = midMax + (padding * 2) + (2*2);

            c.right.left = c.mRect.left + c.mRect.width + padding;
            c.right.top = textTop;
            
            top += rectHeight;

            index++;

            this.addWithUpdate(c.left); 
            this.addWithUpdate(c.mRect);  
            this.addWithUpdate(c.mid); 
            this.addWithUpdate(c.right);
     
        };
        
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

    buildInputPanel: function(view, figure){
        // bygg HTML för panel
        // modify library and rule names
        var userData = app.view.getShapeModel(figure.id).data;
        view.html("");
        // modify library and rule names
        view.append('<div id="formula_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Formula'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+		
            '		<hr>');

        var tableString = 
            '<table id="formulas_table" cellPadding="0">'+
            '	<tbody>';

        var rowNr = 0
        for(row of userData.rows){
            tableString += 
                '<tr>'+
                    '<td width="*">'+
                        this.getLeftHtml(rowNr,row.left) + 
                    '</td>'+
                    '<td>'+
                        this.getOpHtml(rowNr,row.op) + 
                    '</td>'+
                    '<td>'+
                    this.getRightHtml(rowNr,row.right) + 
                    '</td>'+
                '</tr>';
            rowNr++;
        };

        tableString += '</tbody></table>';
        view.append(tableString);
        var rowIndexes = 1003 + (userData.rows.length * 3);
        view.append(
        '			<button id="plus_button" tabIndex = "' + (rowIndexes + 1) + '">+</button>'+
        '			<button id="minus_button" tabIndex = "' + (rowIndexes + 2) + '">-</button>'+
        '			<button id="cancel_button" tabIndex = "' + (rowIndexes + 3) + '">Cancel</button>'+
        '			<button id="ok_button" tabIndex = "' + (rowIndexes + 4) + '">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');
            
        
/*
        // update shape on library/name change
        $("#rule_panel input").on("change", function(){
            
        });
*/

        $("#ok_button").on("click", function(){
            var userData = app.view.getShapeModel(figure.id);

            var size = userData.data.rows.length;
            for(i = 0; i < size; i++)
            {
                userData.data.rows[i] = {
                    "left":$("#left_"+i).val(),
                    "op":$("#op_"+i).val(),
                    "right":$("#right_"+i).val()
                };
            }

            app.view.updateShapeContents(userData);
            app.view.canvas.renderAll();
        });

        $("#plus_button").on("click", function(){
            console.log("plus clicked");
            // add row in table 
            var table = document.getElementById("formulas_table");
            var row = table.insertRow(-1);

            // Insert new cells (<td> elements)
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            // Add some text to the new cells:
            var cellContents1 = figure.getLeftHtml(table.rows.length-1, "");
            var cellContents2 = figure.getOpHtml(table.rows.length-1, "");
            var cellContents3 = figure.getRightHtml(table.rows.length-1, "");

            //console.log(cellContents);
            cell1.innerHTML = cellContents1;
            cell2.innerHTML = cellContents2;
            cell3.innerHTML = cellContents3;

            var userData = app.view.getShapeModel(figure.id);
            userData.data.rows.push(0);
        });
            
        $("#minus_button").on("click", function(){
            console.log("minus clicked");
            var table = document.getElementById("formulas_table");
            var row = table.deleteRow(-1);
            // where does this value even come from? :D
            userData.rows.pop();
        });
        
        //#FOCUS 
        //var elem = $("#left_0");  // focus on the left part, first row
        //window.setTimeout(() => elem.focus().select(), 0);
    },

    getLeftHtml: function(rowNr, value){
        return '<input id="left_' + rowNr + '" tabIndex="' + (1001 + (rowNr*3)) + '" type="text" value="'+ htmlPrologEncode(value) +'"/>';
    },

    getOpHtml: function(rowNr, value){
        return '<input style="width:35px; text-align:center; padding:0;" id="op_' + rowNr + '" tabIndex="' + (1002 + (rowNr*3)) + '" type="text" value="'+ value +'"/>';
    },

    getRightHtml: function(rowNr, value){
        return '<input id="right_' + rowNr + '" tabIndex="' + (1003 + (rowNr*3)) + '" type="text" value="'+ htmlPrologEncode(value) +'"/>';
    },

    parseToExpression:function(shapeData, rpc){
        var data = shapeData.data;
        
        // first, parse all the prolog-texts in the arguments
        var expressionRows = [];
        var rowNr = 1;
        data.rows.forEach(r=>{
            var row = this.parseRowToExpression(r, rowNr, rpc, shapeData);
            expressionRows.push(row);
            rowNr++;
        });

        // build and return a RuleExpression
        var body = ShapeParsing.parseAllBelow(shapeData, rpc);
        return new FormulaExpression(expressionRows,body);
    },
    parseRowToExpression:function(row, rowNr, rpc, shapeData){
        
        var leftExpression = ShapeParsing.parseShapePrologText(rpc, shapeData, "Row #" + rowNr + " left expression", row.left);
        
        tokens = Lexer.GetTokens(row.op);
        
        // there should only be One token, here - but we're not checking that yet
        var opToken = tokens[0];

        var rightExpression = ShapeParsing.parseShapePrologText(rpc, shapeData, "Row #" + rowNr + " right expression", row.right);

        var res = new OperatorExpression(leftExpression, opToken, rightExpression);
        return res; 
    }

});