import { IsNumber, Max, validateOrReject } from 'class-validator';
import jsyaml from 'js-yaml';
import { map } from 'lodash/fp';
import { isArray } from 'util';
import logValidationErrors from '../../util/validationErrorsLogger';
import { Tenant } from './Tenant';

export class EigenConfig {
    @IsNumber()
    @Max(65535)
    public port = 8080;

    public tenants: Tenant[];

    public constructor(yamlConfig: any) {
        this.port = yamlConfig.port;

        if (!isArray(yamlConfig.tenants)) {
            throw new Error ('Expected "tenants" to be an array');
        }
        this.tenants = map((tenantYaml: any) => new Tenant(tenantYaml))(yamlConfig.tenants);
    }
}

export async function parseValidEigenConfig(configFileContent: string) {
    const configYaml = jsyaml.safeLoad(configFileContent);
    const eigenConfig = new EigenConfig(configYaml);
    await validateOrReject(eigenConfig, { forbidUnknownValues: true }).catch (errors => {
        logValidationErrors(errors, '<root>');
        return Promise.reject('Error while validating eigenconfig. Cannot continue.');
    });
    return eigenConfig;
}
