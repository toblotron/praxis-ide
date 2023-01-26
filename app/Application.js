// declare the namespace for this application
var praxis = {};

var pages = [];

praxis.Application = Class.extend({
    NAME : "praxis.Application",

    init : function() 
    {
        

        this.bottombar = new praxis.BottomBar("bottomBar");

        this.treemenu = new praxis.TreeMenu("treeKeeper");

        this.folderPanel = new praxis.FolderPanel("folderPanel");

        this.tablePanel = new praxis.TablePanel("tablePanel");
        
        this.tableView = new praxis.TableView("tableView");

        this.projectSettings = new praxis.ProjectSettings("projectSettings");

        this.view = new praxis.View("c");

        this.drawingPanel = new praxis.DrawingPanel("drawingPanel");
        
        this.palette = new praxis.ShapePalette("palette");

        this.libraries = [];    // used to keep track - in runtime, of which libraries + predicates are available to work with 

        this.canvasFillCenterPane();
          
        // Prevent canvas from responding to right mouse click in the default way; dont' show the default context menu, which makes noone happy
        fabric.util.addListener(document.getElementsByClassName('upper-canvas')[0], 'contextmenu', function(e) {
            e.preventDefault();
        });
/*
        var img = fabric.Image.fromURL("./gfx/darkGrid.png", function (oImg) {
            var canvas = app.view.canvas;
            canvas.backgroundColor = new fabric.Pattern({source: oImg._element});
            console.log("loaded image");
            app.view.backgroundPattern = canvas.backgroundColor;
            canvas.renderAll();
         }, null, { crossOrigin: 'Anonymous' }); 
*/
         //this.canvas.setBackgroundColor({ source: canvasImage, repeat: 'repeat' }, function () {self.canvas.renderAll();});
         /*
        var page1 = {
          shapes:[],
          connections:[]
        };

        var page2 = {
          shapes:[],
          connections:[]
        };

        pages.push(page1);
        pages.push(page2);
*/
        /*this.toolbar = new example.Toolbar("toolbar", this.view);
        this.properties = new example.PropertyPane("properties", this.view);


        // layout FIRST the body
        this.appLayout = $('#container').layout({
          north: {
            resizable:false,
            closable:true,
            resizeWhileDragging:false,
            paneSelector: "#topbar"
          },
            east: {
              resizable:true,
              closable:true,
              resizeWhileDragging:true,
              paneSelector: "#navigation"
            },
            center: {
              resizable:true,
              closable:false,
              resizeWhileDragging:true,
              paneSelector: "#content"
            }
       });
      
       //
       this.contentLayout = $('#content').layout({
            center: {
              resizable:true,
              resizeWhileDragging:true,
              closable:false,
              paneSelector: "#mainArea"
            },
            south: {
              resizable:true,
              closable:true,
              resizeWhileDragging:true,
              paneSelector: "#toolbar"
            }
       });*/
    },

    setModel:function(model){
        Model = model;
        app.bottombar.clearConsole();
        app.bottombar.session = null;
        app.bottombar.queryCode.setValue("");

        if(model.dataTables == undefined)
			model.dataTables = [];
        if(model.settings == undefined)
            model.settings = [];
        if(model.settings.exports == undefined)
            model.settings.exports = [];
        if(model.settings.dynamic == undefined)
            model.settings.dynamic = [];
        if(model.settings.executionLimit == undefined)
            model.settings.executionLimit = 500;

        ruleDefSetupOnModelLoad();

        // rebuild model tree
        app.treemenu.rebuildTree();
			
        // display executionLimit
        var executionLimitField = document.getElementById("executionLimit");
        executionLimitField.value = model.settings.executionLimit;

        // show first page
        app.enterSettings();
    },

    canvasFillCenterPane :function(){
        var pane = document.getElementById('centerPane');
        pane.padding = 0;
        this.view.canvas.setWidth(pane.offsetWidth-2);
        this.view.canvas.setHeight(pane.offsetHeight-2);
        this.view.canvas.renderAll();
        // to recalculate panning limits, when needed
        this.view.panLimit = null;
    },

    updateHeading:function(node){
        // Show selected path in topbar
        if(node) {
            var tophtml = "";
            if(node.parent == undefined)
            {
                tophtml = '<span class="page_title">' + Model.name + '</span>';
            }
            else
            {            
                tophtml = '<span class="page_title">' + node.title + '</span>';
                while(node.parent) {
                    node = node.parent;
                    if(node.parent) // skip the root
                        tophtml = Model.name + " >> " + tophtml;
                }
            }
            $("#selectionPath").html(tophtml);
        }
    },

    enterFolder: function(treeNode){
        $("#properties").html(""); // clear possible shape-panels
        //app.tableView.hide();
        //app.view.hide();

        // if switching from drawing, update groups (very ugly)
        if(app.view.pageModel != null)
            app.view.calculatePageGroupContainment();

        app.folderPanel.showPanel(treeNode);

        app.folderPanel.show();
        app.tablePanel.hide();
    },

    enterSettings: function(nr, treeNode){
        $("#properties").html(""); // clear possible shape-panels
        
        // if switching from drawing, update groups (very ugly)
        if(app.view.pageModel != null)
            app.view.calculatePageGroupContainment();

        app.tableView.hide();
        app.view.hide();
        app.folderPanel.hide();
        app.drawingPanel.hide();
        app.palette.hide();
        app.tablePanel.hide();
        app.projectSettings.show();

        this.updateHeading(treeNode);
    },

    enterTable: function(nr, treeNode){
        $("#properties").html(""); // clear possible shape-panels

        // if switching from drawing, update groups (very ugly)
        if(app.view.pageModel != null)
            app.view.calculatePageGroupContainment();

        app.tableView.show();
        app.view.hide();
        app.folderPanel.hide();
        app.drawingPanel.hide();
        app.projectSettings.hide();
        app.palette.hide();
        app.tablePanel.show();
    
        var grid = document.getElementById("tableView");
    
        var tableData = app.getDataTable(nr);
        
        
        // NEEDS TO BE HERE
        app.tablePanel.showPanel(tableData, treeNode);
        app.tableView.showTable(tableData);

    /* ///
        var options = {
            editable: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            enableAddRow: true
        };
    
        grid = new Slick.Grid("#tableView", tableData.datarows, tableData.columns, options);
    
        var size = tableData.columns.length;
        for(i = 0; i < size; i++)
        {
            var colname = $("#col_"+i+"_name").val();
            var coltype = $("#col_"+i+"_type").val();
    
            // save these if the col already exists
            if(tableData.columns[i].id == undefined) {
                tableData.columns[i].id = colname.toLowerCase();
                tableData.columns[i].field = colname.toLowerCase();
            }
    
            tableData.columns[i].name = colname;
            tableData.columns[i].content = coltype;
            tableData.columns[i].editor = Slick.Editors.Text;
    
            // {id: "name", name: "Name", field: "name", content:"string"},
        }
    
        grid.onAddNewRow.subscribe(function (e, args) {
            var item = args.item;
            grid.invalidateRow(tableData.datarows.length);
            tableData.datarows.push(item);
            grid.updateRowCount();
            grid.render();
        });
     *//////
        // implement schema changes, if any
        
    
        this.updateHeading(treeNode);
    },


// start showing this drawing-page
enterPage:function(nr, treeNode){
  
  $("#properties").html(""); // clear possible shape-panels

  // if switching from drawing, update groups (very ugly)
  if(app.view.pageModel != null)
    app.view.calculatePageGroupContainment();

  app.tableView.hide();
  app.view.show();
  
  app.palette.show();
  app.tablePanel.hide();
  app.projectSettings.hide();
  app.folderPanel.hide();
 
  

  SwitchingPages = true;
  
  

  var start = Date.now();
  
  // save things in current pageModel, if there is any
  if(app.view.pageModel != null) {
    //VPT
    //if(app.view.pageModel.latestZooom == undefined)
        app.view.pageModel.latestZooom = app.view.canvas.getZoom();
    var vpt = app.view.canvas.viewportTransform;
    //if(app.view.pageModel.latestViewport == undefined)
        app.view.pageModel.latestViewport = {x:parseFloat(vpt[4]), y:parseFloat(vpt[5])}; 
  }

  // Set in store
  CurrentViewedPageNr = nr;

  var page = app.getRulePage(nr);
  CurrentViewedPage = page;

  
  app.view.setPageModel(page);

  // after entering - make sure all group-containment-things are set and saved to model
  // updateAllGroupsContained(view); // for every GroupShape- update which figures it contains.. 
  app.view.calculatePageGroupContainment();

  SwitchingPages = false;
  

  app.drawingPanel.showPanel(page);

  //for(var i=0;i<50;i++)
  //    view.add( new draw2d.shape.pert.Activity(),80+i*3,130+i*3);

  var end = Date.now() - start;

  console.log("Page drawing time " + end + " milliseconds");
  // Show selected path in topbar

  this.updateHeading(treeNode);
},

getRulePage:function(nr){
    res = Model.rulePages.find(p=>p.id == nr);
    return res;
},

getDataTable:function(nr){
    res = Model.dataTables.find(p=>p.id == nr);
    return res;
}

});

// default startup-model, for dev-testing
Model = 
{
    name: "modelName",
    settings:{
        includedLibraries:[
            "lists"
        ],
        exports:[],
        dynamic:[],
        executionLimit:300
    },
    formatVersion: 0.2,
    pageIndexTree: 
    [/*
        {type: 'rules', index:0},
        {
            type: 'folder', name: 'Folder', children:
            [
                {type: 'rules', index:1}
            ]
        }
    */],
    dataTables: [
    ],
    rulePages: [/*
        {
            id: 0,
            name:"First page",
            shapes:[
                {
                    type:"RuleShape",
                    "id": 0,
                    "x": 400,
                    "y": 400,
                    data:{
                        libraryName: "",
                        ruleName: "test",
                        arguments: [
                            "atom",
                            "Variable"
                        ]
                    }
                }
            ],
            connections:[]
        },
        {
            id:1,
            name:"Second page",
            shapes:[
                {
                    type:"RuleShape",
                    "id": 0,
                    "x": 402,
                    "y": 205,
                    data:{
                        libraryName: "",
                        ruleName: "katt",
                        arguments: [
                            "E",
                            "List"
                        ]
                    }
                },
            ],
            connections: []
        },
    */]
};
