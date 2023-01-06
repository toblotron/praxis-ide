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


  // PARSELETS ///////////////////////////////////////////////////


  class IntegerParselet {
     parse(parser, token) {
      return new IntegerExpression(token.value);
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