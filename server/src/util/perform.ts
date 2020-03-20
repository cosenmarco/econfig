import { partition } from 'lodash/fp';

/**
 * Convenience function that asynchronously performs a task
 * on elements of an array and returns the results partitioned in two
 * depending on the outcome of the task
 * @param data the elements on which to perform the actions
 * @param mapper a function which maps an element to a promise which is the task
 *              to execute on the element
 */
export async function perform<T, R>(data: T[], mapper: (d: T) => Promise<R>) {
    const results = await Promise.allSettled(data.map(mapper));
    return partition(isFulfilled)(results);
}

function isFulfilled<R>(result: PromiseSettledResult<R>): result is PromiseFulfilledResult<R> {
    return result.status === 'fulfilled';
}
