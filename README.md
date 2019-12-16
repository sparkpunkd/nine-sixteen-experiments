# Nine Sixteen Experiments

Install dependencies:

    yarn install

Run server with:

    ts-node index.ts

Run CasparCG, set up output and then ...

    ADD 1-99 STREAM http://127.0.0.1:3000/ -f mpjpeg -vf "scale=1024:576" -multiple_requests 1

Then in a web browser, to see a single image go to ...

    http://127.0.0.1:3000/latest.jpg

To watch a stream in an img tag, go to:

    http://127.0.0.1:3000/index.html

Some browsers (e.g. iOS or Android) support a direct link to the stream:

    http://127.0.0.1:3000/stream.mjpg
