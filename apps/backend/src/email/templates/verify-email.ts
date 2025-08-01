export const verifyEmailTemplate = (token: string) => {
  return `
    <p>Click <a href="${process.env.FRONTEND_URL}/account/verify-email?token=${token}">here</a> to verify your email.</p>
  `;
};
