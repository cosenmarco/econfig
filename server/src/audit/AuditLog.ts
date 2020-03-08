import { TenantConfig } from '../core/eigenconfig/TenantConfig';

/**
 * The AuditLog offers a facility to record events permanently about
 * what happened to the configuration at various stages of its life cycle.
 * It also aims to log what happens in the various clients to be able to
 * reconstruct exactly which configuration was in effect at a certain point
 * in time.
 */
export interface AuditLog {
    /**
     * This is called when the server is started, after configuration is
     * successfully parsed.
     * @param comment the comment for the event
     * @param version the version of the server
     * @param tenantConfig the current configuration
     */
    serverStarted(version: string, tenantConfig: TenantConfig): void;

    /**
     * This is called when the server has loaded the initial model and it's ready to
     * start serving ist APIs.
     */
    serverReady(): void;

    /**
     * This is called as soon as the configuration is loaded in the server.
     * The repository should provide metadata about how to trace back to the
     * original model or the model itself in case this is not possible.
     * @param hash the model hash
     * @param repositoryMetadata the metadata with traceability info
     */
    logConfigModelLoaded(comment: string, hash: string, repositoryMetadata: object): void;

    /**
     * This is called when the server is shut down and has successfully closed
     * all pending connections.
     * In some cases, the AuditLog needs to be correctly shutdown: this also happens here.
     */
    serverShutdown(): void;
}
