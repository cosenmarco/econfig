import { EconfigError } from './EconfigError';

export class UnknownComponentError extends EconfigError {
    public constructor(tenantId: string) {
        super(
            'UNKNOWN_COMPONENT',
            `Unknown component ${tenantId}`,
            404);
    }
}
