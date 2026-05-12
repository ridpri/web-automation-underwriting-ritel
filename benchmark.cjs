const { performance } = require('perf_hooks');

const flows = {
  motor: {
    quote: { coverageStart: '2024-01-01', coverageEnd: '2025-01-01', someData: Array(100).fill({a: 1, b: 2, c: [1,2,3]}) }
  },
  carComp: {
    quote: { coverageStart: '2024-01-01', coverageEnd: '2025-01-01', someData: Array(100).fill({a: 1, b: 2, c: [1,2,3]}) }
  },
  carTlo: {
    quote: { coverageStart: '2024-01-01', coverageEnd: '2025-01-01', someData: Array(100).fill({a: 1, b: 2, c: [1,2,3]}) }
  }
};

const iterations = 10000;

function benchmark(name, fn) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

benchmark('JSON.parse(JSON.stringify())', () => {
  JSON.parse(JSON.stringify(flows));
});

benchmark('structuredClone()', () => {
  structuredClone(flows);
});
