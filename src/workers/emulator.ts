import { HAL, type ROM } from '../emu/component/HAL';

export enum TXType {
    INIT,
    ROM_LOADED,
    OUTPUT_CHAR
}

export enum RXType {
    INIT,
    RESET,
    LOAD_ROM,
    SEND_CHAR
}

export type RXMessage = RX_INIT | RX_RESET | RX_LOAD_ROM | RX_SEND_CHAR

type RX_INIT = {
    action: RXType.INIT,
    data: ROM
}

type RX_RESET = {
    action: RXType.RESET,
}

type RX_LOAD_ROM = {
    action: RXType.LOAD_ROM,
    data: ROM
}

type RX_SEND_CHAR = {
    action: RXType.SEND_CHAR,
    data: string
}


export type TXMessage = TX_INIT | TX_OUTPUT_CHAR | TX_ROM_LOADED

type TX_INIT = {
    action: TXType.INIT,
}

type TX_ROM_LOADED = {
    action: TXType.ROM_LOADED,
}

type TX_OUTPUT_CHAR = {
    action: TXType.OUTPUT_CHAR
    data: string
}


if (typeof self !== 'undefined') {
    let emuConfig = {
        updateInterval: 1, // ms tick interval
        numCyclesPerTick: 7372 * 3.5, // clock cycles per interval we have to multiply this by 3.5 to match speed for some reason
        sendOutput: (char: string) => { self.postMessage({ action: TXType.OUTPUT_CHAR, data: char }) }
    };

    const theComputer = new HAL(emuConfig);


    self.onmessage = async (e: MessageEvent<RXMessage>) => {
        switch (e.data.action) {
            case RXType.INIT:
                await theComputer.setupMemory(e.data.data);
                theComputer.cpu.reset();
                theComputer.go();
                self.postMessage({ action: TXType.INIT });
                break;
            case RXType.RESET:
                theComputer.cpu.reset();
                break;
            case RXType.SEND_CHAR:
                theComputer.addToKeyboardBuffer(e.data.data);
                break;
            case RXType.LOAD_ROM:
                await theComputer.memory.addROM(e.data.data.start, e.data.data.uri)
                self.postMessage({ action: TXType.ROM_LOADED });
        }
    };
}