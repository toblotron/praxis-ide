
// instance follows parsing of entire rule, both for parsing of shapes as well as for parsing of text(?)
class RuleParsingContext {
  constructor(page, headShape, errorList ) {
    // datamodel of the current drawing page
    this.page = page;
    // the parsed expression 
    this.headShape = headShape;
    // Keep information about all the variables we encounter in the rule
    this.variables = new Map(); // key: string, value: info about variable
    // Keep track of indentation level, for rendering code
    this.indentation = 0;
    // Sometimes we will want to create intermediate variables with unique names
    // this is for making sure those variables have unique names
    this.idCounter = 0; 
    // a list where we put all errors/warnings generated while parsing this shape
    this.errorList = errorList;
  }
}

class DcgTerminalExpression {
  constructor(value, body) {
    this.value = value;
    this.body = body;
    // mark this as part of a dcg statement, for code generation
    this.isDcgStatement = true;
  }

  // if applicable, write out only the code that the shape Itself constitutes,
  // in the shortest form
  printContent(PC){
    ShapeParsing.indent(PC);
    this.value.print(PC);
  }

  // print as part of body, not head
  print(PC) {
    // no special structure-features of this shape - it is just a normal "bit of prolog code"
    // so we just pass it along to the standard rendering method, to handle any possible else-connections and so on
    ShapeParsing.printNormalShape(this, PC);
  }
}

// primarily made from rule-head-shapes, because there we may want to keep track of "library"
class RuleExpression {
  constructor(library, name, args, body) {
    this.library = library;
    this.name = name;
    this.args = args;
    this.body = body;
  }

  // print rule head and body
  printAsHead(PC) {
    this.printContent(PC);
    if(this.body != undefined && this.body.cojunctionExpressions != null) {
      PC.res.push(":-\n"); 
      PC.indentation = 1;
      // rule head shape does not allow outgoing else-arrow; only parse coj-expressions in body
      ShapeParsing.printChildren(PC, this.body.cojunctionExpressions);
    } 
    
    PC.res.push(".\n");
  }

  // if applicable, write out only the code that the shape Itself constitutes,
  // in the shortest form
  printContent(PC){
    ShapeParsing.indent(PC);

    // should this child-statement be wrapped in braces, because we are currently printing a DCG rule,
    // and the statement is normal prolog?
    var wrapInBraces = PC.isDcgRule;
    
    if(wrapInBraces)
        PC.res.push("{");

    PC.res.push(this.name);

    // args?
    if(this.args.length > 0){
      PC.res.push("(");
      ShapeParsing.printList(PC, this.args);
      PC.res.push(")");
    }

    if(wrapInBraces)
        PC.res.push("}");
  }

  // print as part of body, not head
  print(PC) {
    // no special structure-features of this shape - it is just a normal "bit of prolog code"
    // so we just pass it along to the standard rendering method, to handle any possible else-connections and so on
    ShapeParsing.printNormalShape(this, PC);
  }

}

class DcgRuleExpression {
  constructor(library, name, args, pushback, body) {
    this.library = library;
    this.name = name;
    this.args = args;
    this.pushback = pushback;
    this.body = body;
    // mark this as part of a dcg statement, for code generation
    this.isDcgStatement = true;
  }

  // print rule head and body
  printAsHead(PC) {
    this.printContent(PC);
    if(this.body != undefined && this.body.cojunctionExpressions != null) {
      PC.res.push("-->\n"); 
      PC.indentation = 1;

      // set the fact that we are now making a dcg rule
      PC.isDcgRule = true;
      
      // this is to keep track of wether we should put "{" around things, because they are part of "normal" prolog statements
      // within the dcg rule
      // unused - PC.insideDcg = true;

      // dcg rule head shape does not allow outgoing else-arrow; only parse coj-expressions in body
      ShapeParsing.printChildren(PC, this.body.cojunctionExpressions);
    } 
    
    PC.res.push(".\n");
  }

