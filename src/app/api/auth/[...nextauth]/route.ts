import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Profile, Session } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/index";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";
import axios, { AxiosError, AxiosResponse } from "axios";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

interface Oro_Profile extends Profile {
  profile: {
    role?: string;
    group?: string;
  };
}

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
  id_token: string;
}

export const authOptions: NextAuthOptions = {
  // DB adapter
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        let user;
        user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));
        if (user) user = user[0];
        if (!user || !(await compare(credentials.password, user.password!))) {
          console.log("user not found");
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          randomKey: "Hey cool",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    {
      id: "orosound",
      name: "Orosound",
      type: "oauth",
      wellKnown:
        `${process.env.OP_URL}/.well-known/openid-configuration` ||
        "http://localhost:8001/.well-known/openid-configuration",
      // scope: "openid email profile",
      authorization: {
        params: { scope: "openid email profile offline_access" },
      },
      clientId: process.env.ORO_CLIENT_ID || "foo",
      clientSecret: process.env.ORO_CLIENT_SECRET || "bar",
      idToken: true,
      checks: ["state", "pkce", "nonce"],
      //we can't get email and name in Id token
      //https://stackoverflow.com/questions/50740532/should-id-token-contain-claims-when-used-during-authorization-code-flow
      profile(profile: {
        sub: any;
        profile: { name: string; role: string; group: string };
        email: string;
      }) {
        return {
          id: profile.sub,
          name: profile.profile.name,
          email: profile.email,
          role: profile.profile.role,
          group: profile.profile.group || "default",
        };
      },
    },
  ],

  callbacks: {
    async jwt({ user, token, account, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && account.type === "oauth") {
        token.id = profile!.sub;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // token.group = (profile as Oro_Profile).profile.group;
        token.expire_at = (account.expires_at as number) * 1000;
        if (account.provider === "orosound") {
          if (Date.now() < (token.expire_at as number)) {
            console.log("token not expired");
            return token;
          } else {
            console.log("refresh token");
            return refreshAccessToken(token);
          }
        }
      } else if (account && account.type === "credentials") {
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
      user,
    }: {
      session: any;
      token: any;
      user: any;
    }) {
      // Send properties to the client, like an access_token from a provider.
      // session.user.group = token.group as string;
      session.user.token = (token.accessToken as string) || "credentials";
      session.error = token.error as string;
      return session;
    },
    async signIn() {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async redirect({ url, baseUrl }) {
      return url;
    },
  },
  // secret: process.env.JWT_SECRET,
  // pages: {
  //   signIn: "/auth/signin",
  // },
};

export async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.OP_URL}/token`;
    const refresh_data: AxiosResponse<RefreshTokenResponse> = await axios.post(
      url,
      {
        grant_type: "refresh_token",
        client_id: process.env.ORO_CLIENT_ID || "foo",
        client_secret: process.env.ORO_CLIENT_SECRET || "bar",
        refresh_token: token.refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return (token = {
      ...token,
      accessToken: refresh_data.data.access_token,
      refreshToken: refresh_data.data.refresh_token,
      expire_at: Date.now() + refresh_data.data.expires_in * 1000,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      const axiosError = error as AxiosError;
      console.error("Axios Error:", axiosError.message);
      console.error("Axios Response Data:", axiosError.response?.data);
    } else {
      // Handle other errors
      console.error("Error:", error);
    }
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
