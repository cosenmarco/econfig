import { EconfigError } from './EconfigError';

export class UnknownTenantError extends EconfigError {
    public constructor(tenantId: string) {
        super(
            'UNKNOWN_TENANT',
            `Unknown tenant ${tenantId}`,
            404);
    }
}
