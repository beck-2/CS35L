import { test } from 'node:test';
import assert from 'node:assert';
import { createMockPool } from '../mocks/database.mock.js';
import { createSpy } from '../mocks/spy.js';

test('mock database returns form data', async () => {
  const mockPool = createMockPool();

  const result = await mockPool.query('SELECT id, name, definition FROM forms WHERE id = $1', [1]);

  assert.strictEqual(result.rows.length, 1);
  assert.strictEqual(result.rows[0].name, 'Test Form');
  assert(result.rows[0].definition.questions);
});

test('mock database tracks queries', async () => {
  const mockPool = createMockPool();

  await mockPool.query('SELECT * FROM forms', []);
  await mockPool.query('SELECT * FROM form_responses WHERE form_id = $1', [1]);

  const queries = mockPool.getQueries();

  assert.strictEqual(queries.length, 2);
  assert(queries[0].sql.includes('forms'));
  assert(queries[1].sql.includes('form_responses'));
});

test('spy tracks function calls', () => {
  const mockFn = createSpy((x) => x * 2);

  mockFn(5);
  mockFn(10);

  assert.strictEqual(mockFn.getCallCount(), 2);
  assert(mockFn.wasCalledWith(5));
  assert(mockFn.wasCalledWith(10));
});

test('spy can verify call order', () => {
  const spy = createSpy();

  spy('first');
  spy('second');
  spy('third');

  const calls = spy.getCalls();

  assert.strictEqual(calls[0].args[0], 'first');
  assert.strictEqual(calls[1].args[0], 'second');
  assert.strictEqual(calls[2].args[0], 'third');
});
