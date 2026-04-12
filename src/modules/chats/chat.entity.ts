import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateChatEntityInput = Partial<
  Omit<ChatEntity, 'createdAt' | 'updatedAt'>
> & { id: string };
