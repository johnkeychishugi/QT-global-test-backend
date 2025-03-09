import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './url.entity';
import { CreateUrlDto } from './dto/create-url.dto';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private urlsRepository: Repository<Url>,
  ) {}

  async create(createUrlDto: CreateUrlDto, userId: string): Promise<Url> {
    try {
      const { longUrl, customCode } = createUrlDto;
      
      let shortCode: string;
      
      if (customCode) {
        // Check if custom code already exists
        const existingUrl = await this.urlsRepository.findOne({ where: { shortCode: customCode } });
        if (existingUrl) {
          throw new BadRequestException('Custom code already in use');
        }
        shortCode = customCode;
      } else {
        // Generate random short code using dynamic import for nanoid
        const { nanoid } = await import('nanoid');
        shortCode = nanoid(8); // Generate an 8-character code
        
        // Ensure uniqueness
        while (await this.urlsRepository.findOne({ where: { shortCode } })) {
          shortCode = nanoid(8);
        }
      }

      // Create and save the new URL
      const url = this.urlsRepository.create({
        longUrl,
        shortCode,
        userId,
      });

      return this.urlsRepository.save(url);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid URL or data');
    }
  }

  async findAll(userId: string, page: number = 1, limit: number = 10): Promise<[Url[], number]> {
    return this.urlsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findByShortCode(shortCode: string): Promise<Url> {
    const url = await this.urlsRepository.findOne({ where: { shortCode } });
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    
    return url;
  }

  async incrementClicks(shortCode: string): Promise<void> {
    await this.urlsRepository.increment({ shortCode }, 'clicks', 1);
  }

  async delete(id: string, userId: string): Promise<void> {
    const url = await this.urlsRepository.findOne({ where: { id } });
    
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    
    if (url.userId !== userId) {
      throw new BadRequestException('You do not have permission to delete this URL');
    }
    
    await this.urlsRepository.remove(url);
  }
} 