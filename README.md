# SAKAS Content Portal

Client portal for the content partnership with Sakas (restaurant, Gent):
monthly reels and photos, shoot planning, deliveries, documents and billing status.
Static site for GitHub Pages, white and dark blue, no build step.

## Updating the portal

Everything comes from one file: [`data/plan.json`](data/plan.json).
Edit it on github.com (the site's "Edit plan" button jumps straight there), commit,
and the page updates in about a minute.

What each part controls:

- `deal`: the number tiles (reels/month, photos/month, etc.).
- `nextShoot`: the big dark blue card. Set `date` (YYYY-MM-DD) and the countdown
  updates itself. `checklist` items show as chips so the client knows what to prepare.
- `months`: one card per month with progress bars. Update `done` counts as you
  deliver. `status` is `planned`, `active` or `done`.
- `documents`: cards linking to contract, brief, and WeTransfer/Drive delivery links.
  Leave `url` empty to show it as "coming soon".
- `invoices`: the billing table. `status` is `upcoming`, `open` or `paid`.
  No amounts on the page on purpose: it is public. Link the private PDF via `url`
  (WeTransfer, Drive) if you want.

## Publish on GitHub Pages

1. Create a PUBLIC repo named `sakas-portal` on github.com and push this folder.
2. Settings > Pages > Deploy from a branch > `main` + `/ (root)`.
3. Live at `https://YOUR_USERNAME.github.io/sakas-portal/`.

If you use a different repo name, update `CONFIG` at the top of `app.js`.

## Privacy note

The page is public. Keep it to schedule, progress and status.
Amounts, contracts and raw files belong in the linked private documents, not here.
