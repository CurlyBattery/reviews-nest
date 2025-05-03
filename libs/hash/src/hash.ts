import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Scrypt {
  static async hash(needHash: string, inputSalt: number) {
    const salt = randomBytes(inputSalt).toString('hex');
    const buf = (await scryptAsync(needHash, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(
    storedHash: string,
    suppliedHash: string,
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedHash.split('.');
    const hashedBuf = Buffer.from(hashedPassword, 'hex');
    const suppliedBuf = (await scryptAsync(suppliedHash, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  }
}
