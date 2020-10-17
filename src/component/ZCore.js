import Z80 from './Z80'
import MemoryMap from './Memory'

function ZCore(emuConfig) {
    // initialize memory

    this.emuConfig = emuConfig;
    this.mmap = new MemoryMap(0xFFFF);

    // add our peripherals
    this.parsePeripherals(emuConfig.peripherals);

    // reset the output buffer
    this.outbuf = "";
    this.inbuf = "";
    this.bufferTickCountdown = 0;

    // reset debugging
    this.lastReadAddress = 0xFFFF;
    this.lastWriteAddress = 0xFFFF;

    // initialize the Z80 core
    this.cpu = Z80(this);

    this.cpu.reset();

    // timer
    this.go();
}

ZCore.prototype.parsePeripherals = function (data) {
    for (var idx in data.ROM) {
        var item = data.ROM[idx];
        this.mmap.addROM(item.name, item.start, item.size, item.uri);
    }
}

/////////////////////////////////////////////////////////////////////



ZCore.prototype.mem_read = function (address) {
    this.lastReadAddress = address;
    return (this.mmap.read(address));
}

ZCore.prototype.mem_write = function (address, value) {
    this.lastWriteAddress = address;
    this.mmap.write(address, value);
}

ZCore.prototype.addToKeyboardBuffer = function (chars) {
    this.inbuf += chars;
}

ZCore.prototype.animationTick = function () {

}

ZCore.prototype.pollKeybuffer = function () {
    if (this.inbuf.length == 0) { return; }
    this.cpu.interrupt(false, this.inbuf.charCodeAt(0));
}

ZCore.prototype.io_read = function (port) {
    var retval = 0x00;

    port = port & 0x00FF;

    if (port == 0x81) {  /* ACIA data (get chars from console) */
        // return with the first character
        retval = this.inbuf.charCodeAt(0);
        // and trim down the string (pop it off the front)
        this.inbuf = this.inbuf.substring(1);
    }

    if (port == 0x80) {  /* ACIA control */
        if (this.inbuf.length > 0) { /* console available */
            retval = 0x01; // kPRS_RxDataReady
        }
        retval |= 0x02; // kPRS_TXDataEmpty - ready for new stuff
        retval |= 0x04; // kPRS_DCD - connected to carrier
        retval |= 0x08; // kPRS_CTS - clear to send!
    }

    return retval;
}

ZCore.prototype.io_write = function (port, value) {
    port = port & 0x00FF;

    if (port == 0x80) { /* ACIA control */
        // ignore all.
    }
    if (port == 0x81) { /* ACIA data (send chars to console) */
        this.emuConfig.sendOutput(String.fromCharCode(value));
    }
}


//////////////////////////////////////////////////

ZCore.prototype.tick = function () {
    var count = 0;

    // pop a keyhit off, if it's time.
    this.pollKeybuffer();

    // run some instructions
    while (count < this.emuConfig.numCyclesPerTick) {
        count += this.cpu.run_instruction();
    }
}

ZCore.prototype.go = function () {
    // stop them just in case
    clearInterval(this.interval);
    clearInterval(this.animationInterval);


    console.log("Starting timers.");

    var self = this;
    this.interval = setInterval(function () {
        self.tick();
    }, this.emuConfig.updateInterval);

    this.animationToggle = false;
    self.animationTick(); // do one run immediately.
    this.animationInterval = setInterval(function () {
        self.animationTick();
    }, 500);
}

export default ZCore