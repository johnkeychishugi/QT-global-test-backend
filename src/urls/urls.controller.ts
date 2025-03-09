import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req, Query, Redirect, HttpCode, NotFoundException } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { AnalyticsService } from '../analytics/analytics.service';
import { Request } from 'express';

@Controller()
export class UrlsController {
  constructor(
    private urlsService: UrlsService,
    private analyticsService: AnalyticsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('shorten')
  async create(@Body() createUrlDto: CreateUrlDto, @Req() req: Request & { user: { sub: string } }) {
    const userId = req.user.sub;
    return this.urlsService.create(createUrlDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('urls')
  async findAll(@Req() req: Request & { user: { sub: string } }, @Query('page') page: number, @Query('limit') limit: number) {
    const userId = req.user.sub;
    const [urls, total] = await this.urlsService.findAll(userId, page, limit);
    
    return {
      data: urls,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('urls/:id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @Req() req: Request & { user: { sub: string } }) {
    const userId = req.user.sub;
    await this.urlsService.delete(id, userId);
  }

  @Public()
  @Get(':shortCode')
  @Redirect()
  async redirect(@Param('shortCode') shortCode: string, @Req() req: Request) {
    try {
      const url = await this.urlsService.findByShortCode(shortCode);
      
      // Increment click count
      await this.urlsService.incrementClicks(shortCode);
      
      // Record analytics data
      await this.analyticsService.recordClick(url.id, {
        referrer: req.headers.referer || undefined,
        userAgent: req.headers['user-agent'] || undefined,
      });
      
      return { url: url.longUrl };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { url: '/not-found' };
      }
      throw error;
    }
  }
} 