import { IsIn, IsNotEmpty } from 'class-validator';

export class FileBasedAuditLogConfig {
    @IsNotEmpty()
    public path: string;

    @IsIn(['json', 'csv'])
    public format: string;

    public identifier: string;

    constructor(config: any) {
        this.path = config.path;
        this.format = config.format;
        this.identifier = config.identifier;
    }
}
