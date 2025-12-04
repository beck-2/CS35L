import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';

let browser;
let page;
let testForm;

Given('I am on the form builder page', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();

  const createResponse = await page.request.post('http://localhost:5001/api/forms', {
    data: {
      name: 'Test Form for Field Types',
      definition: { fields: [] }
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  testForm = await createResponse.json();

  await page.goto(`http://localhost:3001/admin/forms/${testForm.id}/edit`);
  await page.waitForLoadState('networkidle');
});

When('I add an {string} field', async function (fieldType) {
  const button = page.getByRole('button', { name: fieldType });
  await button.click();
  await page.waitForTimeout(300);
});

When('I add a {string} field', async function (fieldType) {
  const button = page.getByRole('button', { name: fieldType });
  await button.click();
  await page.waitForTimeout(300);
});

Then('I should see the email field in the form', async function () {
  await expect(page.locator('text=email').first()).toBeVisible();
});

Then('the field should have type {string}', async function (fieldType) {
  await expect(page.locator(`text=${fieldType}`).first()).toBeVisible();
});

Then('I should see the GPA field in the form', async function () {
  await expect(page.locator('text=gpa').first()).toBeVisible();
});

Then('I should see the graduation year field in the form', async function () {
  await expect(page.locator('text=graduation_year').first()).toBeVisible();
});

Given('I have a form with an email field', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();

  const createResponse = await page.request.post('http://localhost:5001/api/forms', {
    data: {
      name: 'Email Test Form',
      definition: {
        fields: [
          {
            id: 'email_field',
            type: 'email',
            label: 'Email Address',
            required: true,
            validation: '^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$'
          }
        ]
      }
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  testForm = await createResponse.json();
});

Given('I am on the application form page for that form', async function () {
  await page.goto(`http://localhost:3001/apply/${testForm.public_id}`);
  await page.waitForLoadState('networkidle');
});

When('I enter an invalid email {string}', async function (email) {
  const input = page.locator('input[type="email"]').first();
  await input.fill(email);
});

When('I move to the next field', async function () {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
});

Then('I should see an error {string}', async function (errorMessage) {
  await expect(page.locator(`text=${errorMessage}`)).toBeVisible({ timeout: 2000 });
});

Given('I have a form with a GPA field', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();

  const createResponse = await page.request.post('http://localhost:5001/api/forms', {
    data: {
      name: 'GPA Test Form',
      definition: {
        fields: [
          {
            id: 'gpa_field',
            type: 'gpa',
            label: 'GPA',
            required: true,
            validation: '^(?:[0-3]\\.\\d+|4\\.00)$'
          }
        ]
      }
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  testForm = await createResponse.json();
});

When('I enter an invalid GPA {string}', async function (gpa) {
  const input = page.locator('input[name="gpa_field"]').first();
  await input.fill(gpa);
});

Given('I have a form with a graduation year field', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();

  const createResponse = await page.request.post('http://localhost:5001/api/forms', {
    data: {
      name: 'Graduation Year Test Form',
      definition: {
        fields: [
          {
            id: 'grad_year_field',
            type: 'graduation_year',
            label: 'Graduation Year',
            required: true
          }
        ]
      }
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  testForm = await createResponse.json();
});

When('I enter an invalid graduation year {string}', async function (year) {
  const input = page.locator('input[name="grad_year_field"]').first();
  await input.fill(year);
});

Given('I have a form with email, GPA, and graduation year fields', async function () {
  browser = await chromium.launch();
  page = await browser.newPage();

  const createResponse = await page.request.post('http://localhost:5001/api/forms', {
    data: {
      name: 'Complete Test Form',
      definition: {
        fields: [
          {
            id: 'email_field',
            type: 'email',
            label: 'Email Address',
            required: true,
            validation: '^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$'
          },
          {
            id: 'gpa_field',
            type: 'gpa',
            label: 'GPA',
            required: true,
            validation: '^(?:[0-3]\\.\\d+|4\\.00)$'
          },
          {
            id: 'grad_year_field',
            type: 'graduation_year',
            label: 'Graduation Year',
            required: true
          }
        ]
      }
    },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  testForm = await createResponse.json();
});

When('I enter a valid email {string}', async function (email) {
  const input = page.locator('input[type="email"]').first();
  await input.fill(email);
});

When('I enter a valid GPA {string}', async function (gpa) {
  const input = page.locator('input[name="gpa_field"]').first();
  await input.fill(gpa);
});

When('I enter a valid graduation year {string}', async function (year) {
  const input = page.locator('input[name="grad_year_field"]').first();
  await input.fill(year);
});

When('I submit the form', async function () {
  const submitButton = page.getByRole('button', { name: /submit/i });
  await submitButton.click();
  await page.waitForTimeout(1000);
});

Then('I should see a success message', async function () {
  await expect(page.locator('h1')).toContainText(/success|thank/i, { timeout: 5000 });
  await browser.close();
});

