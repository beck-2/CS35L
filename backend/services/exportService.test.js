/**
 * Unit Tests for CSV Export Service
 *
 * Demonstrates CS35L testing principles:
 * - Tests isolated, pure functions
 * - Each test has single responsibility
 * - Clear test names describe behavior
 * - No external dependencies (DB, network)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateResponsesCSV,
  generateExportFilename,
  escapeCSVField,
  extractFormQuestions,
  extractAnswer
} from './exportService.js';

describe('CSV Export Service', () => {

  describe('escapeCSVField', () => {
    it('should return empty string for null/undefined', () => {
      assert.strictEqual(escapeCSVField(null), '');
      assert.strictEqual(escapeCSVField(undefined), '');
    });

    it('should escape fields with commas', () => {
      assert.strictEqual(escapeCSVField('Hello, World'), '"Hello, World"');
    });

    it('should escape fields with quotes by doubling them', () => {
      assert.strictEqual(escapeCSVField('Say "Hello"'), '"Say ""Hello"""');
    });

    it('should escape fields with newlines', () => {
      assert.strictEqual(escapeCSVField('Line1\nLine2'), '"Line1\nLine2"');
    });

    it('should not escape simple strings', () => {
      assert.strictEqual(escapeCSVField('simple'), 'simple');
      assert.strictEqual(escapeCSVField('hello world'), 'hello world');
    });
  });

  describe('extractFormQuestions', () => {
    it('should extract questions from form definition', () => {
      const formDefinition = {
        questions: [
          { id: 'q1', label: 'Name', type: 'text' },
          { id: 'q2', label: 'Email', type: 'email' }
        ]
      };

      const questions = extractFormQuestions(formDefinition);
      assert.strictEqual(questions.length, 2);
      assert.strictEqual(questions[0].id, 'q1');
      assert.strictEqual(questions[0].label, 'Name');
    });

    it('should return empty array for invalid definition', () => {
      assert.deepStrictEqual(extractFormQuestions(null), []);
      assert.deepStrictEqual(extractFormQuestions({}), []);
    });

    it('should use default label if missing', () => {
      const formDefinition = {
        questions: [{ id: 'q1', type: 'text' }]
      };

      const questions = extractFormQuestions(formDefinition);
      assert.strictEqual(questions[0].label, 'Question q1');
    });
  });

  describe('extractAnswer', () => {
    it('should extract simple text answer', () => {
      const responseData = { q1: 'John Doe' };
      assert.strictEqual(extractAnswer(responseData, 'q1'), 'John Doe');
    });

    it('should join array answers with semicolons', () => {
      const responseData = { q1: ['Option A', 'Option B'] };
      assert.strictEqual(extractAnswer(responseData, 'q1'), 'Option A; Option B');
    });

    it('should stringify object answers', () => {
      const responseData = { q1: { key: 'value' } };
      assert.strictEqual(extractAnswer(responseData, 'q1'), '{"key":"value"}');
    });

    it('should return empty string for missing answer', () => {
      assert.strictEqual(extractAnswer({}, 'q1'), '');
      assert.strictEqual(extractAnswer(null, 'q1'), '');
    });
  });

  describe('generateExportFilename', () => {
    it('should generate filename with date', () => {
      const filename = generateExportFilename('My Form');
      assert.match(filename, /^my-form-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should sanitize special characters', () => {
      const filename = generateExportFilename('Form: 2024 (v2.0)!');
      assert.match(filename, /^form-2024-v2-0-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should handle empty form name', () => {
      const filename = generateExportFilename('');
      assert.match(filename, /^export-\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('generateResponsesCSV', () => {
    it('should generate CSV with headers and data', () => {
      const form = {
        name: 'Test Form',
        definition: {
          questions: [
            { id: 'name', label: 'Full Name', type: 'text' },
            { id: 'email', label: 'Email', type: 'email' }
          ]
        }
      };

      const responses = [
        {
          id: 1,
          applicant_name: 'Alice',
          applicant_email: 'alice@test.com',
          submitted_at: '2024-01-01T10:00:00Z',
          response_data: {
            name: 'Alice Johnson',
            email: 'alice@test.com'
          }
        },
        {
          id: 2,
          applicant_name: 'Bob',
          applicant_email: 'bob@test.com',
          submitted_at: '2024-01-02T10:00:00Z',
          response_data: {
            name: 'Bob Smith',
            email: 'bob@test.com'
          }
        }
      ];

      const ratingsMap = {
        1: { avg_rating: 4.5, review_count: 2 },
        2: { avg_rating: 3.0, review_count: 1 }
      };

      const csv = generateResponsesCSV(form, responses, ratingsMap);

      // Check headers
      assert.match(csv, /Response ID,Applicant Name,Applicant Email,Submitted At,Average Rating,Number of Reviews,Full Name,Email/);

      // Check data rows
      assert.match(csv, /1,Alice,alice@test\.com/);
      assert.match(csv, /4\.50,2/);  // Rating for Alice
      assert.match(csv, /2,Bob,bob@test\.com/);
      assert.match(csv, /3\.00,1/);  // Rating for Bob
    });

    it('should handle responses with no ratings', () => {
      const form = {
        name: 'Test Form',
        definition: { questions: [{ id: 'q1', label: 'Question 1', type: 'text' }] }
      };

      const responses = [{
        id: 1,
        applicant_name: 'Test',
        applicant_email: 'test@test.com',
        submitted_at: '2024-01-01T10:00:00Z',
        response_data: { q1: 'Answer' }
      }];

      const csv = generateResponsesCSV(form, responses, {});

      // Should show N/A for rating
      assert.match(csv, /N\/A,0/);
    });

    it('should handle empty responses', () => {
      const form = {
        name: 'Test Form',
        definition: { questions: [] }
      };

      const csv = generateResponsesCSV(form, [], {});

      // Should have header row only
      const lines = csv.split('\n');
      assert.strictEqual(lines.length, 1);
      assert.match(lines[0], /Response ID,Applicant Name/);
    });
  });
});
