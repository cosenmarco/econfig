import { Dictionary } from 'lodash';
import moment from 'moment';
import { inspect } from 'util';
import { AuditLog } from './audit/AuditLog';
import { TenantConfig } from './core/eigenconfig/TenantConfig';
import CoreModel from './core/model/CoreModel';
import Repository from './repository/Repository';
import logger from './util/logger';

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

    constructor(info: TenantInfo) {
        this._id = info.tenantConfig.id;
        this.model = info.model;
        this.repository = info.repository;
        this.auditLog = info.auditLog;
        this.refreshHandler = setInterval(
            () => this.triggerConfigReload().catch(error => logger.error(error)),
            info.tenantConfig.refreshIntervalMillis);
    }

    get id() {
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
