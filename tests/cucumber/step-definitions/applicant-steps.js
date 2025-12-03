import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';

let browser;
let page;

Given('I am on the application form page', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();

  const response = await page.request.get('http://localhost:5001/api/forms');
  const forms = await response.json();

  if (forms.length > 0) {
    await page.goto(`http://localhost:3001/apply/${forms[0].public_id}`);
  }
});

When('I fill in my information', async function () {
  await page.locator('input[type="text"]').first().fill('Test User');
  await page.locator('input[type="email"]').first().fill('test@test.com');
});

When('I submit the form', async function () {
  await page.getByRole('button', { name: /submit/i }).click();
});

Then('I should see a success message', async function () {
  await page.waitForURL(/.*success.*/);
  expect(page.url()).toContain('success');
  await browser.close();
});
