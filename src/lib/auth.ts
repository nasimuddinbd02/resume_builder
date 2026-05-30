import { AuthOptions, getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUserByEmail, findUserById } from '@/data-access/user';
import bcrypt from 'bcryptjs';

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
        
        const user = await getUserByEmail(credentials.email as string);
        if (!user || !user.hashedPassword) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) return null;

        return { id: user.id, email: user.email, name: user.name };
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
        (session.user as { id?: string; isPro?: boolean }).id = token.id as string;
        
        try {
          const dbUser = await findUserById(token.id as string);
          
          const isPro = Boolean(
            dbUser?.stripePriceId &&
            dbUser.stripeCurrentPeriodEnd &&
            dbUser.stripeCurrentPeriodEnd.getTime() + 86400000 > Date.now()
          );
          
          (session.user as { id?: string; isPro?: boolean }).isPro = isPro;
        } catch (e: unknown) {
          (session.user as { id?: string; isPro?: boolean }).isPro = false;
        }
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
    isPro?: boolean;
  };
}

export async function auth(): Promise<CustomSession | null> {
  const session = await getServerSession(authOptions);
  return session as CustomSession | null;
}
