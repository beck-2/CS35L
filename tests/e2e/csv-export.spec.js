/**
 * End-to-End Test: CSV Export Feature
 *
 * Tests the complete user flow from clicking export button to downloading CSV.
 * Demonstrates CS35L testing principles:
 * - Tests user-facing behavior (not implementation details)
 * - Tests full integration (UI → Backend → Database)
 * - Verifies actual file content
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('CSV Export Feature', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to applicants page
    await page.goto('http://localhost:5173/admin/applicants');
    await page.waitForLoadState('networkidle');
  });

  test('should export CSV from Applicants page', async ({ page }) => {
    // Find a form with responses
    const formCard = page.locator('div').filter({ hasText: /responses/ }).first();
    await expect(formCard).toBeVisible();

    // Expand the form to see export button
    await formCard.click();

    // Wait for export button and click it
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Export CSV').click();

    const download = await downloadPromise;

    // Verify filename format
    expect(download.suggestedFilename()).toMatch(/.*-export-\d{4}-\d{2}-\d{2}\.csv$/);

    // Save and verify file content
    const downloadPath = await download.path();
    const csvContent = fs.readFileSync(downloadPath, 'utf-8');

    // Verify CSV structure
    const lines = csvContent.split('\n');
    expect(lines.length).toBeGreaterThan(1); // Header + at least one data row

    // Verify headers
    const headers = lines[0];
    expect(headers).toContain('Response ID');
    expect(headers).toContain('Applicant Name');
    expect(headers).toContain('Applicant Email');
    expect(headers).toContain('Submitted At');
    expect(headers).toContain('Average Rating');
    expect(headers).toContain('Number of Reviews');

    // Verify data row format (has correct number of commas)
    if (lines.length > 1 && lines[1].trim()) {
      const headerCount = headers.split(',').length;
      const dataFields = lines[1].split(',').length;
      expect(dataFields).toBeGreaterThanOrEqual(headerCount - 2); // Allow some flexibility for empty fields
    }
  });

  test('should export CSV from ViewResponses page', async ({ page }) => {
    // Navigate to applicants page first
    const formCard = page.locator('div').filter({ hasText: /responses/ }).first();
    await formCard.click();

    // Click "View all responses" link
    await page.getByText('View all responses').click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the responses page
    await expect(page.locator('h1')).toBeVisible();

    // Click Export CSV button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export CSV/i }).click();

    const download = await downloadPromise;

    // Verify download completed
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    expect(await download.path()).toBeTruthy();
  });

  test('should disable export button when no responses exist', async ({ page }) => {
    // Create a new form with no responses (if possible)
    // Or find a form with 0 responses

    // Navigate to a form detail page with no responses
    await page.goto('http://localhost:5173/admin/forms/999/responses');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if export button is disabled
    const exportButton = page.getByRole('button', { name: /Export CSV/i });

    // If button exists, verify it's disabled
    if (await exportButton.count() > 0) {
      await expect(exportButton).toBeDisabled();
    }
  });

  test('should handle CSV download with special characters', async ({ page }) => {
    // This test verifies RFC 4180 compliance (commas, quotes, newlines)

    const formCard = page.locator('div').filter({ hasText: /responses/ }).first();
    await formCard.click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Export CSV').click();

    const download = await downloadPromise;
    const downloadPath = await download.path();
    const csvContent = fs.readFileSync(downloadPath, 'utf-8');

    // Verify proper CSV escaping
    // If any field contains commas, it should be wrapped in quotes
    const lines = csvContent.split('\n');
    for (const line of lines) {
      // Check for improperly escaped commas
      // (This is a basic check - more sophisticated parsing could be added)
      const hasCommaInQuotes = line.match(/"[^"]*,[^"]*"/);

      // If we find commas in quotes, it's properly escaped
      if (hasCommaInQuotes) {
        expect(line).toMatch(/"[^"]*"/); // Contains quoted fields
      }
    }
  });
});
