
// instance follows parsing of entire rule, both for parsing of shapes as well as for parsing of text(?)
class RuleParsingContext {
  constructor(page, headShape ) {
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

  print(res) {
    var r = 
      "\n" + this.name;
    if(this.args.length > 0)
      r += "(" + this.args.join(", ") + ")";

    if(this.body != undefined && this.body.length > 0){
      r += ":-\n" + this.body.join(",\n");
    }
    res.concat(r);
  }
}

// may not be necessary to keep "Formula" structure - might just as well just have a bunch OperatorExpressions, but keep it like this for now
// (the "formula" structure probably doesn't add anything of value, but for the sake of overview we keep it around for now)
class FormulaExpression {
  constructor(expressionRows, body) {
    this.expressionRows = expressionRows;
    this.body = body;
  }

  // oh my, this will not work - at all.. :)
  print(res) {
    var r = 
      "\n" + this.name;
    if(this.args.length > 0)
      r += "(" + this.args.join(", ") + ")";

    if(this.body != undefined && this.body.length > 0){
      r += ":-\n" + this.body.join(",\n");
    }
    res.concat(r);
  }
}

class IntegerExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(res) {
    res.concat(this.name);
  }
}

class AtomExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(res) {
    res.concat(this.name);
  }
}

class VariableExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(res) {
    res.concat(this.name);
  }
}

class FloatExpression {
  constructor(name) {
    this.name = name;
  }
  
  print(res) {
    res.concat(this.name);
  }
}

class ListExpression {
  constructor(args) {
    this.args = args;
  }
  
  print(res) {
    res.concat("[" + this.args.join(",") +"]" );
  }
}

class TermExpression {
  constructor(functor, args) {
    this.functor = functor;
    this.args = args;
  }
  
  print(res) {
    res.concat(this.functor + "(" + this.args.join(",") +")" );
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
    
    print(res) {
      this.mLeft.print(res);
      res.concat(" " + this.mOperator.value + " ");
      this.mRight.print(res);
    }
  }

  // unary expressin like "-", "/+", etc 
  class PrefixExpression {
    constructor(operatorToken, rightExpression) {
      this.mOperator = operatorToken;
      this.mRight = rightExpression;
    }
    
    print(res) {
      res.concat(" " + this.mOperator.value + " ");
      this.mRight.print(res);
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