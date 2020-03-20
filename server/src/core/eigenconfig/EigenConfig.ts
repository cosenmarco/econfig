import { IsNumber, Max, validateOrReject } from 'class-validator';
import jsyaml from 'js-yaml';
import { map } from 'lodash';
import { logValidationErrors } from '../../util/validationErrorsLogger';
import { Tenant } from './Tenant';

export class EigenConfig {
    public eigenConfigDir: string;

    @IsNumber()
    @Max(65535)
    public port = 8080;

    public xPoweredByHeaderInResponses: boolean;

    public tenants: Tenant[];

    public constructor(yamlConfig: any, eigenConfigDir: string) {
        this.eigenConfigDir = eigenConfigDir;
        if (yamlConfig.version !== 1) {
            throw new Error(`Unsupported eigenconfig version: ${yamlConfig.version}`);
        }

        this.port = yamlConfig.port;
        this.xPoweredByHeaderInResponses = yamlConfig.xPoweredByHeaderInResponses === true;

        const tenants = yamlConfig.tenants;
        if (!Array.isArray(tenants)) {
            throw new Error ('Expected "tenants" to be an array');
        } else {
            // using non-fp version of map because I want index (see capping for lodash fp)
            this.tenants = map(tenants, (tenantYaml, index) => new Tenant(tenantYaml, index));
        }
    }
}

export async function parseValidEigenConfig(configFileContent: string, eigenConfigDir: string) {
    const configYaml = jsyaml.safeLoad(configFileContent);
    const eigenConfig = new EigenConfig(configYaml, eigenConfigDir);
    await validateOrReject(eigenConfig, { forbidUnknownValues: true }).catch (errors => {
        logValidationErrors(errors, '<root>');
        return Promise.reject('Error while validating eigenconfig. Cannot continue.');
    });
    return eigenConfig;
}
