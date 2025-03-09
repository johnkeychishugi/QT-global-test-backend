import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlsService } from './urls.service';
import { Url } from './url.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

jest.mock('nanoid');

describe('UrlsService', () => {
  let service: UrlsService;
  let mockUrlRepository: jest.Mocked<Repository<Url>>;

  const mockUrl = {
    id: '1',
    shortCode: 'abc123',
    longUrl: 'https://example.com',
    userId: 'user-1',
    clicks: 0,
    createdAt: new Date(),
  } as Partial<Url> as Url;

  beforeEach(async () => {
    mockUrlRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      increment: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Url>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      (nanoid as jest.Mock).mockReturnValue('generated-code');
      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);
    });

    it('should create a URL with generated short code', async () => {
      const createUrlDto = {
        longUrl: 'https://example.com',
      };

      const result = await service.create(createUrlDto, 'user-1');

      expect(nanoid).toHaveBeenCalled();
      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        longUrl: 'https://example.com',
        shortCode: 'generated-code',
        userId: 'user-1',
      });
      expect(mockUrlRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUrl);
    });

    it('should create a URL with custom short code', async () => {
      const createUrlDto = {
        longUrl: 'https://example.com',
        customCode: 'custom-code',
      };

      const result = await service.create(createUrlDto, 'user-1');

      expect(nanoid).not.toHaveBeenCalled();
      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { shortCode: 'custom-code' },
      });
      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        longUrl: 'https://example.com',
        shortCode: 'custom-code',
        userId: 'user-1',
      });
      expect(mockUrlRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUrl);
    });

    it('should throw BadRequestException if custom code already exists', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      const createUrlDto = {
        longUrl: 'https://example.com',
        customCode: 'custom-code',
      };

      await expect(service.create(createUrlDto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if URL is invalid', async () => {
      const createUrlDto = {
        longUrl: 'invalid-url',
      };

      await expect(service.create(createUrlDto, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return urls with pagination', async () => {
      const mockUrls = [mockUrl];
      const mockTotal = 1;
      mockUrlRepository.findAndCount.mockResolvedValue([mockUrls, mockTotal]);

      const result = await service.findAll('user-1', 1, 10);

      expect(mockUrlRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual([mockUrls, mockTotal]);
    });
  });

  describe('findByShortCode', () => {
    it('should return a url by short code', async () => {
      mockUrlRepository.findOne.mockResolvedValue(mockUrl);

      const result = await service.findByShortCode('abc123');

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({ where: { shortCode: 'abc123' } });
      expect(result).toEqual(mockUrl);
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.findByShortCode('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks count', async () => {
      await service.incrementClicks('abc123');

      expect(mockUrlRepository.increment).toHaveBeenCalledWith({ shortCode: 'abc123' }, 'clicks', 1);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockUrlRepository.findOne.mockResolvedValue({ ...mockUrl, userId: 'user-1' });
    });

    it('should delete a url', async () => {
      await service.delete('1', 'user-1');

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockUrlRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is not the owner', async () => {
      mockUrlRepository.findOne.mockResolvedValue({ ...mockUrl, userId: 'different-user' });

      await expect(service.delete('1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });
}); 