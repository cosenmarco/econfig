import { validateOrReject } from 'class-validator';
import logValidationErrors from '../util/validationErrorsLogger';
import Repository from './Repository';
import { UrlRepository } from './url/UrlRepository';
import { UrlRepositoryConfig } from './url/UrlRepositoryConfig';

export default async function createRepository(type: string, config: any) {
    switch (type) {
        case 'url':
            return validateConfigAndBuildRepository(config, UrlRepositoryConfig, UrlRepository);
    }
    throw new Error(`Unknown repository type ${type}`);
}

async function validateConfigAndBuildRepository<C, R>(
    config: any,
    ConfigConstructor: new (rawConfig: any) => C,
    RepositoryConstructor: new (config: C) => R,
) {
    const repoConfig = new ConfigConstructor(config);
    await validateOrReject(repoConfig, { forbidUnknownValues: true }).catch(errors => {
        logValidationErrors(errors, 'configRepositoryConfig');
        return Promise.reject('Error while validating eigenconfig. Cannot continue.');
    });
    return new RepositoryConstructor(repoConfig);
}
