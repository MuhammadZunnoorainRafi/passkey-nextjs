import { kv } from '@vercel/kv';
import { cookies } from 'next/headers';

const sessionPrefix = 'nextjs-webauthn-example-session-';

type SessionData = {
  currentChallenge?: string;
  email?: string;
};

const getSession = async (id: string) => {
  return kv.get<SessionData>(`${sessionPrefix}${id}`);
};

const createSession = async (id: string, data: SessionData) => {
  return kv.set(`${sessionPrefix}${id}`, JSON.stringify(data));
};

export const getCurrentSession = async (): Promise<{
  sessionId: string;
  data: SessionData;
}> => {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('session-id');

  if (sessionId?.value) {
    const session = await getSession(sessionId.value);

    if (session) {
      return { sessionId: sessionId.value, data: session };
    }
  }

  const newSessionId = Math.random().toString(36).slice(2);
  const newSession = { currentChallenge: undefined };
  cookieStore.set('session-id', newSessionId);

  await createSession(newSessionId, newSession);

  return { sessionId: newSessionId, data: newSession };
};

export const updateCurrentSession = async (
  data: SessionData
): Promise<void> => {
  const { sessionId, data: oldData } = await getCurrentSession();

  await createSession(sessionId, { ...oldData, ...data });
};
