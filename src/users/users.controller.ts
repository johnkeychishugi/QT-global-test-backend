import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request & { user: { sub: string } }) {
    const user = await this.usersService.findOne(req.user.sub);
    // Remove sensitive information
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request & { user: { sub: string } }) {
    return this.usersService.findOne(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Req() req: Request & { user: { sub: string } },
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
} 