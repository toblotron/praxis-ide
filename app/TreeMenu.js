/*
This class handles the project tree-menu and everything connected to it
*/

praxis.TreeMenu = Class.extend({
	
	init:function(canvas_element_id){
		
        this.rebuildTree(canvas_element_id);

        // handle import of CSV file
        this.fileSelector = document.getElementById('importCSVFile');
		this.fileSelector.addEventListener('change', $.proxy(this.handleCSVFileSelect,this));

	},

    handleCSVFileSelect:function(event) {
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
		    var table = app.importCSV(event.target.result);
        
            var newPage = app.treemenu.addNewDataTable(table);

            // try to get the name from the filehandler
            var filename = app.treemenu.fileSelector.value;
            var lastBackslash = filename.lastIndexOf("\\");
            var lastFullstop = filename.lastIndexOf(".");
            filename = filename.substring(lastBackslash+1,lastFullstop);

            if(filename != undefined)
                newPage.name = filename;

            var newNodeData = {title:newPage.name + " /"+ newPage.columns.length, type:'table', page:newPage.id,icon: "tree_table"}
            
            //var tree = $("#tree").fancytree("getTree");
            //var selNodes = tree.getSelectedNodes();

            // get currently selected node
            var node = $('#tree').fancytree('getTree').activeNode;

            var newNode = node.addChildren(newNodeData);

            // select the new page in the menu-tree
            app.treemenu.selectFromMessage({resourceType:'table',resourceId:newPage.id});
            
            // go edit it in the drawing page
            app.enterTable(newPage.id, newNode);

            app.treemenu.copyStructureFromTree(); // needed because this event turns out differently from normal adding of page/table
        }
        var file = event.target.files[0];
        fileReader.readAsText(file);
	  },

    // removes any present tree-menu, and rebuilds it from Model-structure
    rebuildTree:function(canvas_element_id){
        
        // build tree from model
        // "tree" is a dynamically added element, to achieve complete removal, when needed

        // remove any present tree-menu
        $("#tree").remove();
        // add new element dynamically
        $("#treeKeeper").append('<div id="tree" style="text-align: left; background-color: white;"></div>');
        var treek = $("#treeKeeper");
        treek[0].style.zIndex = 999; // bring this to top

        var myTree = this.addRecursive(Model.pageIndexTree);
        var modelTree = [{title:"<b>"+Model.name+"</b><img src='./gfx/settings.png' width='16px' height='16px' />" ,type:"root",folder:true,children:myTree,page:"settings"}];  
        
        $("#tree").fancytree({
            checkbox: false,
            extensions: ['contextMenu','dnd'],
            source: modelTree,
            activate: function(event, data){
                if(data.node.data.page != undefined && app.treemenu.suspendSelection == null){
                    app.treemenu.deselectAll();
                    if(data.node.data.type == 'rules'){
                        app.enterPage(data.node.data.page);
                    }
                    else if(data.node.data.type == 'table'){
                        app.enterTable(data.node.data.page, data.node);
                    }
                    /*else if(data.node.data.type == 'struct'){
                        app.enterStruct(data.node.data.page, data.node);
                    }*/
                    else if(data.node.data.type == 'root'){
                        app.enterSettings(app.view, data.node);
                    }
                }
                else if(data.node.data.type == 'folder')
                {
                    app.enterFolder(data.node);
                }
            },
            dnd: {
                autoExpandMS: 400,
                focusOnClick: true,
                preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
                preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
                dragStart: function(node, data) {
                  /** This function MUST be defined to enable dragging for the tree.
                   *  Return false to cancel dragging of node.
                   */
                  return true;
                },
                dragEnter: function(node, data) {
                  /** data.otherNode may be null for non-fancytree droppables.
                   *  Return false to disallow dropping on node. In this case
                   *  dragOver and dragLeave are not called.
                   *  Return 'over', 'before, or 'after' to force a hitMode.
                   *  Return ['before', 'after'] to restrict available hitModes.
                   *  Any other return value will calc the hitMode from the cursor position.
                   */
                  // only allow drop on folder or root
                  var target = node;
                  // console.log("target:" + target.data.type);
                  if(target.data.type == 'folder')// || target.data.type == 'root')){
                  {  
                    return true;
                  } else if (target.data.type != 'root')
                  {
                    return ["after","before"];
                  } else if(target.data.type == 'root')
                  {
                      return ["after","over"];
                  }

                  // Prevent dropping a parent below another parent (only sort
                  // nodes under the same parent)
        /*           if(node.parent !== data.otherNode.parent){
                    return false;
                  }'*/
                  // Don't allow dropping *over* a node (would create a child)
                  // return ["after", "over"];
        
                   return true;
                },
                dragDrop: function(node, data) {
                  /** This function MUST be defined to enable dropping of items on
                   *  the tree.
                   */
                  data.otherNode.moveTo(node, data.hitMode);
                  
                    app.treemenu.copyStructureFromTree();
                }
              },
            contextMenu: {
                menu: 
                    function(node){
                        if (node.data.type == 'folder'){                 
                          return {
                            'add_page': {'name': 'Add rules page', 'icon': 'add'},
                            'add_table': {'name': 'Add data table', 'icon': 'addtable'},
                            'import_csv': {'name': 'Import CSV table', 'icon': 'addtable'},
                            //'add_struct': {'name': 'Add struct', 'icon': 'addstruct'}, - feature paused
                            'add_folder': {'name': 'Add folder', 'icon': 'folder'},
                            'delete': {'name': 'Delete', 'icon': 'delete'}
                          };
                         } 
                         else if (node.data.type == 'root')
                         {
                            return {
                                'add_page': {'name': 'Add rules page', 'icon': 'add'},
                                'add_table': {'name': 'Add data table', 'icon': 'addtable'},
                                'import_csv': {'name': 'Import CSV table', 'icon': 'addtable'},
                                //'add_struct': {'name': 'Add struct', 'icon': 'addstruct'}, - feature paused
                                'add_folder': {'name': 'Add folder', 'icon': 'folder'}
                            }
                         }
                         else {
                            return {
                                'add_page': {'name': 'Add rules page', 'icon': 'add'},
                                'add_table': {'name': 'Add data table', 'icon': 'addtable'},
                                'import_csv': {'name': 'Import CSV table', 'icon': 'addtable'},
                                //'add_struct': {'name': 'Add struct', 'icon': 'addstruct'}, - feature paused
                                'add_folder': {'name': 'Add folder', 'icon': 'folder'},
                                'delete': {'name': 'Delete', 'icon': 'delete'}
                             };
                         }
                    }
                    /*
                    'add_page': {'name': 'Add rules page', 'icon': 'add'},
                    'add_table': {'name': 'Add data table', 'icon': 'addtable'},
                    //'add_struct': {'name': 'Add struct', 'icon': 'addstruct'}, - feature paused
                    'add_folder': {'name': 'Add folder', 'icon': 'folder'},
                    'delete': {'name': 'Delete', 'icon': 'delete'}*/
                ,
                actions: function (node, action, options) {
                    if(node.data.type=='folder' || node.data.type=="root")
                    {
                        if(action == "add_folder")
                        {
                            var newNodeData = {title:"New Folder", type:'folder',folder:true, children:[]}
                            node.addChildren(newNodeData);
                        }
                        if(action == "add_page")
                        {
                            var newPage = app.treemenu.addNewRulePage();
                            var newId = "page" + newPage.id;
                            var newNodeData = {title:newPage.name, type:'rules', id: newId, page:newPage.id,icon: "tree_drawing"}
                            var newNode = node.addChildren(newNodeData);
                            node.setExpanded();

                            // select the new page in the menu-tree
                            app.treemenu.selectFromMessage({resourceType:'rules',resourceId:newPage.id});
                            
                            // go edit it in the drawing page
                            app.enterPage(newPage.id, newNode);

                            /*
                            var $myTree = $("#tree").fancytree();
                            // Get the DynaTree object instance
                            var tree = $myTree.fancytree("getTree");
                            
                            var addedNode = tree.getNodeByKey(newId);

                            //app.enterPage(app.view, data.node.data.page, data.node);
                            //Get the custom data attribute associated to that node
                            //var data = node.data;
                            */


                        }
                        else if(action == "add_table")
                        {
                            var newPage = app.treemenu.addNewDataTable();
                            var newNodeData = {title:newPage.name + " /"+ newPage.columns.length, type:'table', page:newPage.id,icon: "tree_table"}
                            var newNode = node.addChildren(newNodeData);

                            // select the new page in the menu-tree
                            app.treemenu.selectFromMessage({resourceType:'table',resourceId:newPage.id});
                            
                            // go edit it in the drawing page
                            app.enterTable(newPage.id, newNode);
                        }
                        else if(action == "import_csv")
                        {
                            // start file-explorer for csv files
                            this.importCSVFile.click();
                        }
                        /*else if(action == "add_struct")
                        {
                            var newPage = app.treemenu.addNewStruct();
                            var newNode = {title:newPage.name, type:'struct', page:newPage.id,icon: "tree_struct"}
                            node.addChildren(newNode);
                        }*/
                        else if(action == "delete")
                        {
                            // only delete empty folders
                            if(node.children != null && node.children.length > 0)
                            {
                                alert("Cannot delete non-empty folder.");
                            }
                            else
                            {
                                node.parent.removeChild(node);
                                node = null;
                            }
                        }
                    }
                    else if(node.data.type=='rules')
                    {
                        // right now deletion is pretty generic - just remove stuff - but later we will add smarter things to adapt the new state of the model 
                        if(action == "delete")
                        {
                            // delete without question (for now) - TODO: maybe recalc rule-defs, directly?
                            // TODO: hmm.. maybe best to go through and delete every shape, so that will take care of itself?.. yup!
                            node.parent.removeChild(node);
                            // remove from model
                            Model.rulePages = Model.rulePages.filter(r=>r.id != node.data.page);
                            node = null;
                        }
                    }
                    else if(node.data.type=='table')
                    {
                        // right now deletion is pretty generic - just remove stuff - but later we will add smarter things to adapt the new state of the model 
                        if(action == "delete")
                        {
                            // delete without question (for now) - TODO: maybe recalc rule-defs, directly?
                            // TODO: hmm.. maybe best to go through and delete every shape, so that will take care of itself?.. yup!
                            node.parent.removeChild(node);
                            // remove from model
                            Model.dataTables = Model.dataTables.filter(r=>r.id != node.data.page);
                            node = null;
                        }
                    }

                    // if adding item "on" non folder item, add it After the clicked item
                    if(action != "delete" && !(node.data.type=='folder' || node.data.type=="root")){
                        if(action == "add_folder")
                        {
                            var newNode = {title:"New Folder", type:'folder',folder:true, children:[]}
                            node.appendSibling(newNode);
                        }
                        if(action == "add_page")
                        {
                            var newPage = app.treemenu.addNewRulePage();
                            var newNode = {title:newPage.name, type:'rules', page:newPage.id,icon: "tree_drawing"}
                            node.appendSibling(newNode);
                        }
                        else if(action == "add_table")
                        {
                            var newPage = app.treemenu.addNewDataTable();
                            var newNode = {title:newPage.name + " /"+ newPage.columns.length, type:'table', page:newPage.id,icon: "tree_table"}
                            node.appendSibling(newNode);
                        }

                    }

                    // copy structure from treemenu to permanent Model
                    app.treemenu.copyStructureFromTree();
                    
                    // if the currently viewed page does not exist anymore, due to for example deletion, go to the Settings-page
                    // just check if node was nulled, for now
                    if(node == null)
                        app.enterSettings(app.view);

                }
            }
        });

        $("#tree").fancytree("getRootNode").visit(function(node){
            node.setExpanded(true);
          });
    },

    addRecursive:function(branch){
        var me = [];
        for(var child of branch) {
            if(child.type == 'rules' ){
                me.push({title:app.getRulePage(child.index).name,type:child.type,page:child.index,icon: "tree_drawing"});
            }
            if(child.type == 'table' ){
                var table = app.getDataTable(child.index);
                var tableTitle = table.name + " /" + table.columns.length;
                me.push({title:tableTitle,type:child.type,page:child.index,icon: "tree_table"});
            }
            if(child.type == 'struct' ){
                me.push({title:Model.structs[child.index].name,type:child.type,page:child.index,icon: "tree_struct"});
            }         
            else if(child.type == 'folder')
            {
                var myChildren = this.addRecursive(child.children);
                me.push({title:child.name,type:child.type,folder:true,children:myChildren});
            }
        };
        return me;
    },
    
     // returns id nr
    addNewRulePage:function(){
        var newId = 0;
        if(Model.rulePages.length == 0)
            newId = 0;
        else 
        {
            for(var page of Model.rulePages) {
                if(page.id > newId)
                    newId = page.id;
            }
            newId = newId +1;
        }

        var newPage = {
            id: newId,
            name:"Page # " + newId,
            shapes:[],
            connections:[],
            latestViewport:{x:0,y:0}
        };

        Model.rulePages.push(newPage);

        return newPage; 
    },

    
// returns id nr
addNewDataTable:function(table){
    var newId = -1; // create with id from 0 and upwards
    for(var page of Model.dataTables) {
        if(page.id > newId)
            newId = page.id;
    }
    newId = newId +1;

    var newPage = {
        id: newId,
        name: "table_" + (newId+1), // Title has id+1
        columns:[
            {id: "col_a", name: "Column1", field: "col_a", content:"string"},
            {id: "col_b", name: "Column2", field: "col_b", content:"string"},
        ],
        datarows:[
        ]
    };

    if(table != undefined){
        newPage.columns = table.columns;
        newPage.datarows = table.datarows;
    }   

    Model.dataTables.push(newPage);

    return newPage; 
},

// returns id nr
addNewStruct:function(){
    var newId = 0;
    
    if(Model.structs == undefined)
        Model.structs = [];
    
    for(var struct of Model.structs) {
        if(struct.id > newId)
            newId = struct.id;
    }
    if (newId > 0)
        newId = newId +1;

    var newStruct = {
        id: newId,
        nameSpace: "",
        version:"1.0.0",
        name: "New Struct #" + newId,
        inherits: "",
        implements:[],
        fields:[
            { name:"FieldName", array:false,namespace:"Namespace",type:"TypeName",nullable:false},
            { name:"Cat", array:false,namespace:"Namespace",type:"TypeName",nullable:false},
            { name:"Platypus", array:false,namespace:"Namespace",type:"TypeName",nullable:false}
        ]
    };

    Model.structs.push(newStruct);

    return newStruct; 
},


copyStructureFromTree:function(){
    var tree = $("#tree").fancytree("getRootNode");
    var treeNode = tree.children[0];
    var newIndexTree = this.copyFolderRecursive(treeNode.children);    // never count "Model" node, itself
    // replace Model.pageIndexTree!
    Model.pageIndexTree = newIndexTree;
},

copyFolderRecursive:function(children){
    var copiedChildren = [];
    if(children != null){
        for(var child of children) {
            var data = child.data;
            if(data.type == 'rules' ){
                copiedChildren.push({type:'rules', index:data.page});
            }
            else if(data.type == 'table' ){
                copiedChildren.push({type:'table', index:data.page});
            }
            else if(data.type == 'struct' ){
                copiedChildren.push({type:'struct', index:data.page});
            }
            else if(child.data.type == 'folder')
            {
                var nodeChildren = this.copyFolderRecursive(child.children);
                copiedChildren.push({type:'folder', children: nodeChildren, name:child.title});
            }
        }
    }
    return copiedChildren;
},

selectFromMessage:function(message){
    var tree = $("#tree").fancytree("getRootNode");
    var treeNode = tree.children[0]; // never check rootnode

    this.suspendSelection = true;

    this.deselectAll();

    var node = this.findNode(treeNode.children, message.resourceType, message.resourceId);
    if(node != null){
        node.setSelected(true);
        node.setActive(true);
    }

    this.suspendSelection = null;
},

deselectAll:function(){
    var tree = $("#tree").fancytree("getRootNode");
    
    // deselect current
    var currnodes = tree.getSelectedNodes();
    for(n of currnodes){
        // set the 'selected' status and update the display:
        n.setSelected(false);
        n.setActive(false);
    }
},

getTreeNode(resourceType, resourceId){
    var tree = $("#tree").fancytree("getRootNode");
    var treeNode = tree.children[0]; // never check rootnode
    var node = this.findNode(treeNode.children, resourceType, resourceId);
    return node;
},

findNode(nodes, resourceType, resourceId){
    var foundNode = null;
    for(var node of nodes) {
        if(node.data.type == resourceType && node.data.page == resourceId)
            return node;
        if(node.data.type == "folder"){
            foundNode = this.findNode(node.children, resourceType, resourceId);
            if(foundNode != null)
                return foundNode;
        }
    }
    return foundNode;
},

setSelectedNode:function(node){
    if(node == null){
        var tree = $("#tree");
        var node = tree.getActiveNode();
        // set the 'selected' status and update the display:
        node.setSelected(false);
        node.setActive(false);
    }
}


});