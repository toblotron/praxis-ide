/*
This class handles the Shape Palette view
*/

praxis.ShapePalette = Class.extend({
	
	init:function(element_id){
		this.self = this;
        this.html = $("#"+element_id);
        this.elem = document.getElementById(element_id);

	},
	
    hide: function(){
        this.elem.style.display = "none";
    },

    show: function(){
        this.elem.style.display = "block";
    }

});