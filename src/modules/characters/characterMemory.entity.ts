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
import { AvatarEntity } from '../avatars/avatar.entity';

@Entity('character_memories')
@Unique('UQ_character_memories_character_avatar', ['characterId', 'avatarId'])
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
  avatarId: string;

  @ManyToOne(() => AvatarEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'avatarId' })
  avatar: AvatarEntity;

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
  'id' | 'character' | 'avatar' | 'createdAt' | 'updatedAt'
>;
export type UpdateCharacterMemoryEntityInput = Partial<
  Omit<
    CharacterMemoryEntity,
    'character' | 'avatar' | 'createdAt' | 'updatedAt'
  >
> & { id: string };
