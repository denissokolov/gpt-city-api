import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AvatarEntity } from '../avatars/avatar.entity';

@Entity('system_chats')
export class SystemChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AvatarEntity, { onDelete: 'CASCADE' })
  avatar: AvatarEntity;

  @Index()
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
  'id' | 'avatar' | 'createdAt' | 'updatedAt'
>;
export type UpdateSystemChatEntityInput = Partial<
  Omit<SystemChatEntity, 'avatar' | 'createdAt' | 'updatedAt'>
> & { id: string };
