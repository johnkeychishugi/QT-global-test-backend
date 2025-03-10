import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Url } from '../urls/url.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  @Exclude()
  passwordHash?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  picture?: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  providerId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Url, url => url.user)
  urls?: Url[];
} 