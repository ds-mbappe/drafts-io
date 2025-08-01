export const verifyEmailTemplate = (token: string) => {
  return `
    <p>Click <a href="${process.env.HOSTNAME}/account/verify-email?token=${token}">here</a> to verify your email.</p>
  `;
};
