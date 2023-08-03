var GroupShape = fabric.util.createClass(fabric.Group, {
    type: 'groupShape',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });

        this.callSuper('initialize',[], options);
        this.set({ 
            originX: 'left',
            originY: 'top',
            objectCaching: false,
            hasControls: true
         });
        
         
        // TODO: when will these contained shapes be calculated?
        // - can we get drop-preview? (mark group border green, when we're going to drop on it)
        this.isDataShape = true;
        
    },

    // gather all ports, with positions relative to the shape left/top
    gatherPorts: function(){
        // top and bottom ports
        var topPort = {parent:this, shapeId:this.id, role:"in",x:(this.width* this.scaleX)/2,y:0};
        
        var bottomPort = {parent:this, shapeId:this.id, role:"out",x:(this.width*this.scaleX)/2,y:this.height*this.scaleY};
        
        return [topPort, bottomPort];
    },

    // figure out which shapes are contained by this group
    // TODO: only do this through the view method calculatePageGroupContainment?
    gatherContained: function(){
        // look in live, instantiated shapes, to get exact dimensions?
        var view = this.canvas.parent;
        
        var left = this.left;
        var top = this.top;

        // if this groupShape is right now part of the selection-group, modify search area 
        if(this.group){
            left += this.group.left + this.group.width / 2;
            top += this.group.top + this.group.height /2;
        }

        var right = left + this.width;
        var bottom = top + this.height;

        this.contained = view.shapes.filter(s=>
            s.left >= left &&
            s.left <= right &&
            s.top >= top && 
            s.top <= bottom && 
            s != this
        ).map(m=>m.id);

        return this.contained;
    },

    defaultContent: function(){
        return {
            contained: [],
            operator: 'AND',
            width: 300,
            height: 200
        };

    },

    // when a groupshape is moved, contained shapes must also move, without being officially selected
    setContainedStartPos: function(view){
        var followingShapes = [];
        for(id of this.contained){
            var figure = view.shapes.find(s=>s.id == id);
            
            // to be able to drag them!
            // ...only needs to be set once
            figure.startDragLeft = figure.left;
            figure.startDragTop = figure.top;
            
            //console.log("shape " + id + " startdrag set at " + figure.left + "/" + figure.top);

            followingShapes.push(figure);
        }
        return followingShapes;
    }, 

    updateContents: function(shapeData) {

        var startx = this.left;
        var starty = this.top;
        var opPadding = 3;

        if(this.bg != null){
            this.remove(this.bg);
            this.remove(this.opBack);
            this.remove(this.op);
            this.bg = null;
        }
        
        var styles = [
            {op:"AND", background_col:"#00a8f0",text_col:"white"},
            {op:"OR", background_col:"yellow",text_col:"black"},
            {op:"1ST", background_col:"orange",text_col:"black"},
            {op:"NOT", background_col:"red",text_col:"white"},
            {op:"CUT", background_col:"purple",text_col:"white"}
        ];

        var style = styles.find(s => s.op == shapeData.operator);

        if(this.bg == null){
            this.bg = new fabric.Rect({
                top: this.top,
                left: this.left,
                width: shapeData.width,
                height: shapeData.height,
                stroke : 'black',
                strokeWidth : 1,
                fill: '#00a8f0',
                opacity: 0.2,
                rx: 5,
                ry: 5
            });
            this.addWithUpdate(this.bg);
            this.canvas.sendToBack(this);

            this.opBack = new fabric.Rect({
                top: this.top,
                left: this.left,
                width: 100,
                height: 11,
                stroke : 'black',
                strokeWidth : 1,
                fill: style.background_col
            });
            this.op = new fabric.Text(shapeData.operator,{
                fontSize:10, 
                fontFamily:'arial', 
                fill:'white',
                top: this.top,
                left: this.left,
                fill: style.text_col,
                fontWeight: 'bold'
            });
            this.opBack.height = this.op.height + opPadding *2;
            this.addWithUpdate(this.opBack);
            this.addWithUpdate(this.op);
        }
        this.scaleX = 1;
        this.scaleY = 1;

        var bg = this.bg;
        bg.width = shapeData.width;
        bg.height = shapeData.height;

        this.width = bg.width;
        this.height = bg.height;

        bg.left = -bg.width/2;//startx; // this.left;
        bg.top = -bg.height/2;// starty; // this.top;

        this.opBack.top = bg.top
        this.opBack.left = bg.left + bg.width/2 - 50;

        this.op.top = bg.top + opPadding;
        this.op.left = bg.left + bg.width/2 - this.op.width/2;

        shapeData.contained = this.gatherContained();
    
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
        var userData = app.view.getShapeModel(figure.id).data;
        view.html("");

        view.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-heading " >'+
            '     Logic'+
            '</div>'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div class="input-group" ></div> ');

        var options = ["AND","1ST","OR"];
        var radiohtml = "";
        for(option of options){
            radiohtml += '<input type="radio" id="logic_' + option + '" name="' + figure.id + '" value="' + option + '"';
            if(userData.operator == option){
                radiohtml += ' checked="true"';
            }
            else{

            }
            radiohtml += '>' + option + '<br>\n';
        }

        view.append(radiohtml +
        '   </div>'+
        ' </div>'+
        '</div>');

        $("input[type='radio']").change(function () {
			var selection=$(this).val();
            
            var userData = app.view.getShapeModel(figure.id).data;
            userData.operator = selection;
            figure.updateContents(userData);
            app.view.canvas.renderAll();
        });
        
    },

    parseToExpression:function(shapeData, rpc){
        var data = shapeData.data;
        
        var operatorToken = data.operator;

        var childBranchExpressions = ShapeParsing.parseContainedCodes(data.contained, rpc);

        // build and return a RuleExpression
        var body = ShapeParsing.parseAllBelow(shapeData, rpc);
        return new GroupExpression(operatorToken, childBranchExpressions, body, );
    }

    });