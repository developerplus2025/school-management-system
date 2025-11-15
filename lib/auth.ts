import { betterAuth } from "better-auth";
import { Pool } from "pg";

type JWTToken = { [key: string]: unknown; id?: string | number };
type AuthUser = { id?: string | number };
type AuthSession = { user?: { id?: string | number } } & Record<
  string,
  unknown
>;

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: new Pool({
    connectionString: "postgres://school_user:123456@localhost:5432/school_db",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 ngày
  },
  callbacks: {
    async jwt({ token, user }: { token: JWTToken; user?: AuthUser }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: AuthSession;
      token: JWTToken;
    }) {
      if (token?.id) {
        session.user = session.user || {};
        session.user.id = token.id;
      }
      return session;
    },
  },
});
