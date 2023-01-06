praxis.ProjectSettings = Class.extend({
	
	init:function(element_id){
		this.self = this;
        this.html = $("#"+element_id);
        this.elem = document.getElementById(element_id);

        // for caching online-packages (js-format)
        this.runtimeCachedPackageFiles = [];
	},
	
    hide: function(){
        this.elem.style.display = "none";
        this.html.html("");     // erase page when hiding
    },

    show: function(){
        this.elem.style.display = "block";
        this.html.html("");
        this.html.append(this.buildPage());   // rebuild page when showing
        this.connectPage();
    },

    buildPage:function(){
        // Project  ---------------------------
        var prj = 
        "<h2>Project</h2>" + 
        "<p>" +
        "Name: <input id='settingsProjectName' type='text' onchange value='" + Model.name + "' /><div class='validationErrorMessage' id='validationMessageSettingsProjectName' />" +
        "</p>";

        // Exports ----------------------------
        // we can only export non-built-in predicates in the "root" (no prefix)
        var rootLibrary = app.libraries.find(lib=>lib.name=="");
        if(rootLibrary != undefined) // we may not have any rules, yet
        {
            var exports = 
            "<fieldset class='settingsSection'>"+
                "<legend class='settingsSection'>Exported predicates</legend>";
            rootLibrary.predicates.filter(p=>p.external == undefined).forEach(predicate => {
                var predicateId = predicate.name + "/" + predicate.arity;
                var predicateCode = 
                "<div class='listedLibrary'>" +
                    "<input type='checkbox' id='predicate:" + predicateId + "' name='predicates'  onclick='app.projectSettings.handlePredicateClick(this)' value='" + predicateId + "'";
                
                if(Model.settings.exports.includes(predicateId))
                    predicateCode += " checked";
        
                predicateCode += "><label for='" + predicateId + "'>" + predicateId +"</label>"+
                "</div>";

                exports += predicateCode;
            });
            exports += "</fieldset>";

            prj += exports;

            // Dynamic ----------------------------
            var dynamic = 
            "<fieldset class='settingsSection'>"+
                "<legend class='settingsSection'>Dynamic predicates</legend>";
            rootLibrary.predicates.filter(p=>p.external == undefined).forEach(predicate => {
                var predicateId = predicate.name + "/" + predicate.arity;
                var predicateCode = 
                "<div class='listedLibrary'>" +
                    "<input type='checkbox' id='dyn_predicate:" + predicateId + "' name='dyn_predicates'  onclick='app.projectSettings.handleDynPredicateClick(this)' value='" + predicateId + "'";
                
                if(Model.settings.dynamic.includes(predicateId))
                    predicateCode += " checked";
        
                predicateCode += "><label for='" + predicateId + "'>" + predicateId +"</label>"+
                "</div>";

                dynamic += predicateCode;
            });
            dynamic += "</fieldset>";

            prj += dynamic;
        }
        // Libraries --------------------------
        var tauLibraries = getTauPrologLibraries();

        var lib = 
        "<h2>Libraries</h2>";
        // go through the libraries available for Tau Prolog 
        var libCheckHTML = 
        "<fieldset class='settingsSection'>"+
            "<legend class='settingsSection'>Standard Tau-Prolog libraries</legend>";

        for(library of tauLibraries.filter(l => l.external == true)){
            var libraryCode = 
            "<div class='listedLibrary'>" +
                "<input type='checkbox' id='" + library.name + "' name='libraries'  onclick='app.projectSettings.handleClick(this)' value='" + library.name + "'";
            if(Model.settings.includedLibraries.includes(library.name))
                libraryCode += " checked";
            
                 libraryCode += "><label for='" + library.name + "'>" + library.name +"</label>" +
            "</div>";

            libCheckHTML += libraryCode;
        }
        libCheckHTML += "</fieldset>";
        lib += libCheckHTML;

        // Online libraries - "Add URL to .js-file containing a Tau-Prolog package (possibly containing several modules)"
        var oLibs = 
        "<fieldset class='settingsSection'>" +
            "<legend class='settingsSection'>Import online packages, select libraries</legend>" +
            "<div class='comment'>Add URL to .js-file containing a Tau-Prolog package (possibly containing several modules)</div>"+
            "<div class='onlinePackageList'><b>URL:</b> <input type='text' id='newImportUrl' value='https://raw.githubusercontent.com/toblotron/Trafo/master/Prolog/dcg-basic.js'> <button id='newImportButton'>Add</button></div>";

        // go through all the online packages that are included by the model
        if(Model.settings.onlinePackages == undefined)
            Model.settings.onlinePackages = [];
        Model.settings.onlinePackages.forEach(oLib => {
            // add [del]:url - "heading", for each package
            oLibs += "<div class='onlinePackageList'>";
            oLibs += "<div class='onlinePackageUrl'>" + oLib.url + "</div><button id='" + oLib.url + "' onclick='app.projectSettings.handleDeletePackage(this)'>Remove</button>"; 
            // add all modules, with checkboxes, like the normal modules above
            oLib.modules.forEach(module =>{
                var moduleCode = 
                "<div>" +
                    "<input type='checkbox' id='" + module.name + "' name='online_modules'  onclick='app.projectSettings.handleOnlineModuleClick(this)' value='" + module.name + "'";
                if(Model.settings.includedLibraries.includes(module.name))
                    moduleCode += " checked";
                
                    moduleCode += "><label for='" + module.name + "'>" + module.name +"</label>" +
                "</div></div>";
                oLibs += moduleCode;
            })
        })

        oLibs += "<br></fieldset>";

        return prj + lib + oLibs;
    },

    // clicking regular modules
    handleClick:function(event){
        var libraryName = event.id;
        if(event.checked){
            Model.settings.includedLibraries.push(libraryName);
        } else {
            Model.settings.includedLibraries = Model.settings.includedLibraries.filter(name=>name!= libraryName);
        }
        // ugly, but - recalculate which libraries should be shown
        ruleDefSetupOnModelLoad();
    },

    handleOnlineModuleClick:function(event){
        var libraryName = event.id;
        if(event.checked){
            Model.settings.includedLibraries.push(libraryName);
        } else {
            Model.settings.includedLibraries = Model.settings.includedLibraries.filter(name=>name!= libraryName);
        }
        // ugly, but - recalculate which libraries should be shown
        ruleDefSetupOnModelLoad();
    },

    handleDeletePackage:function(event){
        // event.id will contain the url of the package
        
        // get the imported package
        var package = Model.settings.onlinePackages.find(p=>p.url == event.id);

        // remove all these modules from Model.settings.includedLibraries, if they are included there
        for(module of package.modules){
            Model.settings.includedLibraries = Model.settings.includedLibraries.filter(name => name != module.name);
        }
        // remove from onlinepackages
        Model.settings.onlinePackages = Model.settings.onlinePackages.filter(p=>p.url != event.id);
        
        // remove file from cache
        app.projectSettings.runtimeCachedPackageFiles = app.projectSettings.runtimeCachedPackageFiles.filter(p=>p.url != event.id);

        app.projectSettings.show();    // will trigger complete rebuild of page
    },

    // selecting/ deselecting a predicate for export
    handlePredicateClick:function(event){
        var predicateId = event.id.split(":")[1]; // pickout "name/arity" from "predicateName:name/arity"
        if(event.checked){
            Model.settings.exports.push(predicateId);
        } else {
            Model.settings.exports = Model.settings.exports.filter(name=>name!= predicateId);
        }
        
    },

    // selecting/ deselecting a predicate for export
    handleDynPredicateClick:function(event){
        var predicateId = event.id.split(":")[1]; // pickout "name/arity" from "predicateName:name/arity"
        if(event.checked){
            Model.settings.dynamic.push(predicateId);
        } else {
            Model.settings.dynamic = Model.settings.exports.filter(name=>name!= predicateId);
        }
        
    },

    connectPage:function(){
        this.settingsProjectName = $("#settingsProjectName");
		this.settingsProjectName.change($.proxy(this.onModelNameChanged, this));
        
        this.validationErrorMessage =$("#validationMessageSettingsProjectName");
        
        this.newImportButton =$("#newImportButton");
        this.newImportButton.click($.proxy(this.onNewImportButton, this));

        //this.validationErrorMessage.style.display = "hidden";
    },

    parseModuleDefinitions:function(packageText){
        var moduleDefinitions = [];
        var pos = 0; // why no 0 work??
        var searchString = "var name = \'";
        while((pos = packageText.indexOf(searchString,pos)) > -1){
            var moduleDefinition = {};
            // first get the name
            var endPos = packageText.indexOf("\';", pos);
            var moduleName = packageText.substring(pos+searchString.length, endPos);
            pos = endPos + 3;
            moduleDefinition.name = moduleName

            // get start of the predicate definitions
            var predicatesSearchString = "var predicates = ";
            // get where we should start finding predicate definitions
            var predicateDefStart = packageText.indexOf(predicatesSearchString,pos)+predicatesSearchString.length;

            // get start of export-part
            var exportsSearchString = "var exports =";
            var exportsDefStart = packageText.indexOf(exportsSearchString, predicateDefStart); 

            var predicateDefStop = packageText.lastIndexOf(";",exportsDefStart);

            // get predicate definitions
            //var predicateDefinitions = packageText.substring(predicateDefStart, predicateDefStop);
            
            // get the JSON-ifyable part
            //var predJSONStart = packageText.indexOf("return", predicateDefStart);
            //var predJSONStop = packageText.lastIndexOf(";", predicateDefStop-1);
            //var predJSON = packageText.substring(predJSONStart, predJSONStop);
            
            
            // don't save this - we don't use it right now, and we don't want it polluting the Model file where this will be saved
            // moduleDefinition.predicates = new Function("(function (){"+predJSON+"})");

            // get exports-definition
            var exportsDefStop = packageText.indexOf(";", exportsDefStart);
            var exportsDefinitionText = packageText.substring(exportsDefStart+exportsSearchString.length,exportsDefStop);
            var exportsDefinitionList = JSON.parse(exportsDefinitionText);
            var predicateDefinitions = []; // will store predicates in the same way used for other libraries
            for(predicateSignature of exportsDefinitionList)
            {
                // "test/2"
                var parts = predicateSignature.split("/");  // Number below to get int of arity
                var predicateDefinition = {name:parts[0], arity:Number(parts[1]),arguments:[]};
                for(argIndex=0; argIndex<predicateDefinition.arity; argIndex++){
                    predicateDefinition.arguments.push({name:"Arg"+argIndex});
                }
                predicateDefinitions.push(predicateDefinition);
            }
            /*{
                name:"test",
                arity: 2,
                arguments: [
                    {name: "Num"},
                    {name: "Svar"}
                ],
                description: "Is Num liten or stor?",
                external: true
            }]*/

            moduleDefinition.external = true;
            moduleDefinition.predicates = predicateDefinitions;   // make it into a valid list, immediately

            moduleDefinitions.push(moduleDefinition);
        }

        return moduleDefinitions;
    },

    onNewImportButton:function(){
        var url = $("#newImportUrl").val();
        app.projectSettings.recursiveImportPackages([url],[],this.newImportDone);  
    },

    newImportDone:function(packageDefinitions){
        // rebuild the page
        app.projectSettings.show();    // will trigger complete rebuild of page
    },

    // get a package, identified by URL - make sure it is loaded into the DOM
    // if we have it cached, there's not much to do, but otherwise load and process it
    // should return a package-definition, containing module-definitions
    recursiveImportPackages:function(url_list, packageDefinitions, whenDone){

        if(url_list.length == 0)
        {
            whenDone(packageDefinitions); // perform the exit-action - always pass along the packageDefinitions
            return;
        }

        var url = url_list.shift(); // remove first element

        // check if this package has been cached
        var cachedPackage = this.runtimeCachedPackageFiles.find(p=>p.url == url);
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
                //console.log("PIMPORT: testeval:" + testeval);
                
                // we succeeded in loading and (basically) parsing the (presumed!) package-js-file 
                // runtime-cache it in the closest singleton app-object, so we can avoid loading it again
                var runtimeCache = {url:url, packageText: result};
                app.projectSettings.runtimeCachedPackageFiles.push(runtimeCache);

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
                app.projectSettings.recursiveImportPackages(url_list,packageDefinitions,whenDone);
            }});
        } else {
            // get packageDefinition from Model - it should be there, in this case
            packageDefinition = Model.settings.onlinePackages.find(p=>p.url == url);

            // eval the code of the tau-prolog package, loading it into the global dom
            // NOPE! When we get here, it should alreday have been loaded by the case above

            packageDefinitions.push(packageDefinition);
            app.projectSettings.recursiveImportPackages(url_list, packageDefinitions,whenDone);
        }
    },

    onModelNameChanged:function(event){
		var newName = this.settingsProjectName.val();
		
		if(newName != Model.name){
			if(this.validateModelName(newName)){
                Model.name = newName;
			    app.treemenu.rebuildTree();
            }
		}
	},

    validateModelName:function(name){
        var invalid = false;
        // must be a prolog atom  - first letter lowercase alphabetic, the rest alphabetic, numeric or _
        if(!this.isLowercase(name.charAt(0)))
            invalid = true;
        var index = 1;
        while(index < name.length)
        {
            var c = name.charAt(index);
            if(!(this.isNumeric(c) || this.isAlphabetic(c) || c == '_'))
                invalid = true;
            index++;
        }

        if(invalid){
            this.validationErrorMessage.text("This must be a Prolog atom; beginning with a lower-case letter, followed only by alphanumeric characters and '_'");
            //this.validationErrorMessage.style.display = "block";
            return false;
        }
        else
        {
            this.validationErrorMessage.text("");
            //this.validationErrorMessage.style.display = "hidden";
            return true;
        }
    },

    isNumeric:function(c){
        var code = c.charCodeAt(0);
        return (code > 47 && code < 58);
    },

    isLowercase:function(c){
        return c.toLowerCase() != c.toUpperCase() && c.toLowerCase() == c;
    },

    isAlphabetic:function(c){
        return c.toLowerCase() != c.toUpperCase();
    }


});