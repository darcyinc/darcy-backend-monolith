import { signToken, verifyToken } from '@/utils/jwt';
import { db } from './db';

interface DecodedToken {
  id: string;
  iss: string;
}

interface CreateSessionOptions {
  userId: string;
  userAgent: string;
}

export async function createSession(data: CreateSessionOptions) {
  const now = Date.now();
  const expirationTimestamp = now + 1000 * 60 * 60 * 24 * 15;

  const session = await db.session.create({
    data: {
      userId: data.userId,
      userAgent: data.userAgent,
      expiresAt: new Date(expirationTimestamp)
    }
  });

  const [accessToken, refreshToken] = await Promise.all([
    signToken(
      {
        id: session.id
      },
      { expiresIn: '15d' }
    ),
    signToken({
      id: session.id
    })
  ]);

  return { accessToken, refreshToken };
}

export async function deleteSession(accessToken: string) {
  try {
    const verifiedToken = await verifyToken<DecodedToken>(accessToken);
    if (verifiedToken.iss !== 'learnforfree-sessions') return null;

    await db.session.delete({
      where: {
        id: verifiedToken.id
      }
    });
  } catch {
    //
  }

  return null;
}

export async function verifySession(accessToken: string) {
  try {
    const verifiedToken = await verifyToken<DecodedToken>(accessToken);
    if (verifiedToken.iss !== 'learnforfree-sessions') return null;

    const session = await db.session.findUniqueOrThrow({
      where: {
        id: verifiedToken.id
      },
      include: {
        user: true
      }
    });

    if (session.expiresAt.getTime() < Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}

interface RefreshSessionOptions {
  userAgent: string;
  accessToken: string;
  refreshToken: string;
}

export async function refreshSession({ userAgent, accessToken, refreshToken }: RefreshSessionOptions) {
  try {
    const verifiedToken = await verifyToken<DecodedToken>(accessToken, true);

    const session = await db.session.findUnique({
      where: {
        id: verifiedToken.id
      },
      include: {
        user: true
      }
    });

    if (!session) return null;

    const verifiedRefreshToken = await verifyToken<DecodedToken>(refreshToken);
    if (verifiedRefreshToken.id !== session.id) return null;

    await db.session.delete({
      where: {
        id: session.id
      }
    });

    const createdSession = await createSession({
      userId: session.userId,
      userAgent
    });

    return createdSession;
  } catch {
    return null;
  }
}
