/*
This class handles the Class panel
*/

praxis.ClassPanel = Class.extend({
	
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

    showPanel: function(classData, treeNode){

        this.elem.style.display = "block";
        this.html.html("");
        this.html.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div  class="panel-heading ">Class</div> ' +
            '       <input id="class_name" type="text" class="form-control" value="'+treeNode.title+'"/>');
    
        this.html.append(
        '			<button id="class_ok_button">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');

        $("#class_ok_button").on("click", function(){
            
            var newTitle=$("#class_name").val();
           
            treeNode.setTitle(newTitle);
            app.treemenu.copyStructureFromTree();
        });
        
    },

});