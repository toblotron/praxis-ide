/*
This class handles the bottom bar:
- Save button + filename
- Load-button
// Query execution and results display
*/

praxis.BottomBar = Class.extend({
	
	init:function(element_id){
		this.self = this;
        this.html = $("#"+element_id);
		this.previous_break = true; // did the previous addition to console add a BR? 
		//self = this;

		// tabs for the bottom bar
		$( "#bottomtabs" ).tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
		$( "#bottomtabs li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

        this.fileSelector = document.getElementById('fileField');
		this.fileSelector.addEventListener('change', $.proxy(this.handleFileSelect,this));
		
		this.uploadProxyButton =$("#uploadProxyButton");
		this.uploadProxyButton.click($.proxy(this.onProxyUploadButton, this));

		this.saveButton  = $("#saveButton");
		this.saveButton.click($.proxy(this.saveFile,this));

		this.downloadCodeButton = $("#downloadCodeButton");
		this.downloadCodeButton.click($.proxy(this.downloadCode,this));

		this.downloadModuleButton = $("#downloadModuleButton");
		this.downloadModuleButton.click($.proxy(this.downloadModule,this));

		//this.queryField = $("#queryField");
		//var value = document.getElementById("queryField").innerHTML.replace(/&lt;/g,"<").replace(/&gt;/g,">");
        document.getElementById("queryField").innerHTML = "";
	    queryCode = CodeMirror(document.getElementById("queryField"), {
			//value: value,
			lineNumbers: false,
			theme: "tau",
			viewportMargin:5,
			lineWrapping: true,
			placeholder: "Your query here...",
			//autofocus: true,
			mode: "prolog"
		});
		this.queryCode = queryCode;
		//queryCode.setSize("400px", queryCode.defaultTextHeight() + 2 * 2);

		queryCode.setOption("extraKeys", {
			Tab: function(cm) {
			  app.bottombar.queryButton.focus();
			},
			Enter: function(cm) {
				app.bottombar.onQueryButtonClick();
				app.bottombar.nextButton.focus();
			  },
			Down: function(cm){
				console.log("hit arrow down!");
			}
		  });
		
		queryCode.on("beforeChange", function(instance, change) {
			var newtext = change.text.join("").replace(/\n/g, ""); // remove ALL \n !
			change.update(change.from, change.to, [newtext]);
			return true;
		});
		
		queryCode.on("focus", function(instance, event){
			queryCode.focus();
			// Set the cursor at the end of existing content
			queryCode.setCursor(queryCode.lineCount(), 0);
		});
/*
		// and then hide ugly horizontal scrollbar
		queryCode.on("change", function(instance, change) {
			//$(".CodeMirror-vscrollbar").css('display', 'none !Important');
			// (!) this code is using jQuery and the selector is quite imperfect if
			// you're using more than one CodeMirror on your page. you're free to
			// change it appealing to your page structure.
		});
*/		
		// the following line fixes a bug I've encountered in CodeMirror 3.1
		$(".CodeMirror-scroll").css('overflow', 'hidden');
		$(".CodeMirror").css('height', 'auto');
		var minheight = (queryCode.defaultTextHeight() + 2 * 2);
		$(".CodeMirror").css('min-height',minheight );
		$(".CodeMirror").css('max-height',"50px" );
		
		$(".CodeMirror-scroll").css('max-height', '50px');
		$(".CodeMirror-scroll").css('height', 'auto');
		//$(".CodeMirror-vscrollbar").css('overflow-y', 'hidden');
		//$(".CodeMirror-scroll").css('display', 'contents'); // avoid the overhanging area that stopped buttons from being pressed!
		//$(".CodeMirror-hscrollbar").css('display', 'none');
		this.resetButton = $("#resetButton");
		this.resetButton.click($.proxy(this.onResetButtonClick,this));

		this.queryButton = $("#queryButton");
		this.queryButton.click($.proxy(this.onQueryButtonClick,this));

		this.nextButton  = $("#nextButton");
		this.nextButton.click($.proxy(this.onNextButtonClick,this));
		this.nextButton[0].disabled = true;

		this.executionLimitField = $("#executionLimit");
		this.executionLimitField.change($.proxy(this.onExecutionLimitChanged, this));

		this.executionTimer = document.getElementById("executionTimer");

		//this.executionLimitField[0].innerText = "300";

		//this.codeConsole  = $("#codeConsole");
		/*codeConsole = CodeMirror.fromTextArea(document.getElementById("codeConsole"), {
			//value: value,
			lineNumbers: false,
			theme: "tau",
			placeholder: "...",
			mode: "prolog"
		});
		this.codeConsole = codeConsole;
		codeConsole.setSize("calc(100%)", "calc(100%)");
*/
		this.output = $("#output");

		this.errorList =[];

		this.setupErrorTable();

		this.modtext = "var pl;" + 
		"(function( pl ) {"+
		"	// Name of the module"+
		"	var name = 'my_module';"+
		"	// Object with the set of predicates, indexed by indicators (name/arity)"+
		"	var predicates = function() {"+
		"		return {"+
		"			'test/2': [new pl.type.Rule(new pl.type.Term('test',"+
		"				[new pl.type.Var('A'),new pl.type.Var('Svar')"+
		"				]), new pl.type.Term(';',"+
		"				[new pl.type.Term('->',"+
		"					[new pl.type.Term(',',"+
		"						[new pl.type.Term('<',"+
		"							[new pl.type.Var('A'),new pl.type.Num(1, false)"+
		"							]),new pl.type.Term('=',"+
		"							[new pl.type.Var('Svar'),new pl.type.Term('litet',"+
		"								[])"+
		"							])"+
		"						]),new pl.type.Term('true',"+
		"						[])"+
		"					]),new pl.type.Term(\';',"+
		"					[new pl.type.Term('->',"+
		"						[new pl.type.Term('=',"+
		"							[new pl.type.Var('Svar'),new pl.type.Term('stort',"+
		"								[])"+
		"							]),new pl.type.Term('true',"+
		"							[])"+
		"						]),new pl.type.Term('false',"+
		"						[])"+
		"					])"+
		"				]))"+
		"			]"+
		"		};"+
		"	};"+
		"	// List of predicates exported by the module"+
		"	var exports = ["+
		"		'test/2'"+
		"	];"+
		"	// DON'T EDIT"+
		"	if( typeof module !== 'undefined' ) {"+
		"		module.exports = function(tau_prolog) {"+
		"			pl = tau_prolog;"+
		"			new pl.type.Module( name, predicates(), exports );"+
		"		};"+
		"	} else {"+
		"		new pl.type.Module( name, predicates(), exports );"+
		"	}"+
		"})( pl );"
	},
	
/*
	// local version of this method, because things are craaazy,..
	recursiveImportPackages:function(url_list, packageDefinitions, whenDone){

        if(url_list.length == 0)
        {
            whenDone(packageDefinitions); // perform the exit-action - always pass along the packageDefinitions
            return;
        }

        var url = url_list.shift(); // remove first element

        // check if this package has been cached
        var cachedPackage = undefined; //this.runtimeCachedPackageFiles.find(p=>p.url == url);
        var packageDefinition = null;
        
        // we don't have this cached, yet - so process and cache it
        if(cachedPackage == undefined){
            // try importing this library as text -- "https://raw.githubusercontent.com/toblotron/Trafo/master/Prolog/my_module.js"
            $.ajax({url: url, async: true, success: function(result){
                
                console.log("PIMPORT: IMPACKAGE FINISHED LOADING");

                // try to parse the file - and get a list of the module definitions
                var moduleDefinitions = app.projectSettings.parseModuleDefinitions(result);

                // eval the code of the tau-prolog package, loading it into the global dom
                // Yes, yes, I know it's bad practice, but it will have to do for now, until someone tells me a better way of loading it :)
                window.eval(result);   // use the WINDOW.eval - otherwise we won't get access to the pl-namespace variable
                console.log("PIMPORT: PACKAGE IMPORTED");
                
                // we succeeded in loading and (basically) parsing the (presumed!) package-js-file 
                // runtime-cache it in the closest singleton app-object, so we can avoid loading it again
                //var runtimeCache = {url:url, packageText: result};
                //app.projectSettings.runtimeCachedPackageFiles.push(runtimeCache);

                // construct the packageInfoStructure that is to be stored (and saved) in the Model
                if(Model.settings.onlinePackages == undefined)
                    Model.settings.onlinePackages = [];

                // only put into the model if it isn't already there 
                var cachedPackageDefinition = Model.settings.onlinePackages.find(p=>p.url == url);
                if(cachedPackageDefinition == undefined){
                    packageDefinition = {url:url, modules: moduleDefinitions};
                    Model.settings.onlinePackages.push(packageDefinition);
                } else {
                    packageDefinition = cachedPackageDefinition;
                }

                packageDefinitions.push(packageDefinition);
                app.bottombar.recursiveImportPackages(url_list,packageDefinitions,whenDone);
            }});
        } else {
            // get packageDefinition from Model - it should be there, in this case
            packageDefinition = Model.settings.onlinePackages.find(p=>p.url == url);
            packageDefinitions.push(packageDefinition);
            app.bottombar.recursiveImportPackages(url_list, packageDefinitions,whenDone);
        }
    },*/

	loadingFinishedTest:function(packages){
		console.log("finished loading test");
	},

	
	setQueryFieldFocus(){
		app.bottombar.queryCode.focus();
		//app.bottombar.queryCode.execCommand("selectAll");
	},

	onNextButtonClick:function(){
		//this.recursiveImportPackages(["https://raw.githubusercontent.com/toblotron/Trafo/master/Prolog/my_module.js"],[],this.loadingFinishedTest);
		var session = this.session;
	
		session.answer({
			success: function(answer) { 
				console.log(session.format_answer(answer)); 
				//var oldText = app.bottombar.codeConsole.getValue();
				var newText = session.format_answer(answer);
				app.bottombar.addToConsole(newText);//$("#codeConsole")[0].value += session.format_answer(answer)+ '\n'; 
					
				//$("#codeConsole")[0].value += session.format_answer(answer) + '\n';
			},
			error:   function(err) { // Uncaught error
				console.log("Execution error: " + err);
				app.bottombar.addToConsole("Execution error: " + err + '\n');
			},
			fail:    function() { // Fail  
				app.bottombar.addToConsole("false");
			},
			limit:   function() { // Limit exceeded 
				app.bottombar.addToConsole("Limit exceeded" + '\n');
			}
		})
	},
	
	onExecutionLimitChanged:function(event){
		var newLimit = this.executionLimitField.val();
		var newNumber = parseInt(newLimit);

		if(newNumber == undefined || newNumber < 1)
		{
			this.executionLimitField.value = model.settings.executionLimit;
		}
		else
		{
			Model.settings.executionLimit = newNumber;
		}
	},

	onResetButtonClick:function(){
		
		// just check that all packages that are supposed to be imported for this model are imported into the DOM, or already have been
		var url_list = [];
		// clear console
		$("#output")[0].innerHTML = "";
		this.nextButton[0].disabled = true;
		if(Model.settings.onlinePackages != undefined){
			for(package of Model.settings.onlinePackages){
				// either load package, or verify that it has been loaded
				// app.projectSettings.importPackage(package.url);
				url_list.push(package.url);
			}
		}
		if(url_list.length > 0){
			app.projectSettings.recursiveImportPackages(url_list,[],this.makeFirstCall);
		} else {
			this.recompile();
		}
		
	},

	recompile:function(){
		// recalculate which shapes are contained by groups
		app.view.calculatePageGroupContainment();
			
		var self = app.bottombar;

		self.errorList = [];
		var code = generateCode();
		self.updateErrorTable();

		console.log(code);
		
		var executionLimit = Model.settings.executionLimit;
		if(executionLimit == undefined)
			executionLimit = 500;

		var session = pl.create(executionLimit);
		
		// direct output
		session.streams.user_output = new pl.type.Stream({
			put: function( text, _ ) {
				app.bottombar.new_message( text );
				return true;
			},
			flush: function() {
				return true;
			} 
		}, "write", "user_output", "text", false, "eof_code");
		session.standard_output = session.streams["user_output"];
		session.current_output = session.streams["user_output"];

		self.session = session;

		session.consult(code, {
			success: function() { 
				/* Program parsed correctly */ 
				console.log("LOADING SUCCESSFUL");
				//$("#codeConsole")[0].value = "";
				app.bottombar.clearConsole();
				// print listing
				/*session.query("listing.", {
					success: function(goal) { 
						session.answer({
							success: function(answer) { 
								console.log(session.format_answer(answer));
								$("#codeConsole")[0].innerHTML += "listing performed: " + session.format_answer(answer)+ '\n'; 
								console.log(session.compile());
							},
							error:   function(err) { // Uncaught error  
								console.log("Execution error: " + err);
								$("#codeConsole")[0].innerHTML += "Execution error: " + err + '\n';
							},
							fail:    function() { // Fail  
								$("#codeConsole")[0].innerHTML += "false" + '\n';
							},
							limit:   function() { // Limit exceeded  
								$("#codeConsole")[0].innerHTML += "Limit exceeded" + '\n';}
						}) 
					},
					error: function(err) { 
						// Error parsing goal  
						console.log("parsing error: " + err);
						$("#codeConsole")[0].innerHTML += "parsing error: " + err + '\n';
					}
				});*/
			},
			error: function(err) { 
				/* Error parsing program */ 
				console.log("ERROR LOADING PROGRAM: " + err);
				app.bottombar.addToConsole("error = " + err);
			}
		});
	},

	new_message:function(msg) {
		msg = msg.replace(/\n/g, "<br />");
		msg = "<div class='output_text'>" + msg + "</div>";
		this.addToConsole(msg,false);
	},

	onQueryButtonClick:function(){
		
		if(this.session == null)
			this.recompile();
				
		this.makeFirstCall([]);	
	},

	clearConsole:function(){
		//app.bottombar.codeConsole.setValue("");
		app.bottombar.output.innerHTML = "";
		this.previous_break = true;
	},

	addToConsole:function(newText, addNewline = true){
		//var oldText = app.bottombar.codeConsole.getValue();
		var self = app.bottombar;

		//app.bottombar.codeConsole.setValue(oldText + newText+'\n');

		// add new line before, if previous write was unbroken, and this one should be broken
		if(self.previous_break == false && addNewline == true)
			newText = "<br>" + newText;
		// add new line after, if this line should be broken
		if(addNewline)
			newText += "<br>";
			

		self.output.append(newText);
		var mydiv = $("#output")[0];
		mydiv.scrollIntoView(false);
		mydiv.scrollTop = mydiv.scrollHeight;

		self.previous_break = addNewline;
		// scroll to bottom
		//var scrollInfo = app.bottombar.codeConsole.getScrollInfo();
		//app.bottombar.codeConsole
	},

	makeFirstCall:function(packageDefinitions){
		// get query
		var queryText = app.bottombar.queryCode.getValue();//document.getElementById("queryField").value;
		app.bottombar.addToConsole("> " + queryText);
		if(this.session == null)
		{
			var session = pl.create();
			this.session = session;
		}
		var session = this.session;
		
		// start timing call
		app.bottombar.executionStartTime = Date.now();
		
		session.query(queryText, {
			success: function(goal) { 
				session.answer({
					success: function(answer) { 
						app.bottombar.executionStopTime = Date.now();
						app.bottombar.executionTimer.innerHTML = "execution-time: " + (app.bottombar.executionStopTime - app.bottombar.executionStartTime);
						var newText = session.format_answer(answer);
						app.bottombar.rememberQuery(queryText);
						app.bottombar.nextButton[0].disabled = false;
						app.bottombar.addToConsole(newText);//$("#codeConsole")[0].value += session.format_answer(answer)+ '\n'; 
					},
					error:   function(err) { /* Uncaught error */ 
						console.log("Execution error: " + err);
						app.bottombar.addToConsole("Execution error: " + err + '\n');
					},
					fail:    function() { /* Fail */ 
						app.bottombar.addToConsole("false" + '\n');
					},
					limit:   function() { /* Limit exceeded */ 
						app.bottombar.addToConsole("Limit exceeded" + '\n');
					}
				}) 
			},
			error: function(err) { 
				/* Error parsing goal */ 
				console.log("parsing error: " + err);
				app.bottombar.addToConsole("parsing error: " + err + '\n');
			}
		});
	},

	// remember queries entered through the console
	rememberQuery:function(queryText){
		/*if(Model.settings.queries == undefined)
			Model.settings.queries = [];

		Model.settings.queries = Model.settings.queries.unshift(queryText);

		if(Model.settings.queries.length > 10);
			Model.settings.queries = Model.settings.queries.pop();
*/
	},

	saveFile:function(){
		// object we want to save
		var myObject = Model; //{ name: "simon", surname: "goellner" };  
		// convert to json string
		var myJSON = JSON.stringify( myObject ); 
		// create a link DOM fragment
		var $link = $("<a />");  
		// encode any special characters in the JSON
		var text = encodeURIComponent( myJSON );
		var filename = Model.name + ".json";
		
		$link
		.attr( "download", filename )
		.attr( "href", "data:application/octet-stream," + text )
		.appendTo( "body" )
		.get(0)
		.click() 
	},

	downloadCode:function(){
		var code = generateCode();
		var filename = Model.name + ".pl";
		var $link = $("<a />");  
		// encode any special characters in the JSON
		var text = encodeURIComponent( code );

		$link
		.attr( "download", filename )
		.attr( "href", "data:application/octet-stream," + text )
		.appendTo( "body" )
		.get(0)
		.click() 
	},

	// download an entire Tau-prolog package, in JS-form, possibly containing several modules
	// (right now Praxis only works with One, though)
	downloadModule:function(){

		var code = generateCode();
		var session = pl.create();
		
		session.consult(code, {
			success: function() { 
				/* Program parsed correctly */ 
				console.log("LOADING SUCCESSFUL");
			},
			error: function(err) { 
				/* Error parsing program */ 
				console.log("ERROR LOADING PROGRAM: " + err);
			}
		});

		var predicateCode = session.compile();

		var packageStartText = 
		"var pl;\n" +
		"(function( pl ) {\n" +
		"	// Name of the module\n" +
		"	var name = '" + Model.name + "';\n" +
		"	// Object with the set of predicates, indexed by indicators (name/arity)\n" +
		"	var predicates = function() {\n" +
		"	return";
		
		var packageEndText = 
		"};\n// List of predicates exported by the module\n" +
		"var exports = " + JSON.stringify(Model.settings.exports) + ";\n" +
		"// DON'T EDIT\n" +
		"if( typeof module !== 'undefined' ) {\n" +
		"	module.exports = function(tau_prolog) {\n" +
		"		pl = tau_prolog;\n" +
		"		new pl.type.Module( name, predicates(), exports );\n" +
		"	};\n" +
		"} else {\n" +
		"	new pl.type.Module( name, predicates(), exports );\n" +
		"}\n" +
		"})( pl );";
	
		var packageCode = packageStartText + predicateCode + packageEndText;

		var filename = Model.name + ".js";
		var $link = $("<a />");  
		// encode any special characters in the JSON
		var text = encodeURIComponent( packageCode );

		$link
		.attr( "download", filename )
		.attr( "href", "data:application/octet-stream," + text )
		.appendTo( "body" )
		.get(0)
		.click()
	},

	onProxyUploadButton:function(){
		this.fileSelector.click();
	},

	handleFileSelect:function(event) {
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
		  var model = JSON.parse(event.target.result);
		  app.bottombar.nextButton[0].disabled = false;
		  ///if(app.bottombar.validateModel(model))
		  ///{
		  app.setModel(model);
			//.enterPage app.enterPage(app.view, 0);
			//*/
		  ///}
        }
        var file = event.target.files[0];
        fileReader.readAsText(file);
	  },

	// check that this model contains info in the right format
	validateModel: function(model)
	{
		if(model.formatVersion != 0.2) return false;
		if(model.name == undefined) return false;

		
		return true;
	},


	/*onModelNameChanged:function(event){
		var newName = this.modelName.val();
		
		if(newName != Model.name){
			Model.name = newName;
			app.treemenu.rebuildTree();
		}
	},
*/
	submitMessage:function(message)
	{
		/* 
		classification, // "warning" / "error"
		occasion, // "validation" / "compilation"
		title, // short description
		description, // detailed description
		resourceType, // "rules", "table"...
		resourceId // index of resource (page/etc)
		targetType // "shape", "connection"..
		targetId // id of target entity
		*/
		// do not accept doubles
		if(this.errorList.find(e => e.resourceType == message.resourceType && e.resourceId == message.resourceId && e.description == message.description) == undefined){
			// add to list
			this.errorList.push(message);
		}
	},

	// re-initialize error-table, with the data from errorList
	updateErrorTable:function(){
		var data = [];
		for(row of this.errorList){
			var newRow = [];
			newRow.push(row.classification);
			newRow.push(row.title);
			if(row.resourceType == "rules")
				newRow.push(app.getRulePage(row.resourceId).name); //row.targetIndex);
			else 
				newRow.push("n/a");
			newRow.push(row.description);
			data.push(newRow);
		}
		this.errorTable.setData(data);

		// update tab text to show number of errors/messages
		var elem = $("#bottomtab-3")[0];
		elem.innerHTML = "Errors (" + this.errorList.length + ")";
	},

	onMessageClicked:function(rowNr){
		var message = this.errorList[rowNr-1];
		
		if(message.resourceType == "rules"){
			app.view.showMessageTarget(message);
			app.treemenu.selectFromMessage(message);
		}
		//alert("row nr " + rowNr);
	},

	// create table for error/warning-listings
	setupErrorTable:function()
	{
		var data = [
		];
		 
		var customColumn = {
			// Methods
			closeEditor : function(cell, save) {
				return cell.innerHTML;
			},
			openEditor : function(cell) {
				// Create input
				var element = document.createElement('input');
				element.value = cell.innerHTML;
				//alert(cell.innerHTML); // dummy to catch click-event
				var r = app.bottombar.errorTable.getSelectedRows()[0].rowIndex;
				app.bottombar.onMessageClicked(r);
			},
			getValue : function(cell) {
				return cell.innerHTML;
			},
			setValue : function(cell, value) {
				cell.innerHTML = value;
			}
		};

		this.errorTable = jspreadsheet(document.getElementById('MyOtherTable'), {
			data:data,
			allowInsertRow: false,
			allowManualInsertRow: false,
			allowDeleteRow: false,
			allowDeleleColumn: false,
			defaultColAlign:"left",
			allowInsertColumn:false,
			allowManualInsertColumn: false,

			columns: [
				{
					type: 'text',
					title:'Type',
					width:60,
					editor:customColumn
				},
				{
					type: 'text',
					title:'Problem',
					width:100,
					editor:customColumn
				},
				{
					type: 'text',
					title:'Where',
					width:200,
					editor:customColumn
				},
				{
					type: 'text',
					title:'Description',
					width:800,
					editor:customColumn
				}
			 ]
		});

this.errorTable.hideIndex();
		/*
		var options = {
            editable: false,
            enableCellNavigation: true,
            enableColumnReorder: false,
            enableAddRow: false
        };
    
		var columns = [
			{id: "title", name: "Title", field: "title"},
    {id: "duration", name: "Duration", field: "duration"},
    {id: "%", name: "% Complete", field: "percentComplete"},
    {id: "start", name: "Start", field: "start"},
    {id: "finish", name: "Finish", field: "finish"},
    {id: "effort-driven", name: "Effort Driven", field: "effortDriven"}
		];

		var data = [];
    for (var i = 0; i < 500; i++) {
      data[i] = {
        title: "Task " + i,
        duration: "5 days",
        percentComplete: Math.round(Math.random() * 100),
        start: "01/01/2009",
        finish: "01/05/2009",
        effortDriven: (i % 5 == 0)
      };
    }
        this.errorTable = new Slick.Grid("#MyOtherTable", data, columns, options);
*/
		//grid.render();
        /*var size = columns.length;
        for(i = 0; i < size; i++)
        {
            var colname = $("#col_"+i+"_name").val();
            var coltype = $("#col_"+i+"_type").val();
    
            // save these if the col already exists
            if(columns[i].id == undefined) {
                columns[i].id = colname.toLowerCase();
                columns[i].field = colname.toLowerCase();
            }
    
            columns[i].name = colname;
            columns[i].content = coltype;
    
            // {id: "name", name: "Name", field: "name", content:"string"},
        }*/
	}

});