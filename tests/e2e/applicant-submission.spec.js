import { test, expect } from '@playwright/test';

test('applicant can view application form', async ({ page }) => {
  const response = await page.request.get('http://localhost:5001/api/forms');
  const forms = await response.json();

  if (forms.length === 0) {
    test.skip('No forms available');
  }

  const publicUrl = `http://localhost:3001/apply/${forms[0].public_id}`;
  await page.goto(publicUrl);

  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
});

test('officer can view applicants', async ({ page }) => {
  await page.goto('http://localhost:3001/admin/applicants');

  await expect(page.locator('h1')).toBeVisible();
});
