var DcgTerminalShape = fabric.util.createClass(fabric.Group, {
    type: 'dcgTerminalShape',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });

        this.callSuper('initialize',[], options);
        this.set({ 
            originX: 'center',
            originY: 'center',
            objectCaching: false,
            hasControls: true
         });
        
         
        // TODO: when will these contained shapes be calculated?
        // - can we get drop-preview? (mark group border green, when we're going to drop on it)
        this.isDataShape = true;
        this.value = null;
        
    },

    defaultContent: function(){
        return {
            value: "[a]"
        };

    },
    // gather all ports, with positions relative to the shape left/top
    gatherPorts: function(){
        // top and bottom ports
        var topPort = {parent:this, shapeId:this.id, role:"in",x:0,y:-this.height/2};
        var bottomPort = {parent:this, shapeId:this.id, role:"out",x:0,y:this.height/2};
        
        return [topPort, bottomPort];
    },

    
    updateContents: function(shapeData) {

         // delete all the old content
         this.argumentRows = [];
         if(this.bg != null){
             this.remove(this.value);
             this.remove(this.bg);
         }
         var startx = this.left;
         var starty = this.top;
         var incomingx = startx;
         var incomingy = starty;
 
         var maxWidth = 0;
         var totHeight = 0;
         var padding = 4;
         var bottomPad = 2; // extra padding after last row
 
         this.value = new PrologText(shapeData.value,{fontSize:11, objectCaching: false,originX: 'center', fill:'white',fontFamily:'arial'});
 
         maxWidth = this.value.width + padding * 2;
         totHeight += this.value.height + padding * 2;
  
         // set minimum width
         if(maxWidth < 50)
             maxWidth = 50
 
         // place controls
         var top = 0;
 
         this.bg = new RoundedRect({
             topLeft:[5,5],
             topRight : [5,5],
             bottomLeft: [5,5],
             bottomRight: [5,5],
             top: this.top,
             left: this.left,
             width: 30,
             height: 30,
             fill: '#ffaaaa',
             rx: 5,
             ry: 5
           });
         var bg = this.bg;
 
         totHeight += bottomPad;
 
         // center the bg rect on midpoint
         bg.width = maxWidth;
         bg.height = totHeight;
         bg.left = this.left - bg.width/2;
         bg.top = this.top - bg.height/2;
         startx = bg.left;
         starty = bg.top;
         this.addWithUpdate(bg);
 
                  
         this.value.left = startx + maxWidth/2; // - this.value.width / 2;
         this.value.top = starty + top + padding;
         this.addWithUpdate(this.value);

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
        
        view.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     DCG Terminal'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div class="input-group" ></div> '+
            '           <input id="arg_terminal" type="text" tabIndex="1002" class="form-control" value="'+ htmlPrologEncode(userData.value) +'"/>' +
            '		');

        view.append(
        '      <button id="ok_button"  tabIndex="1003">Ok</button>'+
        '    </div>'+
        '  </div>'+
        '</div>');

           
        $("#ok_button").on("click", function(){
            var userData = app.view.getShapeModel(figure.id).data;

            userData.value = $("#arg_terminal").val();

            figure.updateContents(userData);
            app.view.canvas.renderAll();
        });    
       
    },

});