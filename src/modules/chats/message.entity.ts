import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CharacterEntity } from '../characters/character.entity';
import { ChatEntity } from './chat.entity';
import { MessageRole } from './message.enum';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  chat: ChatEntity;

  @Index()
  @Column('uuid')
  chatId: string;

  @ManyToOne(() => CharacterEntity, { onDelete: 'SET NULL', nullable: true })
  character: CharacterEntity | null;

  @Column('uuid', { nullable: true })
  characterId: string | null;

  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole;

  @Column('text')
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateMessageEntityInput = Omit<
  MessageEntity,
  'id' | 'chat' | 'character' | 'createdAt' | 'updatedAt'
>;
export type UpdateMessageEntityInput = Partial<
  Omit<MessageEntity, 'chat' | 'character' | 'createdAt' | 'updatedAt'>
> & { id: string };
