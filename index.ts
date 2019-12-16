import * as Koa from 'koa'
export const app = new Koa()

let latest: Buffer = Buffer.alloc(0)
let building: Buffer = Buffer.alloc(0)
const startExp = /(Content-type: image\/jpeg\r\nContent-length: (\d+)\r\n\r\n).*/

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
				console.log(match[2], latest, latest.slice(-30))
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

	if (ctx.method === 'GET' && ctx.path.startsWith('/latest.jpg')) {
		ctx.type = 'image/jpeg'
		ctx.body = latest
	}
});

if (!module.parent) app.listen(3000);
