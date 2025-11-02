import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  database: new Pool({
    connectionString: "postgres://school_user:123456@localhost:5432/school_db",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 ngày
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token?.id) {
        session.user = session.user || {};
        session.user.id = token.id;
      }
      return session;
    },
  },
});
