# Nine Sixteen Experiments

This is an experiment in how to extract a stream of images from a CasparCG server for display in a web browser. This is being used a part of the development of a 9:16 cropping tool.

### Install

Install dependencies:

    yarn install

### Run server

Run server on test port `3000` with:

    ts-node index.ts

### Create stream

Run CasparCG, set up an output channel (`1` in the example) and then ...

    ADD 1-99 STREAM http://127.0.0.1:3000/ -f mpjpeg -multiple_requests 1

Use flags `-qmin` and `-qmax` to set quality, in the range `0` to `63`, with lower numbers used to increase both quality and bitrate.

To set a different framerate from that in use for the CasparCG channel, use the fps filter e.g. `-vf "fps=fps=5"`.

To scale the video, use a scale filter, e.g. `-vf "scale=1024:576"`.

### View the streams

#### Single image

In a web browser, to see a single image, go to ...

    http://127.0.0.1:3000/latest.jpg

This could be used in a canvas to always pull down the latest version. However, there is no handshake to determine when the image has changed.

#### Direct stream link

Some browsers (e.g. iOS or Android) support a direct link to the stream:

    http://127.0.0.1:3000/stream.mjpg

As the server must push every image in every stream, a maximum number of 4 concurrent streams is supported.

#### Streaming in image tab

To watch a stream in an `img` tag - required for some versions of Chrome - go to:

    http://127.0.0.1:3000/index.html

#### Examples of cropping

To crop out part of an image, try this demo. The demo assumes you have a source stream that is a 2x2 multiviewer and you want to view each quadrant separately.

    http://127.0.0.1:3000/cropped.html

## License

[MIT license](./LICENSE).
