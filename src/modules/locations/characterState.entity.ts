import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CharacterEntity } from '../characters/character.entity';
import { LocationStateEntity } from './locationState.entity';
import { PlaceEntity } from './place.entity';

@Entity('character_states')
export class CharacterStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  stateId: string;

  @ManyToOne(() => LocationStateEntity, (state) => state.characters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stateId' })
  state: LocationStateEntity;

  @Column('uuid')
  characterId: string;

  @ManyToOne(() => CharacterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'characterId' })
  character: CharacterEntity;

  @Column('uuid')
  placeId: string;

  @ManyToOne(() => PlaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'placeId' })
  place: PlaceEntity;

  @Column({ type: 'varchar', length: 255 })
  mood: string;

  @Column({ type: 'varchar', length: 255 })
  activity: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateCharacterStateEntityInput = Omit<
  CharacterStateEntity,
  'id' | 'state' | 'character' | 'place' | 'createdAt' | 'updatedAt'
>;
export type UpdateCharacterStateEntityInput = Partial<
  Omit<
    CharacterStateEntity,
    'state' | 'character' | 'place' | 'createdAt' | 'updatedAt'
  >
> & { id: string };
