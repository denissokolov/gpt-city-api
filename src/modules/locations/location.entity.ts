import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CharacterEntity } from '../characters/character.entity';
import { Locale } from '../../common/enums/locale.enum';
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

  @OneToMany(() => CharacterEntity, (character) => character.location)
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
>;
export type UpdateLocationEntityInput = Partial<
  Omit<LocationEntity, 'characters' | 'places' | 'createdAt' | 'updatedAt'>
> & { id: string };
