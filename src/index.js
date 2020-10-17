import 'bootstrap';
import './main.scss';
import $ from "jquery";

import Screen from './component/Screen';
import ZCore from './component/ZCore';

import root from './roms/root.cim';

import minesweper from './roms/minesweeper.cim';
import puc from './roms/puc.cim';
import snake from './roms/snake.cim';

import minesweperImg from './img/games/minesweeper.png'
import pucImg from './img/games/puc.png'
import snakeImg from './img/games/snake.png'


var emuConfig = {
    updateInterval: 0.1,    // ms tick interval
    numCyclesPerTick: 40000,	// clock cycles per interval
    peripherals: {
        ROM: [
            { name: "8k ROM 0", start: 0x0000, size: 0x2000, uri: root },
        ]
    },
    sendOutput: sendOutput
};

let roms = [
    { name: "PUC", start: 0x9000, size: 0x3000, uri: puc, img: pucImg },
    { name: "Minesweeper", start: 0x9000, size: 0x3000, uri: minesweper, img: minesweperImg },
    { name: "Snake", start: 0x9000, size: 0x3000, uri: snake, img: snakeImg },
]

/////////////////////////////////////////////////////////////////////
function sendOutput(txt) {
    screen.newChar(txt);
}

function inputCharacter(character) {
    // character in from console interface
    theComputer.addToKeyboardBuffer(character);
    if (character.charCodeAt(0) == 10) {
        theComputer.addToKeyboardBuffer("\r");
    }
}

function setupInterface() {
    $('html').on('keypress', function (event) {
        if (event.which == 9 || event.which == 13 || event.which == 16) {
            event.preventDefault();
            if (event.which == 9) { inputCharacter('\t'); }
            if (event.which == 13) { inputCharacter('\n'); }
        } else {
            var key = String.fromCharCode(event.which);
            inputCharacter(key);
        }
    });

    $('html').on('keyup', function (event) {
        if (event.which == 8) { inputCharacter('\b'); }
    });

    $('#reset').on('click', function (event) {
        theComputer.cpu.reset();
    });

    $.each(roms, function (key, value) {
        $('#rom-list')
            .append($(`<div class="carousel-item ${!key ? 'active' : null}"><img class="d-block w-100" src="${value.img}" alt="${value.name}"> </div>`));
    });


    $('#load-rom').on('click', function (event) {
        let rom = roms[$('div.active').index()];
        theComputer.mmap.addROM(rom.name, rom.start, rom.size, rom.uri);
        theComputer.cpu.reset();
        //Give time for the CPU to reset
        setTimeout(() => { theComputer.addToKeyboardBuffer('E9000\n') }, 50);
    });

    $("a[data-target='#ihexModal']").on('click', function () {
        $('#load-ihex').prop('disabled', true);
        $('#ihexFileInput').val('');
        $('#ihexFileLable').html('Choose file');
    });

    let file;

    $('#ihexFileInput').on('change', function () {
        let files = $('#ihexFileInput').prop('files');
        if (files && files[0]) {
            file = files[0];
            $('#ihexFileLable').html(file.name);
            $('#load-ihex').prop('disabled', false);
        }
    });

    $('#load-ihex').on('click', function () {
        let fr = new FileReader(); // FileReader instance
        fr.onload = function () {
            theComputer.cpu.reset();
            setTimeout(() => { theComputer.addToKeyboardBuffer(fr.result) }, 50);
        };
        fr.readAsText(file);
    });


    $('#romlist').on('change', function () {
        let romName = $(this).val();
        let rom = roms.find((rom) => romName == rom.name)
        theComputer.mmap.addROM(rom.name, rom.start, rom.size, rom.uri);

    });
}

/////////////////////////////////////////////////////////////////////

var theComputer;
var screen;

function startUpEmulation() {
    screen = new Screen(80, 37, "terminal")
    screen.clear();
    setInterval(() => screen.draw(), 32);
    theComputer = new ZCore(emuConfig);
    setupInterface();
}

$(startUpEmulation());
