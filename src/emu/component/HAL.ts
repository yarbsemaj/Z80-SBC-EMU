import { Z80 } from 'z80-emulator'
import { MemoryMap } from './Memory'

interface EMUSettings {
    roms: ROM[];
    sendOutput: (txt: string) => void;
    updateInterval: number
    numCyclesPerTick: number
}

export interface ROM {
    name: string;
    start: number;
    uri: any;
}

export class HAL {
    emuConfig: EMUSettings
    memory: MemoryMap
    inputBuffer: number[]
    cpu: Z80
    interval!: NodeJS.Timeout;

    constructor(emuConfig: EMUSettings) {
        this.emuConfig = emuConfig;
        this.memory = new MemoryMap(0xFFFF);


        this.inputBuffer = [];
        this.cpu = new Z80(this);
    }

    async setupMemory(data: ROM[]) {
        for (let rom of data) {
            await this.memory.addROM(rom.start, rom.uri);
        }
    }

    readMemory(address: number) {
        return (this.memory.read(address));
    }

    tStateCount = 0
    contendMemory() { }
    contendPort() { }


    writeMemory(address: number, value: number) {
        this.memory.write(address, value);
    }

    addToKeyboardBuffer(chars: string) {
        this.inputBuffer.push(...[...chars].map((char) => char.charCodeAt(0)))
    }

    pollKeyBuffer() {
        if (this.inputBuffer.length !== 0) {
            this.cpu.maskableInterrupt();
        }
    }

    readPort(port: number) {
        //Mask the port
        port = port & 0x00FF;
        switch (port) {
            case 0x81:
                if (this.inputBuffer.length) {
                    return this.inputBuffer.shift() as number;
                }
                return 0;
            case 0x80:
                let register = 0x00;
                if (this.inputBuffer.length > 0) {
                    register = 0x01; // RDRF (Receive data register full)
                }
                register |= 0b00001110; // Transmit data register empty, Data Carrier detect, Clear to Send
                return register
        }

        return 0;
    }

    writePort(port: number, value: number) {
        port = port & 0x00FF;
        if (port == 0x81) {
            this.emuConfig.sendOutput(String.fromCharCode(value));
        }

        //We don't care about control registers writes.
    }

    tick() {
        this.pollKeyBuffer();
        while (this.tStateCount < this.emuConfig.numCyclesPerTick) {
            this.cpu.step();
        }
        this.cpu.hal.tStateCount = 0
    }

    go() {
        clearInterval(this.interval);

        var self = this;
        this.interval = setInterval(function () {
            self.tick();
        }, this.emuConfig.updateInterval);
    }
}