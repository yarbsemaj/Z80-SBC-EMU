
export class MemoryMap{
    mem: Uint8Array

    constructor(size: number){
        this.mem = new Uint8Array(size);
    }

    async loadBinaryResource(url: string){
        let req = await fetch(url);
        if (req.status != 200) return [];

        return  new Uint8Array (await req.arrayBuffer());
    }

    async addROM(addr: number, url: string) {
        await this.loadBinaryResource(url).then((loadedRom)=>{
            for (let i = 0; i < loadedRom.length; i++) {
                this.mem[i + addr] = loadedRom[i];
            }
        });
    }

    read(addr: number) {
        return this.mem[addr]
    }

    write(addr: number, value: number) {
        if(addr < 0x8000){
            console.log(`NO RAM at address ${addr.toString(16)}`)
            return;
        }

        value = value & 0x00FF; //Mask the value to 8 bits
        this.mem[addr] = value;
    }
}