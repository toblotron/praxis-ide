var RuleShape = fabric.util.createClass(fabric.Group, {
    type: 'ruleShape',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });

        this.callSuper('initialize',[], options);
        this.set({ 
            originX: 'center',
            originY: 'center',
            objectCaching: false,
            strokeWidth:0
         });
        
         
        // TODO: when will these contained shapes be calculated?
        // - can we get drop-preview? (mark group border green, when we're going to drop on it)
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
           ]
        };

    },

    isInvalid:function(shapeData){
        if(shapeData.ruleName == "" || shapeData.ruleName == null)
            return true;
        else
            return false;
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
            shapeData = {ruleName:"ruleName", libraryName:"lib", arguments:["Argument1", "Argument2"]};
        }

        this.argumentRows = [];      

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
            this.libraryName = new fabric.Text(shapeData.libraryName,{fontSize:12,objectCaching: false, fill:'yellow',fontFamily:'arial'});
            if(isPreview){
                this.libraryRect.set({fill:'#555555', opacity:0.5});
                this.libraryName.set({opacity:0.5, fontStyle:'italic'});
            }
            
            this.ruleRect = new RoundedRect({fill:'#bb9988',topRight:[5,5],bottomRight:bottomCorner});
        }
        else {
            this.ruleRect = new RoundedRect({fill:'#bb9988',topLeft:[5,5],topRight:[5,5],bottomLeft:bottomCorner, bottomRight:bottomCorner});
        }
        

        this.ruleName = new fabric.Text(shapeData.ruleName,{fontSize:12, objectCaching: false, fontFamily:'arial', isPreview:isPreview});

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
        var libNames = app.libraries.map(x=>x.name);
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
        var predicateList = '<select id="predicateCombo" tabindex="1004" onchange="this.previousElementSibling.value=this.value; this.previousElementSibling.focus()">';
        predicateList += '</select>';

        view.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Rule'+
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

        tableString += '</tbody></table>';
        view.append(tableString);
        view.append(
        //'			<button id="cancel_button">Cancel</button>'+
        '			<button id="ok_button" tabIndex="1050">Ok</button>'+
        '			<button id="minus_button" tabIndex="1051">-</button>'+
        '			<button id="plus_button" tabIndex="1052">+</button>'+
        '   </div>');

        var exportCheckboxCode = "";
        var dynamicCheckboxCode = "";
        
        // only allow exporting rules without prefixes
        
        // pred signature can change since opened, so this code must always be there, but be hidden
        //if(userData.libraryName == ""){
            //var predicateId = userData.ruleName + "/" + userData.arguments.length; 
            exportCheckboxCode = 
            "   <br><br><div id='exportDiv'><input type='checkbox' id='exportRuleCheckbox' name='exportRuleCheckbox' value='export'";
            //if(Model.settings.exports.includes(predicateId))
            //    exportCheckboxCode += " checked";
            
            exportCheckboxCode += "><label for='export'>Exported</label></div></div>";

            dynamicCheckboxCode = 
            "   <div id='dynamicDiv'><input type='checkbox' id='dynamicRuleCheckbox' name='dynamicRuleCheckbox' value='dynamic'";
            //if(Model.settings.dynamic.includes(predicateId))
            //dynamicCheckboxCode += " checked";
            
            dynamicCheckboxCode += "><label for='dynamic'>Dynamic</label></div></div>";
        //}
        view.append(exportCheckboxCode +dynamicCheckboxCode+
                "</div></div>" +
            ' </div>'+
        '</div>');
            
        // automatically put query in querybox, when selected :)
        
        var page = app.getRulePage(CurrentViewedPageNr);
        var shape = page.shapes.find(f => f.id == figure.id);
        if(!pb["RuleShape"].isInvalid(shape)){
            var queryText = pb["RuleShape"].render(shape);
            //var queryField = document.getElementById("queryField");
            app.bottombar.queryCode.setValue(queryText + ".");
            //queryField.value = queryText + ".";
        }
        setTimeout(figure.openPanel(userData), 500);
        

        // event handlers

        // exportRuleCheckbox
        $("#exportRuleCheckbox").on("click", function(){
            var userData = app.view.getShapeModel(figure.id).data;
            var predicateId = userData.ruleName + "/" + userData.arguments.length; 
            var control = $("#exportRuleCheckbox")[0];
            if(control.checked){
                Model.settings.exports.push(predicateId);
            } else {
                Model.settings.exports = Model.settings.exports.filter(name=>name!= predicateId);
            }
        });

        // dynamicRuleCheckbox
        $("#dynamicRuleCheckbox").on("click", function(){
            var userData = app.view.getShapeModel(figure.id).data;
            var predicateId = userData.ruleName + "/" + userData.arguments.length; 
            var control = $("#dynamicRuleCheckbox")[0];
            if(control.checked){
                Model.settings.dynamic.push(predicateId);
            } else {
                Model.settings.dynamic = Model.settings.dynamic.filter(name=>name!= predicateId);
            }
        });

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

            var blockOkButton = false;

            // get possible rule definition
            var selectedLibraryName = $("#libraryListing").val();
            var library = app.libraries.find(x=>x.name == selectedLibraryName);
            if(library != undefined) {
                var ruleDefinition = library.predicates.find(p=>p.name == selectedRuleName && p.arity == selectedRuleArity);
                if(ruleDefinition != undefined)
                    figure.setArgumentList(userData, ruleDefinition);

                // adjust visibility of export & dynamic checkboxes
                figure.updatePredicateCheckboxes(userData);

                // library found - if it is external we should not be able to save this data, unless the selected rule is part of the library
                
                if(library.external && ruleDefinition == undefined){
                    blockOkButton = true;
                } 

                if(selectedRuleName == "")
                    blockOkButton = true;

            } 

            $("#ok_button").prop("disabled", blockOkButton);

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

            for(i = 0; i < nrArgumentRows; i++)
            {
                newShapeData.arguments[i] = $("#arg_"+i).val();
            }

            // see if ruleRef should be updated
            ruleDefTrySubmitRule(figure, newShapeData);
            
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
        });

        $("#plus_button").on("click", function(){
            console.log("plus clicked");
            // add row in table 
            var table = document.getElementById("arguments_table");
            var row = table.insertRow(-1);

            // Insert new cells (<td> elements)
            var cell1 = row.insertCell(0);

            // Add some text to the new cells:
            var cellContents = '<input id="arg_' + (table.rows.length-1) +'" tabIndex="' + (1005+table.rows.length-1) +  '" type="text" class="form-control" value="'+ 0 +'"/>';
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

        
       
    },

    // SET SELECTED LIBRARY - TRIGGERING FILLING OF PREDICATE LIST
    openPanel: function(userData){
        // set library
        var libCombo = document.getElementById("libraryCombo");
        libCombo.value = userData.libraryName;

        // set library text
        $("#libraryListing").val($("#libraryCombo option:selected").html()); // copy combo selection
                
        // fill predicate combo with methods of selected library
        this.updatePredicateList(userData);
    },

    updatePredicateCheckboxes: function(userData){
        // get rule name & arity from controls - may have been changed
        var table = document.getElementById("arguments_table");
        var nrArgumentRows = table.rows.length;
        var selectedPredicateName = $("#predicateListing").val();

        var predicateId = selectedPredicateName + "/" + nrArgumentRows; 
        //var predicateId = $("#predicateCombo option:selected").html();   // "rulename/arity"
        // update visibility/ checkedness from model data
        var libraryName = $("#libraryListing").val();

        // use divs for hiding/ showing
        var exportDiv = $("#exportDiv")[0];
        var dynamicDiv = $("#dynamicDiv")[0];
        
        // use controls for checking/ unchecking
        var exportControl = $("#exportRuleCheckbox")[0];
        var dynamicControl = $("#dynamicRuleCheckbox")[0];
        
        // check if the library/ predicate is defined as external (ly defined) - in that case we can't export/ dynamic-set it
        var library = app.libraries.find(x=>x.name == libraryName);
        var ruleDef = null;
        
        var allowSettingExportAndDynamic = false;
        if(libraryName == "")
            allowSettingExportAndDynamic = true;

        // see if we should allow setting export and dynamic
        if(library != undefined){
            ruleDef = library.predicates.find(r=>r.name == selectedPredicateName && r.arity == nrArgumentRows);
            if(ruleDef != undefined)
            {
                var isExternal = ruleDef.external;
                if(isExternal != undefined){
                    allowSettingExportAndDynamic = !isExternal;
                }
            }
        }

        if(selectedPredicateName == "")
            allowSettingExportAndDynamic = false;

        // only allow exporting/making dynamic rules without prefixes
        if(allowSettingExportAndDynamic){
            exportDiv.style.display = "block";
            dynamicDiv.style.display = "block";

            exportControl.checked = Model.settings.exports.includes(predicateId);
            dynamicControl.checked = Model.settings.dynamic.includes(predicateId);
        }
        else
        {
            exportDiv.style.display = "none";
            dynamicDiv.style.display = "none";
        }
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
                var predIds = library.predicates.map(x=>x.name + " /" + x.arity);
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

                //var taborder = 1005;

                // list existing predicates
                for(predId of predIds){
                    var option = document.createElement('option');
                    option.value = predId;
                    option.text=predId;
                    //option.tabIndex = taborder;
                    if(predId == currPredId)
                        option.selected = true;
                    container.appendChild(option);
                    //taborder++;
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

        // show export/dynamic checkboxes?
        this.updatePredicateCheckboxes(userData);

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

            // update export/dynamic checkboxes
            var predicateId = ruleDefinition.name + "/" + ruleDefinition.arity;
            
            var exportControl = $("#exportRuleCheckbox")[0];
            exportControl.checked = Model.settings.exports.includes(predicateId);
            
            var dynControl = $("#dynamicRuleCheckbox")[0];
            dynControl.checked = Model.settings.dynamic.includes(predicateId);

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
    }

    });

    // RoundedRect allows rounding each corner of a rect individually.
    const RoundedRect = new fabric.util.createClass(fabric.Rect, {
        type: "roundedRect",
        topLeft: [0, 0],
        topRight: [0, 0],
        bottomLeft: [0, 0],
        bottomRight: [0, 0],
    
        _render: function(ctx) {
        var w = this.width,
            h = this.height,
            x = -this.width / 2,
            y = -this.height / 2,
            /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */
            k = 1 - 0.5522847498;
        ctx.beginPath();
    
        // top left
        ctx.moveTo(x + this.topLeft[0], y);
    
        // line to top right
        ctx.lineTo(x + w - this.topRight[0], y);
        ctx.bezierCurveTo(x + w - k * this.topRight[0], y, x + w, y + k * this.topRight[1], x + w, y + this.topRight[1]);
    
        // line to bottom right
        ctx.lineTo(x + w, y + h - this.bottomRight[1]);
        ctx.bezierCurveTo(x + w, y + h - k * this.bottomRight[1], x + w - k * this.bottomRight[0], y + h, x + w - this.bottomRight[0], y + h);
    
        // line to bottom left
        ctx.lineTo(x + this.bottomLeft[0], y + h);
        ctx.bezierCurveTo(x + k * this.bottomLeft[0], y + h, x, y + h - k * this.bottomLeft[1], x, y + h - this.bottomLeft[1]);
    
        // line to top left
        ctx.lineTo(x, y + this.topLeft[1]);
        ctx.bezierCurveTo(x, y + k * this.topLeft[1], x + k * this.topLeft[0], y, x + this.topLeft[0], y);
    
        ctx.closePath();
    
        this._renderPaintInOrder(ctx);
    },

    
  })