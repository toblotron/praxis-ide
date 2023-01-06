var FindallShape = fabric.util.createClass(fabric.Group, {
    type: 'findallShape',
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
        this.titleRect = null;
        this.titleName = null;
        this.capturePattern = null;
        this.captureList = null;
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
            capturePattern: "",
            captureList: "Results"
        };

    },

    updateContents: function(incomingShapeData) {

        var shapeData = incomingShapeData;

        // delete all the old content
        this.argumentRows = [];
        if(this.bg != null){
            this.remove(this.titleName);
            this.remove(this.titleRect);
            this.remove(this.capturePattern);
            this.remove(this.captureList);
            this.remove(this.bg);
        }

        var startx = this.left;
        var starty = this.top;
        var incomingx = startx;
        var incomingy = starty;

        var isPreview = false;
        if(pb.FindallShape.isInvalid({data:shapeData}, null)){
            isPreview = true;
            // set temporary preview-values
            shapeData = {capturePattern:"capturePattern", captureList:"targetList"};
        }

        var maxWidth = 0;
        var totHeight = 0;
        var padding = 4;
        var bottomPad = 2; // extra padding after last row
        var linePad =3;
        var bgStartY = 0;
        var bgHeight = 0;

        this.titleRect = new RoundedRect({fill:'#000000', topLeft:[5,5], topRight:[5,5]});
        this.titleName = new fabric.Text("FINDALL",{fontSize:12, objectCaching: false,originX: 'center', fill:'white',fontFamily:'arial'});

        maxWidth = this.titleName.width + padding * 2;
        totHeight += this.titleName.height + padding * 2;
        bgStartY = totHeight;   // save for setting final bg location

        this.capturePattern = new PrologText(shapeData.capturePattern,{fontSize:11, objectCaching: false,originX: 'center',
        originY: 'center', fontFamily:'arial', isPreview:isPreview });
        var captureWidth = this.capturePattern.width + padding * 2;
        if(captureWidth > maxWidth)
            maxWidth = captureWidth;
        totHeight += this.capturePattern.height + padding * 2;


        this.captureList = new PrologText(shapeData.captureList,{fontSize:11, objectCaching: false, originX: 'center',
        originY: 'center',fontFamily:'arial', isPreview:isPreview});

        var captureListWidth = this.captureList.width + padding * 2;
        if(captureListWidth > maxWidth)
            maxWidth = captureListWidth;
        totHeight += this.captureList.height + padding * 2;

        // set minimum width
        if(maxWidth < 75)
            maxWidth = 75

        
        // place controls
        var top = 0;

        this.bg = new RoundedRect({
            bottomLeft: [5,5],
            bottomRight: [5,5],
            top: this.top,
            left: this.left,
            width: 30,
            height: 30,
            fill: 'white'
          });
        var bg = this.bg;

        if(isPreview){
            this.titleRect.opacity = 0.5;
            
            this.titleName.opacity = 0.5
            this.titleName.fontStyle = "italic";

            this.capturePattern.opacity = 0.5
            this.captureList.opacity = 0.5
            this.bg.opacity = 0.5;
        }

        totHeight += bottomPad;

        // center the bg rect on midpoint
        bg.width = maxWidth;
        bg.height = totHeight;
        bg.left = this.left - bg.width/2;
        bg.top = this.top - bg.height/2;
        startx = bg.left;
        starty = bg.top;

        bgHeight = totHeight - bgStartY;

        this.addWithUpdate(bg);

        this.titleRect.left = startx;
        this.titleRect.width = maxWidth; // this.titleName.width + padding * 2;
        this.titleRect.height = this.titleName.height + padding * 2;
        this.titleRect.top = starty;
        this.addWithUpdate(this.titleRect);
        
        this.titleName.left = startx + maxWidth/2;
        this.titleName.top = starty + top + padding;
        this.addWithUpdate(this.titleName);
        top += this.titleRect.height;
    
        
        this.capturePattern.left = startx + maxWidth/2;// + this.capturePattern.width/2;    
        this.capturePattern.top = starty + top + padding + this.capturePattern.height/2;
        this.addWithUpdate(this.capturePattern);
        top += this.capturePattern.height + padding * 2;

        this.captureList.left = startx + maxWidth/2;// + this.captureList.width/2;    
        this.captureList.top = starty + top + padding +this.captureList.height /2;
        this.addWithUpdate(this.captureList);

        bg.top = bg.top + bgStartY;
        bg.height = bgHeight;
        bg.width = maxWidth;

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

        // modify library and rule names
        view.append('<div id="formula_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Findall'+
            '</div>'+
            ' <div class="panel-body" id="findall_panel">'+
            '   <div class="form-group">'+		
            '       <label>Capture-pattern</label><input id="property_pattern" tabIndex="1001" type="text" class="form-control" value="'+userData.capturePattern+'"/><br>'+
            '       <label>Destination List</label><input id="property_list" tabIndex="1002" type="text" class="form-control" value="'+userData.captureList+'"/>');

        view.append(
        '			<button id="cancel_button" tabIndex="1003">Cancel</button>'+
        '			<button id="ok_button" tabIndex="1004">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');
            
        $("#ok_button").on("click", function(){
            var userData = app.view.getShapeModel(figure.id).data;

            userData.capturePattern=$("#property_pattern").val();
            userData.captureList=$("#property_list").val();            

            figure.updateContents(userData);
            app.view.canvas.renderAll();
        });

        //var elem = $("#property_pattern");  // focus and select 
        //window.setTimeout(() => elem.focus().select(), 0);
        
    },

});


    