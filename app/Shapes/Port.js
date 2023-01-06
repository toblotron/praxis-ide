var Port = fabric.util.createClass(fabric.Circle, {
    type: 'port',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(options) {
        options || (options = { });
        this.callSuper('initialize', options);

        this.set({ 
            selectable: false,
            strokeWidth: 0.5,
            originX: 'center',
            originY: 'center',
            fill: '#555',
            stroke: 'black',
            radius: 5,
            visible: false,
            targetFindTolerance: 10
         });
        
        this.on('mouseover',function(options){
            if (options.target) {
                app.view.portMouseover(this);
            }
        });
        this.on('mouseout',function(options){
            if (options.target) {
                app.view.portMouseout(this);
            }
        });
    },
  
    toObject: function() {
    return fabric.util.object.extend(this.callSuper('toObject'), {});
    },

    _render: function(ctx) {
    this.callSuper('_render', ctx);

    ctx.font = '20px Helvetica';
    ctx.fillStyle = '#222';
    }
});