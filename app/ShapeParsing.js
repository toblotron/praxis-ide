var ShapeParsing = {
    
    // start parsing of an individual rule/dcg-shape as the head of a rule
    parseRuleHead:function(shapeData, page, errorList){
        if(shapeData != undefined && (shapeData.type == "RuleShape" || shapeData.type == "DcgShape")){
            var expressionTree = null;
            try {
                var rpc = new RuleParsingContext(page, shapeData, errorList);
                if(shapeData.type == "RuleShape") 
                    expressionTree = RuleShape.prototype.parseToExpression(shapeData, rpc);
                if(shapeData.type == "DcgShape") 
                    expressionTree = DcgShape.prototype.parseToExpression(shapeData, rpc);
            }
            catch(error){
                // probably a parsing-error. 
                // do nothing - error has already been added to error-list
                // return null, to signal faulty code generation, and stop
                // from attempt to write out code
                console.log("Exception: " + JSON.stringify(error));
            }
            return expressionTree;
        }
    },

    generateAST:function() {
        // update contained of all Group figures
        updateAllGroupsContained(app.view);

        // gather all rules, grouped by name/arity
        //...
        var res = "";

        // include all included libraries
        for(lib of Model.settings.includedLibraries){
            res += ":- use_module(library(" + lib + ")).\n";
        }
        res += "\n";

        // declare dynamics
        for(signature of Model.settings.dynamic){
            res += ":- dynamic(" + signature + ").\n";
        }
        res += "\n";

        var errorList = [];

        var pages = pagesInTreeOrder();
        for(var page of pages){
            var parsingContext = {};
            parsingContext.page = page;
            
            // sort all shapes, to ensure left-to-right-order of rules
            var shapes = page.shapes.sort(compareXPos);
            for(var shape of shapes){
                parsingContext.shape = shape;
                if(pb[shape.type].shouldStartRule(shape, parsingContext)){
                    var expressionTree = ShapeParsing.parseRuleHead(shape, page, errorList);
                    var PrintContext = {res:[], indentation:0};
                    if(expressionTree != undefined){
                        expressionTree.printAsHead(PrintContext);
                        res = res + PrintContext.res.join("");
                    }
                }
            }
        }

        // table data
        var tables = tablesInTreeOrder();
        var tableCode = "";
        for(var table of tables){
            tableCode += pb.generateTableCode(table);
        }
        res = res + tableCode;

        if(errorList.length > 0){
            errorList.forEach(err=>app.bottombar.errorList.push(err));
            app.bottombar.updateErrorTable();
        } 

        return res
    },

    parseShapePrologText(rpc, shapeData, description, prologText){
        try{
            var tokens = Lexer.GetTokens(prologText);
            tokens = tokens.filter(t=>t.type != TokenType.Blankspace);
            var parser = new PrologParser(tokens);
            var res = parser.parseThis();
            return res;
        } catch (error){
            // construct error-object and insert into errorList
            var report = {
                classification: "error",
                occasion: "compilation",
                title: "Syntax error",
                description: description + ":" + error.message,
                resourceType: "rules",
                resourceId: rpc.page.id,
                targetType: "shape",
                targetId: shapeData.id
                /* 
                classification, // "warning" / "error"
                occasion, // "validation" / "compilation"
                title, // short description
                description, // detailed description
                resourceType, // "rules", "table"...
                resourceId // index of resource (page/etc)
                targetType // "shape", "connection"..
                targetId // id of target entity
                */
            };

            rpc.errorList.push(report);

            throw(error);
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
        targets = targets.sort(compareXPos);
        
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
            // should this child-statement be wrapped in braces, because we are currently printing a DCG rule,
            // and the statement is normal prolog?
            //var wrapInBraces = PC.isDcgRule && children[i].isDcgStatement == undefined;
            
            //if(wrapInBraces)
            //    PC.res.push("{");
            
            this.printNormalShape(children[i],PC);
            // children[i].print(PC);
            
            //if(wrapInBraces)
            //    PC.res.push("}");

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
        "GroupShape": GroupShape,
        "TableShape": TableShape,
        "DcgShape": DcgShape,
        "DcgTerminalShape": DcgTerminalShape
    },
    getShapeClass:function(className){
        // return the prototype of the class, where we can store functions
        return this.classMap[className].prototype;
    }
    
}