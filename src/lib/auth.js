import { betterAuth } from "better-auth";

export const getAuth = (db) => betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  // To test locally without https
  advanced: {
    useSecureCookies: false
  }
});
