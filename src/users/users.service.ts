import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../auth/auth-user.entity';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
const isChinesePhoneNumber = require('is-chinese-phone-number');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authService: AuthService
  ) {}

  filterResult(user: User, curUser: AuthUser) {
    if (curUser?.isAdmin || user && user.id === curUser?.id) {
      return user;
    } else if (user) {
      // filter only public fields
      return Object.assign(new User, {
        id: user.id,
        name: user.name
      });
    } else {
      return null;
    }
  }

  async findAll(curUser: AuthUser): Promise<User[]> {
    if (!curUser?.isAdmin) {
      throw new ForbiddenException('Only admin can list all users');
    }

    return (await this.usersRepository.find()).map(x => this.filterResult(x, curUser)).filter(x => x !== null);
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneWithValidatedPhone(phone: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        phone
      }
    });
  }

  async findOneWithPermission(id: number, curUser: AuthUser): Promise<User> {
    return this.filterResult(await this.findOne(id), curUser);
  }

  async create(createUserDto: CreateUserDto) {
    const user = new User();

    user.name = createUserDto.name;

    if (await this.findOneWithValidatedPhone(createUserDto.phone)) {
      throw new BadRequestException('Phone has been validated');
    }
    if (!isChinesePhoneNumber.mobile(createUserDto.phone)) {
      throw new BadRequestException('Wrong phone');
    }
    user.phone = createUserDto.phone;

    user.address = createUserDto.address;

    user.isAdmin = false;

    user.updatedAt = new Date;
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto, curUser: AuthUser) {
    const user = await this.findOne(id);
    if (!(curUser?.isAdmin || user && user.id === curUser?.id)) {
      // Not Found is better than Forbidden (leaking the message of existence)
      return null;
    }

    user.name = updateUserDto.name;

    if (updateUserDto.phone !== user.phone) {
      if (await this.findOneWithValidatedPhone(updateUserDto.phone)) {
        throw new BadRequestException('Phone has been validated');
      }
      if (!isChinesePhoneNumber.mobile(updateUserDto.phone)) {
        throw new BadRequestException('Wrong phone');
      }
      user.phone = updateUserDto.phone;
    }
    
    user.address = updateUserDto.address;

    user.updatedAt = new Date;
    return this.usersRepository.save(user);
  }

  async remove(user: User) {
    // TODO racing condition
    await this.authService.revokeAll(await this.authService.findAllByUser(user));
    await this.usersRepository.delete(user.id);
    return true;
  }

  async removeWithPermission(id: number, curUser: AuthUser) {
    const user = await this.findOne(id);
    if (!(curUser?.isAdmin || user && user.id === curUser?.id)) {
      // Not Found is better than Forbidden (leaking the message of existence)
      return null;
    }
    return this.remove(user);
  }
}
