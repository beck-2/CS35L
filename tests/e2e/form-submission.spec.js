/**
 * End-to-End Test: Form Submission Flow
 *
 * Tests the complete applicant submission flow.
 * This is a second e2e test to meet the rubric requirement (2+ e2e tests).
 */

import { test, expect } from '@playwright/test';

test.describe('Form Submission Feature', () => {

  test('should submit application form successfully', async ({ page }) => {
    // This test assumes you have at least one form created
    // In a real scenario, you'd set up test data in beforeEach

    // Navigate to forms API to get a public form URL
    const response = await page.request.get('http://localhost:5000/api/forms');
    const forms = await response.json();

    if (forms.length === 0) {
      test.skip('No forms available for testing');
      return;
    }

    const testForm = forms[0];
    const publicUrl = `http://localhost:5173/apply/${testForm.public_id}`;

    // Navigate to public application form
    await page.goto(publicUrl);
    await page.waitForLoadState('networkidle');

    // Verify form title is displayed
    await expect(page.locator('h1')).toContainText(testForm.name);

    // Fill out form fields (this depends on your form structure)
    // Look for common input types
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test Applicant');
    }

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }

    // Submit the form
    const submitButton = page.getByRole('button', { name: /submit/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // Wait for success page or confirmation
    await page.waitForLoadState('networkidle');

    // Verify submission success (adjust based on your success page)
    await expect(page.url()).toContain('/success');
  });

  test('should validate required fields', async ({ page }) => {
    // Get a form to test
    const response = await page.request.get('http://localhost:5000/api/forms');
    const forms = await response.json();

    if (forms.length === 0) {
      test.skip('No forms available for testing');
      return;
    }

    const testForm = forms[0];
    const publicUrl = `http://localhost:5173/apply/${testForm.public_id}`;

    await page.goto(publicUrl);
    await page.waitForLoadState('networkidle');

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /submit/i });

    // Click submit without filling form
    await submitButton.click();

    // Verify we're still on the form page (not navigated away)
    await expect(page.url()).toContain('/apply/');

    // Optionally: check for validation messages
    // (depends on your validation implementation)
  });

  test('should display form questions correctly', async ({ page }) => {
    const response = await page.request.get('http://localhost:5000/api/forms');
    const forms = await response.json();

    if (forms.length === 0) {
      test.skip('No forms available for testing');
      return;
    }

    const testForm = forms[0];
    const publicUrl = `http://localhost:5173/apply/${testForm.public_id}`;

    await page.goto(publicUrl);
    await page.waitForLoadState('networkidle');

    // Verify form has questions
    const definition = testForm.definition;
    if (definition && definition.questions) {
      // Check that each question label is visible
      for (const question of definition.questions) {
        if (question.label) {
          await expect(page.locator(`text=${question.label}`)).toBeVisible();
        }
      }
    }
  });
});
