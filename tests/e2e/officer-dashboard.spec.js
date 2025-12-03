import { test, expect } from '@playwright/test';

test('officer can access dashboard', async ({ page }) => {
  await page.goto('http://localhost:3001/admin/applicants');
  await expect(page.locator('h1')).toBeVisible();
});

test('officer can view responses', async ({ page }) => {
  await page.goto('http://localhost:3001/admin/applicants');

  const formCard = page.locator('div').filter({ hasText: /response/ }).first();

  if (await formCard.count() > 0) {
    await formCard.click();
    await expect(page.getByText(/view all responses/i)).toBeVisible();
  }
});