  // if applicable, write out only the code that the shape Itself constitutes,
  // in the shortest form
  printContent(PC){
    ShapeParsing.indent(PC);
    PC.res.push(this.name);

    // args?
    if(this.args.length > 0){
      PC.res.push("(");
      ShapeParsing.printList(PC, this.args);
      PC.res.push(")");
    }

    // pushback?
    if(this.pushback.length > 0){
      PC.res.push(",[");
      ShapeParsing.printList(PC, this.pushback);
      PC.res.push("]");
    }
  }

  // print as part of body, not head
  print(PC) {
    ShapeParsing.printNormalShape(this, PC);
  }

}

// may not be necessary to keep "Formula" structure - might just as well just have a bunch OperatorExpressions, but keep it like this for now
// (the "formula" structure probably doesn't add anything of value, but for the sake of overview we keep it around for now)
class FormulaExpression {
  constructor(expressionRows, body) {
    this.expressionRows = expressionRows;
    this.body = body;
  }

  printContent(PC) {

    // should this child-statement be wrapped in braces, because we are currently printing a DCG rule,
    // and the statement is normal prolog?
    var wrapInBraces = PC.isDcgRule;

    // for every row.. 
    for(var i=0; i< this.expressionRows.length; i++)
    {
        ShapeParsing.indent(PC);

        if(wrapInBraces)
          PC.res.push("{");

        this.expressionRows[i].print(PC);

        if(wrapInBraces)
          PC.res.push("}");

        if(i<this.expressionRows.length-1)
            PC.res.push(",\n");
    }  
  }

  print(PC) {
    this.printContent(PC);
  }
}

class FindallExpression {
  constructor(capturePatternExpression, body, captureListExpression) {
    this.capturePatternExpression = capturePatternExpression;
    this.body = body;
    this.captureListExpression = captureListExpression;
  }

  printContent(PC) {
    ShapeParsing.indent(PC);

    // should this child-statement be wrapped in braces, because we are currently printing a DCG rule,
    // and the statement is normal prolog?
    var wrapInBraces = PC.isDcgRule;
    
    if(wrapInBraces)
        PC.res.push("{");

    PC.res.push("findall(\n");

    PC.indentation++;
    ShapeParsing.indent(PC);
    this.capturePatternExpression.print(PC);
    PC.res.push(",\n");

    ShapeParsing.indent(PC);
    PC.res.push("(\n");
    PC.indentation++

    ShapeParsing.printChildren(PC, this.body.cojunctionExpressions);
    
    PC.res.push("\n");
    PC.indentation--;
    ShapeParsing.indent(PC);
    PC.res.push("),\n");

    ShapeParsing.indent(PC);
    this.captureListExpression.print(PC);
    PC.res.push("\n");

    PC.indentation--;
    ShapeParsing.indent(PC);
    PC.res.push(")");

    if(wrapInBraces)
        PC.res.push("}");
    
  }

  print(PC) {
    // This demands special handling of else-arrows vs then-arrows; they must be treated in a special way (?)
    if(this.body.elseExpressions != null){
      var disjunctionSign = ";";
      if(PC.isDcgRule)
        disjunctionSign = "|";
      
      ShapeParsing.indent(PC);
      PC.res.push("(\n");

      PC.indentation++;

      this.printContent(PC);
      
      PC.res.push(",\n");
      ShapeParsing.indent(PC);
      PC.res.push("-> true " + disjunctionSign + "\n");
      
      // print the else-branches
      ShapeParsing.printChildren(PC, this.body.elseExpressions);
      
      PC.indentation--;
      PC.res.push("\n");
      ShapeParsing.indent(PC);
      PC.res.push(")");
    } 
    else {
      this.printContent(PC);
    }
  }
}

// this is mainly meant to handle outgoing ELSE-connections
// PS - not used - haven't finished thinking about this, it seems
class IfThenElseExpression {
  constructor(conditionExpression, thenExpression, elseExpression){
    this.conditionExpression = conditionExpression;
    this.thenExpression = thenExpression;
    this.elseExpression = elseExpression;
  }

  // eeh.. lost the thread.. 
  printContent(PC){
    ShapeParsing.indent(PC);
    PC.res.push("(\n");

    PC.indentation++;

    // ShapeParsing.indent(PC);
    this.conditionExpressions[i].print(PC);
    
    if(i < this.thenExpression != null) {
      PC.res.push("\n");
      ShapeParsing.indent(PC);
      PC.res.push("-> true ;\n");
    }         
    else {
      PC.res.push("\n");
      ShapeParsing.indent(PC);
      PC.res.push("-> true ; false");
    }

    PC.indentation--;
    PC.res.push("\n");
    ShapeParsing.indent(PC);
    PC.res.push(")");

  }

