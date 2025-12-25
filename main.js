// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

function init() {
    attachEventHandlers();
    attachKeyboardHandlers();
}

function attachEventHandlers() {
    document.querySelector('.clear').addEventListener('click', () => calculator.clearArray());
    document.querySelector('.clearEntry').addEventListener('click', () => calculator.clearEntry());
    document.querySelectorAll('.number').forEach(btn => btn.addEventListener('click', (e) => calculator.handleInput(e.target.textContent)));
    document.querySelectorAll('.operator').forEach(btn => btn.addEventListener('click', (e) => calculator.handleInput(e.target.textContent)));
    document.querySelector('.equalSign').addEventListener('click', () => calculator.evaluate());
    document.querySelectorAll('.decimal').forEach(btn => btn.addEventListener('click', (e) => calculator.handleInput(e.target.textContent)));
}

function attachKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        // Numbers 0-9
        if (key >= '0' && key <= '9') {
            calculator.handleInput(key);
        }
        // Operators
        else if (key === '+' || key === '-' || key === '*' || key === '/') {
            calculator.handleInput(key);
        }
        // Decimal
        else if (key === '.') {
            calculator.handleInput('.');
        }
        // Equals
        else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculator.evaluate();
        }
        // Clear
        else if (key === 'Escape') {
            calculator.clearArray();
        }
        // Clear Entry (Backspace)
        else if (key === 'Backspace') {
            e.preventDefault();
            calculator.clearEntry();
        }
    });
}

function CalculatorApp() {
    this.value = null;
    this.inputArray = [];
    this.lastOperator = null;
    this.lastOperand = null;
    
    this.storedOperators = {
        '+': '+',
        '-': '-',
        '*': '*',
        '/': '/'
    };

    this.storedNumbers = {
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
        '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
    };

    this.updateDisplay = () => {
        const display = document.querySelector('.calculatorScreen');
        display.value = this.inputArray.length === 0 ? 0 : this.inputArray.join('');
    };

    this.clearArray = () => {
        this.value = null;
        this.inputArray = [];
        this.lastOperator = null;
        this.lastOperand = null;
        this.updateDisplay();
    };

    this.clearEntry = () => {
        if (this.inputArray.length === 0) return;
        
        const lastItem = this.inputArray[this.inputArray.length - 1];
        
        if (typeof lastItem === 'string') {
            this.inputArray.pop();
        } else {
            let stringNum = String(lastItem);
            stringNum = stringNum.slice(0, -1);
            
            if (stringNum.length === 0) {
                this.inputArray.pop();
            } else {
                this.inputArray[this.inputArray.length - 1] = stringNum;
            }
        }
        
        this.updateDisplay();
    };

    this.handleInput = (value) => {
        if (value in this.storedNumbers || value === '.') {
            // Handle numbers and decimals
            const lastItem = this.inputArray[this.inputArray.length - 1];
            
            // If array is empty or last item is an operator, add the number
            if (this.inputArray.length === 0 || (typeof lastItem === 'string' && lastItem in this.storedOperators)) {
                if (value === '.') {
                    this.inputArray.push('0.');
                } else {
                    this.inputArray.push(value);
                }
            } else if (value === '.') {
                // Only add decimal if there isn't one already in the current number
                const currentNum = String(lastItem);
                if (!currentNum.includes('.')) {
                    this.inputArray[this.inputArray.length - 1] = currentNum + '.';
                }
            } else {
                // Append number to last item
                this.inputArray[this.inputArray.length - 1] = String(lastItem) + value;
            }
            
            this.updateDisplay();
        } else if (value in this.storedOperators) {
            // Handle operators - chain calculations
            if (this.inputArray.length === 0) {
                this.inputArray.push(0);
            }
            
            const lastItem = this.inputArray[this.inputArray.length - 1];
            
            // If last item is an operator, replace it
            if (typeof lastItem === 'string' && lastItem in this.storedOperators) {
                this.inputArray[this.inputArray.length - 1] = value;
            } 
            // If we have a complete operation (3+ items), evaluate it first
            else if (this.inputArray.length >= 3) {
                this.evaluate();
                this.inputArray.push(value);
            }
            // Otherwise just add the operator
            else {
                this.inputArray.push(value);
            }
            
            this.updateDisplay();
        }
    };

    this.performOperation = (num1, num2, operator) => {
        let result;
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
            case 'x':
            case 'X':
                result = num1 * num2;
                break;
            case '/':
                result = num1 / num2;
                break;
            default:
                return num1;
        }
        return result;
    };

    this.evaluate = () => {
        // If we have a complete operation (num1, operator, num2)
        if (this.inputArray.length >= 3) {
            let num1 = parseFloat(this.inputArray[0]);
            const operator = this.inputArray[1];
            let num2 = parseFloat(this.inputArray.slice(2).join(''));

            let result = this.performOperation(num1, num2, operator);

            if (!isFinite(result)) {
                document.querySelector('.calculatorScreen').value = 'Error';
                this.inputArray = [];
                this.lastOperator = null;
                this.lastOperand = null;
                return;
            }

            // Store the operator and operand for repeat operations
            this.lastOperator = operator;
            this.lastOperand = num2;

            this.inputArray = [result];
            this.updateDisplay();
        } 
        // If we only have one number but have a stored operator, repeat the last operation
        else if (this.inputArray.length === 1 && this.lastOperator !== null && this.lastOperand !== null) {
            let currentNum = parseFloat(this.inputArray[0]);
            let result = this.performOperation(currentNum, this.lastOperand, this.lastOperator);

            if (!isFinite(result)) {
                document.querySelector('.calculatorScreen').value = 'Error';
                this.inputArray = [];
                return;
            }

            this.inputArray = [result];
            this.updateDisplay();
        }
    };
}

const calculator = new CalculatorApp();