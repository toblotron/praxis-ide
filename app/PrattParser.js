class PrattParser {

    constructor(tokens) {
      this.mTokens = tokens.entries();  // set it as an iterator
      this.mPrefixParselets = new Map();
      this.mInfixParselets = new Map();
      this.mRead = [];
    }
    
    registerPrefixParselet(tokenType, prefixParselet) {
      this.mPrefixParselets.set(tokenType, prefixParselet);
    }
    
    registerInfixParselet(operatorName, infixParselet) {
      this.mInfixParselets.set(operatorName, infixParselet);
    }
    
    parseExpression(){
      this.parseExpression(0);
    }

    parseExpression(iPrecedence) {
      var token = this.consume();
      var prefixParselet = this.mPrefixParselets.get(token.type);
      
      if (prefixParselet == null) throw new ParseException("Could not parse \"" +
          token.value + "\".");
      
      var leftExpression = prefixParselet.parse(this, token);
      
      while (iPrecedence < this.getPrecedence()) {
        token = this.consume();
        
        var infixParselet = this.mInfixParselets.get(token.value);
        leftExpression = infixParselet.parse(this, leftExpression, token);
      }
      
      return leftExpression;
    }
    
    parseThis() {
      return this.parseExpression(0);
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
        throw new RuntimeException("Expected token " + expectedTokenType +
            " and found " + token.type);
      }
      
      return consume();
    }
    
    consume() {
      // Make sure we've read the token.
      this.lookAhead(0);
      
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
        var infixParselet = this.mInfixParselets.get(currentToken.value);
        if(infixParselet != undefined) 
            return infixParselet.getPrecedence();
      }
      return 0;
    }

  }

  class PrologParser extends PrattParser {
    constructor(tokens){
        super(tokens);

        // Register all of the parselets for the grammar.
    
        // Register the ones that need special parselets.
        this.registerPrefixParselet(TokenType.Integer, new IntegerParselet());
        this.registerPrefixParselet(TokenType.Float, new FloatParselet());
        this.registerPrefixParselet(TokenType.Atom, new AtomParselet());

        this.registerPrefixParselet(TokenType.BeginList, new ListParselet());

        /*
        register(TokenType.ASSIGN,     new AssignParselet());
        register(TokenType.QUESTION,   new ConditionalParselet());
        register(TokenType.LEFT_PAREN, new GroupParselet());
        register(TokenType.LEFT_PAREN, new CallParselet());
        */

        // term parselet, like: "a(1,2)"
        this.registerInfixParselet("(", new TermParselet());

        // Register the simple operator parselets.
        this.registerInfixParselet("|", new BinaryOperatorParselet(1001, false, true));
        this.registerInfixParselet("+", new BinaryOperatorParselet(60, false, true));
        this.registerInfixParselet("-", new BinaryOperatorParselet(60, false, true)); 
    }

  }