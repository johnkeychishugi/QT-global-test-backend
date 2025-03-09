import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Click } from './click.entity';
import { Url } from '../urls/url.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Click)
    private clicksRepository: Repository<Click>,
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
  ) {}

  async getUrlAnalytics(shortCode: string, userId: string) {
    const url = await this.urlsRepository.findOne({ 
      where: { shortCode, userId },
      relations: ['clickDetails'],
    });

    if (!url) {
      throw new NotFoundException('URL not found or you do not have access');
    }

    const clicksByDate = await this.clicksRepository
      .createQueryBuilder('click')
      .select('DATE(click.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('click.urlId = :urlId', { urlId: url.id })
      .groupBy('DATE(click.createdAt)')
      .orderBy('date', 'DESC')
      .getRawMany();

    const browserStats = await this.clicksRepository
      .createQueryBuilder('click')
      .select('SUBSTRING_INDEX(click.userAgent, "/", 1)', 'browser')
      .addSelect('COUNT(*)', 'count')
      .where('click.urlId = :urlId', { urlId: url.id })
      .groupBy('browser')
      .getRawMany();

    const referrerStats = await this.clicksRepository
      .createQueryBuilder('click')
      .select('COALESCE(click.referrer, "Direct")', 'referrer')
      .addSelect('COUNT(*)', 'count')
      .where('click.urlId = :urlId', { urlId: url.id })
      .groupBy('referrer')
      .getRawMany();

    return {
      url: {
        id: url.id,
        shortCode: url.shortCode,
        longUrl: url.longUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
      analytics: {
        clicksByDate,
        browserStats,
        referrerStats,
      }
    };
  }

  async recordClick(urlId: string, clickData: { referrer?: string; userAgent?: string }) {
    const click = this.clicksRepository.create({
      urlId,
      referrer: clickData.referrer,
      userAgent: clickData.userAgent,
    });

    return this.clicksRepository.save(click);
  }
} 