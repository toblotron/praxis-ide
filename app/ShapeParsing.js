var ShapeParsing = {
    
    // start parsing of an individual rule-shape as the head of a rule
    parseRuleHead:function(shapeId, page){
        var shapeData = page.shapes.find(s=>s.id == shapeId);
        if(shapeData != undefined && shapeData.type == "RuleShape"){
            var expressionTree = RuleShape.prototype.parseAsHead(shapeData, page);
            return expressionTree;
        }
    },
    // normal parsing of shapes below a certain shape
    // build Abstract Syntax Tree - return expression-tree
    parseAllBelow: function(shapeData, rpc){
        var res = {};

        // build expressiontree for all else-connected shapes
        var elseShapesData = this.getTargetShapes(shapeData, rpc, "false");
        if(elseShapesData.length > 0){
            var elseExpressions = [];
            elseShapesData.forEach(elseShapeId => {
                elseExpressions.push(this.parseShapeExpression(elseShapeId, rpc));
            });
            res.elseExpressions = elseExpressions;
        }

        // build expressiontree for all cojunction-connected shapes
        var cojunctionShapesData = this.getTargetShapes(shapeData, rpc, "true");
        if(cojunctionShapesData.length > 0){
            var cojunctionExpressions = [];
            cojunctionShapesData.forEach(cojunctionShapeId => {
                cojunctionExpressions.push(this.parseShapeExpression(cojunctionShapeId, rpc));
            });
            res.cojunctionExpressions = cojunctionExpressions;
        }
        return res;
    },

    printAllBelow: function(PC, body){
        for(var i=0; i<body.length; i++)
        {
            PC.res.push(body[i].print(PC));
            if(i<body.length-1)
                PC.res.push(",");
        }
    },

    // parse tree for specific shape
    // call static parsing functions in the shape-classes, found based on shapeData
    parseShapeExpression(shapeData, rpc){
        return this.getShapeClass(shapeData.type).parseToExpression(shapeData, rpc);
    },
    getTargetShapes:function(shapeData, rpc, connectionRole){
        var targets = [];
        for(var connection of rpc.page.connections) {
            if(connection.role == connectionRole && 
                (
                    // for logic connections, connection direction should not matter
                    connection.source.shape == shapeData.id && connection.source.role == "out" ||
                    connection.target.shape == shapeData.id && connection.target.role == "out"
                )
            ){
                // return the other shape the connection is involved with - not the source-shape itself :)
                target = rpc.page.shapes.find(sh => (sh.id == connection.target.shape || sh.id == connection.source.shape) && sh.id != shapeData.id);
                targets.push(target);
            }
        }
        return targets.sort(compareXPos);;
    },
    // this is (I think?) needed so that we can go from a text-string to a class-reference, without using the evil eval
    classMap:{
        "FormulaShape": FormulaShape,
        "RuleShape": RuleShape,
        "LogicShape": LogicShape
    },
    getShapeClass:function(className){
        // return the prototype of the class, where we can store functions
        return this.classMap[className].prototype;
    }
    
}