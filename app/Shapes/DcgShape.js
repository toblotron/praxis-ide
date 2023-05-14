var DcgShape = fabric.util.createClass(fabric.Group, {
    type: 'dcgShape',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });

        this.callSuper('initialize',[], options);
        this.set({ 
            originX: 'center',
            originY: 'center',
            objectCaching: false
         });
        
        this.isDataShape = true;
        
        // dataview-keepers
        this.argumentRows = [];
        this.libraryRect = null;
        this.libraryName = null;
        this.ruleRect = null;
        this.ruleName = null;
    },

    // gather all ports, with positions relative to the shape left/top (in this case, center)
    gatherPorts: function(){
        // top and bottom ports
        var topPort = {parent:this, shapeId:this.id, role:"in",x:0,y:-this.height/2};
        
        var bottomPort = {parent:this, shapeId:this.id, role:"out",x:0,y:this.height/2};
        
        return [topPort, bottomPort];
    },

    defaultContent: function(){
        return {
            libraryName :"",
            ruleName : "",
            arguments:[
                 "Argument1",
                 "Argument2"
            ],
            pushback:[]
        };

    },

    updateContents: function(incomingShapeData) {

        var shapeData = incomingShapeData;

        // delete all the old content
        if(this.libraryName){
            this.remove(this.libraryName);
            this.remove(this.libraryRect);
        }
        this.remove(this.ruleName);
        this.remove(this.ruleRect);
        for(text of this.argumentRows){
            this.remove(text);
        }
        if(this.pushbackRect){
            this.remove(this.pushbackRect);
            this.remove(this.pushbackText);
            for(text of this.pushbackRows){
                this.remove(text);
            }
        }

        this.argumentRows = [];
        this.pushbackRows = [];
        if(this.bg != null)
            this.remove(this.bg);
        
        var startx = this.left;
        var starty = this.top;
        var incomingx = startx;
        var incomingy = starty;

        var isPreview = false;
        if(pb.RuleShape.isInvalid({data:shapeData}, null)){
            isPreview = true;
            // set temporary preview-values
            shapeData = {ruleName:"grammarName", libraryName:"lib", arguments:["Argument1", "Argument2"]};
        }

        var leftMax = 0;
        var leftPad = 2;
        var totHeight = 0;
        var padding = 4;
        var bgStartY = 0;
        var bgHeight = 0;

        var bottomPad = 3; // extra padding after last row
        var linePad =5;

        var hasArguments = shapeData.arguments.length > 0;

        var hasLibrary = true;
        if(shapeData.libraryName == "" || shapeData.libraryName == undefined)
            hasLibrary = false;

        // round corners on bottom, if no arguments below
        var bottomCorner = [0,0];
        if(!hasArguments)
            bottomCorner = [5,5];

        if(hasLibrary){
            
            this.libraryRect = new RoundedRect({fill:'#000000', topLeft:[5,5], bottomLeft:bottomCorner});
            this.libraryName = new fabric.Text(shapeData.libraryName,{fontSize:12, objectCaching: false, fill:'yellow',fontFamily:'arial'});
            if(isPreview){
                this.libraryRect.set({fill:'#555555', opacity:0.5});
                this.libraryName.set({opacity:0.5, fontStyle:'italic'});
            }
            this.ruleRect = new RoundedRect({fill:'#bb2222',topRight:[5,5],bottomRight:bottomCorner});
        }
        else {
            this.ruleRect = new RoundedRect({fill:'#bb2222',topLeft:[5,5],topRight:[5,5],bottomLeft:bottomCorner, bottomRight:bottomCorner});
        }
        
        this.ruleName = new fabric.Text(shapeData.ruleName,{fontSize:12,fill:'white', objectCaching: false, fontFamily:'arial'});
        if(isPreview){
            this.ruleRect.set({opacity:0.5});
            this.ruleName.set({opacity:0.5, fontStyle:'italic'});
        }

        leftMax = this.ruleName.width + padding * 2;
        if(hasLibrary)
              leftMax += this.libraryName.width + padding * 2

        totHeight += this.ruleName.height + padding;
        bgStartY = totHeight;   // save for setting final bg location

        // create controls and gather maxwidths
        for(argText of shapeData.arguments) {
            var leftText = new PrologText(argText,{fontSize:12, 
                objectCaching: false,fontFamily:'arial',isPreview:isPreview});

            if(leftText.width+padding*2 +leftPad > leftMax)
                leftMax = leftText.width+padding*2+leftPad;

            totHeight += leftText.height + linePad;
            
            this.argumentRows.push(leftText);
        };

        totHeight += linePad + bottomPad;

        // Add (possible) pushback-part!
        if(shapeData.pushback != undefined && shapeData.pushback.length > 0)
        {
            // add pushback-heading
            this.pushbackRect = new RoundedRect({fill:'#bb2222',topLeft:bottomCorner,topRight:bottomCorner,bottomLeft:bottomCorner, bottomRight:bottomCorner});
            this.pushbackName = new fabric.Text("<<",{fontSize:12,fill:'white', objectCaching: false, fontFamily:'arial'});
            totHeight += this.pushbackName.height + padding;

            // add pushback rows
            for(pushText of shapeData.pushback) {
                var pushbackText = new PrologText(pushText,{fontSize:12, 
                    objectCaching: false,fontFamily:'arial',isPreview:isPreview});
    
                if(pushbackText.width+padding*2 +leftPad > leftMax)
                    leftMax = pushbackText.width+padding*2+leftPad;
    
                totHeight += pushbackText.height + linePad;
                
                this.pushbackRows.push(pushbackText);
            };
            totHeight += linePad;

        }


        // Ensure minimum width
        if(leftMax < 75)
            leftMax = 75;

        // place controls
        var top = 0;

        this.bg = new RoundedRect({
            topLeft:[0,0],
            topRight : [0,0],
            bottomLeft: [5,5],
            bottomRight: [5,5],
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

        //this.libraryRect.set({clipPath: this.bg});

        // center the bg rect on midpoint
        bg.width = leftMax;
        bg.height = totHeight;
        bg.left = this.left - bg.width/2;
        bg.top = this.top - bg.height/2;
        startx = bg.left;
        starty = bg.top;

        bgHeight = totHeight - bgStartY;

        this.addWithUpdate(bg);

        if(hasLibrary){
            this.libraryRect.left = startx;
            this.libraryRect.width = this.libraryName.width + padding * 2;
            this.libraryRect.height = this.libraryName.height + padding;
            this.libraryRect.top = starty;
            this.addWithUpdate(this.libraryRect);

            this.libraryName.left = startx + padding;
            this.libraryName.top = starty + top + padding/2 +1;
            this.addWithUpdate(this.libraryName);
            
            this.ruleRect.left = startx + this.libraryRect.width;
        }
        else 
            this.ruleRect.left = startx;
        
        this.ruleRect.width = this.ruleName.width + padding * 2 + leftPad;
       
        // make sure ruleRect covers to the right border
        var summedFieldWidth = this.ruleRect.width;
        if(hasLibrary)
            summedFieldWidth += this.libraryRect.width;
        if(summedFieldWidth < leftMax)
        {
            this.ruleRect.width += leftMax - summedFieldWidth;
            summedFieldWidth = leftMax;
        }
        this.ruleRect.height = this.ruleName.height + padding;
        this.ruleRect.top = starty;
        this.addWithUpdate(this.ruleRect);

        if(hasLibrary)
            this.ruleName.left = startx + this.libraryName.width + padding * 3 + leftPad;
        else 
            this.ruleName.left = startx + padding * 1 + leftPad;

        this.ruleName.top = starty + top + padding/2 +1;
        top += this.ruleName.height + padding/2;
        this.addWithUpdate(this.ruleName);

        for(text of this.argumentRows) {
            
            text.left = startx + padding + leftPad;
            text.top = starty + top + padding + linePad;
            
            top += text.height + linePad;

            this.addWithUpdate(text); 
            
        };
        
        // add pushback things
        if(shapeData.pushback != undefined && shapeData.pushback.length > 0)
        {
            this.pushbackRect.height = this.pushbackName.height + padding;
            this.pushbackRect.top = starty + top + padding + linePad;
            this.pushbackRect.left = startx;
            this.pushbackRect.width = summedFieldWidth;
            this.addWithUpdate(this.pushbackRect);
            
            this.pushbackName.left = startx + padding * 1 + leftPad;

            this.pushbackName.top = starty + top + padding +3 + linePad;

            top += this.pushbackRect.height + padding;
            
            this.addWithUpdate(this.pushbackName);

            for(text of this.pushbackRows) {
                text.left = startx + padding + leftPad;
                text.top = starty + top + padding + linePad;
                top += text.height + linePad;
                this.addWithUpdate(text); 
            };
            top += padding;
        }

        /*this.set({clipPath: new fabric.Circle({
            radius: 55,
            originX: 'center',
            originY: 'center',
          }),});*/


        // Finally - change bg so it only covers the arguments
        if(hasArguments){
            bg.top = bg.top + bgStartY;
            bg.height = bgHeight;
            bg.width = summedFieldWidth;
        } else {
            bg.height = 0;
            this.removeWithUpdate(bg);
            this.bg = null;
            this.height = this.ruleRect.height;

        }

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
        var userData = app.view.getShapeModel(figure.id).data;
        view.html("");
        
        
        // list of libraries
        var libraryList =  '<select id="libraryCombo" tabIndex="1002">'; // onchange="this.previousElementSibling.value=this.value; this.previousElementSibling.focus()">';
        var libNames = app.libraries.filter(lib=>lib.predicates.some(p=>p.isDcg == true)).map(x=>x.name);
        libraryList += '<option value="" selected></option>'; // add "" (no library; global) option
        for(libName of libNames){
            if(libName != "") { // do not double-list ""
                libraryList += '<option value="'+ libName +'" ';
                //if(libName == userData.libraryName)
                //    libraryList += 'selected';
                libraryList += '>' + libName + '</option>';
            }
        }
        libraryList += '</select>';

        // list of predicates
        var predicateList = '<select id="predicateCombo" tabIndex="1004" onchange="this.previousElementSibling.value=this.value; this.previousElementSibling.focus()">';
        predicateList += '</select>';

        view.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Grammar'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div class="input-group" ></div> '+
            '       <label for="library">Library</label><div class="dropdown"><input type="text" tabIndex="1001" name="myLibs" id="libraryListing" />' + libraryList + '</div>' +
            '       <label for="predicate">Rule name</label><div class="dropdown"><input type="text" tabIndex="1003" name="myPreds" value="' + userData.ruleName + '" id="predicateListing" />' + predicateList +'</div>' +
            '		');

        var tableString = 
            '<label>Arguments</label>' +
            '<table id="arguments_table" cellPadding="0">'+
            '	<tbody>';

        var row = 0
        var taborder = 1005;
        for(arg of userData.arguments){
            tableString += 
                '<tr>'+
                    '<td>'+
                        '<input id="arg_' + row +  '" tabIndex="' + (taborder + row) + '" type="text" class="form-control" value="'+ htmlPrologEncode(arg) +'"/>' +
                    '</td>'+
                '</tr>';
            row++;
        };
        taborder = taborder + row;
        tableString += '</tbody></table>';
        
        var pushbackString = 
            '<br><label>Pushback</label>' +
            '<table id="pushback_table" cellPadding="0">'+
            '	<tbody>';

        var row = 0
        //var taborder = 1005;
        if(userData.pushback != undefined){
            for(push of userData.pushback){
                pushbackString += 
                    '<tr>'+
                        '<td>'+
                            '<input id="push_' + row +  '" tabIndex="' + (taborder + row + 2) + '" type="text" class="form-control" value="'+ htmlPrologEncode(push) +'"/>' +
                        '</td>'+
                    '</tr>';
                row++;
            };
        }
        pushbackString += '</tbody></table>';
        
        view.append(tableString);
        view.append(
        '			<button id="minus_button" tabIndex="' + taborder+1 +'">-</button>'+
        '			<button id="plus_button" tabIndex="'+ taborder+2+'">+</button>');
        
        view.append(pushbackString);
        view.append(
            '			<button id="minus_push" tabIndex="' + taborder+row+3 +'">-</button>'+
            '			<button id="plus_push" tabIndex="'+ taborder+row+4+'">+</button>');

        view.append(
        '			<button id="cancel_button">parse</button>'+
        '			<hr><button id="ok_button" tabIndex="'+ taborder+row+4+'">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');
            
        // automatically put query in querybox, when selected :)
        // Not for DCG-rules!... yet!.. 
        /*
        var page = Model.rulePages[CurrentViewedPageNr];
        var shape = page.shapes.find(f => f.id == figure.id);
        var queryText = pb["RuleShape"].render(shape);
        var queryField = document.getElementById("queryField");
        queryField.value = queryText + ".";
        */

        setTimeout(figure.openPanel(userData), 500);
        

        // event handlers
        // for combobox
        $("#libraryCombo").on("change", function(){         
            $("#libraryListing").val($("#libraryCombo option:selected").html()); // copy combo selection
            // $("#libraryListing").focus(); // makes it impossible to delete selected shape, since canvas loses focus
            var userData = app.view.getShapeModel(figure.id).data;
            
            figure.updatePredicateList(userData);
        });

        $( "#libraryListing" ).on("blur", function(){
            var userData = app.view.getShapeModel(figure.id).data;
            figure.updatePredicateList(userData);
        });

        // predicate combo change -> copy option to text, fill arguments
        $("#predicateCombo").on("change", function(){         
            var selectedPredicateValue = $("#predicateCombo option:selected").html();   // includes "/arity"
            
            var stringParts = selectedPredicateValue.split("/");
            var selectedRuleName = stringParts[0].trim();
            var selectedRuleArity = stringParts[1];
            
            $("#predicateListing").val(selectedRuleName); // copy combo selection, but just the name part
            var userData = app.view.getShapeModel(figure.id).data;

            // get possible rule definition
            var selectedLibraryName = $("#libraryListing").val();
            var library = app.libraries.find(x=>x.name == selectedLibraryName);
            if(library != undefined) {
                var ruleDefinition = library.predicates.find(p=>p.name == selectedRuleName && p.arity == selectedRuleArity);
                if(ruleDefinition != undefined)
                    figure.setArgumentList(userData, ruleDefinition);
            } 
        });
             
        $("#ok_button").on("click", function(){
            var shapeModel = app.view.getShapeModel(figure.id);
            var userData = shapeModel.data;

            var table = document.getElementById("arguments_table");
            var nrArgumentRows = table.rows.length;

            // create new version of shapeData
            var newShapeData = {};
            newShapeData.libraryName=$("#libraryListing").val();
            var selectedPredicateName = $("#predicateListing").val();

            newShapeData.ruleName = selectedPredicateName;
            newShapeData.arguments = [];
            newShapeData.pushback = [];

            for(i = 0; i < nrArgumentRows; i++)
            {
                newShapeData.arguments[i] = $("#arg_"+i).val();
            }

            var pushbackTable = document.getElementById("pushback_table");
            var nrPushbackRows = pushbackTable.rows.length;
            for(i = 0; i < nrPushbackRows; i++)
            {
                newShapeData.pushback[i] = $("#push_"+i).val();
            }

            // see if ruleRef should be updated
            ruleDefTrySubmitRule(figure, newShapeData, true);
            
            // copy info to stored data
            userData.libraryName = newShapeData.libraryName;
            userData.ruleName = selectedPredicateName;
            userData.arguments = [];

            for(i = 0; i < nrArgumentRows; i++)
            {
                userData.arguments[i] = $("#arg_"+i).val();
            }

            shapeModel.data = newShapeData;
            
            app.view.updateShapeContents(shapeModel);
            app.view.canvas.renderAll();

            //figure.updateContents(userData);
            //app.view.canvas.renderAll();
        });

        $("#cancel_button").on("click", function(){
            var userData = app.view.getShapeModel(figure.id).data;
            var errorList =  [];
            var expressionTree = ShapeParsing.parseRuleHead(figure.id, app.view.pageModel,errorList);
            
            if(errorList.length > 0){
                errorList.forEach(err=>app.bottombar.errorList.push(err));
                app.bottombar.updateErrorTable();
            } else {
                var PrintContext = {res:[], indentation:0};
                if(expressionTree != undefined){
                    expressionTree.printAsHead(PrintContext);
                    var res = PrintContext.res.join("");
                }
            }
            var i = 0;
        });

        $("#plus_button").on("click", function(){
            console.log("plus clicked");
            // add row in table 
            var table = document.getElementById("arguments_table");
            var row = table.insertRow(-1);

            // Insert new cells (<td> elements)
            var cell1 = row.insertCell(0);

            // Add some text to the new cells:
            var cellContents = '<input id="arg_' + (table.rows.length-1) + '" type="text" class="form-control" value="'+ 0 +'"/>';
            //console.log(cellContents);
            cell1.innerHTML = cellContents;

            //var userData = figure.getUserData();
            //userData.arguments.push(0);

        });
            
        $("#minus_button").on("click", function(){
            console.log("minus clicked");
            var table = document.getElementById("arguments_table");
            var row = table.deleteRow(-1);
            //userData.arguments.pop();
        });

        $("#plus_push").on("click", function(){
           // add row in table 
            var table = document.getElementById("pushback_table");
            var row = table.insertRow(-1);

            // Insert new cells (<td> elements)
            var cell1 = row.insertCell(0);

            // Add some text to the new cells:
            var cellContents = '<input id="push_' + (table.rows.length-1) + '" type="text" class="form-control" value="'+ 0 +'"/>';
            //console.log(cellContents);
            cell1.innerHTML = cellContents;

        });
            
        $("#minus_push").on("click", function(){
            var table = document.getElementById("pushback_table");
            var row = table.deleteRow(-1);
        });

        
       
    },

    // SET SELECTED LIBRARY - TRIGGERING FILLING OF PREDICATE LIST
    openPanel: function(userData){
        // set library
        var libCombo = document.getElementById("libraryCombo");
        libCombo.value = userData.libraryName;

        // set library text
        $("#libraryListing").val($("#libraryCombo option:selected").html()); // copy combo selection
        
        // skip auto-select focus
        //$("#libraryListing").focus();
        //var elem = $("#predicateListing");  // focus and select on the rulename-field
        //window.setTimeout(() => elem.focus().select(), 0);
        
        // fill predicate combo with methods of selected library
        this.updatePredicateList(userData);

    },

    updatePredicateList: function(userData){
        // fill predicateList datalist with appropriate values

        // should ok-button be blocked?
        var blockOkButton = false;

        var libNames = app.libraries.map(x=>x.name);
        // if there is a library like the currently selected text
        var selectedLibraryName = $("#libraryListing").val();
        // use entered text, if it differs from what is in userData (current text in shape)
        var selectedPredicateName = $("#predicateListing").val();

        if(libNames.includes(selectedLibraryName)){
            var container = document.getElementById('predicateCombo');
            container.innerHTML = '';
            var library = app.libraries.find(x=>x.name == selectedLibraryName);

            // if external library, we can't add/edit rules - just edit arguments
            $("#predicateListing").prop("disabled",library.external);
            $("#plus_button").prop("disabled",library.external);
            $("#minus_button").prop("disabled",library.external);

            if(library.predicates != undefined){
                var currPredId = selectedPredicateName + " /" + userData.arguments.length;
                var predIds = library.predicates.filter(pred => pred.isDcg == true).map(x=>x.name + " /" + x.arity);
                // if there is a pred name present (manually entered?), but none predefined, add current selection
                if(library.predicates.find(p=>p.name == selectedPredicateName) == undefined)
                {
                    var option = document.createElement('option');
                    option.value = currPredId;
                    option.text = currPredId;
                    option.selected = true;
                    container.appendChild(option);
                    // closed lib, entered rule name not found? - block ok button
                    if(library.external)
                        blockOkButton = true;
                } 
                else {
                    // closed lib, entered rule name not found? - block ok button
                    //if(library.external)
                    //    blockOkButton = true;
                }

                // list existing predicates
                for(predId of predIds){
                    var option = document.createElement('option');
                    option.value = predId;
                    option.text=predId;
                    if(predId == currPredId)
                        option.selected = true;
                    container.appendChild(option);
                }
            }
        } 
        else 
        {
            // no library definition found - lib yet to be created? - reset pred list anyways..
            // usecase: a new library is being created, by entering a new name in the lib-text box
            var container = document.getElementById('predicateCombo');
            container.innerHTML = '';

            $("#predicateListing").prop("disabled",false);
            $("#plus_button").prop("disabled",false);
            $("#minus_button").prop("disabled",false);  
        }

        // try to set the correct predicate selected, according to pred-box text ///!shape settings
        var currPredId = selectedPredicateName + ' /' + userData.arguments.length;
        var selectedLibrary = app.libraries.find(x=>x.name == userData.libraryName);
        // check if the rule exists in the library - in that case select the correct option
        if(selectedLibrary != undefined){
            var ruleDef = selectedLibrary.predicates.find(r=>r.name == selectedPredicateName && r.arity == userData.arguments.length);
            if(ruleDef != undefined){
                var predCombo = document.getElementById("predicateCombo");
                predCombo.value = selectedPredicateName; //currPredId;
           } 
           //else {
           //     // otherwise, just put the text in the right place
           //     $("#predicateListing").val(userData.ruleName);
           // } 
        } 
        //else {
        //    // otherwise, just put the text in the right place
        //    $("#predicateListing").val(userData.ruleName);
        //} 

        // block/ unblock ok button?
        $("#ok_button").prop("disabled", blockOkButton);
    },

    // set the panel to display the correct number of arguments, possibly with reasonable variable names
    setArgumentList: function(userData, ruleDefinition){
        // regenerate arguments list
        var table = document.getElementById("arguments_table");
        // Harvest existing arguments
        var currArgs = [];
        for(let i=0; i<table.rows.length; i++) {
            currArgs[i] = $("#arg_"+i).val();
        }
        // clear table contents
        table.innerHTML = "";
        var taborder = 1005;
        // if there is a ruleDefinition, fill according to that
        if(ruleDefinition != undefined){
            // if there are defined arguments, use those
            if(ruleDefinition.arguments != null){
                var i = 0;
                for(argDef of ruleDefinition.arguments){
                    var row = table.insertRow(-1);
                    var cell1 = row.insertCell(0);
                    // Add some text to the new cells:
                    var cellContents = '<input id="arg_' + i + '" tabIndex="' + (taborder + i) + '" type="text" class="form-control" value="'+ argDef.name +'"/>';
                    //console.log(cellContents);
                    cell1.innerHTML = cellContents;
                    i++;
                }
            } else {
                // no defined arguments? - just look at arity
                for(let i=0; i<ruleDefinition.arity; i++) {
                    var row = table.insertRow(-1);
                    var cell1 = row.insertCell(0);
                    // Add some text to the new cells:
                    var cellContents = '<input id="arg_' + i + '" tabIndex="' + (taborder + i) + '" type="text" class="form-control" value="Arg'+ (i+1) +'"/>';
                    //console.log(cellContents);
                    cell1.innerHTML = cellContents;
                }
            }
        } else {
            // ignore what's there?
        }
    },

    // create AST node for the rule-heads, based on shapeData and RuleParsingContext, which contains everything else needed
    parseAsHead:function(shapeData, drawingPage, errorList){
        var rpc = new RuleParsingContext(drawingPage, shapeData, errorList);
        var data = shapeData.data;
        // parse the rule-shape itself - produce a RuleExpression
        var library = data.libraryName;
        var name = data.ruleName;
        var args = [];
        if(data.arguments.length > 0)
            var argIndex = 1;
            data.arguments.forEach(element => {
                var res = ShapeParsing.parseShapePrologText(rpc, shapeData, "Argument #" + argIndex, element);
                args.push(res);
                argIndex ++;
            });
        
        var pushbackExpressions = [];
        var argIndex = 1;
        data.pushback.forEach(a=>{
            // experimental parsing-code - later, make it so we don't have to create a new parser for each argument :) 
            // - store a parser in rpc
            var res = ShapeParsing.parseShapePrologText(rpc, shapeData, "Pushback #" + argIndex, a);
            pushbackExpressions.push(res);
            argIndex++;
        });
        var body = ShapeParsing.parseAllBelow(shapeData, rpc);
        return new DcgRuleExpression(library,name,args,pushbackExpressions,body);
    },

    // a dcg rule call/ reference is mostly just the same as a normal rule, except there can be a "pushback" part, and
    // also that it is signified by "-->" instead of ":-"
    parseToExpression:function(shapeData, rpc){
        var data = shapeData.data;
        var name = data.ruleName;
        var library = data.libraryName;
/*
        newShapeData.ruleName = selectedPredicateName;
        newShapeData.arguments = [];
        newShapeData.pushback = [];
*/
        // first, parse all the prolog-texts in the arguments
        var argumentExpressions = [];
        data.arguments.forEach(a=>{
            // experimental parsing-code - later, make it so we don't have to create a new parser for each argument :) 
            // - store a parser in rpc
            var tokens = Lexer.GetTokens(a);
            tokens = tokens.filter(t=>t.type != TokenType.Blankspace);
            var parser = new PrologParser(tokens);
            var res = parser.parseThis();
            argumentExpressions.push(res);
        });

        var pushbackExpressions = [];
        data.pushback.forEach(a=>{
            // experimental parsing-code - later, make it so we don't have to create a new parser for each argument :) 
            // - store a parser in rpc
            var tokens = Lexer.GetTokens(a);
            tokens = tokens.filter(t=>t.type != TokenType.Blankspace);
            var parser = new PrologParser(tokens);
            var res = parser.parseThis();
            pushbackExpressions.push(res);
        });

        // build and return a DcgRuleExpression
        var body = ShapeParsing.parseAllBelow(shapeData, rpc);
        return new DcgRuleExpression(library,name,argumentExpressions,pushbackExpressions,body);
    }

    });
