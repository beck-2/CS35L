export function createMockPool() {
  const queries = [];

  return {
    query: async (sql, params) => {
      queries.push({ sql, params });

      if (sql.includes('SELECT id, name, definition FROM forms')) {
        return {
          rows: [{
            id: 1,
            name: 'Test Form',
            definition: { questions: [{ id: 'q1', label: 'Name', type: 'text' }] }
          }]
        };
      }

      if (sql.includes('FROM form_responses')) {
        return {
          rows: [{
            id: 1,
            form_id: 1,
            response_data: { q1: 'John Doe' },
            submitted_at: '2024-12-03',
            applicant_name: 'John Doe',
            applicant_email: 'john@test.com'
          }]
        };
      }

      if (sql.includes('FROM ratings')) {
        return {
          rows: [{
            response_id: 1,
            avg_rating: 4.5,
            review_count: 2
          }]
        };
      }

      return { rows: [] };
    },

    getQueries: () => queries,
    clearQueries: () => queries.length = 0
  };
}
