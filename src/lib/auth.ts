import { AuthOptions, getServerSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { validateUserCredentials } from '@/services/user-service';
import { prisma } from '@/lib/prisma';

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
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { stripePriceId: true, stripeCurrentPeriodEnd: true }
          });
          
          const isPro = Boolean(
            dbUser?.stripePriceId &&
            dbUser.stripeCurrentPeriodEnd &&
            dbUser.stripeCurrentPeriodEnd.getTime() + 86400000 > Date.now()
          );
          
          (session.user as any).isPro = isPro;
        } catch (e) {
          (session.user as any).isPro = false;
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