  print(PC){
    this.printContent(PC);
  }

}

// used for the GroupShape where we can introduce different operators like OR, 1ST, etc.
class GroupExpression {
  constructor(operatorToken, childBranchExpressions, body){
    this.operatorToken = operatorToken;
    this.childBranchExpressions = childBranchExpressions;
    this.body = body;
  }

  print(PC) {
    // no special structure-features of this shape - it is just a normal "bit of prolog code"
    // so we just pass it along to the standard rendering method, to handle any possible else-connections and so on
    ShapeParsing.printNormalShape(this, PC);
  }

  printContent(PC) {
    switch(this.operatorToken) {
      case "AND":
        ShapeParsing.printChildren(PC, this.childBranchExpressions);
        break;
      case "OR":
        ShapeParsing.indent(PC);
        PC.res.push("(\n");
        PC.indentation++;

        var disjunctionSign = ";";
        if(PC.isDcgRule)
          disjunctionSign = "|";

        for(var i=0; i< this.childBranchExpressions.length; i++)
        {
            this.childBranchExpressions[i].print(PC);
            if(i < this.childBranchExpressions.length-1) {
              PC.res.push("\n");
              ShapeParsing.indent(PC); 
              PC.res.push(disjunctionSign); 
              PC.res.push("\n");
            }
        }
        PC.indentation--;
        PC.res.push("\n");
        ShapeParsing.indent(PC);  
        PC.res.push(")");
        break;
      case "1ST":
        var startIndent = PC.indentation;

        var disjunctionSign = ";";
        if(PC.isDcgRule)
          disjunctionSign = "|";
        
        for(var i=0; i< this.childBranchExpressions.length; i++)
        {
            ShapeParsing.indent(PC);
            PC.res.push("(\n");

            PC.indentation++;

            //ShapeParsing.indent(PC);
            this.childBranchExpressions[i].print(PC);
            
            if(i < this.childBranchExpressions.length-1) {
              PC.res.push("\n");
              ShapeParsing.indent(PC);
              PC.res.push("-> true " + disjunctionSign + "\n");
            }         
            else {
              PC.res.push("\n");
              ShapeParsing.indent(PC);
              PC.res.push("-> true " + disjunctionSign + " false");
            }

        }
        // back up to the original indentation level again
        while(PC.indentation > startIndent)
        {
          PC.indentation--;
          PC.res.push("\n");
          ShapeParsing.indent(PC);
          PC.res.push(")");
        }

        break;
      case "NOT":
        ShapeParsing.indent(PC);
        
        var disjunctionSign = ";";
        if(PC.isDcgRule)
          disjunctionSign = "|";

        PC.res.push("(\n");
        PC.indentation++;
        ShapeParsing.printChildren(PC, this.childBranchExpressions);
        PC.res.push("\n");
        ShapeParsing.indent(PC);
        PC.res.push("-> fail " + disjunctionSign + " true");
        PC.indentation--;
        PC.res.push("\n");
        ShapeParsing.indent(PC);
        PC.res.push(")");
        break;
      case "CUT":
        ShapeParsing.indent(PC);
        PC.res.push("!,\n");
        ShapeParsing.printChildren(PC, this.childBranchExpressions);
        break;
    }
  }
}

// used for the LogicShape and LogicGroup - shapes, where we can introduce different operators like OR, 1ST, etc.
// these get their own expression so that we can handle indentation in a different way from in parsed Prolog text
// - we take responsibility for how scope-parenthesis' are placed, to isolate child-branches, if necessary
class LogicExpression {
  constructor(operatorToken, childBranchExpressions, elseExpressions){
    this.operatorToken = operatorToken;
    this.childBranchExpressions = childBranchExpressions;
    this.elseExpressions = elseExpressions;
  }

