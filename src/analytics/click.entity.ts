import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Url } from '../urls/url.entity';

@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Url, url => url.clickDetails)
  @JoinColumn({ name: 'urlId' })
  url!: Url;

  @Column()
  urlId!: string;
} 