require('typeface-courier-prime')

const black = "#000000";
const red = "#800000";
const green = "#008000";
const yellow = "#808000";
const blue = "#000080";
const magenta = "#800080";
const cyan = "#008080";
const white = "#c0c0c0";

const bright_black = "#808080";
const bright_red = "#ff0000";
const bright_green = "#00ff00";
const bright_yellow = "#ffff00";
const bright_blue = "#0000ff";
const bright_magenta = "#ff00ff";
const bright_cyan = "#00ffff";
const bright_white = "#ffffff";

const defaultConsoleColour = { fg: white, bg: black };
const defaultChar = { txt: undefined, colour: { fg: white, bg: black } };

////////////////////////////////////////

function Screen(width, height, element) {
    var scale = window.devicePixelRatio;

    this.canvasElement = document.getElementById(element);
    var ctx = this.canvasElement.getContext("2d");
    this.canvasElement.style.width = 800 + "px";
    this.canvasElement.style.height = 600 + "px";
    this.canvasElement.width = Math.floor(800 * scale);
    this.canvasElement.height = Math.floor(600 * scale);
    ctx.scale(scale, scale)
    this.screenBuffer = [];
    this.width = width;
    this.height = height;
    this.element = element;
    this.canvas = ctx;
    this.cursor = { x: 0, y: 0 };
    this.colour = { ...defaultConsoleColour };
    this.escapeSequenceBuilder = "";
    this.showCursor = true;
}

Screen.prototype.clear = function () {
    this.screenBuffer = Array.from(Array(this.height), () => new Array(this.width));
}

Screen.prototype.excapeHandeler = function (escape) {
    //Remove the E
    escape = escape.substring(1);

    //Handel the firm cases
    switch (escape) {
        case '[H':
            this.cursor = { x: 0, y: 0 };
            return;
        case '[0m':
            this.colour = { ...defaultConsoleColour };
            return;
        case '[2J':
            this.clear();
            return;
        case '[?25l':
            this.showCursor = false;
            return;
        case '[?25h':
            this.showCursor = true;
            return;
    }
    //Handel the other cases

    //Cursor Pos
    let cursorPosRegx = /\[([0-9]+)\;([0-9]+)f/;
    let cursorPos = escape.match(cursorPosRegx);
    if (cursorPos) {
        let x = parseInt(cursorPos[2]) == 0 ? 0 : parseInt(cursorPos[2]) - 1;
        let y = parseInt(cursorPos[1]) == 0 ? 0 : parseInt(cursorPos[1]) - 1;
        this.cursor = { y: y, x: x }
        return;
    }
    //Colour
    let colourRegx = /\[([0-9]+)m/;
    let colour = escape.match(colourRegx);
    if (colour) {
        this.setColour(parseInt(colour[1]), this);
        return;
    }
    let colourRegxMuti = /\[([0-9]+)\;([0-9]+)m/;
    colourRegxMuti = escape.match(colourRegxMuti);
    if (colourRegxMuti) {
        this.setColour(parseInt(colourRegxMuti[1]), this);
        this.setColour(parseInt(colourRegxMuti[2]), this);
        return;
    }
    console.log(escape)
}

Screen.prototype.parseColour = (colourCode) => {
    switch (colourCode) {
        case 30:
            return black;
        case 31:
            return red;
        case 32:
            return green;
        case 33:
            return yellow;
        case 34:
            return blue;
        case 35:
            return magenta;
        case 36:
            return cyan;
        case 37:
            return white;
        case 90:
            return bright_black;
        case 91:
            return bright_red;
        case 92:
            return bright_green;
        case 93:
            return bright_yellow;
        case 94:
            return bright_blue;
        case 95:
            return bright_magenta;
        case 96:
            return bright_cyan;
        case 97:
            return bright_white;
        default:
            console.log('Unknow Colour' + colour[1]);
            break;
    }
}

Screen.prototype.setColour = (colourCode, screnOBJ) => {
    if ((colourCode >= 30 && colourCode <= 37) || (colourCode >= 90 && colourCode <= 97)) {
        ;
        screnOBJ.colour.fg = screnOBJ.parseColour(colourCode);
    } else {
        screnOBJ.colour.bg = screnOBJ.parseColour(colourCode - 10);
    }
}

Screen.prototype.newChar = function (char) {
    if (this.escapeSequenceBuilder != "") {
        this.escapeSequenceBuilder += char;
        if (char == 'f' || char == 'm' || char == 'H' || char == 'J' || char == 'l' || char == 'h') {
            this.excapeHandeler(this.escapeSequenceBuilder);
            this.escapeSequenceBuilder = "";
        }
    } else {
        switch (char) {
            case '\r':
                break;
            case '\n':
                //Newline
                this.cursor.y++;
                this.cursor.x = 0;
                break;
            case '\b':
                //backspace
                this.cursor.x--;
                this.screenBuffer[this.cursor.y][this.cursor.x] = undefined;
                break;
            case String.fromCharCode(27):
                //escape
                this.escapeSequenceBuilder += "E";
                break;
            default:
                this.screenBuffer[this.cursor.y][this.cursor.x] = { txt: char, colour: { ...this.colour } };
                this.cursor.x++;
                break;
        }
        if (this.cursor.x == this.width) {
            this.cursor.x = 0;
            this.cursor.y++;
        }
        if (this.cursor.y == this.height) {
            this.cursor.y--;
            this.screenBuffer.shift();
            this.screenBuffer.push(new Array(this.width))
        }
    }
}

Screen.prototype.draw = function () {
    this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.canvas.fillStyle = black;
    this.canvas.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    this.canvas.font = "15px Courier Prime";
    let now = new Date();
    //First draw the background, we have to spit this out so we dont get overdraw
    for (var row = 0; row < this.height; row++) {
        for (var col = 0; col < this.width; col++) {
            let char = this.screenBuffer[row][col] || defaultChar;
            this.canvas.fillStyle = char.colour.bg
            this.canvas.fillRect((col + 1) * 10 - 10, row * 16, 10, 16);
        }
    }
    //Now the foreground and cursor
    for (var row = 0; row < this.height; row++) {
        for (var col = 0; col < this.width; col++) {
            let char = this.screenBuffer[row][col] || defaultChar;
            this.canvas.fillStyle = char.colour.fg
            if (this.cursor.y == row && this.cursor.x == col && this.showCursor && Math.round(now.getTime() / 1000) % 2) {
                this.canvas.fillRect((col + 1) * 10 - 10, row * 16 + 4, 10, 16);
            }
            if (char.txt) {
                this.canvas.fillStyle = char.colour.fg
                this.canvas.fillText(char.txt, col * 10, (row + 1) * 16);
            }
        }
    }
}

export default Screen;