/*
This class handles the Drawing panel-view
*/

praxis.DrawingPanel = Class.extend({
	
	init:function(element_id){
		this.self = this;
        this.html = $("#"+element_id);
        this.elem = document.getElementById(element_id);
	},
	
    hide: function(){
        this.html.html("");
        this.elem.style.display = "none";
    },

    show: function(){
        this.elem.style.display = "block";
    },

    showPanel: function(drawingData){
        
        this.elem.style.display = "block";
        this.html.html("");
        this.html.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div  class="panel-heading ">Drawing</div> ' +
            '       <input id="drawing_name" type="text" class="form-control" value="'+drawingData.name+'"/>');
    
        this.html.append(
        '			<button id="drawing_ok_button">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');

        $("#drawing_ok_button").on("click", function(){
            
            drawingData.name=$("#drawing_name").val();
            var treeNode = app.treemenu.getTreeNode('rules', drawingData.id);

            treeNode.setTitle(drawingData.name);
            app.updateHeading(treeNode);
        });
    
       
        
    }

});