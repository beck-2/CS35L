import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';

let browser;
let page;

Given('I am on the applicants dashboard', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3001/admin/applicants');
});

Then('I should see the dashboard', async function () {
  await expect(page.locator('h1')).toBeVisible();
  await browser.close();
});
