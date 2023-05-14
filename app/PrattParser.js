class PrattParser {

    constructor(tokens) {
      this.tokens = tokens;
      this.mTokens = tokens.entries();  // set it as an iterator
      this.mPrefixParselets = new Map();
      this.mInfixParselets = new Map();
      this.mRead = [];
    }
    
    registerPrefixParselet(tokenType, prefixParselet) {
      this.mPrefixParselets.set(tokenType, prefixParselet);
    }

    // for numeric prefix operators
    registerPrefixOperatorParselet(operatorName, precedence, isNumeric) {
      this.mPrefixParselets.set(operatorName, new PrefixOperatorParselet(precedence,isNumeric));
    }
    
    registerInfixParselet(operatorName, infixParselet) {
      this.mInfixParselets.set(operatorName, infixParselet);
    }
    
    parseExpression(){
      this.parseExpression(0);
    }

    parseExpression(iPrecedence) {
      var token = this.consume();
      var prefixParselet = null;
      if(token.type.name == "Operator") {
        // for operators (prefix) we have them registered by operator name
        var operatorName = token.value;
        // if operator is snuffed, remove snuff before finding parselet
        if(operatorName[0] == "'" && operatorName[operatorName.length-1] == "'")  
          operatorName = operatorName.substring(1,operatorName.length-1);
        prefixParselet = this.mPrefixParselets.get(operatorName);
      }
      else
        // others are registered by token type name
        prefixParselet = this.mPrefixParselets.get(token.type.name);

      if (prefixParselet == null) { 
        console.log("Could not parse \"" + token.value + "\".");
        throw new PrologParsingException("Could not parse \"" +
          token.value + "\".");
      }
      
      var leftExpression = prefixParselet.parse(this, token);
      
      while (iPrecedence < this.getPrecedence()) {
        token = this.consume();
        var tokenName = token.value;
        // if operator is snuffed, remove snuff before finding parselet
        if(token.type.name == "Operator") {
          if(tokenName[0] == "'" && tokenName[tokenName.length-1] == "'")  
          tokenName = tokenName.substring(1,tokenName.length-1);
        }
        var infixParselet = this.mInfixParselets.get(tokenName);
        leftExpression = infixParselet.parse(this, leftExpression, token);
      }
      
      return leftExpression;
    }
    
    parseThis() {
      var res = this.parseExpression(0);
      // after parsing, check that all tokens have been consumed - otherwise throw error
      var nextValue = this.mTokens.next();
      if(nextValue.done == false || this.mRead.length > 0){
        // report what token was unparseable, and where it occured
        throw new PrologParsingException("Expected end of expression, found token {"+this.mRead[0].value+"}" );
      }

      return res;
    }
    
    match(expectedTokenType) {
      var token = this.lookAhead(0);
      if (token.type != expectedTokenType) {
        return false;
      }
      
      this.consume();
      return true;
    }
    
    consumeToken(expectedTokenType) {
      var token = this.lookAhead(0);
      if (token.type != expectedTokenType) {
        throw new PrologParsingException("Expected token " + expectedTokenType +
            " and found " + token.type);
      }
      
      return consume();
    }
    
    consume() {
      // Make sure we've read the token.
      var ret = this.lookAhead(0);
      if(ret == null)
      {
        // looked for more tokens but found none
        throw new PrologParsingException("Unexpected end of expression");
      }
      return this.mRead.shift(); // remove first element
      //return mRead.remove(0);
    }
    
    lookAhead(iDistance) {
      // Read in as many as needed.
      var exit = false;
      while (iDistance >= this.mRead.length && exit == false) {
        var nextValue = this.mTokens.next();
        if(nextValue.done){
            exit = true;
            return null;
        }
        else
        {
            var actualToken = nextValue.value[1];
            this.mRead.unshift(actualToken); // add to beginning of array
        }
      }
  
      // Get the queued token.
      return this.mRead[iDistance];
    }
  
    getPrecedence() {
      var currentToken = this.lookAhead(0);
      if(currentToken != null){
        var tokenName = currentToken.value;
        // handle the case when an operator is snuffed
        if(currentToken.type.name == "Operator") {
          if(tokenName[0] == "'" && tokenName[tokenName.length-1] == "'")  
          tokenName = tokenName.substring(1,tokenName.length-1);
        }
        var infixParselet = this.mInfixParselets.get(tokenName);
        if(infixParselet != undefined) 
            return infixParselet.getPrecedence();
      }
      return 0;
    }

  }

  class PrologParsingException extends Error {
    constructor(message) {
      super(message);
    }
  }

  class PrologParser extends PrattParser {
    constructor(tokens){
        super(tokens);

        // Register all of the parselets for the grammar.
    
        // Register the ones that need special parselets.
        this.registerPrefixParselet(TokenType.Integer.name, new IntegerParselet());
        this.registerPrefixParselet(TokenType.Float.name, new FloatParselet());
        this.registerPrefixParselet(TokenType.Atom.name, new AtomParselet());
        this.registerPrefixParselet(TokenType.Variable.name, new VariableParselet());
        this.registerPrefixParselet(TokenType.BeginList.name, new ListParselet());
        this.registerPrefixParselet(TokenType.BeginParen.name, new TermParselet());
        
        this.registerPrefixOperatorParselet("-", 500, true);
        this.registerPrefixOperatorParselet("+", 500, true);

        /*
        register(TokenType.ASSIGN,     new AssignParselet());
        register(TokenType.QUESTION,   new ConditionalParselet());
        register(TokenType.LEFT_PAREN, new GroupParselet());
        register(TokenType.LEFT_PAREN, new CallParselet());
        */

        // term parselet, like: "a(1,2)"
        this.registerInfixParselet("(", new TermParselet());

        // Register the simple operator parselets.
        this.registerInfixParselet(",", new BinaryOperatorParselet(30, true, false));
        this.registerInfixParselet(";", new BinaryOperatorParselet(25, true, false));
        this.registerInfixParselet("|", new BinaryOperatorParselet(1001, false, false));
        this.registerInfixParselet(":", new BinaryOperatorParselet(20, true, false));
        this.registerInfixParselet("+", new BinaryOperatorParselet(60, false, true));
        this.registerInfixParselet("-", new BinaryOperatorParselet(60, false, true)); 
        this.registerInfixParselet("*", new BinaryOperatorParselet(70, false, true)); 
        this.registerInfixParselet("=", new BinaryOperatorParselet(40, false, true)); 
        this.registerInfixParselet("/", new BinaryOperatorParselet(70, false, true)); 
        this.registerInfixParselet("mod", new BinaryOperatorParselet(70, false, true)); 

    }

  }