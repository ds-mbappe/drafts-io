export const changeEmailCodeTemplate = (code: string, newEmail: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #f9f9f9; padding: 40px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e5e5e5;">
    <h2 style="margin-top: 0; color: #111;">Confirm your new email address</h2>
    <p style="color: #555;">You requested to change your email address to <strong>${newEmail}</strong>.</p>
    <p style="color: #555;">Enter the code below to confirm the change. It expires in <strong>15 minutes</strong>.</p>
    <div style="text-align: center; margin: 32px 0;">
      <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111; background: #f3f4f6; padding: 16px 24px; border-radius: 8px;">${code}</span>
    </div>
    <p style="color: #999; font-size: 13px;">If you did not request this change, you can safely ignore this email.</p>
  </div>
</body>
</html>
`;
