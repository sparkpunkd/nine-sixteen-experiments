import * as Koa from 'koa'
// import { IncomingMessage } from 'http'
// import { Socket } from 'net'
export const app = new Koa()

// let building = Buffer.alloc(8294400)
// let latest = Buffer.alloc(8294400)
// let pos = 0
Buffer.poolSize = 82944000

// class MyIncoming extends IncomingMessage {
//  	constructor (socket: Socket) {
//  		super(socket)
//
//
//  	}
// }

app.use(async function(ctx) {
	// console.log(ctx)
  ctx.body = 'Hello World!'
	let start = process.hrtime()
	let callMeDone: (x: any) => void = () => {}
	// ctx.req.on('data', (d: Buffer) => {
		// console.log('pos', pos, d.length)
		// if (pos >= building.length) {
		//
		// 	building.copy(latest, 0)
		// 	console.log(pos, building.length, process.hrtime(start), ctx.req.socket.bufferSize)
		// 	start = process.hrtime()
		// 	// building = Buffer.alloc(8294400)
		// 	pos = d.copy(building, 0)
		// 	callMeDone('fred')
		// } else {
		// 	pos += d.copy(building, pos)
		// }
	// setInterval(() => {
	// 	let bufit = ctx.req.read(8294400)
	// 	console.log(ctx.req.readable, bufit ? bufit.length : null)
	// }, 35)

	ctx.req.on('readable', () => {
		// console.log('Readable length: ', ctx.req.readableLength)
		let bufit: Buffer | null = ctx.req.read(8294400)
		// console.log('Rabbits')
		if (bufit !== null) {
			console.log((bufit as Buffer).length, process.hrtime(start))
			start = process.hrtime()
			callMeDone('fred')
		}
	})
	ctx.req.on('close', () => { console.log('Stream has ended.') })
	ctx.req.on('error', console.error)
	return new Promise((resolve) => { callMeDone = resolve; })
})

if (!module.parent) app.listen(3000, '0.0.0.0');
