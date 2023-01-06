/*
This class handles the fabric canvas and everything connected to it
*/

praxis.View = Class.extend({
	
	init:function(canvas_element_id){
		
        fabric.Object.prototype.hasRotatingPoint = false;
        fabric.Object.prototype.objectCaching = false;
        
        this.html = $("#" + canvas_element_id);
        //this.elem = document.getElementById(canvas_element_id);

        var canvas = new fabric.Canvas(canvas_element_id,{
            "hasRotatingPoint" : false,
            "controlsAboveOverlay":false,
            "backgroundColor": "#222",
            "preserveObjectStacking": true,
            "originX": 'center',
            "originY": 'center',
            "id" : "myCanvas",
            "fireRightClick": true,
            "objectCaching": false,
            "targetFindTolerance": 5,
            "perPixelTargetFind": true
        });

        canvas.set({"backgroundColor": '#222'});
/*
        const bgUrl = 'https://ossrs.net/wiki/images/figma-bg.png';
        canvas.setBackgroundColor(
            {source: bgUrl, repeat: 'repeat'}, 
            canvas.renderAll.bind(canvas),
        );
*/
  /*      canvas.canvas_width = 3000;
        canvas.canvas_height = 1500;
*/
        this.canvas = canvas;
        canvas.parent = this;

        this.elem = document.getElementsByClassName("canvas-container")[0];
        var canvasElem = document.getElementById("canvaswrapper");

        // hook these to "canvaswrapper" div
        canvasElem.onkeydown = function(e) {
            //if (objSelected) {
                var view = app.view;
                switch (e.keyCode) {
                case 46: // delete
                    
                    if (view.selectedLine) {
                        view.deleteConnection(view.selectedLine);
                        view.selectedLine = null;
                    }
                    if (view.selected)
                    {
                        view.deleteSelection();
                        view.shapesLimit = null;
                    }
                    break;
                case 67: // "c"
                    if(e.ctrlKey){
                        view.copySelectionToClipboard();
                    }
                    break;
                case 86: // "v"
                    if(e.ctrlKey){
                        view.pasteFromClipboard();
                    }
                    break;
                }
                canvas.renderAll();
            //}
            if(e.key == "Shift"){
                // calculate new panning-limit rectangle
                var view = app.view;
                // reset Every time, for now
                view.shapesLimit = null;
                view.calcShapesLimit();
            }
        }

        // hook these to "canvaswrapper" div
        canvasElem.onkeyup = function(e){
            if(e.key == "Shift"){
                console.log("SHIFT UP");
                var view = app.view;
                view.lastPosX = undefined;
                view.lastPosY = undefined;
                view.canvas.selection = true;
                
                // because zoom recalculates object positions
                // without this we won't be able to click on things after panning
                var zoom = view.canvas.getZoom();
                view.canvas.setZoom(zoom);

                view.canvas.renderAll();

                view.panLimit = null;
            }
        }

        canvas.on('mouse:down', function(opt) {
            
            if(opt.button === 3) {
                console.log("right click - get ready to drag canvas");
                var view = app.view;
                view.isDragging = true;
                view.canvas.selection = false;
                view.lastPosX = opt.e.clientX;
                view.lastPosY = opt.e.clientY;

                // calculate new panning-limit rectangle
                // reset Every time, for now
                view.shapesLimit = null;
                view.calcShapesLimit();
                canvas.defaultCursor = "all-scroll";
                view.canvas.renderAll();
                //document.body.style.cursor = "all-scroll";

            } 
            
            // ALWAYS deselect selected connection when clicking on anything? 
            app.view.unmarkSelectedConnection();

            /*var evt = opt.e;
            if (evt.shiftKey === true) {
                var view = app.view;
                view.isDragging = true;
                view.canvas.selection = false;
                view.lastPosX = evt.clientX;
                view.lastPosY = evt.clientY;
            }*/
        });

        canvas.on('mouse:up', function(opt) {
            var view = canvas.parent;
            
            canvas.defaultCursor = "auto";

            if(this.parent.isDragging){
                // console.log("stop dragging");
                this.parent.isDragging = false;
                this.selection = true;
                
                view.lastPosX = undefined;
                view.lastPosY = undefined;
                view.canvas.selection = true;
                
                // because zoom recalculates object positions
                // without this we won't be able to click on things after panning
                var zoom = view.canvas.getZoom();
                view.canvas.setZoom(zoom);

                view.canvas.renderAll();

                view.panLimit = null; // reset to recalc when used
            } 
            else if(view.portstate == "draggingPort"){
                if(view.draggedPort != null){
                    // find any other port nearby?
                    var targetedPort = null;
                    var drop = view.draggedPort;
                    // go through ports
                    view.ports.forEach(port => {
                        if(drop.left > port.portShape.left-5 && drop.left < port.portShape.left+5 && drop.top > port.portShape.top-5 && drop.top < port.portShape.top+5){
                            targetedPort = port;
                        }
                    });

                    if(targetedPort != null){
                        // create connection!
                        var targetPort = view.draggedPort.fromPort; // canvas.dropPortTarget;
                        var sourcePort = targetedPort.portShape; // fromPort;
                        var connection = view.portLine;
                        view.portLine = null;
                        connection.set({stroke: 'blue'});
                        this.sendToBack(connection);
                        connection.source = sourcePort;
                        connection.target = targetPort;
                        
                        var connModel = {
                            type: "StraightConnection",
                            role: "true", // there can also be "false", indicating the negative case
                            target: {
                                shape: sourcePort.parentShapeId,
                                role: sourcePort.role
                            },
                            source: {
                                shape: targetPort.parentShapeId,
                                role: targetPort.role
                            },
                        }
                        
                        var newConnection = view.createConnection(connModel);

                        // remove the temporary connection-line
                        this.remove(connection);

                        /*
                        view.connections.push(connection);

                        connection.set({
                            strokeDashArray: null,
                            'x2':connection.source.left, 
                            'y2': connection.source.top,
                            'x1':connection.target.left, 
                            'y1': connection.target.top
                        });
                        connection.setCoords();
                        */
                        
                    } else {
                        // no target hit - remove portline
                        this.remove(view.portLine);
                    }

                    // remove these, anyhow
                    this.remove(view.draggedPort);
                    view.draggedPort = null;
                    view.portLine = null;

                }
                
                view.portstate = "normal";
                console.log("state = " + view.portstate);
            } 
            else if(view.selected != null){
                // we have (maybe) been dragging
                // update coords of ports
                view.ports.forEach(port => {
                    port.portShape.setCoords();
                });
                
            }
        });

    
        // custom properties -----------------------------

        // store shapes
        this.shapes = []; 

        // handle ports
        this.portstate = "normal";
        this.ports = [];
        // handle connections
        this.connections = [];
        
        // one or more shapes that mark the selection of a connection
        this.connectionMark = null;

        this.shapesLimit = null;    // calculated rect saying within which limits all shapes are - for panzoom. This is set to null when it needs to be recalculated. 
        this.panLimit = null;  // calculated rect with shape-limits, adapted to current zoom-factor, for panzoom. This is set to null when it needs to be recaculated.

        /*
        this.draggingInType = null; 
        this.draggedInFigure = null; // when created from palette, drag this around until mouse-up
        */

        // default page-model - no pages or connections
        // page-model is pure data content - nothing directly connected to a view
        this.pageModel = {shapes:[],connections:[]};

        /*canvas.on('dragstart', function(options){
            this.draggingInType = options.e.dataTransfer.getData("Text");
        });
*/
        // when dragged shape enters canvas from palette
        /*canvas.on('dragover', function(options){
            console.log("dragging");
            if(this.parent.draggingInType != null){
                // create the shape, and start dragging it!
                var typeName = this.parent.draggingInType;
                var nextShapeId = 0;
                
                var zoom = this.getZoom()
                var vpt = this.viewportTransform;
                var xoff = vpt[4];
                var yoff = vpt[5];
                var newX = (options.e.offsetX  - xoff)/zoom;
                var newY = (options.e.offsetY - yoff)/zoom;
                    
                if(this.parent.pageModel.shapes.length > 0)
                    nextShapeId = Math.max(...this.parent.pageModel.shapes.map(n=>n.id)) + 1;
                var newShapeData = {type:typeName, id: nextShapeId,x:newX, y:newY, data:null};
                console.log("Dropping shape at " + newX + "/" + newY);
                var newFigure = this.parent.createFigure(newShapeData);
                this.parent.pageModel.shapes.push(newShapeData);
                this.dragCreated = true;
                this.parent.draggingInType = null;

                // try auto-selecting... you fooool... 
                var canvas = this;

                canvas.discardActiveObject();
                var sel = new fabric.ActiveSelection([newFigure], {
                canvas: canvas,
                });

                canvas.setActiveObject(sel);
                canvas.requestRenderAll();

                this.parent.draggedInFigure = newFigure;

            } else {
                // have we Just now created a figure from the palette?
                // in that case, move it around as if we were legitimately dragging it
                if(this.parent.draggedInFigure){
                    var zoom = this.getZoom()
                    var vpt = this.viewportTransform;
                    var xoff = vpt[4];
                    var yoff = vpt[5];
                    var newX = (options.e.offsetX  - xoff)/zoom;
                    var newY = (options.e.offsetY - yoff)/zoom;
                        
                    if(this.parent.pageModel.shapes.length > 0)
                        nextShapeId = Math.max(...this.parent.pageModel.shapes.map(n=>n.id)) + 1;
                    var newShapeData = {type:typeName, id: nextShapeId,x:newX, y:newY, data:null};
                    console.log("Dragging shape at " + newX + "/" + newY);

                    this.parent.draggedInFigure.set({left:newX, top:newY});
                    this.requestRenderAll();
                }
            }
            options.e.stopPropagation();
            options.e.preventDefault();
            this.ondrag = null;
            return false;
        });
*/
        canvas.on('drop', function(options){
            // when dragging shape from palette
            options.e.stopPropagation();
            options.e.preventDefault();
            var typeName = options.e.dataTransfer.getData("Text");
            var nextShapeId = 0;
            
            var zoom = this.getZoom()
            var vpt = this.viewportTransform;
            var xoff = vpt[4];
            var yoff = vpt[5];
            var newX = (options.e.offsetX  - xoff)/zoom;
            var newY = (options.e.offsetY - yoff)/zoom;
                
            if(this.parent.pageModel.shapes.length > 0)
                nextShapeId = Math.max(...this.parent.pageModel.shapes.map(n=>n.id)) + 1;

            var newShapeData = {type:typeName, id: nextShapeId,x:newX, y:newY, data:null};
            console.log("Dropping shape at " + newX + "/" + newY);
            var newFigure = this.parent.createFigure(newShapeData);

            // check if it should be centered after being placed (groupshape)
            if(typeName == "GroupShape"){
                newFigure.left = newFigure.left - newFigure.width/2;
                newFigure.top = newFigure.top - newFigure.height/2;
            }

            this.parent.pageModel.shapes.push(newShapeData);
            // calculate new panzoom limits
            this.parent.shapesLimit = null;
            this.parent.panLimit = null;
            this.parent.calcShapesLimit();

            // immidiately select created shape!
            this.discardActiveObject();
            var sel = newFigure; //new fabric.ActiveSelection([newFigure], {canvas: this});

            this.setActiveObject(sel);
            this.requestRenderAll();
        });

        canvas.on("object:scaling", (e) => {
            // when changing size - only for GroupShape
            var o = canvas.getActiveObject();
            if(o.type == "groupShape"){
                // recalc port positions
                // var ports = o.gatherPorts();
                // redraw connections
                var figure = this.shapes.find(s=>s.id == o.id);
                var storedVersion = this.pageModel.shapes.find(s=>s.id == o.id);
                // just update the stored shape-specific data - not pos, id or overlying
                storedVersion.data.width = figure.bg.width * figure.scaleX;
                storedVersion.data.height = figure.bg.height * figure.scaleY;

                // update ports
                
                this.updateShapeContents(storedVersion);
                var view = canvas.parent;
                o.setContainedStartPos(view);
                
                // in case we will start moving this group, with contained, directly after this 
                //view.startDragLeft = figure.left;
                //view.startDragTop = figure.top;
                this.startDrag = {left:figure.left, top: figure.top};

                console.log("view.startDrag updated to " + figure.left + "/" + figure.top);

            }
        });

        

     
        // hide ports when shape/s selected
        canvas.on('selection:updated', function(options) {
            //if(this.parent.isDragging == false)
                this.parent.handleSelection(options);
        });

        // hide ports when shape/s selected
        canvas.on('selection:created', function(options) {
            //if(this.parent.isDragging == false)
            //console.log("selecting!")
                this.parent.handleSelection(options);
        });

        
        canvas.on('object:moving', function(options) {
            // when moving one or more selected objects
            var view = this.parent;

            // stop all normal operations if dragging
            if(this.parent.isDragging)
                return;

            // move following shapes (contained by groups) on screen
            var xmove = view.startDrag.left - options.target.left;
            var ymove = view.startDrag.top - options.target.top;
            
            //console.log("movement: " + xmove + "/" + ymove);

            view.followingShapes.forEach(shape=>{
                shape.left = shape.startDragLeft - xmove;
                shape.top = shape.startDragTop - ymove;
                // and move them in model
                var modelShape = this.parent.pageModel.shapes.find(s=>s.id == shape.id);
                modelShape.x = shape.left;
                modelShape.y = shape.top;
                shape.setCoords();
            });

            view.selectedPorts.forEach(port => {
                var parentx = port.parent.left;
                var parenty = port.parent.top;
                if(port.parent.group){
                    parentx += port.parent.group.left + port.parent.group.width / 2;
                    parenty += port.parent.group.top + port.parent.group.height /2;
                }
                port.portShape.set({
                    left: parentx+port.x, 
                    top: parenty+port.y
                });
            });
            view.selectedConnections.forEach(conn => {
                conn.redraw();
            });

            // move selected shapes, in the model
            view.selectedShapes.forEach(shapeFigure=>{
                if(shapeFigure.isDataShape){
                    var modelShape = this.parent.pageModel.shapes.find(s=>s.id == shapeFigure.id);
                    if(modelShape){
                        var realx = shapeFigure.left;
                        var realy = shapeFigure.top;
                        // will be true if we are moving the shapes in a fabric-group (always true when several shapes are moved)
                        if(shapeFigure.group){
                            realx += shapeFigure.group.left + shapeFigure.group.width / 2;
                            realy += shapeFigure.group.top + shapeFigure.group.height / 2;
                        }
                        modelShape.x = realx;
                        modelShape.y = realy;
                        //console.log("moved shape #" + shapeFigure.id + " to " + shapeFigure.left + "/" + shapeFigure.top);
                    }
                }
            });

            
               

        });

        canvas.on('selection:cleared', function(options) {
            //canv.state = "normal";
            //updatePorts();
            this.parent.selected = null;
            this.followingShapes = [];
            this.startDrag = null;
            this.parent.unmarkSelectedConnection();

            // clear old panel control, if any
            var propertyView = $("#properties");
            propertyView.html("");

            console.log("cleared selection");

            app.drawingPanel.show();
            app.palette.show();
        });

        canvas.on('mouse:move', function(options) {

            var view = this.parent;
            
            

            if (view.lastPosX != undefined) {
                // drag-panning canvas?
                //console.log("starting pan");
                var e = options.e;
                var view = app.view;

                var vpt = this.viewportTransform;
                if(view.lastPosX == undefined){
                    view.lastPosX = e.clientX;
                    view.lastPosY = e.clientY;
                }
                
                var newX = vpt[4] + (e.clientX - view.lastPosX) * 3;
                var newY = vpt[5] + (e.clientY - view.lastPosY) *3;
                //console.log("Panning to " + newX + "/" + newY)


                vpt[4] = newX;
                vpt[5] = newY;
                
                // save new pos
                view.pageModel.latestViewport.x = parseFloat(newX);
                view.pageModel.latestViewport.y = parseFloat(newY);

                view.calcShapesLimit();
                view.calcPanLimit();

                view.enforcePanLimit();

                this.requestRenderAll();
                
                view.lastPosX = e.clientX;
                view.lastPosY = e.clientY;
            } else if(view.portstate == "draggingPort"){
                if(view.portLine != null){
                    //var p = canvas.getPointer(options.e);
                    view.portLine.redraw(); //set({'x2':view.draggedPort.left, 'y2': view.draggedPort.top});
                    this.bringToFront(view.draggedPort);
                }
            } else if(view.draggedPort != null){
                // if there is a portLine, and we are not dragging, something is wrong - dragleave for dragport did not fire 
                // first, check that we're not currently over the canvas.draggedPort
                var pointer = this.getPointer(options.e);
                var posX = pointer.x;
                var posY = pointer.y;
                
                var distance = view.getDistance(posX, posY, view.draggedPort.left, view.draggedPort.top);
                //console.log("mx:"+posX+" my:" + posY + " x2:" + options.e.clientX + " distance:"+distance);
                if(distance > view.draggedPort.radius)
                    view.destroyDragPort();
            }

            // Hide / show ports, depending on proximity to mouse pointer
            /*var pointer = this.getPointer(options.e);
            view.shapes.forEach(shape=>{
                var ports = view.ports.filter(port=> port.parent == shape);
                if(view.getDistance(shape.left,shape.top,pointer.x, pointer.y) < 100){
                    // find all the ports of the shape, and SHOW them
                    ports.forEach(port=>port.portShape.visible = true);
                } else {
                    // find all the ports of the shape, and HIDE them
                    ports.forEach(port=>port.portShape.visible = false);
                }
                
            });

            view.canvas.renderAll();*/
/*
            var pointer = this.getPointer(options.e);
            view.pageModel.shapes.forEach(shape=>{
                var ports = view.ports.filter(port=> port.parent.id == shape.id);
                if(view.getDistance(shape.x,shape.y,pointer.x, pointer.y) < 100){
                    // find all the ports of the shape, and SHOW them
                    ports.forEach(port=>port.portShape.visible = true);
                } else {
                    // find all the ports of the shape, and HIDE them
                    ports.forEach(port=>port.portShape.visible = false);
                }
                
            });

            view.canvas.renderAll();
*/
            //* per port = even slower! :D
            var pointer = this.getPointer(options.e);
            view.ports.forEach(port=>{
                var shape = port.portShape;
                var dist = view.getDistance(shape.left,shape.top,pointer.x, pointer.y);
                if( dist < 100){
                    if(shape.visible == false){
                        shape.visible = true;
                        view.canvas.bringToFront(shape); // make sure port is always on top
                    }
                } else {
                    if(shape.visible == true)
                        shape.visible = false;
                }
                
            });
            
            view.canvas.renderAll();
            //*/

        });

        canvas.on('mouse:wheel', function(opt) {
            // Only do this if CTRL is pressed
            var view = this.parent;

            if(view.lastPosX == undefined)
                return;
            /*var delta = opt.e.deltaY;
            var zoom = this.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 2) zoom = 2;
            if (zoom < 0.1) zoom = 0.1;
            this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
            console.log("zoom:"+zoom);
            
            

            // Only do this if CTRL is pressed
            if(!opt.e.ctrlKey)
                return;*/

            
            var zoom = canvas.getZoom();
            var oldzoom = canvas.getZoom();

            var delta = opt.e.deltaY * (3-oldzoom*2);

            zoom *= 0.999 ** delta;

            // only want 1 decimal, for sharp text! (?)
            //zoom = Math.round(zoom * 10) / 10
            
            if (zoom > 1.5) zoom = 1.5;
            if (zoom < 0.2) zoom = 0.2;
            
            // get CURRENT pointer position, on canvas
            var pointer = canvas.getPointer(opt.e); // coordinates in canvas-space - unmodified by zoom
            
            var elem = document.getElementById('centerPane');
            
            var scroll_left = elem.scrollLeft;
            var scroll_top = elem.scrollTop;

            // the nr of visual x-pixels within the panel, to the left of pointer.x
            //var vis_x_screen = (pointer.x*oldzoom) - scroll_left;
            //var vis_y_screen = (pointer.y*oldzoom) - scroll_top;

            opt.e.preventDefault();
            opt.e.stopPropagation();
            
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            
            // save page zoom
            canvas.parent.pageModel.latestZoom = zoom;

            canvas.requestRenderAll();

            view.panLimit = null;
            view.calcPanLimit();
            view.enforcePanLimit();
            
        });
	},

    hide: function(){
        //this.elem = document.getElementById("c");
        this.elem.style.display = "none";
    },

    show: function(){
        //this.elem = document.getElementById("c");
        this.elem.style.display = "block";
    },

    // if view is outside valid pan-limit, bring it inside the limit
    enforcePanLimit:function(){
        var zoom = this.canvas.getZoom();
        var vpt = this.canvas.viewportTransform;

        this.calcPanLimit();

    

        //console.log("vpt: " + -vpt[4]*zoom + "/"+ -vpt[5]*zoom + " view.panLimit:" + this.panLimit.left + "/" + this.panLimit.top + "/" + this.panLimit.right + "/" + this.panLimit.bottom);
        if(-(vpt[4]/zoom) < this.panLimit.left)
        {
            var oldx = vpt[4];
            vpt[4] = -this.panLimit.left*zoom;
            console.log("panning x due to limit - from " + oldx + " to " + vpt[4]);
            this.canvas.renderAll();
        }
        if(-(vpt[5]/zoom) < this.panLimit.top)
        {
            var oldy = vpt[5];
            vpt[5] = -this.panLimit.top*zoom;
            console.log("panning y due to limit - from " + oldy + " to " + vpt[5]);
            this.canvas.renderAll();
        }
        if(-(vpt[4]/zoom) > this.panLimit.right)
        {
            var oldx = vpt[4];
            vpt[4] = -this.panLimit.right*zoom;
            console.log("panning x due to limit - from " + oldx + " to " + vpt[4]);
            this.canvas.renderAll();
        }
        if(-(vpt[5]/zoom) > this.panLimit.bottom)
        {
            var oldy = vpt[5];
            vpt[5] = -this.panLimit.bottom*zoom;
            console.log("panning y due to limit - from " + oldy + " to " + vpt[5]);
            this.canvas.renderAll();
        }
    },

    calcShapesLimit:function(){
        // only recalculate if it has been set to null, which should happen when any relevant changes in shape-position occur
        if(this.shapesLimit != null)
            return;

        // only do this if there are shapes - otherwise set default rect around 0,0
        this.shapesLimit = {};
        if(this.pageModel.shapes.length > 0){
            this.shapesLimit.left = Math.min.apply(Math, this.pageModel.shapes.map(function(o) { return o.x; }));
            this.shapesLimit.top = Math.min.apply(Math, this.pageModel.shapes.map(function(o) { return o.y; }));
            this.shapesLimit.right = Math.max.apply(Math, this.pageModel.shapes.map(function(o) { return o.x; }));
            this.shapesLimit.bottom = Math.max.apply(Math, this.pageModel.shapes.map(function(o) { return o.y; }));
        }
        else{
            // tom "default"-rect
            this.shapesLimit = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        }

        console.log("shape limits recalculated");

        // and when this happens, we always need to recalculate the Actual, zoom-adapted viewport limits
        this.panLimit = null;
    },

    calcPanLimit: function(){
        // only recalculate if it has been set to null, which should happen when any relevant changes in zoom/canvas size occur
        if(this.panLimit != null)
            return;

        this.calcShapesLimit();
        
        var zoom = this.canvas.getZoom();
        var canvasWidth = this.canvas.getWidth();
        var canvasHeight = this.canvas.getHeight();
        
        this.panLimit = {};
        this.panLimit.left = this.shapesLimit.left-(canvasWidth-100)/zoom;
        this.panLimit.top = this.shapesLimit.top-(canvasHeight-100)/zoom;
        this.panLimit.right = this.shapesLimit.right-100/zoom;
        this.panLimit.bottom = this.shapesLimit.bottom-100/zoom;

        console.log("new view.panLimit:" + this.panLimit.left + "/" + this.panLimit.top + "/" + this.panLimit.right + "/" + this.panLimit.bottom);
       
        
        console.log("pan limits recalculated");
    },

    getDistance : function(x1, y1, x2, y2){
        var y = x2 - x1;
        var x = y2 - y1;
        return Math.sqrt(x*x + y*y);
    },

    // create fabric connection object
    // if no existingId submitted inside connModel, calculate new id, and save to pagemodel
    createConnection: function(connModel){
        // find the ports to connect to
        var sourcePort = this.ports.find(p=>
            p.shapeId == connModel.source.shape &&
            p.role == connModel.source.role );
        var targetPort = this.ports.find(p=>
            p.shapeId == connModel.target.shape &&
            p.role == connModel.target.role );
        
        // refuse to connect shape to itself
        if(targetPort == sourcePort)
            return;


        var saveToModel = false;

        // new id = the highest existing, plus 1 
        if(connModel.id == null){
            if(this.pageModel.connections.length == 0)
                connModel.id = 0;
            else
               connModel.id = Math.max(...this.pageModel.connections.map(n=>n.id)) + 1;
            
            saveToModel = true;
        }

        var connection = new StraightConnector([sourcePort.portShape.left-1, sourcePort.portShape.top-1, targetPort.portShape.left-1, targetPort.portShape.top-1], {
            source: sourcePort.portShape,
            target: targetPort.portShape,
            id: connModel.id,
        });

        // set true/false-styling
        connection.setRole(connModel.role);

        //??
        //connection.source = sourcePort.portShape;
        //connection.target = targetPort.portShape;

        if(saveToModel)
            this.pageModel.connections.push(connModel);

        
        this.canvas.add(connection);
        this.connections.push(connection);
        
        // put ports to the front
        this.canvas.bringToFront(sourcePort.portShape);
        this.canvas.bringToFront(targetPort.portShape);

    },

    createFigure: function(shapeModel){
        
        var figureData = {
            id: shapeModel.id, // unique id!
            left:shapeModel.x, 
            top:shapeModel.y, 
            height:100, 
            label:'trams',
            width:100,
            //fill:'green',
            hasControls:true,
            subTargetCheck:true,
            perPixelTargetFind:true
        };
        
        var figure = eval("new "+shapeModel.type+"("+JSON.stringify(figureData)+");");
        this.shapes.push(figure);
        this.canvas.add(figure);
        

        if(shapeModel.data == null)
            shapeModel.data = figure.defaultContent();

        figure.updateContents(shapeModel.data);
        //figure.setCoords();
        var shapePorts = figure.gatherPorts();
        shapePorts.forEach(port => {
            var portShape =  new Port({
                parentShapeId: shapeModel.id, 
                role: port.role,
                radius: 6, 
                fill: '#333', 
                left: port.parent.left+port.x, 
                top: port.parent.top+port.y,
                hasControls:false
            });
            this.canvas.add(portShape);
            this.ports.push(port);
            port.portShape = portShape;
            // port.shapeId = shapeModel.id;
        });

        return figure;
    },

    // set data-model which view should render/control
    setPageModel: function(model){

        if(this.pageModel != undefined)
        {
            console.log("switching FROM page " + this.pageModel.name + " at " + this.pageModel.latestViewport.x + "/" + this.pageModel.latestViewport.y + ":" + this.pageModel.latestZoom)
        }
        this.pageModel = model;

        if(this.pageModel.latestViewport != undefined)
            console.log("switching TO page " + this.pageModel.name + " at " + this.pageModel.latestViewport.x + "/" + this.pageModel.latestViewport.y + ":" + this.pageModel.latestZoom)

        this.canvas.clear();
        //this.canvas.set({"backgroundColor": '#222'});
        this.canvas.backgroundColor = this.backgroundPattern;
            
        
        // const bgUrl = 'http://fabricjs.com/assets/escheresque_ste.png';
        //const bgUrl = './gfx/darkGrid.png';
        
        //this.canvas.setBackgroundImage(app.img, this.canvas.renderAll.bind(this.canvas), {repeat:'repeat', crossOrigin: 'Anonymous'});
        //app.view.backgroundImage =this.backgroundImage;
        /*        
        this.canvas.setBackgroundColor(
            {source: bgUrl, repeat: 'repeat'}, 
            this.canvas.renderAll.bind(this.canvas),
        );*/
        this.shapes = []; 

        // handle ports
        this.portstate = "normal";
        this.ports = [];
        // handle connections
        this.connections = [];

        
        // render page
        if(model.shapes != undefined)
            model.shapes.forEach(shapeModel => {
                this.createFigure(shapeModel);
            });

        // create connections
        if(model.connections != undefined)
            model.connections.forEach(connModel=>{
                this.createConnection(connModel)
            });

        
        // if there is previous viewstate saved, restore it
        if(model.latestZooom != undefined){
            this.canvas.setZoom(model.latestZooom);
        }

        updateAllGroupsContained(this); // for every GroupShape- update which figures it contains..
        
        if(model.latestViewport != undefined){
            var vpt = this.canvas.viewportTransform;
            //this.canvas.zoomToPoint({ x: model.latestViewport.x, y: model.latestViewport.y }, model.latestZooom);
            vpt[4] = model.latestViewport.x;
            vpt[5] = model.latestViewport.y;
            console.log("Setting pan for " + this.pageModel.name + " at " + this.pageModel.latestViewport.x + "/" + this.pageModel.latestViewport.y)

        }

        // if there is previous viewstate saved, restore it
        if(model.latestZooom != undefined){
            this.canvas.setZoom(model.latestZooom);
        }
        
        //this.canvas.setCoords();
        

        this.panLimit = null;
        this.shapesLimit = null;
        //this.calcPanLimit();
        //this.enforcePanLimit();

        //this.canvas.requestRenderAll();
        this.canvas.renderAll();
        
    },

    destroyDragPort : function(){
        console.log("dragport destroyed");
        var canvas = this.canvas;
        if(this.draggedPort != null){
            canvas.remove(this.draggedPort);
            
            this.draggedPort = null;
            canvas.remove(canvas.portLine);
            this.portLine = null;
            canvas.renderAll();
        }
    },
    
    portMouseover : function(portShape){
        // maybe create draggable port-disk?
        this.destroyDragPort(); // if there should happen to be one left, destroy it
        if(this.portstate == "normal"){
            
            console.log("port mouse over");
            
            var dragShape =  new DraggablePort({left: portShape.left, top: portShape.top, view: this});

            this.draggedPort = dragShape;
            dragShape.fromPort = portShape;
            this.canvas.add(dragShape);
            this.canvas.bringToFront(dragShape);
            
            console.log("portmouseover");
            //canv.setActiveObject(dragShape);
        }
        
    },

    dragPortMouseout : function(portShape){
                
        console.log("dragport mouseout");
        if(this.portstate == "normal"){
            //destroyDragPort();
        }
    },

    portMouseout : function(portShape){
        if(this.portstate == "draggingPort"){
            console.log("portMouseout");
            //destroyDragPort();
        }
    },

    markSelectedConnection : function(conn){
        this.unmarkSelectedConnection();
        //conn.set('stroke','red');
        //conn.set('strokeWidth','3');

        // add a mark to show which connection is selected
        var mark = new fabric.Circle({selectable: false,
            strokeWidth: 1,
            originX: 'center',
            originY: 'center',
            fill: 'transparent',
            left: (conn.target.left + conn.source.left)/2,
            top: (conn.target.top + conn.source.top)/2,
            stroke: '#00ff00',
            radius: 10}
        )

        this.connectionMark = mark;
        this.canvas.add(mark);

        this.selectedLine = conn;
        //conn.setCoords();
    },

    unmarkSelectedConnection : function(){
        if(this.selectedLine){
            this.selectedLine = null;
            this.canvas.remove(this.connectionMark);
            this.connectionMark = null;
            // conn.set('stroke','blue');
            //conn.set('strokeWidth','2');
        }
    },
/*
    function portdragEnter(portShape){
        if(canv.state == "draggingPort"){
            canv.dropPortTarget = portShape;
        }
    }
*/
    // start dragging a possible connection
    dragPortMousedown : function(dragPortShape){
        var canvas = this.canvas;
        //#CONN
        // maybe create draggable port-disk?
        if(this.portstate == "normal"){
            this.portstate = "draggingPort";
            console.log("state = " + this.portstate);
            var portShape = dragPortShape.fromPort;
            // check what kind of port we are pointing at.. decides what kind of connection we are going to create
            if(portShape.role == "out" ||  portShape.role == "in"){
                // this should become a StraightConnection
                this.portLine =  new StraightConnector([dragPortShape.left-1, dragPortShape.top-1, portShape.left-1, portShape.top-1], {
                    source: dragPortShape,
                    target: portShape
                });
                this.portLine.setRole("preview");
            }
/*
            this.portLine = new fabric.Line([dragPortShape.left, dragPortShape.top, portShape.left, portShape.top], {
                //fill: 'red',
                stroke: 'gray',
                strokeWidth: 2,
                selectable: false,
                strokeDashArray: [3],
                //evented: false,
                padding: 1
            });
*/
            canvas.add(this.portLine);
            this.portLine.setCoords();
            canvas.bringToFront(portShape);
            canvas.renderAll();
            this.portLine.on('mousedown',function(options){
                if (options.target) {
                    // WUT?.. hur addressera?
                    canvas.parent.markSelectedConnection(this);
                }
            });
        }
    },

    // receive an updated shapeModel - update display and model storage
    updateShapeContents(shapeModel){
        // update stored shapeModel
        var storedVersion = this.pageModel.shapes.find(s=>s.id == shapeModel.id);
        // just update the stored shape-specific data - not pos, id or overlying
        storedVersion.data = shapeModel.data;

        // update ports
        var figure = this.shapes.find(s=>s.id == shapeModel.id);
        figure.updateContents(shapeModel.data);

        // if this shape has an isInvalid method, and it returns true..
        if(figure.isInvalid && figure.isInvalid(shapeModel.data))
        {
            // maybe delete the shape?
        }

        // get updated ports
        var newShapePorts = figure.gatherPorts();
        var existingShapePorts = this.ports.filter(p=>p.shapeId == shapeModel.id);

        // delete those removed (existing among old ports of shape, but not among the new ones), and eventual connections - there can only be one of each role, so id * role = unique
        //var toDelete = existingShapePorts.filter(p=>!newShapePorts.includes(p));
        var toDelete = existingShapePorts.filter(ep=>!newShapePorts.find(np=>np.role == ep.role));
        for(d of toDelete){
            
            var portConnections = this.connections.
                filter(conn=> 
                    toDelete.
                        find(p=>conn.source == p.portShape || conn.target == p.portShape)
                );
            
            for(conn of portConnections){
                // delete connections from model
                this.modelPage.connections = this.modelPage.connections.filter(c=>c.id != conn.id);
                // delete connections from view
                this.connections = this.connections.filter(c=>c == conn);
                this.canvas.remove(conn);
            }
            // delete from view
            this.canvas.remove(d.portShape);           
        }

        // update those already existing - redraw possible connections
        var toUpdate = existingShapePorts.filter(ep=>newShapePorts.find(np=>np.role == ep.role));
        for(port of toUpdate){
            // move existing portShape of existing port
            var newPortVersion = newShapePorts.find(n=>n.role == port.role);
            port.x = newPortVersion.x;
            port.y = newPortVersion.y;
            var parentx = port.parent.left;
            var parenty = port.parent.top;
            if(port.parent.group){
                parentx += port.parent.group.left + port.parent.group.width / 2;
                parenty += port.parent.group.top + port.parent.group.height /2;
            }
            port.portShape.set({
                left: parentx+port.x, 
                top: parenty+port.y
            });
            
        } 

        // redraw connections to this port

        var selectedConnections = this.connections.
            filter(conn=> 
                toUpdate.
                    find(p=>conn.source == p.portShape || conn.target == p.portShape)
            );

        selectedConnections.forEach(conn => {
            conn.set({
                'x2':conn.source.left-1, 
                'y2': conn.source.top-1,
                'x1':conn.target.left-1, 
                'y1': conn.target.top-1
            });
            conn.setCoords();
        });

        // add those not previously existing - these can have no connections 



    },

    updatePorts : function(){

        var canvas = this.canvas;

        this.ports.forEach(port => {
            canvas.remove(port.portShape);
        });

        // collect all ports from shapes
        this.ports = [];
        this.allShapes.forEach(shape => {
            shape.gatherPorts(this.ports); // puts them in canvas.ports
        });
        
        // draw all the ports! - specialized circle!
        this.ports.forEach(port => {
            var portShape =  new Port({ 
                radius: 6, 
                fill: '#f55', 
                left: port.parent.left+port.x, 
                top: port.parent.top+port.y,
                hasControls:false,
                view: this
            });
            canvas.add(portShape);
            port.portShape = portShape;
        });
    },


    /* 
    bring selected thing to front - in the case of groups this needs to be done recursively
    */
    bringForward: function(shape){
        var canvas = this.canvas;

        // in any case, bring it and its dependants (connections, ports) to the front
        canvas.bringToFront(shape);
        // ports & connections
        var ports = this.ports.filter(port=> port.parent == shape);
        var connections = this.connections.
            filter(conn=> 
                ports.
                    find(p=>conn.source == p.portShape || conn.target == p.portShape)
            );
        
        for(conn of connections){
            canvas.bringToFront(conn);
        }

        for(port of ports){
            canvas.bringToFront(port.portShape);
        }


        // if this is a group shape, now is the time to bring its children to the front in the same way, so they will be on top of the group
        if(shape.type == "groupShape"){
            // find all membershapes
            for(id of shape.contained){
                // gatherContained will have been called before this.. 
                var childShape = this.shapes.find(shape => shape.id == id);
                if(childShape){
                    this.bringForward(childShape);
                }
            }

            // bring them forward
            // (organize in group-tree first?..) 
        }

    },

    handleSelection : function(options)
    {
        var canvas = this.canvas;

        this.unmarkSelectedConnection();
        // make sure it can't be rotated
        const activeSelection = options.target
        activeSelection.set({hasControls: false,padding: 10, borderColor:"#00ff00", cornerColor:"#00ff00"})

        // allow size-controls - ONLY on GroupShape
        var selection = options.selected;
        //selection[0].set({hasControls: false,padding: 10, borderColor:"#00ff00", cornerColor:"#00ff00"})
        // clear old panel control, if any
        var propertyView = $("#properties");
        propertyView.html("");

        if(selection.length == 1){
            var selectedShape = selection[0];
            if(selectedShape.type == "groupShape")
            {
                activeSelection.set({hasControls: true});
                // don't allow rotation control
                activeSelection.setControlVisible('mtr',false);
            }

            // activate shape editor-pane, if possible
            if(selectedShape.buildInputPanel)
            {
                selectedShape.buildInputPanel(propertyView, selectedShape);
            }

            app.drawingPanel.hide();
            app.folderPanel.hide();
            app.palette.hide();
        }
        else
        {
            app.palette.show();
            app.drawingPanel.show();
        }
        // check which shapes are selected
       
        if(selection != undefined){
            this.selectedShapes = selection;

            // add those shapes contained in (possible) selected group-shapes
            var groupShapes = this.selectedShapes.filter(s=>s.type == "groupShape");
            this.followingShapes = [];
            this.startDrag = {left:options.target.left, top: options.target.top};

            // TODO: contained should be stored in Model instead of in shape!(?)(now in both)
            for(groupShape of groupShapes){
                groupShape.gatherContained(); // check which shapes are inside this group
                this.followingShapes = this.followingShapes.concat(groupShape.setContainedStartPos(this));    
            }
            //console.log("following shapes:" + this.followingShapes.length);

            this.selectedPorts = this.ports.filter(port=> selection.includes(port.parent) || this.followingShapes.includes(port.parent));
            this.selectedConnections = this.connections.
                filter(conn=> 
                    this.selectedPorts.
                        find(p=>conn.source == p.portShape || conn.target == p.portShape)
                );

            // redraw all selected connections
            /*for(conn of this.selectedConnections){
                conn.redraw();  
            }*/

            for(selected of selection){
                this.bringForward(selected);
                //this.canvas.bringToFront(selected);
            }
            for(port of this.selectedPorts){
                this.canvas.bringToFront(port.portShape);
                //this.canvas.bringToFront(selected);
            }
            
            //console.log("selected ports:" + this.selectedPorts.length);
            //console.log("selected connections:" + this.selectedConnections.length);

            // remove actually selected connectors from selection
            /*selection.forEach(element => {
                if(element.lineCoords != undefined){

                }
            });
            */
            //canv.state = "selected";
            //canvas.ports.forEach(port => {
            //    port.portShape.visible = false;
            //});
            this.selected = options.selected;
            this.canvas.renderAll();
            //destroyDragPort();
            //canv.state = "normal";
        }
    },

    getShapeModel:function(id){
        return this.pageModel.shapes.find(s=>s.id == id);
    },

    deleteConnection: function(connectionFigure){
        this.unmarkSelectedConnection();
        this.canvas.remove(connectionFigure);
        this.connections = this.connections.filter(conn => conn != connectionFigure);
        this.pageModel.connections = this.pageModel.connections.filter(conn => conn.id != connectionFigure.id);
    },

    // shape should be deleted - maybe because it has been found to be invalid
    // unused?
    deleteShape: function(figure){
        var shapeId = figure.id;
        // delete from pagemodel 
        this.pageModel.shapes = this.pageModel.shapes.filter(shapeM => shapeM.id != shapeId);
        // delete the ports of the shape
        this.ports = this.ports.filter(p=>p.parentShapeId != shapeId);
        // delete the connections of the shape
        var connectionIds = this.connections.filter(conn => conn.target.shape == shapeId || conn.source.shape == shapeId).amp(c=>c.id); 
        for(connId of connectionIds){
            
        }
        // delete figure from canvas

        // delete reference in view

    },

    // delete all tings selected (shapes, their ports and their connections)
    deleteSelection: function(){
        
        // delete all involved connections
        this.selectedConnections.forEach(conn => {
            this.deleteConnection(conn);
        });

        // delete all selected shapes
        this.selectedShapes.forEach(shapeFigure=>{
            //if(shapeFigure.isDataShape){
                console.log("Deleting shape with id#" + shapeFigure.id);
                // delete from view list of figures
                this.shapes = this.shapes.filter(shapeM => shapeM.id != shapeFigure.id); 
                // delete from datamodel
                this.pageModel.shapes = this.pageModel.shapes.filter(shapeM => shapeM.id != shapeFigure.id);
                // delete from canvas
                this.canvas.remove(shapeFigure);
            //}
        });

        // delete all selected ports
        this.selectedPorts.forEach(port => {
            this.ports = this.ports.filter(p=>p != port);
            this.canvas.remove(port.portShape);
        });

        this.canvas.discardActiveObject();
        this.canvas.renderAll(); 
        this.selected = null;
    },

    // go through all groups om current page, and set what shapes are contained by them
    // this is called (for example) before switching page, or generating code
    calculatePageGroupContainment:function(){
        
        // find all group-shapes on page
        var groups = this.shapes.filter(shape=>shape.type == "groupShape");
        
        // go through them and see what shapes they contain
        for(var group of groups){
            var contained = this.shapes.filter(shape=>shape != group && shape.isContainedWithinObject(group));
            group.contained = contained.map(c=>c.id);
            // set in model
            var groupModel = this.pageModel.shapes.find(gm=>gm.id == group.id);
            groupModel.data.contained = group.contained;
        }

        // go through all groups, and remove the contained of all other groups inside them
        // (depends on the largest/lowest ones being processed first)
        for(var group of groups){
            for(var childId of group.contained){
                var shapeModel = this.pageModel.shapes.find(sm=>sm.id == childId);
                // in case we can't find the contained shape any more.. TODO: better truth maintenance, here - how to make sure contained by group is always updated when needed?
                if(shapeModel != undefined && shapeModel.type == "GroupShape"){
                    // remove all of these contained, from the overlying group
                    group.contained = group.contained.filter(id=> !shapeModel.data.contained.includes(id));
                }
            }
            var groupModel = this.pageModel.shapes.find(gm=>gm.id == group.id);
            groupModel.data.contained = group.contained;
        }

    },

    // a message containing a reference to a shape/connection on a certain page.
    // this method shows the target object to the user
    showMessageTarget:function(message){
        // go to the correct page
        var pageId = message.resourceId;
        var page = app.getRulePage(pageId);
        this.setPageModel(page);
        // mark the correct connection/shape
        if(message.targetType == "shape")
        {
            var id = message.targetId;
            // find shape
            var shapeFigure = this.shapes.find(s=>s.id == id);
            this.canvas.setActiveObject(shapeFigure);
            // make sure it's visible!
            this.centerScreenOnItem(shapeFigure);
        }
        // 
    },

    centerScreenOnItem: function(object){
        // item can be any shape / connection
        /*var vpt = this.canvas.viewportTransform;
        vpt[4] = -item.left;// + this.canvas.width/2;
        vpt[5] = -item.top;// + this.canvas.height/2;
        */
       //this.canvas.centerObject(item);
       var zoom = this.canvas.getZoom();
       var panX = ((this.canvas.getWidth() / zoom / 2) - (object.aCoords.tl.x)) * zoom;
        var panY = ((this.canvas.getHeight() / zoom / 2) - (object.aCoords.tl.y)) * zoom;
        
      
       
       this.canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
        this.shapesLimit = null;
        this.panLimit = null;
        this.calcShapesLimit();
        this.canvas.renderAll();
    },

    copySelectionToClipboard: function(){
        // this is where we collect everything we want to copy
        var clipboard = {shapes:[],connections:[]};

        var elementsToCopy = this.selectedShapes;

        // add implicitly selected shapes - in selected group(/s)
        this.followingShapes.forEach(follower => {
            if(!elementsToCopy.find(s=>s.id == follower.id)){
                elementsToCopy.push(follower);
            }
        });
        
        var page = GetCurrentModelPage();
        
        var lowy = 100000; // lowest y encountered
        var lowx = 100000; // leftmost x encountered
        var highy = -100000;
        var highx = -100000;

        // copy shapes
        elementsToCopy.forEach(element => {
        
            // save copy of shape data directly from model
            var shapeModel = this.getShapeModel(element.id);
            var clonedModel = JSON.parse(JSON.stringify(shapeModel));
            
            // figure out dimensions of clipboard
            if(shapeModel.x > highx)
                highx = shapeModel.x;
            if(shapeModel.x < lowx)
                lowx = shapeModel.x;
            if(shapeModel.y > highy)
                highy = shapeModel.y;
            if(shapeModel.y < lowy)
                lowy = shapeModel.y;

            clipboard.shapes.push(clonedModel);
            
        });

        // copy connections
        this.selectedConnections.forEach(element => {
            // - get the original directly from the model!
            var connection = page.connections.find(e => e.id == element.id);
            var copy = JSON.parse(JSON.stringify(connection));
            clipboard.connections.push(copy);
        });

        // normalize positions of shapes in the clipboard
        clipboard.shapes.forEach(shape => {
            shape.x = shape.x - lowx;
            shape.y = shape.y - lowy;
        });

        this.clipboard = clipboard; // remember the clipboard, please!

        // remember dimensions of selection
        clipboard.height = highy - lowy;
        clipboard.width = highx - lowx;
    },

    pasteFromClipboard:function(){
        // create new instances of the data in the clipboard
        // TODO: does this work properly with group-shapes?.. 
        var clipboard = this.clipboard;
        var newFigures = []; // new draw2d.util.ArrayList();

        // decide where the pasted things should go
        // currenty: center on page... not so great.. 
        var vpt = this.canvas.viewportTransform;
        var centery = -(vpt[5]  + (clipboard.height/2))/ this.canvas.getZoom();
        var centerx = -(vpt[4]  + (clipboard.width/2))/ this.canvas.getZoom();
        var halfxscreen = (this.canvas.getWidth() / this.canvas.getZoom())/2;
        var halfyscreen = (this.canvas.getHeight() / this.canvas.getZoom())/2;

        var page = GetCurrentModelPage();
        var idMap = new Map();  // map old ids to the new id's, of the shapes

        clipboard.shapes.forEach(shape => {
            // copy again, since we want all copies to be independent
            var shapeCopy = JSON.parse(JSON.stringify(shape));
            var nextShapeId = 0;
            if(this.pageModel.shapes.length > 0)
                nextShapeId = Math.max(...this.pageModel.shapes.map(n=>n.id)) + 1;
            shapeCopy.id = nextShapeId;    // assign new id
            // modify pos
            shapeCopy.x += centerx + halfxscreen;
            shapeCopy.y += centery + halfyscreen;

            console.log("Shape copy created with id#" + shapeCopy.id);

            var figure = this.createFigure(shapeCopy);
            this.pageModel.shapes.push(shapeCopy);
            idMap.set(shape.id, figure.id); // create mapping old->new id
            
            // remember new figure, to select it later
            newFigures.push(figure);
        });
        clipboard.connections.forEach(connection => {
            // copy again, so everything is independent
            var connectionCopy = JSON.parse(JSON.stringify(connection));

            // change references from old anchor ids to new ones
            var sourceId = connectionCopy.source.shape;
            var newSourceId = idMap.get(sourceId);
            connectionCopy.source.shape = newSourceId;
            
            var targetId = connectionCopy.target.shape;
            var newTargetId = idMap.get(targetId);
            connectionCopy.target.shape = newTargetId;
            
            if(newSourceId != undefined && newTargetId != undefined){
                // otherwise, we did not find the source/target shape in the clipboard, which means one of the shapes is not copied: ignore copying this connection
               
                // generate new id
                this.pageModel.connections.push(connectionCopy);
                if(this.pageModel.connections.length == 0)
                    connectionCopy.id = 0;
                else
                    connectionCopy.id = Math.max(...this.pageModel.connections.map(n=>n.id)) + 1;

                this.createConnection(connectionCopy);
            }

        });

        var canvas = this.canvas;

        canvas.discardActiveObject();
        if(newFigures.length == 1)
            canvas.setActiveObject(newFigures[0]);
        else{    
            var sel = new fabric.ActiveSelection(newFigures, {
            canvas: canvas,
            });

            canvas.setActiveObject(sel);
        }

        canvas.requestRenderAll();
    },
   


    // --------- LEGACY FLUFF FOR REFERENCE ---------------------------------------
    /**
     * @method
     * Called if the DragDrop object is moving around.<br>
     * <br>
     * Graphiti use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} droppedDomNode The dragged DOM element.
     * @param {Number} x the x coordinate of the drag
     * @param {Number} y the y coordinate of the drag
     * 
     * @template
     **/
    /*
    onDrag:function(droppedDomNode, x, y )
    {
    },
    */
    /**
     * @method
     * Called if the user drop the droppedDomNode onto the canvas.<br>
     * <br>
     * Draw2D use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} droppedDomNode The dropped DOM element.
     * @param {Number} x the x coordinate of the drop
     * @param {Number} y the y coordinate of the drop
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @private
     **/
    /*onDrop : function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        var type = $(droppedDomNode).data("shape");
        var figure = eval("new "+type+"();");
        // drop shape into model
        var page = Model.rulePages[CurrentViewedPageNr];
        var newShape = {typeName : type, id:figure.id, x:x, y:y, shapeData:figure.userData };
        
        page.shapes.push(newShape);

        

        // create a command for the undo/redo support
        var command = new draw2d.command.CommandAdd(this, figure, x, y);
        this.getCommandStack().execute(command);

        //var newx = newShape.x - figure.getWidth()/2;
        //var newy = newShape.y - figure.getHeight()/2;
        //figure.setX(newx);
        //figure.setY(newy);

        // automatically select the newly created shape
        //example.properties.on
        this.setCurrentSelection(figure);
    }*/
});