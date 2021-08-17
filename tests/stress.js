const { mean } = require('lodash');

function stressTest(fn1, iterations = 25) {
  let differences = [];
  for (let i = 0; i < iterations; i++) {
    let before = new Date().getTime();
    await fn1();
    differences.push(new Date().getTime() - before);
  }
  return mean(differences);
}

function stressTestCompare(fn1, fn2, iterations = 50) {
  let results1 = [],
    results2 = [];
  for (let i = 0; i < iterations; i++) {
    let pre = new Date().getTime();
    await fn1();
    results1.push(new Date().getTime() - pre);
  }
  for (let i = 0; i < iterations; i++) {
    let pre = new Date().getTime();
    await fn2();
    results2.push(new Date().getTime() - pre);
  }
  return {
    iterations,
    meaOfFn1: mean(results1),
    meanOfFn2: mean(results2)
  };
}

module.exports = {
  stressTest,
  stressTestCompare
};
