export const resetPasswordTemplate = (token: string, email: string) => {
  return `
    <p>Click <a href="${process.env.HOSTNAME}/account/reset-pass?email=${email}&token=${token}">here</a> to reset your password.</p>
  `;
};
