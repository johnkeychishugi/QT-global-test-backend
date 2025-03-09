import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':shortCode')
  async getUrlAnalytics(@Param('shortCode') shortCode: string, @Req() req: Request & { user: { sub: string } }) {
    const userId = req.user.sub;
    return this.analyticsService.getUrlAnalytics(shortCode, userId);
  }
} 