//pkg.js
mergeInto(LibraryManager.library, {
	i64_func_lh: function (a_lo, a_hi, b_lo, b_hi) {
		var u32 = new Uint32Array([a_lo, a_hi, b_lo, b_hi]);
		console.log('a_lo: ', u32[0], ', a_hi:', u32[1], ', b_lo:', u32[2], ', b_hi:', u32[3]);
		var a = BigInt("0x" + u32[1].toString(16) + ("00000000" + u32[0].toString(16)).slice(-8));
		var b = BigInt("0x" + u32[3].toString(16) + ("00000000" + u32[2].toString(16)).slice(-8));
	  console.log('a: ', a, 'b:', b);
	  return a + b;
	},
	i64_func: function (a, b) {
		console.log('a: ', a, 'b:', b);
		return a + b;
	}
})