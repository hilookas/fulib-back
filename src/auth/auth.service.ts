import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Token } from './token.entity';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
const randomBytesAsync = promisify(randomBytes)

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
  ) {}

  async issue(user: User) {
    const token = new Token();
    token.id = (await randomBytesAsync(16)).toString('base64url');
    token.user = user;
    token.issuedAt = new Date();
    return this.tokensRepository.save(token);
  }

  async findAllByUser(user: User) {
    return this.tokensRepository.find({ where: { user } });
  }

  async revokeAll(tokens: Token[]) {
    return this.tokensRepository.remove(tokens);
  }

  async check(id: string) {
    return this.tokensRepository.findOne({
      where: { id },
      relations: {
        user: true,
      }
    });
  }

  async revoke(id: string) {
    await this.tokensRepository.delete(id);
  }
}
