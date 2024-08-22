// pages/api/get-user-info.ts

import { NextApiRequest, NextApiResponse } from 'next';
import jwt, {JwtPayload} from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET||"";

interface DecodedToken {
  user_id: BigInteger;
  rol: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');

    const token = cookies.auth;

    //console.log(token);

    if (!token) {
      res.writeHead(302, { Location: '/login' });
      res.end()
      return;
      return res.status(401).json({ error: 'Authentication token is missing' });
    }


    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | DecodedToken;

    return res.status(200).json({ user_id: decoded.user_id, role: decoded.rol, token:token });
  
} catch (error) {
    console.log("ERROR RARO")
    console.log(error);
    res.writeHead(302, { Location: '/login' });
    res.end();
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
