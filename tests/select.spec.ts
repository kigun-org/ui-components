import { test, expect } from '@playwright/test';

test('selected item is visible', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  await expect(page.getByRole('main')).toContainText('Texas');

  await page.getByLabel('Single').click();

  await page.getByLabel('Single').fill('c');

  await page.getByLabel('Single').press('Enter');
  
  await expect(page.getByRole('main')).toContainText('California');
});