import { EconfigError } from './EconfigError';

export class UnknownComponentError extends EconfigError {
    constructor(tenantId: string) {
        super(
            'UNKNOWN_COMPONENT',
            `Unknown component ${tenantId}`,
            404);
    }
}