  print(PC) {
    // This demands special handling of else-arrows vs then-arrows; they must be treated in a special way (?)
    if(this.elseExpressions != null){
      ShapeParsing.indent(PC);
      PC.res.push("(\n");

      var disjunctionSign = ";";
      if(PC.isDcgRule)
        disjunctionSign = "|";

      PC.indentation++;

      this.printContent(PC);
      
      PC.res.push(",\n");
      ShapeParsing.indent(PC);
      PC.res.push("-> true " + disjunctionSign +"\n");
      
      // print the else-branches
      ShapeParsing.printChildren(PC, this.elseExpressions);
      
      PC.indentation--;
      PC.res.push("\n");
      ShapeParsing.indent(PC);
      PC.res.push(")");
    } 
    else {
      this.printContent(PC);
    }
  }

  printContent(PC) {
    switch(this.operatorToken) {
      case "AND":
        ShapeParsing.printChildren(PC, this.childBranchExpressions);
        break;
      case "OR":
        var disjunctionSign = ";";
        if(PC.isDcgRule)
          disjunctionSign = "|";

        ShapeParsing.indent(PC);
        PC.res.push("(\n");
        PC.indentation++;
        for(var i=0; i< this.childBranchExpressions.length; i++)
        {
            this.childBranchExpressions[i].print(PC);
            if(i < this.childBranchExpressions.length-1) {
              PC.res.push("\n");
              ShapeParsing.indent(PC);  
              PC.res.push(disjunctionSign + "\n");
            }
        }
        PC.indentation--;
        PC.res.push("\n");
        ShapeParsing.indent(PC);  
        PC.res.push(")");
        break;
      case "1ST":
        var disjunctionSign = ";";
        if(PC.isDcgRule)
          disjunctionSign = "|";

        var startIndent = PC.indentation;
        for(var i=0; i< this.childBranchExpressions.length; i++)
        {
            ShapeParsing.indent(PC);
            PC.res.push("(\n");

            PC.indentation++;

            //ShapeParsing.indent(PC);
            this.childBranchExpressions[i].print(PC);
            
            if(i < this.childBranchExpressions.length-1) {
              PC.res.push("\n");
              ShapeParsing.indent(PC);
              PC.res.push("-> true "+disjunctionSign+"\n");
            }         
            else {
              PC.res.push("\n");
              ShapeParsing.indent(PC);
              PC.res.push("-> true "+disjunctionSign+" false");
            }

        }
        // back up to the original indentation level again
        while(PC.indentation > startIndent)
        {
          PC.indentation--;
          PC.res.push("\n");
          ShapeParsing.indent(PC);
          PC.res.push(")");
        }

        break;
      case "NOT":
        var disjunctionSign = ";";
        if(PC.isDcgRule)
          disjunctionSign = "|";

        ShapeParsing.indent(PC);
        PC.res.push("(\n");
        PC.indentation++;
        ShapeParsing.printChildren(PC, this.childBranchExpressions);
        PC.res.push("\n");
        ShapeParsing.indent(PC);
        PC.res.push("-> fail "+disjunctionSign+" true");
        PC.indentation--;
        PC.res.push("\n");
        ShapeParsing.indent(PC);
        PC.res.push(")");
        break;
      case "CUT":
        ShapeParsing.indent(PC);
        PC.res.push("!,\n");
        ShapeParsing.printChildren(PC, this.childBranchExpressions);
        break;
    }
    
  }

}


class IntegerExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(PC) {
    PC.res.push(this.name);
  }
}

class AtomExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(PC) {
    PC.res.push(this.name);
  }
}

class StringExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(PC) {
    PC.res.push(this.name);
  }
}

class VariableExpression {
  constructor(name) {
    this.name = name;
    // add this instance to the collection in this map
    if(this.name[0] != '_') {
      var found = ShapeParsing.variableMap.get(this.name);
      if(found == undefined)
        found = [];
      found.push(this.name); // add a copy of the name to the list..
      ShapeParsing.variableMap.set(this.name, found);
    }
  }
  
  print(PC) {
    PC.res.push(this.name);
  }
}

class FloatExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(PC) {
    PC.res.push(this.name);
  }
}

class ListExpression {
  constructor(args) {
    this.args = args;
  }
  
