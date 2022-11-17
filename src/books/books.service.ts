import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AuthUser } from '../auth/auth-user.entity';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { User } from '../users/user.entity';
import { omit } from 'lodash';
import { UsersService } from '../users/users.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly usersService: UsersService
  ) {}

  filterResult(book: Book, curUser: AuthUser) {
    if (curUser?.isAdmin || book && book.user && book.user.id === curUser?.id) {
      book.borrowedByUser = book.borrowedByUser ? this.usersService.filterResult(book.borrowedByUser, curUser) : undefined;
      book.user = book.user ? this.usersService.filterResult(book.user, curUser) : undefined;
      return book;
    } else if (book) {
      // filter only public fields
      return Object.assign(new Book, {
        id: book.id,
        isbn: book.isbn,
        name: book.name,
        author: book.author,
        description: book.description,
        canBuy: book.canBuy,
        sellPrice: book.sellPrice,
        canBorrow: book.canBorrow,
        borrowedByUser: book.borrowedByUser ? this.usersService.filterResult(book.borrowedByUser, curUser) : undefined,
        user: book.user ? this.usersService.filterResult(book.user, curUser) : undefined,
        updatedAt: book.updatedAt
      });
    } else {
      return null;
    }
  }

  async findAll(query: { isbn: string, name: string, author: string }, curUser: AuthUser): Promise<Book[]> {
    return (await this.booksRepository.find({
      where: {
        isbn: query.isbn ? Like('%' + query.isbn + '%') : undefined,
        name: query.name ? Like('%' + query.name + '%') : undefined,
        author: query.author ? Like('%' + query.author + '%') : undefined,
      },
      relations: [ 'borrowedByUser', 'user' ]
    })).map(x => this.filterResult(x, curUser)).filter(x => x !== null);
  }

  findOne(id: number): Promise<Book> {
    return this.booksRepository.findOne({ where: { id }, relations: [ 'borrowedByUser', 'user' ] });
  }

  async findOneWithPermission(id: number, curUser: AuthUser): Promise<Book> {
    return this.filterResult(await this.findOne(id), curUser);
  }

  async create(createBookDto: CreateBookDto, curUser: AuthUser) {    
    const book = new Book();

    book.isbn = createBookDto.isbn;

    book.name = createBookDto.name;

    book.author = createBookDto.author;

    book.description = createBookDto.description;

    book.canBuy = createBookDto.canBuy;

    if (createBookDto.canBuy) {
      if (createBookDto.sellPrice == null) {
        throw new BadRequestException('Need a price')
      }
      book.sellPrice = createBookDto.sellPrice;
    } else {
      book.sellPrice = null;
    }

    book.canBorrow = createBookDto.canBorrow;

    book.user = Object.assign(new User, omit(curUser, 'token'));

    book.updatedAt = new Date;
    return this.filterResult(await this.booksRepository.save(book), curUser);
  }

  async update(id: number, updateBookDto: UpdateBookDto, curUser: AuthUser) {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException;
    }
    
    // TODO racing condition
    if (book.borrowedByUser) {
      throw new BadRequestException('Borrowed');
    }

    if (!(curUser?.isAdmin || book && book.user && book.user.id === curUser?.id)) {
      throw new BadRequestException('Permission denied');
    }

    book.isbn = updateBookDto.isbn;

    book.name = updateBookDto.name;

    book.author = updateBookDto.author;

    book.description = updateBookDto.description;

    book.canBuy = updateBookDto.canBuy;

    if (updateBookDto.canBuy) {
      if (updateBookDto.sellPrice == null) {
        throw new BadRequestException('Need a price')
      }
      book.sellPrice = updateBookDto.sellPrice;
    } else {
      book.sellPrice = null;
    }

    book.canBorrow = updateBookDto.canBorrow;

    book.user = Object.assign(new User, omit(curUser, 'token'));

    book.updatedAt = new Date;
    return this.filterResult(await this.booksRepository.save(book), curUser);
  }

  async borrow(id: number, curUser: AuthUser) {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException;
    }
    
    // TODO racing condition
    if (book.borrowedByUser) {
      throw new BadRequestException('Borrowed');
    }
    
    if (!book.canBorrow) {
      throw new BadRequestException('Can not be borrowed');
    }

    book.borrowedByUser = Object.assign(new User, omit(curUser, 'token'));

    return this.filterResult(await this.booksRepository.save(book), curUser);
  }

  async return(id: number, curUser: AuthUser) {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException;
    }
    
    // TODO racing condition
    if (!book.borrowedByUser) {
      throw new BadRequestException('Not borrowed');
    }

    if (book.borrowedByUser.id !== curUser.id) {
      throw new BadRequestException('Not borrower');
    }

    book.borrowedByUser = null;

    return this.filterResult(await this.booksRepository.save(book), curUser);
  }

  async remove(book: Book) {
    // TODO racing condition
    await this.booksRepository.delete(book.id);
    return true;
  }

  async buy(id: number, curUser: AuthUser) {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException;
    }
    
    // TODO racing condition
    if (book.borrowedByUser) {
      throw new BadRequestException('Borrowed');
    }
    
    if (!book.canBuy) {
      throw new BadRequestException('Can not be buyed');
    }

    return this.remove(book);
  }

  async removeWithPermission(id: number, curUser: AuthUser) {
    const book = await this.findOne(id);
    
    if (!book) {
      throw new NotFoundException;
    }

    // TODO racing condition
    if (book.borrowedByUser) {
      throw new BadRequestException('Borrowed');
    }

    if (!(curUser?.isAdmin || book && book.user && book.user.id === curUser?.id)) {
      throw new BadRequestException('Permission denied');
    }

    return this.remove(book);
  }
}
