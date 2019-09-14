import ConfigValue from './ConfigValue';
import DimensionValue from './DimensionValue';

import {expect} from 'chai';
import { Mock } from 'ts-mockery';

describe('ConfigValue', () => {
    let testDimensionValues: DimensionValue[];

    before(() => {
        testDimensionValues  = [
            buildMockDimensionValue('dim0', true, 'test0'),
            buildMockDimensionValue('dim1', true, '1234'),
            buildMockDimensionValue('dim2', false, 'test2'),
            buildMockDimensionValue('dim3', false, '4321'),
        ];
    });

    it('has static and dynamic dimension values', () => {
        const configValue = new ConfigValue(999, testDimensionValues);

        expect(configValue.staticDimensionValuesLength).to.equal(2);

        expect(configValue.dynamicDimensionValues).to.have.property('length').equal(2);
        expect(configValue.dynamicDimensionValues).to.contain(testDimensionValues[0]);
        expect(configValue.dynamicDimensionValues).to.contain(testDimensionValues[1]);

        expect(configValue.staticDimensionValues).to.have.property('length').equal(2);
        expect(configValue.staticDimensionValues).to.contain(testDimensionValues[2]);
        expect(configValue.staticDimensionValues).to.contain(testDimensionValues[3]);
    });

    it('can tell if all static dimension values match a certain map', () => {
        const configValue = new ConfigValue(999, testDimensionValues);
        const testStaticDimensions = {
            dim2: 'test2',
            dim3: '4321',
            // Note: an additional unknown dimension doesn't compromise match
            dim4: '8888',
        };

        expect(configValue.areAllStaticDimensionsMatching(testStaticDimensions)).to.equal(true);
    });

    it('can tell if some static dimension values do not match a certain map', () => {
        const configValue = new ConfigValue(999, testDimensionValues);
        const testMap = {
            dim2: 'wrong',
            dim3: '4321',
        };

        expect(configValue.areAllStaticDimensionsMatching(testMap)).to.equal(false);
    });
});

function buildMockDimensionValue(dimensionId: string, isDynamic: boolean, value: string) {
    return Mock.of <DimensionValue>({
        dimensionId,
        isDynamicDimension: () => isDynamic,
        matches: (what?: string) => what === value,
    });
}
