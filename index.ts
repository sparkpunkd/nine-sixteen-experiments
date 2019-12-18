import * as Koa from 'koa'
export const app = new Koa()
import { ServerResponse } from 'http'

let latest: Buffer = Buffer.alloc(0)
let building: Buffer = Buffer.alloc(0)
const startExp = /(Content-type: image\/jpeg\r\nContent-length: (\d+)\r\n\r\n).*/
let streams: Array<ServerResponse> = []

app.use(async function(ctx) {
	console.log(ctx)
  // ctx.body = 'Hello World';
	if (ctx.method === 'POST') {
		ctx.req.on('data', d => {
			// console.log(d.length, d.slice(0, 100).toString('utf8'))
			let match = startExp.exec(d.slice(0, 60).toString('utf8'))
			// console.log(match, d.slice(0, 60).toString('utf8'))
			if (d.length === 10 && d.toString('utf8') === '--ffmpeg\r\n') {
				return
			}
			if (match) {
				latest = building.length > 12 && building[0] === 0xff && building[1] === 0xd8 ? Buffer.from(building.slice(0, -12)) : latest
				streams.forEach(s => {
					s.write('--jpgboundary\r\n')
					s.write('Content-type: image/jpeg\r\n')
					s.write(`Content-length: ${latest.length}\r\n\r\n`)
					s.write(latest)
				})
				// console.log(match[2], latest, latest.slice(-30))
				if (+match[2] !== 11532) {
					building = d.slice(Buffer.byteLength(match[1], 'utf8'))
				} else {
					building = Buffer.alloc(0)
				}
			} else {
				// console.log('In here', building.slice(-30), d.slice(-30))
				building = Buffer.concat([building, d])
			}
		})
		ctx.body = "Hello World"
	}

	if (ctx.method === 'GET') {
		if (ctx.path.startsWith('/latest.jpg')) {
			ctx.type = 'image/jpeg'
			ctx.body = latest
		} else if (ctx.path.startsWith('/index.html')) {
			ctx.type = 'text/html'
			ctx.body = `<html><head></head><body>
                    <img src="http://127.0.0.1:3000/stream.mjpg" width="100%"/>
                  </body></html>`
		} else if (ctx.path.startsWith('/stream.mjpg')) {
			streams.push(ctx.res)
			ctx.res.on('error', console.error)
			ctx.type = 'multipart/x-mixed-replace; boundary=--jpgboundary'
			ctx.status = 200
			return new Promise( _resolve => { } )
		}
	}

})

if (!module.parent) app.listen(3000, '0.0.0.0');
