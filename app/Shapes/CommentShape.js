var CommentShape = fabric.util.createClass(fabric.Group, {
    type: 'commentShape',
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
        this.isDataShape = true; // all shapes should be data shapes?
        this.value = null;
        
    },

    defaultContent: function(){
        return {
            value: ""
        };

    },
    // gather all ports, with positions relative to the shape left/top
    gatherPorts: function(){
        // comment shape has no ports
        return [];
    },

    
    updateContents: function(shapeData) {

         // delete all the old content
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
         var padding = 10;
         var bottomPad = 0; // extra padding after last row
 
         this.value = new fabric.Text(shapeData.value,{fontSize:11, objectCaching: false,originX: 'center', fill:'green',fontFamily:'arial'});
 
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
             fill: '#000000',
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
            '     Comment'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div class="input-group" ></div> '+
            '           <textarea id="comment_text" class="form-control"  tabIndex="1002" style="height:50%; width:100%; min-height:90px">'+ userData.value +'</textarea>' +
            '		');

        view.append(
        '      <button id="ok_button" tabIndex="1003">Ok</button>'+
        '    </div>'+
        '  </div>'+
        '</div>');

           
        $("#ok_button").on("click", function(){
            var userData = app.view.getShapeModel(figure.id).data;

            userData.value = $("#comment_text").val();

            figure.updateContents(userData);
            app.view.canvas.renderAll();
        });    
       
    },

});