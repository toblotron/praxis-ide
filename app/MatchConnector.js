var MatchConnector = fabric.util.createClass(fabric.Line, {
    type: 'matchConnector',
  
    initialize(element, options) {
      options || (options = {});
      this.callSuper('initialize', element, options);
  
      // Set default options
      this.set({
        hasBorders: false,
        hasControls: false,
        stroke: '#00a8f0',
        perPixelTargetFind: true,
        strokeWidth: 2,
        selectable: false,
        padding: 5
      });

      this.role = "preview"; // mode when dragging-to-create
      this.setRole("true");

      this.on('mousedown', function(options){
        if(options.button === 1) {
          app.view.markSelectedConnection(this);
          // console.log("left click");
        }
        if(options.button === 3) {
          // console.log("right click");
          
          // toggle connection "role" between "true" and "false"
          // find connectionmodel
          var model = app.view.pageModel;
          var connModel = model.connections.find(conn=>conn.id == this.id);
          if(connModel.role == "true")
            connModel.role = "false";
          else
            connModel.role = "true";

          this.setRole(connModel.role);

          this.redraw();
          
          options.e.preventDefault();
          options.e.stopPropagation();
      }
      });
    },

    // styling is changed according to role
    setRole: function(role){
      if(this.role != role){
        var newColor = null;
        var dash = null;

        this.role = role;
        if(this.role == "true"){
          newColor = '#00a8f0';
          dash = null;
        }
        else if(this.role == "false"){
          // "false"
          newColor = '#ff5555';
          dash = [5, 5];
        }
        else {
          // assume "preview"
          newColor = 'gray';
          dash = [5, 5];
        }

        this.set({
          strokeDashArray: dash,
          stroke: newColor
        })
        this.redraw();
      }
    },

    // redraw, for whatever reason
    redraw: function(){
      this.set({
        'x2':this.source.left-1, 
        'y2':this.source.top-1,
        'x1':this.target.left-1, 
        'y1':this.target.top-1
      });
      this.setCoords();

      // make sure the involved ports are at the top
      app.view.canvas.bringToFront(this.source);
      app.view.canvas.bringToFront(this.target);

    }

  });