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
import { SystemChatEntity } from './systemChat.entity';
import { SystemMessageRole } from './systemMessage.enum';

@Entity('system_messages')
export class SystemMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SystemChatEntity, { onDelete: 'CASCADE' })
  systemChat: SystemChatEntity;

  @Index()
  @Column('uuid')
  systemChatId: string;

  @ManyToOne(() => AvatarEntity, { onDelete: 'CASCADE' })
  avatar: AvatarEntity;

  @Index()
  @Column('uuid')
  avatarId: string;

  @Column({ type: 'enum', enum: SystemMessageRole })
  role: SystemMessageRole;

  @Column('text')
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateSystemMessageEntityInput = Omit<
  SystemMessageEntity,
  'id' | 'systemChat' | 'avatar' | 'createdAt' | 'updatedAt'
>;
export type UpdateSystemMessageEntityInput = Partial<
  Omit<SystemMessageEntity, 'systemChat' | 'avatar' | 'createdAt' | 'updatedAt'>
> & { id: string };
