import { inspect } from 'util';
import logger from '../logger';

export default function logValidationErrors(errors: any[], path: string) {
    errors.forEach(error => {
        logger.error(`Invalid eigenconfig at path '${path}': property '${error.property}' ` +
            `must respect following constraints: ${inspect(error.constraints)}`);
    });
}
