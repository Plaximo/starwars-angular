import { test, expect } from '@playwright/test';

test.describe('Star Wars Archive - Core Flow E2E', () => {
  test('should load characters, filter by search, and navigate to character details', async ({ page }) => {
    // 1. Visit the home page
    await page.goto('/');

    // 2. Verify header brand/title is loaded
    await expect(page.locator('body')).toContainText(/Star Wars/i);

    // 3. Wait for initial character cards to render
    const firstCard = page.locator('app-people-list-item').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // 4. Test Live Filter: Search for "Vader"
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('Vader');

    // 5. Verify filtered list shows Darth Vader and filters out others
    const vaderCard = page.locator('app-people-list-item', { hasText: 'Darth Vader' });
    await expect(vaderCard).toBeVisible();

    const lukeCard = page.locator('app-people-list-item', { hasText: 'Luke Skywalker' });
    await expect(lukeCard).toHaveCount(0);

    // 6. Navigate to Character Detail View
    const detailsLink = vaderCard.locator('a', { hasText: /Details/i });
    await detailsLink.click();

    // 7. Verify routing to detail page /people/:id
    await expect(page).toHaveURL(/\/people\/\d+/);

    // 8. Verify the detail page displays Darth Vader's dossier
    await expect(page.locator('h1')).toContainText('Darth Vader');

    // 9. Navigate back to the archive
    const backLink = page.locator('a', { hasText: /Archive|Archiv/i });
    await backLink.click();

    // 10. Verify we are back on the archive list
    await expect(page).toHaveURL(/\/(?:people)?(?:\?.*)?$/);
    await expect(page.locator('app-people-list-item').first()).toBeVisible();
  });
});
