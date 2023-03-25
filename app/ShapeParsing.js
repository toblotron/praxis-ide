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

    // process all shapes that are contained by this shape, and parse them to expressions
    parseContainedCodes(containedIds, rpc){
        var targets = [];
        for(var childId of containedIds) {
            target = rpc.page.shapes.find(sh => sh.id == childId && incomingArrows(sh, rpc.page) == 0);
            if(target != undefined) // if has no incoming arrows
                targets.push(target);
        }
        targets = targets.sort(compareXPos);;
        
        var targetExpressions = [];
        for(var target of targets) {
            var targetExpression = this.parseShapeExpression(target, rpc)
            targetExpressions.push(targetExpression);
        }
        return targetExpressions;
    },

    indent(PC) {
        PC.res.push("\t".repeat(PC.indentation));
    },

    printList(PC, list) {
        for(var i=0; i<list.length; i++)
        {
            //PC.res.push(list[i].print(PC));
            list[i].print(PC);
            if(i<list.length-1)
                PC.res.push(",");
        }
    },

    printNormalShape(shapeExpression, PC) {
        // check if this shape has else-connections outgoing
        if(shapeExpression.body.elseExpressions != null && 
            shapeExpression.body.elseExpressions.length > 0){
            // in that case we wrap the whole thing in an if-then-else structure

            // the condition is the code of the shape itself
            this.indent(PC);
            PC.res.push("(\n");
            PC.indentation++;
            shapeExpression.printContent(PC);
            PC.indentation--;
            PC.res.push("\n");
            this.indent(PC);
            PC.res.push(") ->\n");

            // if the shape succeeds:
            if(shapeExpression.body.cojunctionExpressions.length > 0) {
                // wrap this also in scope
                this.indent(PC);
                PC.res.push("(\n");
                PC.indentation++;
                this.printChildren(PC,shapeExpression.body.cojunctionExpressions);
                PC.indentation--;
                PC.res.push("\n");
                this.indent(PC);
                PC.res.push(") ;\n");
            } else {
                this.indent(PC) + "true";
            }

            // and then write the else-branches
            this.indent(PC);
            PC.res.push("(\n");
            PC.indentation++;
            this.printChildren(PC,shapeExpression.body.elseExpressions);
            PC.indentation--;
            PC.res.push("\n");
            this.indent(PC);
            PC.res.push(")");
        } else {
            shapeExpression.printContent(PC);
            if(shapeExpression.body.cojunctionExpressions != null && shapeExpression.body.cojunctionExpressions.length > 0) {
                PC.res.push(",\n");
                this.printChildren(PC,shapeExpression.body.cojunctionExpressions);
            }
        }
    },

    printChildren(PC, children) {
        for(var i=0; i<children.length; i++)
        {
            children[i].print(PC);
            if(i<children.length-1)
                PC.res.push(",\n"); // \n to get newlines between statements in body
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
        return targets.sort(compareXPos);
    },

    // this is (I think?) needed so that we can go from a text-string to a class-reference, without using the evil eval
    classMap:{
        "FormulaShape": FormulaShape,
        "RuleShape": RuleShape,
        "LogicShape": LogicShape,
        "FindallShape": FindallShape,
        "GroupShape": GroupShape
    },
    getShapeClass:function(className){
        // return the prototype of the class, where we can store functions
        return this.classMap[className].prototype;
    }
    
}