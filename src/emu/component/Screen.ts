export class Screen {
    static black = "#000000";
    static red = "#800000";
    static green = "#008000";
    static yellow = "#808000";
    static blue = "#000080";
    static magenta = "#800080";
    static cyan = "#008080";
    static white = "#c0c0c0";

    static bright_black = "#808080";
    static bright_red = "#ff0000";
    static bright_green = "#00ff00";
    static bright_yellow = "#ffff00";
    static bright_blue = "#0000ff";
    static bright_magenta = "#ff00ff";
    static bright_cyan = "#00ffff";
    static bright_white = "#ffffff";

    static colourMap = {
        30: Screen.black,
        31: Screen.red,
        32: Screen.green,
        33: Screen.yellow,
        34: Screen.blue,
        35: Screen.magenta,
        36: Screen.cyan,
        37: Screen.white,
        90: Screen.bright_black,
        91: Screen.bright_red,
        92: Screen.bright_green,
        93: Screen.bright_yellow,
        94: Screen.bright_blue,
        95: Screen.bright_magenta,
        96: Screen.bright_cyan,
        97: Screen.bright_white
    }

    static defaultConsoleColour = { fg: Screen.white, bg: Screen.black };
    static defaultChar = { txt: undefined, colour: { fg: Screen.white, bg: Screen.black } };

    canvasElement: HTMLCanvasElement
    screenBuffer: Array<Array<{ txt: undefined | string, colour: { fg: string, bg: string } } | undefined>>
    width: number
    height: number
    canvas: CanvasRenderingContext2D
    cursor: { x: number, y: number }
    colour: { fg: string, bg: string }
    escapeSequenceBuilder: string
    showCursor: boolean

    constructor(width: number, height: number, element: HTMLCanvasElement) {
        let scale = window.devicePixelRatio;
        this.canvasElement = element;
        let ctx = this.canvasElement.getContext("2d") as CanvasRenderingContext2D;
        this.canvasElement.style.width = 800 + "px";
        this.canvasElement.style.height = 600 + "px";
        this.canvasElement.width = Math.floor(800 * scale);
        this.canvasElement.height = Math.floor(600 * scale);
        ctx.scale(scale, scale)
        this.screenBuffer = [];
        this.width = width;
        this.height = height;
        this.canvas = ctx;
        this.cursor = { x: 0, y: 0 };
        this.colour = { ... Screen.defaultConsoleColour };
        this.escapeSequenceBuilder = "";
        this.showCursor = true;
    }

    clear() {
        this.screenBuffer = Array.from(Array(this.height), () => new Array(this.width));
    }

    excapeHandeler(escape: string) {
        //Remove the E
        escape = escape.substring(1);

        //Handel the firm cases
        switch (escape) {
            case '[H':
                this.cursor = { x: 0, y: 0 };
                return
            case '[0m':
                this.colour = { ... Screen.defaultConsoleColour };
                return
            case '[2J':
                this.clear();
                return
            case '[?25l':
                this.showCursor = false;
                return
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
        let colourRegxMatch = escape.match(colourRegxMuti);
        if (colourRegxMatch) {
            this.setColour(parseInt(colourRegxMatch[1]), this);
            this.setColour(parseInt(colourRegxMatch[2]), this);
            return;
        }
    }

    parseColour(colourCode: number) {
        return Screen.colourMap[colourCode];
    }

    setColour(colourCode: number, screnOBJ: Screen) {
        if ((colourCode >= 30 && colourCode <= 37) || (colourCode >= 90 && colourCode <= 97)) {
            ;
            screnOBJ.colour.fg = screnOBJ.parseColour(colourCode);
        } else {
            screnOBJ.colour.bg = screnOBJ.parseColour(colourCode - 10);
        }
    }

    newChar(char: string) {
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

    draw() {
        this.canvas.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvas.fillStyle =  Screen.black;
        this.canvas.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        this.canvas.font = "16px Windows Command Prompt, monospace";
        let now = new Date();
        //First draw the background, we have to spit this out so we dont get overdraw
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                let char = this.screenBuffer[row][col] ||  Screen.defaultChar;
                this.canvas.fillStyle = char.colour.bg
                this.canvas.fillRect((col + 1) * 10 - 10, row * 16, 10, 16);
            }
        }
        //Now the foreground and cursor
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                let char = this.screenBuffer[row][col] ||  Screen.defaultChar;
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
}