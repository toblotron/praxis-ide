//const { fabric } = require("./lib/fabric.min");

var LogicShape = fabric.util.createClass(fabric.Group, {
    type: 'logicShape',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { originX:'center' });

        this.callSuper('initialize',[], options);
        this.set({ 
            originX: 'center',
            originY: 'center',
            objectCaching: false
         });
        // to store refs to the rows of displayitems
        this.operatorText = null;
        this.isDataShape = true;
          
    },

    // gather all ports, with positions relative to the shape
    gatherPorts: function(){
        // top and bottom ports
        var topPort = {parent:this, shapeId:this.id, role:"in",x:0,y:-this.height/2};
        
        var bottomPort = {parent:this, shapeId:this.id, role:"out",x:0,y:this.height/2};
        
        return [topPort, bottomPort];
    },

    defaultContent: function(){
        return {
            operator: "1ST"
        }
    },

    updateContents: function(shapeData) {
        
        // delete all the old content
        if(this.circle != null){
            this.remove(this.circle);      
            this.remove(this.rect);
            this.remove(this.operatorText);
        }

        var startx = this.left;
        var starty = this.top;
        var incomingx = startx;
        var incomingy = starty;

        // Select style depending on operator
        var styles = [
            {op:"AND", background_col:"#00a8f0",text_col:"white"},
            {op:"OR", background_col:"yellow",text_col:"black"},
            {op:"1ST", background_col:"orange",text_col:"black"},
            {op:"NOT", background_col:"red",text_col:"white"},
            {op:"CUT", background_col:"purple",text_col:"white"}
        ];

        var style = styles.find(s => s.op == shapeData.operator);

        // place controls
        this.circle = new fabric.Circle({
            top: starty,
            left: startx,
            strokeWidth: 0,
            originX: 'center',
            originY: 'center',
            fill: style.background_col,
            radius: 15 });

        this.rect = new fabric.Rect({
            top: starty+15,
            left: startx,
            width: 30,
            originX: 'center',
            originY: 'center',
            height: 20,
            strokeWidth : 0,
            fill: style.background_col
        });


        this.operatorText = new fabric.Text(shapeData.operator,{
            fontSize:11, 
            top: starty+20,
            left: startx,
            fill: style.text_col,
            fontWeight: 'bold',
            originX: 'center',
            originY: 'center', 
            fontFamily:'arial'});

        this.circle.top = starty;
        
        this.addWithUpdate(this.circle);

        this.rect.top = starty + 12;
        this.operatorText.top = starty + 5;

        //this.operatorText.top = this.top; // - this.operatorText.height/2;
        //this.operatorText.left = circle.left;// - this.operatorText.width/2;

        //this.width = circle.width;
        //this.height = circle.height;

        // center the bg rect on midpoint
        //bg.left = this.left - bg.width/2;
        //bg.top = this.top - bg.height/2;
        //startx = circle.left;
        ///starty = circle.top;

        this.addWithUpdate(this.rect);
        
        this.addWithUpdate(this.operatorText);
        
        //this.left = incomingx;
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
        // modify library and rule names
        var userData = app.view.getShapeModel(figure.id).data;
        view.html("");
        
        view.append('<div id="rule_property_container" class="panel panel-default">' +
            ' <div class="panel-heading " >'+
            '     Logic'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div class="input-group" ></div> ');

        var options = ["AND", "OR", "1ST","NOT","CUT"];
        var radiohtml = "";
        for(option of options){
            radiohtml += '<input type="radio" id="logic_' + option + '" name="' + figure.id + '" value="' + option + '"';
            if(userData.operator == option){
                radiohtml += ' checked="true"';
            }
            else{

            }
            radiohtml += '><label for "logic_' + option + '">' + option + '</label><br>\n';
        }

        view.append(radiohtml +
        '   </div>'+
        ' </div>'+
        '</div>');

        $("input[type='radio']").change(function () {
			var selection=$(this).val();
            
            var userData = app.view.getShapeModel(figure.id);
            userData.data.operator = selection;
            //figure.updateContents(userData);
            //this.canvas.renderAll();
            app.view.updateShapeContents(userData);
            app.view.canvas.renderAll();
        });
        
    },

});