import { test } from 'node:test';
import assert from 'node:assert';
import { generateResponsesCSV, generateExportFilename } from '../../services/exportService.js';

test('generateResponsesCSV creates correct CSV format', () => {
  const form = {
    name: 'Test Form',
    definition: {
      questions: [
        { id: 'q1', label: 'Name', type: 'text' },
        { id: 'q2', label: 'Email', type: 'email' }
      ]
    }
  };

  const responses = [
    {
      id: 1,
      applicant_name: 'John Doe',
      applicant_email: 'john@test.com',
      submitted_at: '2024-12-03',
      response_data: { q1: 'John Doe', q2: 'john@test.com' }
    }
  ];

  const csv = generateResponsesCSV(form, responses);

  assert(csv.includes('Response ID'));
  assert(csv.includes('Applicant Name'));
  assert(csv.includes('Name,Email'));
  assert(csv.includes('John Doe,john@test.com'));
});

test('generateExportFilename creates valid filename', () => {
  const filename = generateExportFilename('Test Form');

  assert(filename.includes('test-form'));
  assert(filename.endsWith('.csv'));
  assert(filename.match(/\d{4}-\d{2}-\d{2}/));
});

test('CSV escapes special characters', () => {
  const form = {
    definition: {
      questions: [{ id: 'q1', label: 'Comment', type: 'text' }]
    }
  };

  const responses = [{
    id: 1,
    applicant_name: 'Test',
    applicant_email: 'test@test.com',
    submitted_at: '2024-12-03',
    response_data: { q1: 'Text with, comma' }
  }];

  const csv = generateResponsesCSV(form, responses);

  assert(csv.includes('"Text with, comma"'));
});
