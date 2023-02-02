var pb = {
    generateModelCode: function(model){
        var res = "";

        return res;
    },

    generateTableCode: function(table){
        var res = "";

        for(var row of table.datarows) {
            res += "\n'" + table.name + "'("
            var count = 0;
            for(var col of table.columns){
                count++;
                if(count > 1)
                    res+=", ";
                var cell = row[col.id];
                switch(col.content){
                    case "string":
                        if(cell == undefined)
                            cell = "\"\"";
                        else
                            //cell = JSON.stringify(cell);
                            cell = "\""+cell.replaceAll('"', '""') +"\"";    // this is because of a bizarre bug in TauProlog (HT22), where "\"" does not work, but """" does... how VB! :)
                        break;
                    case "atom":
                        if(cell == undefined)
                            cell = "''";
                        else
                            // cell = "'" + JSON.stringify(cell) + "'";
                            cell = "'" + cell.replaceAll(/'/g, "\\\'") + "'";
                    case "bool":
                        break;
                    case "int":
                        // do validation
                        if(parseInt(cell) == NaN){
                            app.bottombar.submitMessage({
                                classification: "error",
                                occasion:"compilation",
                                title:"Data format error", 
                                description:"This value is not an integer, which it is specified to be in the column definition.", // detailed description
                                resourceType:"table", // "rules", "table"...
                                resourceId:pc.table.id, // index of resource
                                targetType: "cell", // "shape", "connection", "cell" /...
                                targetId: shape.id // index of target entity
                            });
                        } 
                        break;
                    case "float":
                        break;
                    case "term":
                        break;                    
                }
                res += cell;
            }
            res += ")."
        }

        return res;
    },

    generatePageCode: function(page, model){
        var res = "";

        return res;
    },
    "CommentShape":{
        shouldStartRule: function(shape, pc){
            return false;
        }
    },
    "RuleShape":{
        shouldStartRule: function(shape, pc){

            // to start rule, should have no incoming connections, and not be conatained by group
            var shouldStart = incomingArrows(shape,pc.page) == 0 && getContainer(shape,pc) == undefined &&  
                !this.isInvalid(shape,pc); // no name, = invalid

            if(shouldStart){
                // refuse to build rules for imported libraries
                if(shape.data.libraryName != "" && app.libraries.some(rd=>rd.external == true && rd.name == shape.data.libraryName)){
                    app.bottombar.submitMessage({
                        classification: "error",
                        occasion:"compilation",
                        title:"Overriding import", 
                        description:"This library is imported - you may not create new rules in it.", // detailed description
                        resourceType:"rules", // "rules", "table"...
                        resourceId:pc.page.id, // index of resource
                        targetType: "shape", // "shape", "connection" /...
                        targetId: shape.id // index of target entity
                    });
                    return false;
                }
                // refuse to build rules without library, if rule name exists in imported library
                // -because this messed up tau-prolog (ex: when accidentally creating a new case for lists:member/2)
                if(shape.data.libraryName == "" && (
                    app.libraries.some(lib=> lib.external == true && lib.predicates.some(pred=>pred.name == shape.data.ruleName))
                    ||
                    app.libraries.some(lib=> lib.predicates.some(pred=>pred.name == shape.data.ruleName && pred.external == true))
                    )) {
                    app.bottombar.submitMessage({
                        classification: "error",
                        occasion:"compilation",
                        title:"Overriding import", 
                        description:"A rule with this signature is imported from an external library, or builtin. For safety reasons you may not create it without specifying a library.", // detailed description
                        resourceType:"rules", // "rules", "table"...
                        resourceId:pc.page.id, // index of resource
                        targetType: "shape", // "shape", "connection" /...
                        targetId: shape.id // index of target entity
                    });
                    return false;
                }

                // check that no else-arrows go out from this (head) shape, since that would make no sense
                var else_targets = shapeTargets(shape, pc, "false");
                if(else_targets.length > 0){
                    app.bottombar.submitMessage({
                        classification: "error",
                        occasion:"compilation",
                        title:"Faulty else-connection", 
                        description:"A rule may not start with an else-connection.", // detailed description
                        resourceType:"rules", // "rules", "table"...
                        resourceId:pc.page.id, // index of resource
                        targetType: "shape", // "shape", "connection" /...
                        targetId: shape.id // index of target entity
                    });
                    return false;
                }
            }

            return shouldStart;
        },
        isInvalid:function(shape,pc){
            if(shape.data.ruleName == "")
                return true;
            else 
                return false;
        },
        startParseRule: function(shape, pc){
            var res =  this.render(shape);
            pc.indentation = "\t";
            var body = parseTargetCodes(shape, pc);
            if(body.length > 0){
                res += ":-\n" +  body.join(",\n");
            }
            return res + ".\n\n";
        },
        render:function(shape){
            var res = "";
            var data = shape.data;
            if(data.libraryName != ""){
                if(app.libraries.find(lib=> lib.name == data.libraryName && lib.external == true)){
                    //res += shape.data.libraryName + ":"; // tau prolog doesn't like these prefixes?.. not very much..? :(
                }    
                else
                    res += shape.data.libraryName + "." // when an "internal library", or "prefix", use "." to separate lib & rulename
            }
            res += shape.data.ruleName;
            if(data.arguments.length > 0){
                res += "(" + data.arguments.join() + ")";
            }
            
            return res;
        },
        renderFull(shape,pc){
            var res = this.render(shape);
            
            // try encapsulating this statement in wings, if we are currently building a DCG rule
            if(pc.dcgRule == true)
                res = "{" + res + "}";
            res = pc.indentation + res;

            var body = parseTargetCodes(shape, pc);
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                res = buildIfThenElse(res, body,elseExpression,pc);
                /*res = res + "\n" + pc.indentation + "->\n";

                if(body.length > 0){
                    res += pc.indentation + "(\n";
                    var count = 0;
                    for(var branchCode of body) {
                        branchCode = branchCode + "\n"; + pc.indentation + ")";
                        count++;
                        if(count < body.length)
                            branchCode += ",\n";
                        res += branchCode;
                    }
                    res += pc.indentation + ")\n";
                } else {
                    res += "false\n"; // no true-condition? Always fail, if true?
                }
                res += pc.indentation + ";\n";
                res += pc.indentation + "(\n";
                var count = 0;
                for(var branchCode of elseExpression) {
                    branchCode = branchCode + "\n"; + pc.indentation + ")";
                    count++;
                    if(count < elseExpression.length)
                        branchCode += ",\n";
                    res += branchCode;
                }
                res += pc.indentation + ")\n"
                */
            } else {
                if(body.length > 0){
                    res += ",\n" + body.join(",\n");
                }
            }
            return res;
        }
    },
    "DcgShape":{
        shouldStartRule: function(shape, pc){
            // refuse to build rules for imported libraries
            if(shape.data.libraryName != "" && app.libraries.some(rd=>rd.external == true && rd.name == shape.data.libraryName))
                return false;
            // refuse to build rules without library, if rule name exists in imported library
            if(shape.data.libraryName == "" && app.libraries.some(lib=> lib.external == true && lib.predicates.some(pred=>pred.name == shape.data.ruleName)))
                return false;
            return incomingArrows(shape,pc.page) == 0 && getContainer(shape,pc) == undefined ;
        },
        isInvalid:function(shape,pc){
            if(shape.data.ruleName == "")
                return true;
            else 
                return false;
        },
        startParseRule: function(shape, pc){
            var res =  this.render(shape);
            pc.indentation = "\t";
            pc.dcgRule = true;
            var body = parseTargetCodes(shape, pc);
            if(body.length > 0){
                res += "-->\n" +  body.join(",\n");
            }
            pc.dcgRule = false;
            return res + ".\n\n";
        },
        render:function(shape){
            var res = "";
            var data = shape.data;
            if(data.libraryName != "")
                res += shape.data.libraryName + ":";
            res += shape.data.ruleName;
            if(data.arguments.length > 0){
                res += "(" + data.arguments.join() + ")";
            }
            if(data.pushback != undefined && data.pushback.length > 0){
                res += ",[" + data.pushback.join() + "]";
            }
            return res;
        },
        renderFull(shape,pc){
            var res =  pc.indentation + this.render(shape);
            var body = parseTargetCodes(shape, pc);
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                res = buildIfThenElse(res, body,elseExpression,pc);
            } else {
                if(body.length > 0){
                    res += ",\n" + body.join(",\n");
                }
            }
            return res;
        }
    },
    "LogicShape":{
        shouldStartRule: function(shape, pc){
            return false;
        },
        renderFull(shape,pc){
            var res = "";
            var oldIndentation = pc.indentation;
            pc.indentation = pc.indentation + "\t";
            var body = parseTargetCodes(shape, pc);
            if(body.length > 0){
                switch(shape.data.operator){
                    case "OR":
                        var count = 0;
                        res += "("; // extra containment
                        for(var branchCode of body) {
                            branchCode = oldIndentation + "(" + "\n" + branchCode + "\n" + oldIndentation + ")";
                            count++;
                            if(count < body.length)
                                branchCode += ";\n"
                            res += branchCode;
                        }
                        res += ")"; // extra containment
                        break;
                    case "AND":
                        res += body.join(",\n");
                        break;
                    case "CUT":
                        res += "!,(" + body.join(",\n") + ")";
                        break;
                    case "NOT":
                        res += "(" + body.join(",\n") + "-> fail;true)";
                        break;
                    case "1ST":
                        /*
                        (A -> true ;
                            (B -> true ;
                                (C -> true ; false)
                            )
                        )
                        */
                        var count = 0;
                        for(var branchCode of body) {
                            branchCode = oldIndentation + "((\n" + branchCode + "\n" + oldIndentation + ")-> true ;\n";
                            count++;                               
                            res += branchCode;
                        }
                        res += oldIndentation + "false\n" + oldIndentation ;
                        for(var i = 0; i < count; i++)
                            res += ")";
                        
                        break;
                }
                // TODO: WARN - if there is no body, else-expression makes no sense
                pc.indentation = oldIndentation;
                var elseExpression = parseElseCodes(shape,pc);
                if(elseExpression.length > 0){
                    res = buildIfThenElse(res, [],elseExpression,pc);
                }
            } else {
                // even if no body, there can still be a cut :O)
                if(shape.data.operator == "CUT")
                    res = pc.indentation + "!";
            }
            
            return res;
        }
    },
    "FormulaShape":{
        shouldStartRule: function(shape, pc){
            // submit warning if this shape has no inputs
            if(incomingArrows(shape,pc.page) == 0 && getContainer(shape,pc) == undefined)
                app.bottombar.submitMessage({
                    classification: "warning",
                    occasion:"compilation",
                    title:"Irrelevant shape", 
                    description:"This shape has no meaning when it has no incoming arrows, since it can not form a valid rule on its own", // detailed description
                    resourceType:"rules", // "rules", "table"...
                    resourceId:pc.page.id, // index of resource
                    targetType: "shape", // "shape", "connection" /...
                    targetId: shape.id // index of target entity
                });
            return false;
        },
        isInvalid(shape,pc){
            var data = shape.data;
            if(data.rows.length == 0){
                return true;
            }
            var resp = false;
            data.rows.forEach(element => {
                if(element.op == "" || element.left == "" || element.right == "")
                {
                    resp = true;
                }
            });
            return resp;
        },
        renderFull(shape,pc){
            var res = "";
            var data = shape.data;
            var rowNr = 0;
            for(var row of data.rows) {
                res += pc.indentation + row.left + " " + row.op + " " + row.right;
                rowNr++;
                if(rowNr < data.rows.length)
                    res += ",\n";
            }
            
            // try encapsulating this statement in wings, if we are currently building a DCG rule
            if(pc.dcgRule == true)
                res = "{" + res + "}";

            var body = parseTargetCodes(shape, pc);
            // if there is an else-arrow..
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                res = buildIfThenElse(res, body,elseExpression,pc);
                /*if(shapeTargets(shape, pc, "false").length > 0) {
                    // if there is an else-arrow, wrap in if-then-else
                    var elseExpression = parseElseCodes(shape,pc);
                    res = pc.indentation + "(\n" +
                        res + "\n";
                        pc.indentation + ")\n";
                    res = buildIfThenElse(res, body,elseExpression,pc);
                    */
            } else {
                if(body.length > 0){
                    res += ",\n" + body.join(",\n");
                }
            }
        
            return res;
        }
    },
    "GroupShape":{
        shouldStartRule: function(shape, pc){
            return false;
        },
        renderFull(shape,pc){
            var res = "";
            // parse shapes inside body
            var body = parseContainedCodes(shape.data.contained, pc);
            switch(shape.data.operator){
                case "OR":
                    var oldIndentation = pc.indentation;
                    pc.indentation = pc.indentation + "\t";
                    if(body.length > 0){
                        var count = 0;
                        for(var branchCode of body) {
                            branchCode = oldIndentation + "(" + "\n" + branchCode + "\n" + oldIndentation + ")";
                            count++;
                            if(count < body.length)
                                branchCode += ";\n"
                            res += branchCode;
                        }
                    }
                    pc.indentation = oldIndentation;
                    break;
                case "AND":
                    res += body.join(",\n");
                    break;
                case "1ST":
                    /*
                    (A -> true ;
                        (B -> true ;
                            (C -> true ; false)
                        )
                    )
                    */
                    var oldIndentation = pc.indentation;
                    pc.indentation = pc.indentation + "\t";
                    var count = 0;
                    for(var branchCode of body) {
                        branchCode = oldIndentation + "((\n" + branchCode + "\n" + oldIndentation + ")-> true ;\n";
                        count++;                               
                        res += branchCode;
                    }
                    res += oldIndentation + "false\n" + oldIndentation ;
                    for(var i = 0; i < count; i++)
                        res += ")";
                    pc.indentation = oldIndentation;
                    break;
            }

            // extra wrapping..
            res = "(" + res + ")";

            // parse shapes below body - build else-expression
            var below = parseTargetCodes(shape, pc);
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                
                res = buildIfThenElse(res, below, elseExpression, pc);
            } else {
                
                if(below.length > 0){
                    res += ",\n" + below.join(",\n");
                }
            }

            return res;
        }
    },
    "DcgTerminalShape":{
        shouldStartRule: function(shape, pc){
            return false;
        },
        renderFull(shape,pc){
            if(pc.dcgRule == false)
                return null;

            var data = shape.data;
            
            // handle "\"" (escaped " within string) - so it will generate """" instead of (the correct) "\"" - due to TP bug
            var tempValue = data.value.trim();
            if(tempValue[0] == "\"" && tempValue[tempValue.length-1] == "\"" && tempValue.length > 3){
                var innerValue = tempValue.substring(1,tempValue.length-1);
                innerValue = innerValue.replaceAll('\\"', '""');
                tempValue = "\"" + innerValue + "\"";
            }

            var res =  pc.indentation + tempValue;
                    
            var body = parseTargetCodes(shape, pc);
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                res = buildIfThenElse(res, body,elseExpression,pc);
            } else {
                if(body.length > 0){
                    res += ",\n" + body.join(",\n");
                }
            }

            return res;
        }
    },
    "FindallShape":{
        shouldStartRule: function(shape, pc){
            return false;
        },
        isInvalid:function(shape,pc){
            if(shape.data.capturePattern == "" || shape.data.captureList == "")
                return true;
            else 
                return false;
        },
        renderFull(shape,pc){
            var data = shape.data;
            var oldIndentation = pc.indentation;

            if(this.isInvalid(shape,pc)){
                app.bottombar.submitMessage({
                    classification: "error",
                    occasion:"compilation",
                    title:"Invalid Findall shape", 
                    description:"This Findall-shape is not properly filled", // detailed description
                    resourceType:"rules", // "rules", "table"...
                    resourceId:pc.page.id, // index of resource
                    targetType: "shape", // "shape", "connection" /...
                    targetId: shape.id // index of target entity
                });
            }

            var res =  pc.indentation + "findall(" + data.capturePattern + ", (\n";
            pc.indentation = pc.indentation + "\t";
            
            // WARN that else-expressions make no sense, here
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                app.bottombar.submitMessage({
                    classification: "warning",
                    occasion:"compilation",
                    title:"Invalid Else-connection", 
                    description:"Else-connections have no function here, since findall/3 will always succeed.", // detailed description
                    resourceType:"rules", // "rules", "table"...
                    resourceId:pc.page.id, // index of resource
                    targetType: "shape", // "shape", "connection" /...
                    targetId: shape.id // index of target entity
                });
            }
            var body = parseTargetCodes(shape, pc);
            if (body.length > 0) {
                res += body.join(",\n");
            }
            else {
                res += "false";
            }
            res += "\n" + pc.indentation +"), " + data.captureList + ")";
            pc.indentation = oldIndentation;

            return res;
        }
    },
    "TableShape":{
        shouldStartRule: function(shape, pc){
            return false; // TODO - kanske den SKA kunna generera en regel - låt säga ifall man vill generera resultatet av en tabellslagning :)
            // skulle iofs kräva någon slags global access, för att kunna komma åt parametrar/värden?
        },
        /*startParseRule: function(shape, pc){
            var res =  this.render(shape);
            pc.indentation = "\t";
            var body = parseTargetCodes(shape, pc);
            if(body.length > 0){
                res += ":-\n" +  body.join(",\n");
            }
            return res + ".\n\n";
        },*/
        // test returning validation messages.. ?
        isInvalid:function(shape){
            if(shape.data.name == "" || shape.data.values.length == 0)
                return true;          
            
            return false;
        },
        validate:function(shape){
            if(shape.data.tableId > -1){
                // check that there is a table with the same signature
                var table = Model.dataTables.find(t=>t.id == shape.data.tableId);
                if(table == undefined)
                    return "This Table shape refers to the table '" + shape.data.name + "' with id '" + shape.data.tableId + "', which does not exist.";

                if(table.columns.length != shape.data.values.length)
                    return "The referred table has " + table.columns.length + " columns, but the shape uses " + shape.data.values.length + " arguments.";
            }
            return undefined;
        },
        render:function(shape,pc){
            var res = "";
            var data = shape.data;
           
            if(this.isInvalid(shape)){
                app.bottombar.submitMessage({
                    classification: "error",
                    occasion:"compilation",
                    title:"Invalid shape", 
                    description:"This Table-shape is not properly filled", // detailed description
                    resourceType:"rules", // "rules", "table"...
                    resourceId:pc.page.id, // index of resource
                    targetType: "shape", // "shape", "connection" /...
                    targetId: shape.id // index of target entity
                });
                return res;
            }

            var errorMessage = this.validate(shape);
            if(errorMessage != undefined){
                app.bottombar.submitMessage({
                    classification: "error",
                    occasion:"compilation",
                    title:"Invalid shape", 
                    description:errorMessage, // detailed description
                    resourceType:"rules", // "rules", "table"...
                    resourceId:pc.page.id, // index of resource
                    targetType: "shape", // "shape", "connection" /...
                    targetId: shape.id // index of target entity
                });
                return res;
            }

            res += app.getDataTable(data.tableId).name;
            if(data.values.length > 0){
                res += "(" + data.values.join() + ")";
            }

            return res;
        },
        renderFull(shape,pc){
            var res =  pc.indentation + this.render(shape,pc);

            var body = parseTargetCodes(shape, pc);
            var elseExpression = parseElseCodes(shape,pc);
            if(elseExpression.length > 0){
                res = buildIfThenElse(res, body,elseExpression,pc);
            }
            else {
                if(body.length > 0){
                    res += ",\n" + body.join(",\n");
                }
            }
            return res;
        }
    },

};