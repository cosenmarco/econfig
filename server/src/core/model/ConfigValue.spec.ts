import ConfigValue from './ConfigValue'
import DimensionValue from './DimensionValue'

import {expect} from 'chai'
import { Mock } from 'ts-mockery';


describe('ConfigValue', () => {
    let testDimensionValues: Array<DimensionValue>;

    before(() => {
        testDimensionValues  = [
            buildMockDimensionValue("dim0", true, "test0"),
            buildMockDimensionValue("dim1", true, 1234),
            buildMockDimensionValue("dim2", false, "test2"),
            buildMockDimensionValue("dim3", false, 4321)
        ]
    })
    
    it('has static and dynamic dimension values', () => {
        const configValue = new ConfigValue("testValue", 999, testDimensionValues);
        expect(configValue.staticDimensionValuesLength).to.equal(2);
    });
});

function buildMockDimensionValue(dimensionId: string, isDynamic: boolean, value: any) {
    return Mock.of <DimensionValue>({
        isDynamicDimension: () => isDynamic,
        matches: (what: any) => what == value
    });
}