import { AuthenticatorDevice } from '@simplewebauthn/typescript-types';
import { kv } from '@vercel/kv';
import { cookies } from 'next/headers';

const userPrefix = 'nextjs-webauthn-example-user-';

// The original types are "Buffer" which is not supported by KV
export type UserDevice = Omit<
  AuthenticatorDevice,
  'credentialPublicKey' | 'credentialID'
> & {
  credentialID: string;
  credentialPublicKey: string;
};

type User = {
  email: string;
  devices: UserDevice[];
};

export const findUser = async (email: string): Promise<User | null> => {
  const user = await kv.get<User>(`${userPrefix}${email}`);

  return user;
};

export const createUser = async (
  email: string,
  devices: UserDevice[]
): Promise<User> => {
  const user = await findUser(email);

  if (user) {
    throw new Error('User already exists');
  }

  await kv.set(`${userPrefix}${email}`, { email, devices });
  return { email, devices };
};
