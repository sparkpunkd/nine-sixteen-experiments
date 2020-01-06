import * as Koa from 'koa'
export const app = new Koa()
import { ServerResponse } from 'http'

let latest: Buffer = Buffer.alloc(0)
let building: Buffer = Buffer.alloc(0)
const startExp = /(Content-type: image\/jpeg\r\nContent-length: (\d+)\r\n\r\n).*/
let streams: Array<{ r: ServerResponse, drained: boolean }> = []
const clientLimit = 4
let frameCounter = 0

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
				frameCounter++
				Promise.all(streams.map((s, index) => new Promise((resolve: (b: boolean) => void, _reject) => {
					// console.log('<<<', index, s.drained)
					if (!s.drained) {
						console.log(`Dropping stream ${index} frame ${frameCounter}`)
						return resolve(s.drained)
					}
					s.r.write('--jpgboundary\r\n')
					s.r.write('Content-type: image/jpeg\r\n')
					s.r.write(`Content-length: ${latest.length}\r\n\r\n`)
					s.drained = s.r.write(latest)
					// console.log('>>>', index, s.drained)
					resolve(s.drained)
				}).catch(err => { console.error(`Failed to send JPEG to stream ${index}: ${err.message}`) })))

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
		ctx.body = `Received frame part ${frameCounter}`
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
		} else if (ctx.path.startsWith('/clipped.html')) {
			ctx.type = 'text/html'
			ctx.body = `<html>
									<head>
									</head>
									<body>
										<img src="http://127.0.0.1:3000/stream.mjpg" style="width: 640px; height: 360px; object-fit: none; object-position: 0% 0%"/>&nbsp;
										<img src="http://127.0.0.1:3000/stream.mjpg" style="width: 640px; height: 360px; object-fit: none; object-position: 100% 0%"/>
										<br/>
										<img src="http://127.0.0.1:3000/stream.mjpg" style="width: 640px; height: 360px; object-fit: none; object-position: 0% 100%"/>&nbsp;
										<img src="http://127.0.0.1:3000/stream.mjpg" style="width: 640px; height: 360px; object-fit: none; object-position: 100% 100%"/>
									</body>
									</html>`
		} else if (ctx.path.startsWith('/stream.mjpg')) {
			if (streams.length >= clientLimit) {
				ctx.status = 429
				ctx.body = 'Maximum number of streams exceeded.'
				return
			}
			let stream = { r: ctx.res, drained: true }
			streams.push(stream)
			ctx.res.on('drain', () => { stream.drained = true })
			console.log(`Streaming client connected. ${streams.length} streams now active.`)
			ctx.res.on('error', err => { console.error(`Error for stream at index ${streams.indexOf(stream)}: ${err.message}`) })
			ctx.res.on('close', () => {
				streams = streams.filter(s => s !== stream)
				console.log(`Client closed. ${streams.length} streams active.`)
			})
			ctx.type = 'multipart/x-mixed-replace; boundary=--jpgboundary'
			ctx.status = 200
			return new Promise( _resolve => { } )
		}
	}

})

if (!module.parent) app.listen(3000, '0.0.0.0', () => {
	console.log('MJPEG forwarding server listening on port 3000.')
});
