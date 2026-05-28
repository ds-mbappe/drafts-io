export const emailChangedNotificationTemplate = (newEmail: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f9f9f9; padding: 40px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
    <h2 style="margin-top: 0; color: #111;">Your email address was changed</h2>
    <p style="color: #555;">The email address on your account has been updated to <strong>${newEmail}</strong>.</p>
    <p style="color: #555;">If you made this change, no further action is needed.</p>
    <p style="color: #e53e3e; font-weight: 600;">If you did not make this change, please contact our support team immediately.</p>
  </div>
</body>
</html>
`;
