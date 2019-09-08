import Component from './Component';
import ConfigKey, { ResolvedConfigKey } from './ConfigKey';
import ConfigValue from './ConfigValue';
import Dimension from './Dimension';
import DimensionValue from './DimensionValue';

import { expect } from 'chai';

// Component tests for the core logic with entry point in the Component class (no pun intended)
describe('a component with typical configuration', () => {
    const regionDimension = new Dimension('region', 'The AWS region', false);
    const userIdDimension = new Dimension('userId', 'The user ID', true);
    const requestSourceDimension = new Dimension('requestSource', 'The source system for the request', true);
    const instanceTypeDimension = new Dimension('instanceType', 'The the type of instance', false);

    // Values for the region dimension
    const regionUsEast1DimensionValue = new DimensionValue(regionDimension, 'us-east-1');
    const regionUsEast2DimensionValue = new DimensionValue(regionDimension, 'us-east-2');
    const regionEuCentral1DimensionValue = new DimensionValue(regionDimension, 'eu-central-1');

    // Values for the userId dimension
    const userRange1DimensionValue = new DimensionValue(userIdDimension, 0.2);
    const userRange2DimensionValue = new DimensionValue(userIdDimension, 0.7);

    // Values for the requestSource dimension
    const froogleRequestSourceDimensionValue = new DimensionValue(requestSourceDimension, 'froogle.net');
    const microflopRequestSourceDimensionValue = new DimensionValue(requestSourceDimension, 'microflop.com');

    // Values for the instanceType dimension
    const normalInstanceDimensionValue = new DimensionValue(instanceTypeDimension, 'normal');
    const canaryInstanceDimensionValue = new DimensionValue(instanceTypeDimension, 'canary');
    const debugInstanceDimensionValue = new DimensionValue(instanceTypeDimension, 'debug');

    // A default value has no dimension values associated
    const timeoutValue0ConfigValue = new ConfigValue(1000, []);

    // Would make no sense to have two values from the same dimension because
    // Such value would be unusable
    const timeoutValue1ConfigValue = new ConfigValue(600, [
        regionUsEast1DimensionValue,
        froogleRequestSourceDimensionValue,
        debugInstanceDimensionValue,
    ]);
    const timeoutValue2ConfigValue = new ConfigValue(700, [
        regionUsEast2DimensionValue,
        froogleRequestSourceDimensionValue,
        normalInstanceDimensionValue,
    ]);
    const timeoutValue3ConfigValue = new ConfigValue(300, [
        froogleRequestSourceDimensionValue,
        canaryInstanceDimensionValue,
    ]);

    const timeoutConfigKey = new ConfigKey('timeout', 'Server to server call timeout', [
        timeoutValue0ConfigValue,
        timeoutValue1ConfigValue,
        timeoutValue2ConfigValue,
        timeoutValue3ConfigValue,
    ]);

    const featureFlag1ConfigValue = new ConfigValue(true, [
        userRange1DimensionValue,
        froogleRequestSourceDimensionValue,
    ]);

    const featureFlag2ConfigValue = new ConfigValue(true, [
        userRange2DimensionValue,
        froogleRequestSourceDimensionValue,
    ]);

    const featureFlag3ConfigValue = new ConfigValue(true, [
        microflopRequestSourceDimensionValue,
        regionEuCentral1DimensionValue,
        normalInstanceDimensionValue,
    ]);

    const featureFlagConfigKey = new ConfigKey('feature.awesome.enable', 'Awesome feature flag', [
        featureFlag1ConfigValue,
        featureFlag2ConfigValue,
        featureFlag3ConfigValue,
    ]);

    const testCases = [{
        staticValues: new Map<string, any>([
            ['region', 'us-east-1'],
            ['instanceType', 'normal'],
        ]),
        expectedKeys: [{
            key: 'timeout',
            description: 'Server to server call timeout',
            values: [{
                value: 1000,
                dynamicDimensionValues: [],
            }],
        }, {
            key: 'feature.awesome.enable',
            description: 'Awesome feature flag',
            values: [{
                value: true,
                dynamicDimensionValues: [ userRange1DimensionValue, froogleRequestSourceDimensionValue ],
            }, {
                value: true,
                dynamicDimensionValues: [ userRange2DimensionValue, froogleRequestSourceDimensionValue ],
            }],
        }],
    }, {
        staticValues: new Map<string, any>([
            ['region', 'us-east-2'],
            ['instanceType', 'normal'],
        ]),
        expectedKeys: [{
            key: 'timeout',
            description: 'Server to server call timeout',
            values: [{
                value: 1000,
                dynamicDimensionValues: [],
            }, {
                value: 700,
                dynamicDimensionValues: [froogleRequestSourceDimensionValue],
            }],
        }, {
            key: 'feature.awesome.enable',
            description: 'Awesome feature flag',
            values: [{
                value: true,
                dynamicDimensionValues: [ userRange1DimensionValue, froogleRequestSourceDimensionValue ],
            }, {
                value: true,
                dynamicDimensionValues: [ userRange2DimensionValue, froogleRequestSourceDimensionValue ],
            }],
        }],
    }, {
        staticValues: new Map<string, any>([
            ['region', 'eu-central-1'],
            ['instanceType', 'normal'],
        ]),
        expectedKeys: [{
            key: 'timeout',
            description: 'Server to server call timeout',
            values: [{
                value: 1000,
                dynamicDimensionValues: [],
            }],
        }, {
            key: 'feature.awesome.enable',
            description: 'Awesome feature flag',
            values: [{
                value: true,
                dynamicDimensionValues: [ microflopRequestSourceDimensionValue ],
            }, {
                value: true,
                dynamicDimensionValues: [userRange2DimensionValue, froogleRequestSourceDimensionValue ],
            }, {
                value: true,
                dynamicDimensionValues: [ userRange1DimensionValue, froogleRequestSourceDimensionValue ],
            }],
        }],
    }, {
        staticValues: new Map<string, any>([
            ['region', 'us-east-1'],
            ['instanceType', 'debug'],
        ]),
        expectedKeys: [{
            key: 'timeout',
            description: 'Server to server call timeout',
            values: [{
                value: 1000,
                dynamicDimensionValues: [],
            }, {
                value: 600,
                dynamicDimensionValues: [froogleRequestSourceDimensionValue],
            }],
        }, {
            key: 'feature.awesome.enable',
            description: 'Awesome feature flag',
            values: [{
                value: true,
                dynamicDimensionValues: [userRange1DimensionValue, froogleRequestSourceDimensionValue],
            }, {
                value: true,
                dynamicDimensionValues: [userRange2DimensionValue, froogleRequestSourceDimensionValue],
            }],
        }],
    }, {
        staticValues: new Map<string, any>([
            ['region', 'us-east-2'],
            ['instanceType', 'debug'],
        ]),
        expectedKeys: [{
            key: 'timeout',
            description: 'Server to server call timeout',
            values: [{
                value: 1000,
                dynamicDimensionValues: [],
            }, {
                value: 600,
                dynamicDimensionValues: [froogleRequestSourceDimensionValue],
            }],
        }, {
            key: 'feature.awesome.enable',
            description: 'Awesome feature flag',
            values: [{
                value: true,
                dynamicDimensionValues: [userRange1DimensionValue, froogleRequestSourceDimensionValue],
            }, {
                value: true,
                dynamicDimensionValues: [userRange2DimensionValue, froogleRequestSourceDimensionValue],
            }],
        }],
    }];

    testCases.forEach(testCase => {
        it('resolves correctly configuration for case '
                    + `region:${testCase.staticValues.get('region')} `
                    + `instanceType:${testCase.staticValues.get('instanceType')}`, () => {
            const testComponent = new Component('myFantasticAppService', 'A WEB App', [
                timeoutConfigKey,
                featureFlagConfigKey,
            ]);
            const resolvedConfiguration = testComponent.resolveUsing(testCase.staticValues);

            expect(resolvedConfiguration).to.have.lengthOf(testCase.expectedKeys.length);
            testCase.expectedKeys.forEach(expectedKey => {
                const resolvedKey = resolvedConfiguration.shift() as ResolvedConfigKey;
                expect(resolvedKey.key).to.equal(expectedKey.key);
                expect(resolvedKey.description).to.equal(expectedKey.description);
                expect(resolvedKey.values, `values of key ${resolvedKey.key}`)
                    .to.have.lengthOf(expectedKey.values.length);

                resolvedKey.values.forEach((expectedValue, index) => {
                    const resolvedValue = resolvedKey.values[index];
                    expect(resolvedValue.value).to.equal(expectedValue.value);
                    expect(resolvedValue.dynamicDimensionValues,
                            `dynamicDimensionValues for value ${resolvedValue.value} and index ${index}`)
                        .to.have.ordered.members(expectedValue.dynamicDimensionValues);
                });
            });
        });
    });
});
