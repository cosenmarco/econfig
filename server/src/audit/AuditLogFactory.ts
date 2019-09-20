import { validateOrReject } from 'class-validator';
import logValidationErrors from '../util/validationErrorsLogger';
import FileBasedAuditLog from './file/FileBasedAuditLog';
import { FileBasedAuditLogConfig } from './file/FileBasedAuditLogConfig';

export default async function createAuditLog(type: string, config: any) {
    switch (type) {
        case 'file':
            return validateConfigAndBuildRepository(config, FileBasedAuditLogConfig, FileBasedAuditLog);
    }
    throw new Error(`Unknown repository type ${type}`);
}

async function validateConfigAndBuildRepository<C, R>(
    config: any,
    ConfigConstructor: new (rawConfig: any) => C,
    AuditLogConstructor: new (config: C) => R,
) {
    const repoConfig = new ConfigConstructor(config);
    await validateOrReject(repoConfig, { forbidUnknownValues: true }).catch(errors => {
        logValidationErrors(errors, 'configRepositoryConfig');
        return Promise.reject('Error while validating eigenconfig. Cannot continue.');
    });
    return new AuditLogConstructor(repoConfig);
}
