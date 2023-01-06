var DraggablePort = fabric.util.createClass(fabric.Circle, {
    type: 'draggablePort',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize', options);

        this.set({ 
            strokeWidth: 0.5,
            originX: 'center',
            originY: 'center',
            fill: 'gray',
            stroke: 'black',
            radius: 8,
            hasBorders: false,
            //selectable: false,
            hasControls:false, 
            fill: '#1f5'
         });

        this.on('mouseout',function(options){
            //if (options.target) {
                this.view.dragPortMouseout(this);
            //}
        });

        this.on('mousedown',function(options){
            if (options.target) {
                this.view.dragPortMousedown(this);
            }
        });
        
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {});
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#333';
    }
});