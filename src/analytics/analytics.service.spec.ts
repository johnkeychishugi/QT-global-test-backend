import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { Click } from './click.entity';
import { Url } from '../urls/url.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockClickRepository: jest.Mocked<Repository<Click>>;
  let mockUrlRepository: jest.Mocked<Repository<Url>>;

  const mockUrl = {
    id: '1',
    shortCode: 'abc123',
    longUrl: 'https://example.com',
    userId: 'user-1',
    clicks: 5,
    createdAt: new Date(),
  };

  const mockClick = {
    id: '1',
    urlId: '1',
    referrer: 'https://google.com',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockClickRepository = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
    } as unknown as jest.Mocked<Repository<Click>>;

    mockUrlRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<Url>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(Click),
          useValue: mockClickRepository,
        },
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUrlAnalytics', () => {
    it('should return analytics for a URL', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);
      mockClickRepository.createQueryBuilder().getRawMany.mockResolvedValueOnce([
        { date: '2023-01-01', count: '3' },
      ]);
      mockClickRepository.createQueryBuilder().getRawMany.mockResolvedValueOnce([
        { browser: 'Chrome', count: '2' },
      ]);
      mockClickRepository.createQueryBuilder().getRawMany.mockResolvedValueOnce([
        { referrer: 'Google', count: '1' },
      ]);

      const result = await service.getUrlAnalytics('abc123', 'user-1');

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode: 'abc123', userId: 'user-1' },
        relations: ['clickDetails'],
      });
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('analytics');
      expect(result.analytics).toHaveProperty('clicksByDate');
      expect(result.analytics).toHaveProperty('browserStats');
      expect(result.analytics).toHaveProperty('referrerStats');
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.getUrlAnalytics('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordClick', () => {
    it('should record a click', async () => {
      mockClickRepository.create.mockReturnValue(mockClick);
      mockClickRepository.save.mockResolvedValue(mockClick);

      const clickData = {
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0',
      };

      const result = await service.recordClick('1', clickData);

      expect(mockClickRepository.create).toHaveBeenCalledWith({
        urlId: '1',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0',
      });
      expect(mockClickRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockClick);
    });
  });
}); 