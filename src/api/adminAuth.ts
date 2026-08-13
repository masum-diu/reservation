// Holds the admin password entered in the login modal for the current app
// session. There's no backend login endpoint — protected requests just send
// this value as the X-Admin-Password header, and the server rejects it with
// a 403 if it's wrong.
let adminPassword: string | null = null;

export const setAdminPassword = (password: string) => {
  adminPassword = password;
};

export const clearAdminPassword = () => {
  adminPassword = null;
};

export const getAdminPassword = () => adminPassword;
