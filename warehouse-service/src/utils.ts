class AssertionError extends Error {}

export function assert(assertion: boolean, msg?: string): asserts assertion {
    if (!assertion) {
        throw new AssertionError(msg ?? "Assertion not met, got false");
    }
}
