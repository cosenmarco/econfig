import { Dictionary } from 'lodash';
import ConfigKey from './ConfigKey';
import ConfigValue from './ConfigValue';

import { expect } from 'chai';
import { Mock } from 'ts-mockery';

describe('ConfigKey', () => {
    it('resolves the best value according to the number of static dimension matches', () => {
        const testConfigValues = [
            buildConfigValueMock('test value0', 5, true),
            buildConfigValueMock('test value1', 6, false),
            buildConfigValueMock('test value2', 2, true),
            buildConfigValueMock('test value3', 8, false),
            buildConfigValueMock('test value4', 0, true),
        ];
        const configKey = new ConfigKey('key', 'test key', testConfigValues);

        // Content of this map doesn't matter since we're mocking values
        const testDimensionValues = {} as Dictionary<string>;

        const resolvedKey = configKey.resolveUsing(testDimensionValues);
        expect(resolvedKey.key).to.equal('key');
        expect(resolvedKey.description).to.equal('test key');
        expect(resolvedKey.values).to.have.deep.ordered.members([
            {
                value: 'test value0',
                dynamicDimensionValues: [],
            }, {
                value: 'test value2',
                dynamicDimensionValues: [],
            }, {
                value: 'test value4',
                dynamicDimensionValues: [],
            },
        ]);
    });

    it('resolves falling back to the default value if no match found', () => {
        const testConfigValues = [
            buildConfigValueMock('test value0', 5, false),
            buildConfigValueMock('test value1', 6, false),
            buildConfigValueMock('test value2', 0, false),
        ];

        // Content of this map doesn't matter since we're mocking values
        const testDimensionValues = {} as Dictionary<string>;

        const configKey = new ConfigKey('key', 'test key', testConfigValues);
        const resolvedKey = configKey.resolveUsing(testDimensionValues);
        expect(resolvedKey.values).to.have.deep.ordered.members([
            {
                value: 'test value2',
                dynamicDimensionValues: [],
            },
        ]);
    });

    it('resolves empty values if there is no match and no default value', () => {
        const testConfigValues = [
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 5,
                areAllStaticDimensionsMatching: () => false,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 6,
                areAllStaticDimensionsMatching: () => false,
            }),
        ];

        // Content of this map doesn't matter since we're mocking values
        const testDimensionValues = {} as Dictionary<string>;

        const configKey = new ConfigKey('key', 'test key', testConfigValues);
        const resolvedKey = configKey.resolveUsing(testDimensionValues);
        expect(resolvedKey.values).to.eql([]);
    });

    it('resolves same key and description', () => {
        const testConfigValues = [] as ConfigValue[];

        // Content of this map doesn't matter since we're mocking values
        const testDimensionValues = {} as Dictionary<string>;
        const configKey = new ConfigKey('key', 'test key', testConfigValues);

        const resolvedKey = configKey.resolveUsing(testDimensionValues);

        expect(resolvedKey.key).to.equal('key');
        expect(resolvedKey.description).to.equal('test key');
    });
});

function buildConfigValueMock(
    value: string,
    staticDimensionValuesLength: number,
    areAllStaticDimensionsMatching: boolean,
) {
    return Mock.of<ConfigValue>({
        staticDimensionValuesLength,
        areAllStaticDimensionsMatching: () => areAllStaticDimensionsMatching,
        getResolvedDynamicDimensionValues: () => [],
        value,
    });
}