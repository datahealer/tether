import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { User } from '../models/User';
import { Provider, Platform } from '../types/enums';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signIn = async (req: Request, res: Response) => {
  const { idToken, provider, deviceToken, platform } = req.body; // provider: 'apple'|'google'

  try {
    let sub: string, email: string, name: string | undefined;

    if (provider === Provider.GOOGLE) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid Google token');
      sub = payload.sub;
      email = payload.email!;
      name = payload.name;
    } else if (provider === Provider.APPLE) {
      const appleIdToken = await appleSignin.verifyIdToken(idToken, {
        audience: process.env.APPLE_CLIENT_ID,
      });
      sub = appleIdToken.sub;
      email = appleIdToken.email || req.body.email; // Fallback if not in token
      name = req.body.fullName; // From client (Apple provides on first sign-in)
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const query = provider === Provider.GOOGLE ? { googleSub: sub } : { appleSub: sub };
    let user = await User.findOne(query);

    if (!user) {
      user = new User({
        [provider === Provider.GOOGLE ? 'googleSub' : 'appleSub']: sub,
        email,
        name,
        provider,
        platform,
        fcmTokens: platform === Platform.ANDROID ? [deviceToken] : [],
        apnsToken: platform === Platform.IOS ? deviceToken : undefined,
      });
      await user.save();
    } else {
      // Update push tokens if changed
      if (platform === Platform.ANDROID && deviceToken && !user.fcmTokens.includes(deviceToken)) {
        user.fcmTokens.push(deviceToken);
      } else if (platform === Platform.IOS && deviceToken !== user.apnsToken) {
        user.apnsToken = deviceToken;
      }
      if (name && !user.name) user.name = name;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '180d' });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        onboarded: user.onboarded,
        coupleId: user.coupleId,
      },
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
};