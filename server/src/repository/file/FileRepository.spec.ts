import { expect } from 'chai';
import fs from 'fs';
import { basename } from 'path';
import { SinonStub } from 'sinon';
import { dirSync, fileSync, setGracefulCleanup } from 'tmp';
import { ImportMock } from 'ts-mock-imports';
import { CoreModel } from '../../core/model/CoreModel';
import * as buildModelFromJson from '../buildModelFromJson';
import { FileRepository } from './FileRepository';
import { FileRepositoryConfig } from './FileRepositoryConfig';

setGracefulCleanup();

const testYaml = `
value0: 42
string0: string
list0: [ a, b, c ]`;

const testJson = `{ "value0": 42, "string0": "string", "list0": [ "a", "b", "c" ]}`;

describe('FileRepository', () => {
    let buildModelSpy: SinonStub;
    const emptyModel = {} as CoreModel;

    beforeEach(() => {
        buildModelSpy = ImportMock.mockFunction(buildModelFromJson, 'buildModelFromJson', emptyModel);
    });

    afterEach(() => {
        ImportMock.restore();
    });

    [
        ['yaml', testYaml],
        ['json', testJson],

    ].forEach((testCase: string[]) => {
        const [ format, content ] = testCase;
        it(`reads configuration file correctly for type ${format} with absolute path`, async () => {
            const tempFile = fileSync();
            fs.writeSync(tempFile.fd, content);
            const configuration = new FileRepositoryConfig({
                format,
                path: tempFile.name,
            });

            const repository = new FileRepository(configuration, './ignore/me');
            const result = await repository.buildCoreModel();

            expect(result.model).to.equal(emptyModel);
            expect(result.meta).to.deep.equal({
                path: tempFile.name,
                modelJson: {
                    value0: 42,
                    string0: 'string',
                    list0: ['a', 'b', 'c'],
                },
            });
            expect(buildModelSpy.getCall(0).args[0]).to.deep.equal({
                value0: 42,
                string0: 'string',
                list0: ['a', 'b', 'c'],
            });

            tempFile.removeCallback();
        });
    });

    [
        ['yaml', testYaml],
        ['json', testJson],

    ].forEach((testCase: string[]) => {
        const [format, content] = testCase;
        it(`reads configuration file correctly for type ${format} with relative path`, async () => {
            const tempDir = dirSync({ unsafeCleanup: true });
            const tempFile = fileSync({ dir: tempDir.name });
            fs.writeSync(tempFile.fd, content);
            const configuration = new FileRepositoryConfig({
                format,
                path: basename(tempFile.name),
            });

            const repository = new FileRepository(configuration, tempDir.name);
            const result = await repository.buildCoreModel();

            expect(result.model).to.equal(emptyModel);
            expect(result.meta).to.deep.equal({
                path: tempFile.name,
                modelJson: {
                    value0: 42,
                    string0: 'string',
                    list0: ['a', 'b', 'c'],
                },
            });
            expect(buildModelSpy.getCall(0).args[0]).to.deep.equal({
                value0: 42,
                string0: 'string',
                list0: ['a', 'b', 'c'],
            });

            tempFile.removeCallback();
            tempDir.removeCallback();
        });
    });

});
