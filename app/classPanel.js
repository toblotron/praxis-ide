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
        var superClassName = "";
        if(classData.superClass != undefined)
            superClassName = classData.superClass;

        var panelTitle = classData.type == "class" ? "Class" : "Enum";
        
        this.html.html("");
        this.html.append('<div id="rule_property_container" class="panel panel-default">'+
            ' <div class="panel-body" id="rule_panel">'+
            '   <div class="form-group">'+
            '       <div  class="panel-heading ">' + panelTitle + '</div> ' +
            '       <input id="class_name" type="text" class="form-control" value="'+treeNode.title+'"/>');
        if(classData.type == "class")
            this.html.append('        <div  class="panel-heading ">Superclass</div> ' +
            '       <input id="superclass_name" type="text" class="form-control" value="' + superClassName +'"/>');
        this.html.append(
        '			<button id="class_ok_button">Ok</button>'+
        '   </div>'+
        '   <button id="class_delete_rows">Remove selected rows</button>' + 
        ' </div>'+
        '</div>');

        $("#class_ok_button").on("click", function(){
            
            var newTitle=$("#class_name").val();
            classData.name = newTitle;
            if(classData.type == "class"){
                var newSuperClass=$("#superclass_name").val();
                if(newSuperClass != undefined && newSuperClass != "")
                    classData.superClass = newSuperClass;
            }
            treeNode.setTitle(newTitle);
            app.updateHeading(treeNode);
            app.treemenu.copyStructureFromTree();
        });

        $("#class_delete_rows").on("click", function(){
            var grid = app.classView.grid;

            var data = grid.getData();
            var rows= grid.getSelectedRows();

            var sure= confirm("Are You Sure You Want to Delete the selected rows?");   
            if(sure){
                var deleted = 0;
                for (var i = 0; i < rows.length; i += 1) {
                    data.splice(rows[i-deleted], 1);
                    deleted++;
                }
                grid.setData(data, true);
                grid.render();
            }
        });
        
    },

});