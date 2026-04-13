import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlaceEntity } from '../locations/place.entity';

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PlaceEntity, { onDelete: 'CASCADE' })
  place: PlaceEntity;

  @Column('uuid')
  placeId: string;

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
  'id' | 'place' | 'createdAt' | 'updatedAt'
>;
export type UpdateChatEntityInput = Partial<
  Omit<ChatEntity, 'place' | 'createdAt' | 'updatedAt'>
> & { id: string };
