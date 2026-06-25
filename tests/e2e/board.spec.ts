import { test, expect } from '@playwright/test'

// End-to-end smoke test of the full sign-up -> post -> vote flow.
// Runs in CI against a local Supabase stack (see deploy-dev.yml / ci.yml).
// Uses a unique email per run so it is idempotent.

test('user can sign up, post an idea and vote on it', async ({ page }) => {
  const email = `e2e+${Date.now()}@example.com`

  await page.goto('/')

  // Switch to sign-up and create an account.
  await page.getByText('Need an account? Sign up').click()
  await page.getByTestId('email').fill(email)
  await page.getByTestId('password').fill('demo-password-123')
  await page.getByTestId('submit-auth').click()

  // New post form should appear once authenticated.
  await expect(page.getByTestId('new-title')).toBeVisible({ timeout: 15_000 })

  const title = `Playwright idea ${Date.now()}`
  await page.getByTestId('new-title').fill(title)
  await page.getByTestId('new-submit').click()

  const card = page.getByTestId('post-card').filter({ hasText: title })
  await expect(card).toBeVisible()

  // Vote and confirm the count increments.
  await card.getByTestId('vote-button').click()
  await expect(card.getByTestId('vote-count')).toHaveText('1')
})
