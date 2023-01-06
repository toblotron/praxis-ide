prologStyles = {
    "Atom": {fill: 'green'},
    "String": {fill: 'green'},
    "Variable": {fill: 'blue'},
    "Operator": {fill:'black', fontWeight: 'bold'},
    "Pipe": {fill:'black', fontWeight: 'bold'},
    "Comma": {fill:'black', fontWeight: 'bold'},
    "FullStop": {fill:'black', fontWeight: 'bold'},
    "Integer": {fill: 'red'},
    "Float": {fill: 'purple'},
    "BeginList":{fill:'blue', fontWeight: 'bold'},
    "EndList":{fill:'blue', fontWeight: 'bold'},
    "BeginParen":{fill:'blue', fontWeight: 'bold'},
    "EndParen":{fill:'blue', fontWeight: 'bold'},
    "Blankspace":{}
}

var PrologText = fabric.util.createClass(fabric.Text, {
    type: 'prologText',
    // initialize can be of type function(options) or function(property, options), like for text.
    // no other signatures allowed.
    initialize: function(text,options) {
        options || (options = {});

        this.callSuper('initialize',text, options);
        this.set({ 
            objectCaching: false,
            fontSize:11, 
            fontFamily:'arial', 
            fill:'white'
        });
        if(options.isPreview)
            this.isPreview = true;
        else
            this.isPreview = false;

        this.setPrologText(text);
    },
        
    setPrologText: function(text){
        /*var lexed = this.prologLexer(text);
        this.set({styles:{
            0:lexed
        }
        });*/

        var tokens = Lexer.GetTokens(text);
        var styles = this.addStyles(tokens)
        this.set({styles:{
            0:styles
        }});

        if(this.isPreview){
            this.set({opacity:0.5, fontStyle:'italic'});
        }
    },

    isOperator: function(c){
        return "[],.-/+*:<>()\\=@.\'\"|".includes(c);
    },

    addStyles: function(tokens){
        var styles = {};
        var pos = 0;
        tokens.forEach(token => {
            for(i=0;i<token.value.length; i++){
                styles[pos] = prologStyles[token.type.name];
                pos++;
            }
        });
        return styles;
    },

    addStyle:function(styles, pos, name, length){
        for(i=0; i<length; i++){
            //var tag = {};
            styles[pos] = prologStyles[name];
            //styles.push(tag);
            pos += 1;
        }
        return pos;
    },

    prologLexer: function(text)
    {
        var elements = [];
        var styles = {};

        var length = text.length;
        var from = 0;
        var i = 0;
        var elem;
        var pos = 0;
        do {
            var c = text[i];
            if(this.isOperator(c)){
                do {
                    i++;
                    var c = text[i];
                } while (i<length && this.isOperator(c));
                elem = {type:"prologOperator", value:text.substring(from,i)};
                from = i;
                elements.push(elem);
                pos = this.addStyle(styles, pos, "prologOperator",elem.value.length);
            }
            else if(c.match(/[a-z]/)){
                // only atom acceptable
                do {
                    i++;
                    var c = text[i];
                } while (i<length && c.match(/[a-zA-Z0-9_]/));
                elem = {type:"prologAtom", value:text.substring(from,i)};
                from = i;
                elements.push(elem);
                pos = this.addStyle(styles, pos, "prologAtom",elem.value.length);
            } else if(c.match(/[A-Z]/) || c == '_'){
                // only variable acceptable
                do {
                    i++;
                    var c = text[i];
                } while (i<length && c.match(/[a-zA-Z0-9_]/));
                elem = {type:"prologVariable", value:text.substring(from,i)};
                from = i;
                elements.push(elem);
                pos = this.addStyle(styles, pos, "prologVariable",elem.value.length);
            } 
            else if(c.match(/[0-9]/)){
                // only numbers acceptable
                do {
                    i++;
                    var c = text[i];
                } while (i<length && c.match(/[0-9.]/));
                elem = {type:"prologNumber", value:text.substring(from,i)};
                from = i;
                elements.push(elem);
                pos = this.addStyle(styles, pos, "prologNumber",elem.value.length);
            } 
            else 
            {
                i = i +1;
                pos++;
                from = i;
            }
        } while(i<length);
        return styles;

    }
});