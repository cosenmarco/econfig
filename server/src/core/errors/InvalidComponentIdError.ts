import { EconfigError } from './EconfigError';

export class InvalidComponentIdError extends EconfigError {
    public constructor(componentId: string) {
        super(
            'INVALID_COMPONENT',
            `Invalid component ID ${componentId}`,
            400);
    }
}
