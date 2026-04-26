import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('system_chats')
export class SystemChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Index()
  @Column('uuid')
  userId: string;

  @Column('uuid')
  avatarId: string;

  @Column('varchar', { length: 255, nullable: true })
  title: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateSystemChatEntityInput = Omit<
  SystemChatEntity,
  'id' | 'user' | 'createdAt' | 'updatedAt'
>;
export type UpdateSystemChatEntityInput = Partial<
  Omit<SystemChatEntity, 'user' | 'createdAt' | 'updatedAt'>
> & { id: string };
