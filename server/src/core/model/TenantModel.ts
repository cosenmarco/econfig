import { Dictionary } from 'lodash';
import moment from 'moment';
import { inspect } from 'util';
import { AuditLog } from '../../audit/AuditLog';
import { Repository } from '../../repository/Repository';
import { logger } from '../../util/logger';
import { TenantConfig } from '../eigenconfig/TenantConfig';
import { CoreModel } from './CoreModel';

export interface TenantInfo {
    readonly model: CoreModel;
    readonly repository: Repository;
    readonly auditLog: AuditLog;
    readonly tenantConfig: TenantConfig;
}

export class TenantModel {
    private _id: string;
    private model: CoreModel;
    private repository: Repository;
    private auditLog: AuditLog;
    private refreshHandler: NodeJS.Timeout;

    public constructor(info: TenantInfo) {
        this._id = info.tenantConfig.id;
        this.model = info.model;
        this.repository = info.repository;
        this.auditLog = info.auditLog;
        this.refreshHandler = setInterval(
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            () => this.triggerConfigReload().catch(
                error => logger.error(`Unable to reload the configuration for tenant ${this._id}: ${error}`)),
            info.tenantConfig.refreshIntervalMillis);
    }

    public get id() {
        return this._id;
    }

    public async triggerConfigReload() {
        if (this.repository && await this.repository.shouldReload()) {
            const startMoment = moment();
            const { model, meta } = await this.repository.buildCoreModel();
            this.model = model;
            this.auditLog.logConfigModelLoaded(`Refresh load triggered at ${startMoment.toISOString()}`,
                model.hash(), meta);
            logger.silly(inspect(this.model, true, 9));
        }
    }

    public resolveConfiguration(componentId: string, staticDimensionValues: Dictionary<string>) {
        return this.model.resolveConfiguration(componentId, staticDimensionValues);
    }

    public serverReady() {
        this.auditLog.serverReady();
    }

    public initiateShutdown() {
        clearInterval(this.refreshHandler);
    }

    public serverShutdown() {
        this.auditLog.serverShutdown();
    }
}
