function MemoryMap(size) {
    this.memsize = size;
    this.memorybuffer = new ArrayBuffer(this.memsize);
    this.mem = new Uint8Array(this.memorybuffer);
}

MemoryMap.prototype.loadBinaryResource = (url) => {
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


MemoryMap.prototype.addROM = function (name, addr, size, url) {
    var loadedRom = this.loadBinaryResource(url);
    for (var i = 0; i < size; i++) {
        this.mem[i + addr] = loadedRom[i];
    }
}

MemoryMap.prototype.read = function (addr) {
    return this.mem[addr]
}

MemoryMap.prototype.write = function (addr, value) {
    this.mem[addr] = value & 0x00FF;
}

export default MemoryMap;