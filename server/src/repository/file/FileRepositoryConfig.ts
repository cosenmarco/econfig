import { IsIn, IsNotEmpty } from 'class-validator';
import { isString } from 'util';

export class FileRepositoryConfig {
    @IsNotEmpty()
    public path: string;

    @IsIn(['json', 'yaml'])
    public format: string;

    @IsNotEmpty()
    public encoding = 'utf-8';

    constructor(config: any) {
        this.path = config.path;
        this.format = config.format;
        if (isString(config.encoding)) {
            this.encoding = config.encoding;
        }
    }
}
