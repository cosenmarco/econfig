import { Dictionary } from 'lodash';
import ConfigKey from './ConfigKey';
import ConfigValue from './ConfigValue';

import { expect } from 'chai';
import { Mock } from 'ts-mockery';

describe('ConfigKey', () => {
    it('resolves the best value according to the number of static dimension matches', () => {
        const testConfigValues = [
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 5,
                areAllStaticDimensionsMatching: () => true,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 6,
                areAllStaticDimensionsMatching: () => false,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 2,
                areAllStaticDimensionsMatching: () => true,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 8,
                areAllStaticDimensionsMatching: () => false,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 0,
                areAllStaticDimensionsMatching: () => true,
            }),
        ];
        const configKey = new ConfigKey('key', 'test key', testConfigValues);

        // Content of this map doesn't matter since we're mocking values
        const testDimensionValues = {} as Dictionary<string>;

        const resolvedKey = configKey.resolveUsing(testDimensionValues);
        expect(resolvedKey.values).to.have.ordered.members([
            testConfigValues[0],
            testConfigValues[2],
            testConfigValues[4],
        ]);
    });

    it('resolves falling back to the default value if no match found', () => {
        const testConfigValues = [
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 5,
                areAllStaticDimensionsMatching: () => false,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 6,
                areAllStaticDimensionsMatching: () => false,
            }),
            Mock.of<ConfigValue>({
                staticDimensionValuesLength: 0,
                areAllStaticDimensionsMatching: () => false,
            }),
        ];

        // Content of this map doesn't matter since we're mocking values
        const testDimensionValues = {} as Dictionary<string>;

        const configKey = new ConfigKey('key', 'test key', testConfigValues);
        const resolvedKey = configKey.resolveUsing(testDimensionValues);
        expect(resolvedKey.values).to.have.ordered.members([
            testConfigValues[2],
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
