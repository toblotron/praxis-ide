class TokenType {
    
    // Create new instances of the same class as static attributes
    static BeginList = new TokenType("BeginList")
    static EndList = new TokenType("EndList")
    static FullStop = new TokenType("FullStop")
    static Atom = new TokenType("Atom")
    static Integer = new TokenType("Integer")
    static Float = new TokenType("Float")
    static BeginParen = new TokenType("BeginParen")
    static EndParen = new TokenType("EndParen")
    static Operator = new TokenType("Operator")
    static String = new TokenType("String")
    static Variable = new TokenType("Variable")
    static Blankspace = new TokenType("Blankspace")
    static Comma = new TokenType("Comma")
    static Pipe = new TokenType("Pipe")

    constructor(name) {
      this.name = name
    }

    // https://www.sohamkamani.com/javascript/enums/
}

class PrologToken {
  constructor(type, value)
  {
    this.type = type;
    this.value = value;
  }
}

class Lexer {
  
  constructor(text) 
  {
    this.text = text;
    this.pos = 0;
    //this.operatornames = ["mod"];
    
  }

  static operatornames = ["mod"];
  static isOperatorString(string)
  {
    if(this.operatornames.includes(string))
       return true;
    else
    {
      var i = 0;
      var length = string.length;
      do {
        var c = string[i];
        i++;
      } while (i<length && this.isOperatorChar(c));

      return i == length; // return success if all the chars counted as operators
    }
  }

  static isOperatorChar(char) 
  {
    return "[],.-/+*:<>\\=@.|".includes(c);
  }

  isOperator(char) 
  {
    return "[],.-/+*:<>()\\=@.\'\"|".includes(char);
  }
  
  static GetTokens(text)
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
          if(c == "."){
            i++;
            elem = new PrologToken(TokenType.FullStop, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if(c == "|"){
            i++;
            elem = new PrologToken(TokenType.Pipe, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if(c == ","){
            i++;
            elem = new PrologToken(TokenType.Comma, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if(c == "("){
            i++;
            elem = new PrologToken(TokenType.BeginParen, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if(c == ")"){
            i++;
            elem = new PrologToken(TokenType.EndParen, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if(c == "["){
            i++;
            elem = new PrologToken(TokenType.BeginList, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if(c == "]"){
            i++;
            elem = new PrologToken(TokenType.EndList, text.substring(from,i));
            from = i;
            elements.push(elem);
            pos += elem.value.length;
          }
          else if("[],.-/+*:<>\\=@.|".includes(c)){
              do {
                  i++;
                  var c = text[i];
              } while (i<length && "[],.-/+*:<>\\=@.|".includes(c));
              elem = new PrologToken(TokenType.Operator, text.substring(from,i));
              from = i;
              elements.push(elem);
              pos += elem.value.length;
          }
          else if(c.match(/[a-z]/)){
              // only atom acceptable
              do {
                  i++;
                  var c = text[i];
              } while (i<length && c.match(/[a-zA-Z0-9_]/));
              var atomText = text.substring(from,i);
              if(this.operatornames.includes(atomText))
              {
                elem = new PrologToken(TokenType.Operator, atomText);
              }
              else 
              {
                elem = new PrologToken(TokenType.Atom, atomText);
              }
              from = i;
              elements.push(elem);
              pos += elem.value.length;
          } else if(c.match(/[A-Z]/) || c == '_'){
              // only variable acceptable
              do {
                  i++;
                  var c = text[i];
              } while (i<length && c.match(/[a-zA-Z0-9_]/));
              elem = new PrologToken(TokenType.Variable, text.substring(from,i));
              from = i;
              elements.push(elem);
              pos += elem.value.length;
          } 
          else if(c.match(/[0-9]/)){
              // only numbers acceptable
              var fullstops = 0;
              var latestFullstopPos = 0;
              do {
                  i++;
                  var c = text[i];
                  if(c == "."){
                    fullstops++;
                    latestFullstopPos = i;
                  }
              } while (i<length && (c.match(/[0-9.]/) || c == "."));

              // accept as integer or float, or not?
              if(fullstops == 0)
                elem = new PrologToken(TokenType.Integer, text.substring(from,i));
              else if(fullstops == 1 && latestFullstopPos < i) // demand that there is only one fullstop, and that there is a number after the fullstop
                elem = new PrologToken(TokenType.Float, text.substring(from,i));
              else
              {
                // TODO: throw exception? - or handle in better way.. submit errorSink, so we can get it either to calling method, or directly to UI-errorlist?
              }

              from = i;
              elements.push(elem);
              pos += elem.value.length;
          } 
          else if(c == "\"")
          {
            // only accept string
            var escapes = 0;
            do {
              i++;
              var priorEscapes = escapes;
              var c = text[i];
              if(c == "\\")
                escapes ++;
              else 
                escapes = 0;

              // ignore everything inside the string
            } while (i<length && (!(c == "\"") || priorEscapes % 2 == 1));

            if(i<length && (c == "\"")){
              i++;
              elem = new PrologToken(TokenType.String, text.substring(from,i));
              elements.push(elem);
              pos += elem.value.length;
            } 
            else
            {
              //TODO: Throw exception - or something
            }

          }
          else if(c == "\'")
          {
            // only accept snuffed atom
            var escapes = 0;
            do {
              i++;
              var priorEscapes = escapes;
              var c = text[i];
              if(c == "\\")
                escapes ++;
              else 
                escapes = 0;

              // ignore everything inside the snuffed atom
            } while (i<length && (!(c == "\'") || priorEscapes % 2 == 1));

            if(i<length && (c == "\'")){
              i++;

              var atomText = text.substring(from,i);
              var operatorText = text.substring(from+1,i-1);
              
              if(this.isOperatorString(operatorText))
              {
                elem = new PrologToken(TokenType.Operator, operatorText);
              }
              else 
              {
                var atomText = text.substring(from,i);
                elem = new PrologToken(TokenType.Atom, atomText);
              }

              elements.push(elem);
              from = i;
              pos += atomText.length;
            } 
            else
            {
              //TODO: Throw exception - or something
            }

          }
          else 
          {
            // default - class it as blankspace; classed as undecipherable
            i = i +1;
            elem = new PrologToken(TokenType.Blankspace, text.substring(from,i));
            pos++;
            from = i;
            elements.push(elem);
          }
      } while(i<length);
      return elements;

  }

}