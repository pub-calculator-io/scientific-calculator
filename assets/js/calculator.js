const ScientificCalculator = {
  inputField: _('input_field'),
  expressionElement: _('expression_element'),
  expression: '', partiallyEvaluated: false,
  unit: 'rad',
  mrc: '0',

  config: {
    precision: 9,
    inputs: ['0','1','2','3','4','5','6','7','8','9','.'],
    inputsMap: {
      'Backspace': 'BACK', 'Enter': '=',
      'Escape': 'AC', '_': '±', ',': '.'
    },
    actions: [ // 'e^'?
      'AC','*10^','BACK','%','/','*','+','-','=','±','rad-deg',
      '(', ')','m+','m-','mrc','^','^3','^2','10^','x^(1/y','^(1/3)','^(1/2)',
      'ln','log2','log10','log(x,y','!','sin','cos','tan','e','pi','rnd',
      'sinh','cosh','tanh','asinh','acosh','atanh','asin','acos','atan',
    ],
    actionsMap: {
      '−':'-', '×':'*', '÷':'/', 'π': 'pi', 'Rand': 'rnd', 'Rad': 'rad-deg', 'Deg': 'rad-deg',
      'cos-1':'acos', 'sin-1':'asin', 'tan-1':'atan',
      'cosh-1':'acosh', 'sinh-1':'asinh', 'tanh-1':'atanh',
      'x2':'^2', 'x3':'^3', 'xy':'^', '2√x':'^(1/2)', 'y√x':'x^(1/y', '3√x':'^(1/3)',
      'x!': '!', '10x': '10^', 'logy': 'log(x,y',
      'MRC': 'mrc', 'M+': 'm+', 'M-': 'm-', 'EE' : '*10^'
    },
    binaryOperators: ['/','*','-','+','^','x^(1/y','log(x,y','*10^'],
    leftOperators: [
      '10^','ln','log10','log2',
      'asin','acos','atan','sin','cos','tan',
      'sinh','cosh','tanh','asinh','acosh','atanh',
    ],
    rightOperators: ['!','^2','^3','^(1/2)','^(1/3)'],
  },

  calc(expression){
    try{
      return math.evaluate(expression).toString();
    }
    catch(error){
      return 'Error';
    }
  },

  initMath(){
    math.config({number: 'BigNumber', precision: this.config.precision});
    math.import({
      ln: value => math.log(value, math.e),
    });
  },

  initValues(type){
    let value = this.inputField.value || '0';
    let expression = this.expression;
    const evaluated = expression.indexOf('=') != -1;
    const error = ['NaN','Error','Infinity','-Infinity'].includes(value);

    if(error || this.partiallyEvaluated && type == 'key'){
      value = '0';
    }

    if(error || evaluated || this.partiallyEvaluated && type == 'key'){
      expression = '';
      this.deactivateActions();
    }

    if(this.partiallyEvaluated){
      this.partiallyEvaluated = false;
    }

    return {value,expression};
  },

  action(op){
    // init
    let {value, expression} = this.initValues('op');
    
    // get parts of expression
    const getExpressionParts = () => {
      let leftParentheses = 0;
      let rightParentheses = 0;
      let index = expression.length - 1;
      while(index >= 0){
        if(expression[index] == '(') leftParentheses++;
        if(expression[index] == ')') rightParentheses++;
        if(rightParentheses <= leftParentheses) {
          if(rightParentheses == 0) index++;
          break;
        }
        index--;
      }  
      return {
        left: expression.slice(0, index),
        right: expression.slice(index)
      }
    };
    let expParts = getExpressionParts();
    let partialExp;
    const config = this.config;

    // left operators
    if(config.leftOperators.includes(op)){
      // trigonometry ops. for deg. angles (no native support)
      if(this.unit == 'deg' && ['sin','cos','tan','asin','acos','atan'].includes(op)){
        if(['sin','cos','tan'].includes(op)){
          partialExp = `(round(${op}${expParts.right?`(${expParts.right}${this.unit})`:`(${value} ${this.unit})`},${config.precision-3}))`;
        }
        if(['asin','acos','atan'].includes(op)) {
          partialExp = `(round(${op}${expParts.right||`(${value})`}*180/pi,${config.precision-3}))`;
        }
      }
      else {
        partialExp = `(${op}${expParts.right||`(${value})`})`;
      }
    }

    // right operators
    if(config.rightOperators.includes(op)){
      partialExp = `(${expParts.right||`${value}`}${op})`;
    }

    // left and right ops.
    if([...config.leftOperators, ...config.rightOperators].includes(op)){
      expression = `${expParts.left}${partialExp}`;
      value = this.calc(partialExp);
      this.partiallyEvaluated = true;
      this.activateAction(op);
    }

    // binary operators
    if(config.binaryOperators.includes(op)){
      if((op.match(/x|y/g)||[]).length == 2){
        const opParts = {};
        [opParts.left, opParts.right] = op.split(/x|y/);
        expression = `${expParts.left}${opParts.left}${expParts.right||value}${opParts.right}`
      } else {
        expression+= (!expParts.right?`${value}`:'') + op;
      }
      value = '0'; // or ''
      this.activateAction(op);
    }

    // other keys
    switch(op){
      case ')':
        let leftParentheses = (expression.match(/\(/g)||[]).length;
        let rightParentheses = (expression.match(/\)/g)||[]).length;
        if(leftParentheses <= rightParentheses) break;

        expression+= (!expParts.right?`${value}`:'') + op;
        value = this.calc(getExpressionParts().right);
        this.partiallyEvaluated = true;
        this.activateAction(op);
      break;
      case '(':
        if(config.inputs.includes(expression[expression.length - 1])) break;

        expression+= op;
        value = '0';
        this.activateAction(op);
      break;
      case 'e': case 'pi':
        value = op; // this.calc(op);
      break;
      case 'rnd':
        value = this.calc(`round(random(),${config.precision})`);
      break;

      case 'm+': 
        this.mrc = this.calc(`(${this.mrc})+(${value})`);
        this.setPersistentAction({op:'mrc', state:this.mrc != '0'});
      break;
      case 'm-': 
        this.mrc = this.calc(`(${this.mrc})-(${value})`);
        this.setPersistentAction({op:'mrc', state:this.mrc != '0'});
      break;
      case 'mrc': 
        if(this.mrc != value & this.mrc != '0'){
          value = this.mrc;
        } else {
          this.mrc = '0';
        }
        this.setPersistentAction({op, state:this.mrc != '0'});
      break;

      case 'rad-deg':
        this.unit = (this.unit == 'rad' ? 'deg' : 'rad');
        this.setPersistentAction({op, state: this.unit == 'deg', 
          value: this.unit == 'deg' ? 'Deg' : 'Rad'});
      break;

      case '=':
        expression+= (!expParts.right?`${value}`:'')
        
        // close all brackets
        let parentheses = 0;
        for(let index = 0; index < expression.length; index++){
          if(expression[index] == '(') parentheses++;
          if(expression[index] == ')') parentheses--;
        }
        expression+= ')'.repeat(parentheses);

        value = this.calc(expression);
        expression+= '=' + value;
        this.activateAction(op);
      break;

      case '±':
        if(value == '0') break;
        if(value[0] == '-')
          value = value.slice(1);
        else
          value = '-' + value;
        this.setAction({op,state:value[0] == '-'});
      break;

      case '%':
        if(value[value.length-1] == '%')
          value = value.slice(0,-1);
        else
          value+= '%';
        this.setAction({op,state:value[value.length - 1] == '%'});
      break;

      case 'AC':
        value = '0';
        expression = '';
        this.deactivateActions();
      break;

      case 'BACK':
        value = value.slice(0,-1);
      break;
    }

    // output
    this.output(value, expression);
  },

  output(value, expression){
    this.inputField.value = value;
    this.expression = expression;
    this.expressionElement.innerText = expression;
    // console.log(`${value}, ${expression}`);
  },

  input(key){
    // init
    let {value, expression} = this.initValues('key');

    // check value
    if(key == '.' && value.indexOf('.') != -1) return;
    if(key != '%' && value.indexOf('%') != -1) return;

    // set value
    value = (
      value == '0' && key != '.' ? 
      key : value + key
    );
    
    if(value.length > this.config.precision) return;

    // output
    this.output(value, expression);
  },

  inputKeydown(event){
    // map keys
    let key = event.key;
    key = this.config.inputsMap[key] || key;
    let keyHandled = false;

    // action keys
    if(this.config.actions.includes(key)) {
      this.action(key);
      keyHandled = true;
    }

    // printalbe keys
    if(this.config.inputs.includes(key)) {
      this.input(key);
      keyHandled = true;
    }

    // don't stop event
    if (
      // for keys combinations
      ['Meta','Control','Alt'].some(state => event.getModifierState(state)) ||
      // for special keys, excluding which ones handled
      event.key.length > 1 && !keyHandled ||
      // for global event
      event.target.id != 'input_field' && event.code != 'NumpadDivide' // fix for some browsers
    ) return;
    
    event.preventDefault();
    event.stopPropagation();
  },

  buttonClick(event){
    if(!event.clientX && !event.clientY) return; // stops recognizing ENTER as a click
    if(event.target.tagName != "BUTTON") return;

    // map keys
    let key = event.target.innerText;
    key = this.config.actionsMap[key] || key; 
  
    // action keys
    if(this.config.actions.includes(key)){
      this.action(key);
    }
  
    // printable keys
    if(this.config.inputs.includes(key)){
      this.input(key);
    }
  },
  
  setPersistentAction({op, state, value}) {
    const button = $(`button[data-persistent-action="${op}"]`);
    if(!button) return;
    button.classList[state?'add':'remove']('basic-button--active');
    if(!value) return;
    button.innerText = value;
  },

  setAction({op, state}){
    const button = $(`button[data-action="${op}"]`);
    button && button.classList[state?'add':'remove']('basic-button--active');
  },

  activateAction(op){
    this.deactivateActions();
    this.setAction({op, state:true});
  },

  deactivateActions() {
    $$('button[data-action].basic-button--active').forEach(button => {
      button.classList.remove('basic-button--active')
    });
  },

};

window.addEventListener('load', () => ScientificCalculator.initMath());
window.addEventListener('keydown', event => ScientificCalculator.inputKeydown(event))
