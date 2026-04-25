import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CharacterStateEntity } from './characterState.entity';
import { LocationEntity } from './location.entity';

@Entity('location_states')
export class LocationStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  locationId: string;

  @ManyToOne(() => LocationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locationId' })
  location: LocationEntity;

  @Column({ type: 'timestamptz' })
  userTime: Date;

  @OneToMany(
    () => CharacterStateEntity,
    (characterState) => characterState.state,
  )
  characters: CharacterStateEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateLocationStateEntityInput = Omit<
  LocationStateEntity,
  'id' | 'location' | 'characters' | 'createdAt' | 'updatedAt'
>;
export type UpdateLocationStateEntityInput = Partial<
  Omit<
    LocationStateEntity,
    'location' | 'characters' | 'createdAt' | 'updatedAt'
  >
> & { id: string };
