import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CharacterEntity } from '../characters/character.entity';
import { Locale } from './location.enum';
import { PlaceEntity } from './place.entity';

@Entity('locations')
export class LocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: Locale })
  locale: Locale;

  @ManyToMany(() => CharacterEntity)
  @JoinTable({
    name: 'location_characters',
    joinColumn: { name: 'locationEntityId', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'characterEntityId',
      referencedColumnName: 'id',
    },
  })
  characters: CharacterEntity[];

  @OneToMany(() => PlaceEntity, (place) => place.location)
  places: PlaceEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateLocationEntityInput = Omit<
  LocationEntity,
  'id' | 'characters' | 'places' | 'createdAt' | 'updatedAt'
> & { characterIds?: string[] };
export type UpdateLocationEntityInput = Partial<
  Omit<LocationEntity, 'characters' | 'places' | 'createdAt' | 'updatedAt'>
> & { id: string; characterIds?: string[] };
