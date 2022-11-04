import { User } from '../users/user.entity';
import { Token } from './token.entity';

export class AuthUser extends User {
  token: Token;
}
