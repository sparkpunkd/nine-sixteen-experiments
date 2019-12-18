import * as Koa from 'koa'
// import { IncomingMessage } from 'http'
export const app = new Koa()

let building = Buffer.alloc(8294400)
let latest = Buffer.alloc(8294400)
let pos = 0
let start = process.hrtime()
Buffer.poolSize = 82944000

// class MyIncoming extends IncomingMessage {
// 	constructor (socket) {
// 		super(socket, { highWaterMark: 8294400 })
// 	}
// }

app.use(async function(ctx) {
	console.log(ctx)
	console.log(ctx.req)
  ctx.body = 'Hello World!'
	ctx.req.on('data', (d: Buffer) => {
		if (d.length === 11520 || pos >= building.length) {
			building.copy(latest, 0)
			console.log(pos, building.length, process.hrtime(start), ctx.req.readableHighWaterMark)
			start = process.hrtime()
			// building = Buffer.alloc(8294400)
			if (d.length !== 11520) {
				pos = d.copy(building, 0)
			} else {
				pos = 0
			}
		} else {
			pos += d.copy(building, pos)
		}
	})
})

if (!module.parent) app.listen(3000, '0.0.0.0');
