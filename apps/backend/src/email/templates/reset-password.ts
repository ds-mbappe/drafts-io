export const resetPasswordTemplate = (token: string, email: string) => {
  return `
    <p>Click <a href="${process.env.FRONTEND_URL}/account/reset_password?email=${email}&token=${token}">here</a> to reset your password.</p>
  `;
};
