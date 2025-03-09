import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Click } from '../analytics/click.entity';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  shortCode!: string;

  @Column()
  longUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 0 })
  clicks!: number;

  @ManyToOne(() => User, user => user.urls)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @OneToMany(() => Click, click => click.url)
  clickDetails!: Click[];
} 