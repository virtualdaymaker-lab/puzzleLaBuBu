# PuzLabu Puzzle Purchase & Activation QA Handbook

## 1. Payment & Purchase Flow
- Complete a purchase using PayPal sandbox.
- Confirm payment is marked as completed in Supabase (`purchases` table).
- Ensure activation code is generated and delivered (via email and/or UI).

## 2. Activation Code Entry
- Enter a valid activation code and confirm it unlocks the puzzles.
- Reuse the same code on a second device (up to device limit).
- Attempt to use a code after the device limit is reached (should show an error).

## 3. Email Delivery
- Confirm activation codes are sent to the correct email address.
- Email should contain clear instructions for activation.
- Check spam/junk folders to ensure reliable delivery.

## 4. Device Locking
- Ensure activation is tied to the device (test by clearing storage, using incognito, or a different browser/device).

## 5. Error Handling
- Enter an invalid or already-used code and confirm a clear error message is shown.
- Simulate network errors (disconnect, reload) and check for graceful error handling.

## 6. UI/UX
- All buttons, forms, and messages are visible and responsive.
- No overlays or modals block the main content.
- Test on both mobile and desktop devices.

## 7. Edge Cases
- Try rapid repeated purchases or code entries.
- Use the dev/test bypass and ensure it does not work in production.

## 8. Security
- Ensure no sensitive keys or logic are exposed in the frontend.
- Confirm only paid users receive codes and access.

---

### Launch Checklist
- [ ] All above tests pass in sandbox.
- [ ] Payment, activation, and email flows are reliable.
- [ ] UI is clear and error messages are helpful.
- [ ] Device locking and code limits are enforced.
- [ ] No sensitive data is exposed.

**If all checks pass, you are ready to let users start buying the puzzle!**

---

_Last updated: December 11, 2025_
