import { Logger } from './logger';
import { ThereminSampler } from './sampler';
import { Theremin } from './theremin';
import { ToyManager } from './toyManager';


const main = () => {
    const logger = new Logger();
    const theremin = new Theremin(logger)

    new ToyManager(
        new ThereminSampler(theremin, logger),
        logger);
};

main();