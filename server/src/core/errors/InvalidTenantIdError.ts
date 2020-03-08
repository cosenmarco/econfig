import { EconfigError } from './EconfigError';

export class InvalidTenantIdError extends EconfigError {
    constructor(tenantId: string) {
        super(
            'INVALID_TENANT',
            `Invalid tenant ID ${tenantId}`,
            400);
    }
}
