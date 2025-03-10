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
      .select('CASE WHEN click.userAgent IS NULL THEN \'Unknown\' ELSE split_part(click.userAgent, \'/\', 1) END', 'browser')
      .addSelect('COUNT(*)', 'count')
      .where('click.urlId = :urlId', { urlId: url.id })
      .groupBy('browser')
      .getRawMany();

    const referrerStats = await this.clicksRepository
      .createQueryBuilder('click')
      .select('COALESCE(click.referrer, \'Direct\')', 'referrer')
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
    // Sanitize referrer URL to avoid SQL issues
    let sanitizedReferrer = undefined;
    if (clickData.referrer) {
      try {
        // Try to parse and then regenerate the URL to ensure it's valid
        const referrerUrl = new URL(clickData.referrer);
        sanitizedReferrer = referrerUrl.toString();
      } catch (e) {
        // If it's not a valid URL, store it as a simple string or omit it
        sanitizedReferrer = clickData.referrer;
      }
    }

    const click = this.clicksRepository.create({
      urlId,
      referrer: sanitizedReferrer,
      userAgent: clickData.userAgent,
    });

    return this.clicksRepository.save(click);
  }

  async deleteByShortCode(urlId: string): Promise<void> {
    // Find the URL by ID
    const url = await this.urlsRepository.findOne({ where: { id: urlId } });
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    
    // Delete all clicks associated with this URL ID
    await this.clicksRepository.delete({ urlId: url.id });
  }
} 