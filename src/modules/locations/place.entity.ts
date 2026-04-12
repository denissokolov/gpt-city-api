import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationEntity } from './location.entity';

@Entity('places')
export class PlaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => LocationEntity, (location) => location.places, {
    onDelete: 'CASCADE',
  })
  location: LocationEntity;

  @Column()
  locationId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreatePlaceEntityInput = Omit<
  PlaceEntity,
  'id' | 'location' | 'createdAt' | 'updatedAt'
>;
export type UpdatePlaceEntityInput = Partial<
  Omit<PlaceEntity, 'location' | 'createdAt' | 'updatedAt'>
> & { id: string };