  print(PC) {
    PC.res.push("[");
    ShapeParsing.printList(PC, this.args);
    PC.res.push("]");
  }
}

class TermExpression {
  constructor(functor, args) {
    this.functor = functor;
    this.args = args;
  }
  
  print(PC) {
    // this may be a term (parenthesis-enclosed expression) without functor
    if(this.functor != null)
      this.functor.print(PC);
    PC.res.push("(");
    ShapeParsing.printList(PC, this.args);
    PC.res.push(")");
  }
}

/**
 * A binary arithmetic expression like "a + b" or "c ^ d".
 */
class OperatorExpression {
    constructor(leftExpression, operatorToken, rightExpression) {
      this.mLeft = leftExpression;
      this.mOperator = operatorToken;
      this.mRight = rightExpression;
    }
    
    print(PC) {
      this.mLeft.print(PC);
      PC.res.push(this.mOperator.value);
      this.mRight.print(PC);
    }
  }

  // unary expressin like "-", "/+", etc 
  class PrefixExpression {
    constructor(operatorToken, rightExpression) {
      this.mOperator = operatorToken;
      this.mRight = rightExpression;
    }
    
    print(PC) {
      PC.res.push(this.mOperator.value);
      this.mRight.print(PC);
    }
  }

  // PARSELETS ///////////////////////////////////////////////////


  class IntegerParselet {
     parse(parser, token) {
      return new IntegerExpression(token.value);
    }
  }

  class VariableParselet {
    parse(parser, token) {
     return new VariableExpression(token.value);
   }
 }

  class AtomParselet {
    parse(parser, token) {
      return new AtomExpression(token.value);
    }
  }

  class StringParselet {
    parse(parser, token) {
      return new StringExpression(token.value);
    }
  }

  class FloatParselet {
    parse(parser, token) {
      return new FloatExpression(token.value);
    }
  }

  class ListParselet {

    parse(parser, token) {
      var args = [];
      if (!parser.match(TokenType.EndList))
      {
        do
        {
          args.push(parser.parseExpression(0));
        } while (parser.match(TokenType.Comma));

        parser.consume(TokenType.EndList);
      }
      return new ListExpression(args);
    }

    getPrecedence() {
      return 1000;
    }
  }

  class TermParselet {

    parse(parser, left, token) {
      var args = [];
      if (!parser.match(TokenType.EndParen))
      {
        do
        {
          args.push(parser.parseExpression(0));
        } while (parser.match(TokenType.Comma));

        parser.consume(TokenType.EndParen);
      }
      // left hand value will be term name/ functor
      // if it's just a "(", ignore it (?) - then it comes from a functorless term, and the "(" is just from the parsing procedure
      if(left instanceof PrologToken && left.type == TokenType.BeginParen)
        left = null;
      return new TermExpression(left,args);
    }

    getPrecedence() {
      return 1000;
    }
  }

  /**
 * Generic infix parselet for a binary arithmetic operator. The only
 * difference when parsing, "+", "-", "*", "/", and "^" is precedence and
 * associativity, so we can use a single parselet class for all of those.
 */
class BinaryOperatorParselet {
    
    constructor(iPrecedence,isRight,isNumeric) {
      this.mPrecedence = iPrecedence;
      this.mIsRight = isRight;
      this.mIsNumeric = isNumeric;
    }
    
    parse(parser, leftExpression, token) {
      // To handle right-associative operators like "^", we allow a slightly
      // lower precedence when parsing the right-hand side. This will let a
      // parselet with the same precedence appear on the right, which will then
      // take *this* parselet's result as its left-hand argument.
      var rightExpression = parser.parseExpression(
          this.mPrecedence - (this.mIsRight ? 1 : 0));
      
      return new OperatorExpression(leftExpression, token, rightExpression);
    }
  
    getPrecedence() {
      return this.mPrecedence;
    }
  }

class PrefixOperatorParselet{
    constructor(iPrecedence, isNumeric){
      this.mPrecedence = iPrecedence;
      this.mIsNumeric = isNumeric;
    }

    parse(parser, token) {
      var rightExpression = parser.parseExpression(this.mPrecedence);
      return new PrefixExpression(token, rightExpression);

    }
}