import { AuthOptions, getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { validateUserCredentials } from '@/services/user-service';

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return validateUserCredentials(
          credentials.email as string,
          credentials.password as string
        );
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
};

export interface CustomSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function auth(): Promise<CustomSession | null> {
  const session = await getServerSession(authOptions);
  return session as CustomSession | null;
}
