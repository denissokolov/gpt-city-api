import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlaceEntity } from '../locations/place.entity';
import { UserEntity } from '../users/user.entity';

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlaceEntity, { onDelete: 'CASCADE' })
  place: PlaceEntity;

  @Column('uuid')
  placeId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Index()
  @Column('uuid')
  userId: string;

  @Column('uuid', { array: true })
  characterIds: string[];

  @Column('text', { nullable: true })
  summary: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateChatEntityInput = Omit<
  ChatEntity,
  'id' | 'place' | 'user' | 'createdAt' | 'updatedAt'
>;
export type UpdateChatEntityInput = Partial<
  Omit<ChatEntity, 'place' | 'user' | 'createdAt' | 'updatedAt'>
> & { id: string };
