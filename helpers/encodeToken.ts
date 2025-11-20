import jwt, { JwtPayload } from 'jsonwebtoken';

const dataFromToken = (token: string): JwtPayload => {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded.payload === 'string') {
    throw new Error('Invalid token');
  }

  return decoded.payload as JwtPayload;
};

export default dataFromToken;
