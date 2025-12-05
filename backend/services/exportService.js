function escapeCSVField(field) {
  if (field === null || field === undefined) {
    return '';
  }

  const stringValue = String(field);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function extractFormQuestions(formDefinition) {
  if (!formDefinition || !Array.isArray(formDefinition.fields)) {
    return [];
  }

  return formDefinition.fields.map(f => ({
    id: f.id,
    label: f.label || f.question || `Question ${f.id}`,
    type: f.type
  }));
}

function extractAnswer(responseData, questionId) {
  if (!responseData || !responseData[questionId]) {
    return '';
  }

  const answer = responseData[questionId];

  if (Array.isArray(answer)) {
    return answer.join('; ');
  }

  if (typeof answer === 'object') {
    return JSON.stringify(answer);
  }

  return String(answer);
}

function generateResponsesCSV(form, responses, ratingsMap = {}) {
  const questions = extractFormQuestions(form.definition);

  const headers = [
    ...questions.map(q => q.label),
    'Submitted At',
    'Average Rating',
    'Number of Reviews'
  ];

  const rows = responses.map(response => {
    const ratings = ratingsMap[response.id] || { avg_rating: null, review_count: 0 };

    const answerFields = questions.map(q =>
      extractAnswer(response.response_data, q.id)
    );

    const metadataFields = [
      response.submitted_at,
      ratings.avg_rating !== null ? ratings.avg_rating.toFixed(2) : 'N/A',
      ratings.review_count
    ];

    return [...answerFields, ...metadataFields];
  });

  const csvLines = [
    headers.map(escapeCSVField).join(','),
    ...rows.map(row => row.map(escapeCSVField).join(','))
  ];

  return csvLines.join('\r\n');
}

function generateExportFilename(formName) {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedName = formName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${sanitizedName}-export-${date}.csv`;
}

export {
  generateResponsesCSV,
  generateExportFilename,
  escapeCSVField,
  extractFormQuestions,
  extractAnswer
};
