import { IsIn, IsUrl } from 'class-validator';

export class UrlRepositoryConfig {
    @IsUrl()
    public url?: string;

    @IsIn(['json', 'yaml'])
    public format?: string;

    constructor(config: any) {
        this.url = config.url;
        this.format = config.format;
    }
}
