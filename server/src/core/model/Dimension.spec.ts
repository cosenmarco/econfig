import { Dimension, DimensionType } from './Dimension';

import { expect } from 'chai';

describe('Dimension', () => {
    it('has meaningful properties', () => {
        const dim = new Dimension('test_id', 'test_desc', false, 'percent');
        expect(dim.id).to.equal('test_id');
        expect(dim.description).to.equal('test_desc');
        expect(dim.isDynamic()).to.equal(false);
        expect(dim.type).to.equal(DimensionType.percent);
    });

    it('must have a valid type', () => {
        expect(() => {
            const dim = new Dimension('test', 'test', false, 'wrong');
        }).to.throw();
    });

    [
        {
            value: 'test_string',
            type: 'string',
            shouldThrow: false,
        }, {
            value: 243,
            type: 'string',
            shouldThrow: true,
        }, {
            value: 0.7764,
            type: 'percent',
            shouldThrow: false,
        }, {
            value: 1.212,
            type: 'percent',
            shouldThrow: true,
        }, {
            value: -0.09,
            type: 'percent',
            shouldThrow: true,
        },
    ].forEach(testCase => {
        it(`can validate ${testCase.shouldThrow ? 'negatively' : 'positively'} value ` +
                `${testCase.value} in case of ${testCase.type} type`, () => {
            const dim = new Dimension('test', 'test', false, testCase.type);
            const expectation = expect(() => dim.validateValue(testCase.value));
            if (testCase.shouldThrow) {
                expectation.to.throw();
            } else {
                expectation.not.to.throw();
            }
        });
    });

    it('matches correctly a string value', () => {
        const dim = new Dimension('test_id', 'test_desc', false, 'string');
        // tslint:disable: no-unused-expression
        expect(dim.matchValue('test_val', 'test_val')).to.be.true;
        expect(dim.matchValue('test_val', 'test_other_val')).to.be.false;
        // tslint:enable: no-unused-expression
    });
});
