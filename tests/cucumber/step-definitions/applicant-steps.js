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
  await page.waitForTimeout(500);
});

When('I submit the form', async function () {
  await page.waitForTimeout(500);
});

Then('I should see a success message', async function () {
  await expect(page.locator('h1')).toBeVisible();
  await browser.close();
});
