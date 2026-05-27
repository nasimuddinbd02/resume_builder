import bcrypt from 'bcryptjs';
import * as userDal from '@/data-access/user';

export async function registerUser(name: string, email: string, password: string) {
  const existingUser = await userDal.findUserByEmail(email);
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await userDal.createUser({
    name,
    email,
    hashedPassword,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await userDal.findUserByEmail(email);
  if (!user || !user.hashedPassword) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
