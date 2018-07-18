# Theremin-X Source

Code that powered the [Theremin-X Project](https://blog.mattbierner.com/theremin-x).

***Warning:** this code was basically written to be run once. It did that, and I'm just posting it up on Github in case anyone else wants to see how it was done. It's not pretty and is probably not be a good starting point for similar projects.*

## Running
The node scripts are written in TypeScript and use the [noble](https://www.npmjs.com/package/noble) library for bluetooth. 

To build and run:

```bash
$ npm install
$ npm run compile
$ npm run start
```

This starts the script listing on the default midi input ports. It will automatically discover nearby supported vibrators and drive them using there theremin midi input.

Ctrl+c to stop the script.


## Hardware

### Theremin

The script in this repo samples the pitch and volume of a theremin as Midi input. Some basic config options for midi connecting are found in `src/config.ts`. The mapping from midi input values to vibration strength is found in `scr/sampler.ts`. The current values are optimized for an Moog Etherwave theremin and may need tweaking for best results.

If dealing with a non-midi enabled theremin, such as the professionally one used in the video, consider using [Midi Merlin](http://www.randygeorgemusic.com/midimerlin/).

### Toys

The following vibrators should connect automatically:

- [Lovense Hush](https://www.lovense.com/vibrating-butt-plug)
- [Lovense Lush](https://www.lovense.com/bluetooth-remote-control-vibrator)
- [Lovense Ambi](https://www.lovense.com/mini-bullet-vibrator-for-clitoral-simulation)

Should be easy to hook up other bluetooth toys as well provided they have open APIs. 