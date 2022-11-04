import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CurrentUser, BearerAuthGuard, WeakBearerAuthGuard } from '../auth/bearer-auth.guard';
import { AuthUser } from '../auth/auth-user.entity';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidatePhoneInput } from './dto/validate-phone.input';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  // https://github.com/nestjs/nest/issues/995
  // order is important
  @Get('who-am-i')
  @UseGuards(BearerAuthGuard)
  whoAmI(@CurrentUser() curUser: AuthUser) {
    return curUser;
  }

  @Post('login')
  async login(@Body() validatePhoneInput: ValidatePhoneInput) {
    if (validatePhoneInput.code !== '666666') {
      throw new BadRequestException('Wrong code');
    }
    const user = await this.usersService.findOneWithValidatedPhone(validatePhoneInput.phone);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const token = await this.authService.issue(user);
    return Object.assign(new AuthUser, user, { token });
  }

  @Post('logout')
  @UseGuards(BearerAuthGuard)
  async logout(@CurrentUser() curUser: AuthUser) {
    await this.authService.revoke(curUser.token.id);
    return true;
  }

  @Get()
  @UseGuards(WeakBearerAuthGuard)
  findAll(@CurrentUser() curUser: AuthUser) {
    return this.usersService.findAll(curUser);
  }

  @Get(':id')
  @UseGuards(WeakBearerAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const user = await this.usersService.findOneWithPermission(id, curUser);
    if (!user) throw new NotFoundException;
    return user;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const token = await this.authService.issue(user);
    return Object.assign(new AuthUser, user, { token });
  }

  @Patch(':id')
  @UseGuards(WeakBearerAuthGuard)
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @CurrentUser() curUser: AuthUser) {
    const user = await this.usersService.update(id, updateUserDto, curUser);
    if (!user) throw new NotFoundException;
    return user;
  }

  @Delete(':id')
  @UseGuards(WeakBearerAuthGuard)
  async removeUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const user = await this.usersService.removeWithPermission(id, curUser);
    if (!user) throw new NotFoundException;
    return user;
  }
}
