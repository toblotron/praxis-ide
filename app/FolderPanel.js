/*
This class handles the Folder panel-view
*/

praxis.FolderPanel = Class.extend({
	
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

    showPanel: function(treeNode){
        
        this.elem.style.display = "block";
        this.html.html("");
        this.html.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div  class="panel-heading ">Folder</div> ' +
            '       <input id="folder_name" type="text" class="form-control" value="'+treeNode.title+'"/>');
    
        this.html.append(
        '			<button id="folder_ok_button">Ok</button>'+
        '   </div>'+
        ' </div>'+
        '</div>');

        $("#folder_ok_button").on("click", function(){
            
            var newTitle=$("#folder_name").val();
           
            treeNode.setTitle(newTitle);
            app.treemenu.copyStructureFromTree();
            //app.updateHeading(treeNode);
        });
    
       
        
    }

});