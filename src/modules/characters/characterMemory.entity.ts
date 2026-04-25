import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CharacterEntity } from './character.entity';
import { UserEntity } from '../users/user.entity';

@Entity('character_memories')
@Unique('UQ_character_memories_character_user', ['characterId', 'userId'])
export class CharacterMemoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  characterId: string;

  @ManyToOne(() => CharacterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'characterId' })
  character: CharacterEntity;

  @Index()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  relationship: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sentiment: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  familiarity: string | null;

  @Column({ type: 'varchar', length: 10000, nullable: true })
  keyFacts: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateCharacterMemoryEntityInput = Omit<
  CharacterMemoryEntity,
  'id' | 'character' | 'user' | 'createdAt' | 'updatedAt'
>;
export type UpdateCharacterMemoryEntityInput = Partial<
  Omit<CharacterMemoryEntity, 'character' | 'user' | 'createdAt' | 'updatedAt'>
> & { id: string };
