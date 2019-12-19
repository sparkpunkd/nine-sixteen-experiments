import * as Koa from 'koa'
// import { IncomingMessage } from 'http'
// import { Socket } from 'net'
export const app = new Koa()

// let building = Buffer.alloc(8294400)
// let latest = Buffer.alloc(8294400)
// let pos = 0
// let start = process.hrtime()
Buffer.poolSize = 82944000

// class MyIncoming extends IncomingMessage {
//  	constructor (socket: Socket) {
//  		super(socket)
//
//
//  	}
// }

app.use(async function(ctx) {
	console.log(ctx)
  ctx.body = 'Hello World!'
	let start = process.hrtime()
	// ctx.req.on('data', (d: Buffer) => {
	// 	if (d.length === 11520 || pos >= building.length) {
	// 		building.copy(latest, 0)
	// 		console.log(pos, building.length, process.hrtime(start), ctx.req.socket.bufferSize)
	// 		start = process.hrtime()
	// 		// building = Buffer.alloc(8294400)
	// 		if (d.length !== 11520) {
	// 			pos = d.copy(building, 0)
	// 		} else {
	// 			pos = 0
	// 		}
	// 	} else {
	// 		pos += d.copy(building, pos)
	// 	}
	// setInterval(() => {
	// 	let bufit = ctx.req.read(8294400)
	// 	console.log(ctx.req.readable, bufit ? bufit.length : null)
	// }, 35)
	ctx.req.on('readable', () => {
		if (ctx.req.readableLength === 11520) {
			ctx.req.read()
			console.log('Discarding audio')
			return
		}
		let bufit: Buffer | null = ctx.req.read(8294400)
		if (bufit) {
			console.log(bufit.length, process.hrtime(start))
			start = process.hrtime()
		}
	})
})

if (!module.parent) app.listen(3000, '0.0.0.0');
