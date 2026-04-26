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
import { LocationStateEntity } from '../locations/locationState.entity';
import { PlaceEntity } from '../locations/place.entity';

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlaceEntity, { onDelete: 'CASCADE' })
  place: PlaceEntity;

  @Column('uuid')
  placeId: string;

  @ManyToOne(() => AvatarEntity, { onDelete: 'CASCADE' })
  avatar: AvatarEntity;

  @Index()
  @Column('uuid')
  avatarId: string;

  @Column('uuid', { array: true })
  characterIds: string[];

  @ManyToOne(() => LocationStateEntity, { onDelete: 'CASCADE' })
  state: LocationStateEntity;

  @Index()
  @Column('uuid')
  stateId: string;

  @Column('text', { nullable: true })
  summary: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateChatEntityInput = Omit<
  ChatEntity,
  'id' | 'place' | 'avatar' | 'state' | 'createdAt' | 'updatedAt'
>;
export type UpdateChatEntityInput = Partial<
  Omit<ChatEntity, 'place' | 'avatar' | 'state' | 'createdAt' | 'updatedAt'>
> & { id: string };
