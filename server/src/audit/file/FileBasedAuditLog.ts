import fs from 'fs';
import moment from 'moment';
import os from 'os';
import { TenantConfig } from '../../core/eigenconfig/TenantConfig';
import { AuditLog } from '../AuditLog';
import { FileBasedAuditLogConfig } from './FileBasedAuditLogConfig';

interface Event {
    eventType: string;
    comment: string;
    payload: object;
}

/**
 * This audit log, will append all events to the file at the specified path.
 * If the file is not existing, it will be created with permissions 660
 *
 * There are two format types:
 * json - The message is encoded in JSON. The event payload is itself part of the
 * json object which is written appended to the file. Every row in the file is a JSON object
 * csv - The standard field in the object are columns in the CSV output whereas the payload
 * is converted to a JSON string and is written its own column. Separator is \t
 * Columns are in following order: timestamp, id, eventType, comment, payload
 *
 * The id represents an identifier for this server instance (in case it is part of
 * a cluster). The special id $hostname is replaced by the host name.
 */
export default class FileBasedAuditLog implements AuditLog {
    private configuration: FileBasedAuditLogConfig;
    private id: string;
    private fileDescriptor: number;

    public constructor(configuration: FileBasedAuditLogConfig) {
        this.configuration = configuration;
        this.id = this.resolveIdentifier();
        this.fileDescriptor = fs.openSync(configuration.path, 'a', 0o660);
    }

    public serverStarted(version: string, tenantConfig: TenantConfig) {
        this.logEvent({
            eventType: 'server_started',
            comment: 'Started',
            payload: {
                version,
                tenantConfig,
            },
        });
    }

    public serverReady() {
        this.logEvent({
            eventType: 'server_ready',
            comment: 'Ready',
            payload: {},
        });
    }

    public logConfigModelLoaded(comment: string, hash: string, repositoryMetadata: object): void {
        this.logEvent({
            eventType: 'config_model_loaded',
            comment,
            payload: {
                hash,
                repositoryMetadata,
            },
        });
    }

    public serverShutdown() {
        this.logEvent({
            eventType: 'server_shutdown',
            comment: 'Shutdown',
            payload: {},
        });
        fs.closeSync(this.fileDescriptor);
    }

    private logEvent(event: Event) {
        const { eventType, comment, payload } = event;
        const timestamp = moment().toISOString();
        switch (this.configuration.format) {
            case 'json':
                fs.writeSync(this.fileDescriptor, JSON.stringify({
                    timestamp,
                    id: this.id,
                    eventType,
                    comment,
                    payload,
                }) + '\n');
                break;
            case 'csv':
                fs.writeSync(this.fileDescriptor, `${timestamp}\t${this.id}\t` +
                    `${eventType}\t${comment}\t${JSON.stringify(payload)}\n`);
                break;
            default:
                throw new Error(`Unsupported audit log format ${this.configuration.format}`);
        }
    }

    private resolveIdentifier() {
        switch (this.configuration.identifier) {
            case '$hostname':
                return os.hostname().replace('\t', '   ');
            default:
                return this.configuration.identifier;
        }
    }
}
