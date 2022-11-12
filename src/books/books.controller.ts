import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { CurrentUser, BearerAuthGuard } from '../auth/bearer-auth.guard';
import { AuthUser } from '../auth/auth-user.entity';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService
  ) {}

  @Get()
  @UseGuards(BearerAuthGuard)
  findAll(@CurrentUser() curUser: AuthUser) {
    return this.booksService.findAll(curUser);
  }

  @Get(':id')
  @UseGuards(BearerAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.findOneWithPermission(id, curUser);
    if (!book) throw new NotFoundException;
    return book;
  }

  @Post()
  @UseGuards(BearerAuthGuard)
  async createBook(@Body() createBookDto: CreateBookDto, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.create(createBookDto, curUser);
    return book;
  }

  @Patch(':id')
  @UseGuards(BearerAuthGuard)
  async updateBook(@Param('id', ParseIntPipe) id: number, @Body() updateBookDto: UpdateBookDto, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.update(id, updateBookDto, curUser);
    return book;
  }

  @Post(':id/borrow')
  @UseGuards(BearerAuthGuard)
  async borrowBook(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.borrow(id, curUser);
    return book;
  }

  @Post(':id/return')
  @UseGuards(BearerAuthGuard)
  async returnBook(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.return(id, curUser);
    return book;
  }

  @Post(':id/buy')
  @UseGuards(BearerAuthGuard)
  async buyBook(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.buy(id, curUser);
    return book;
  }

  @Delete(':id')
  @UseGuards(BearerAuthGuard)
  async removeBook(@Param('id', ParseIntPipe) id: number, @CurrentUser() curUser: AuthUser) {
    const book = await this.booksService.removeWithPermission(id, curUser);
    return book;
  }
}
