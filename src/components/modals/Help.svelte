<div >
	<b>Monitor commands</b>
	<p>
		When the emulator first starts it will be running the monitor program, this gives a window into
		the machine that can be used to load other programs.  <br />
        When in the monitor program the following
		commands can be used. <br /> <br />
		R nn Dumps out <code>0xFF</code> bites of memory starting at address
		<code>0xnn00</code>.<br />
		W nnnn Write byte starting at <code>0xnnnn</code> until a break is sent.<br />
		E nnnn Runs a program starting at address <code>0xnnnn</code>.<br />
	</p>

	<b>Start Basic</b>
    <p>
		Basic is in memory at address <code>0x0100</code>, typing E 0100 in the monitor will
		start it.<br />
    </p>  
	<b>Load Roms</b>
	<p>
		ROM images can be loaded using the on-screen menu. All ROM are loaded into memory starting at
		address <code>0x9000</code> and start immediately.<br />
		All action games use WASD to control.
	</p>
	<b>Load iHEX files</b>
	<p>
		<a href="https://en.wikipedia.org/wiki/Intel_HEX">iHEX Files</a> can be loaded using the on-screen
		menu and executed using the monitor.
	</p>
</div>
