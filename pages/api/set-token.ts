// pages/api/get-user-info.ts

import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || ''; // Ensure this is stored securely in your environment variables

interface DecodedToken {
  user_id: string;
  rol: string;
  iat: number;
  exp: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Parse the JWT token from the request body
    const { data } = req.body;

    if (!data || !data.access) {
      return res.status(401).json({ error: 'Authentication token is missing' });
    }

    const token = data.access;

    console.log(token);

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    
    // Set the token as an HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('auth', token, {
        httpOnly: true,         
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',                
      })
    );

    return res.status(200).json({ user_id: decoded.user_id, rol: decoded.rol });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
