
export class MemoryMap{
    memsize: number
    memorybuffer: ArrayBuffer
    mem: Uint8Array

    constructor(size: number){
        this.memsize = size;
        this.memorybuffer = new ArrayBuffer(this.memsize);
        this.mem = new Uint8Array(this.memorybuffer);
    }

    loadBinaryResource(url: string){
        var byteArray = [];
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.overrideMimeType('text\/plain; charset=x-user-defined');
        req.send(null);
        if (req.status != 200) return byteArray;
        for (var i = 0; i < req.responseText.length; ++i) {
            byteArray.push(req.responseText.charCodeAt(i) & 0xff)
        }
        return byteArray;
    }

    addROM(name: any, addr: number, size: number, url: string) {
        var loadedRom = this.loadBinaryResource(url);
        for (var i = 0; i < size; i++) {
            this.mem[i + addr] = loadedRom[i];
        }
    }

    read(addr: number) {
        return this.mem[addr]
    }

    write(addr: number, value: number) {
        this.mem[addr] = value & 0x00FF;
    }
}