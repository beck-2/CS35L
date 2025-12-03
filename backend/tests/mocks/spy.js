export function createSpy(implementation) {
  const calls = [];

  const spy = function(...args) {
    calls.push({ args, timestamp: new Date() });

    if (implementation) {
      return implementation(...args);
    }
  };

  spy.getCalls = () => calls;
  spy.getCallCount = () => calls.length;
  spy.wasCalledWith = (...expectedArgs) => {
    return calls.some(call =>
      JSON.stringify(call.args) === JSON.stringify(expectedArgs)
    );
  };
  spy.reset = () => calls.length = 0;

  return spy;
}
