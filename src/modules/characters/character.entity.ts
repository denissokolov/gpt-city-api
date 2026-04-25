import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Provider, Sex } from './character.enum';
import { LocationEntity } from '../locations/location.entity';

@Entity('characters')
export class CharacterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ length: 255 })
  title: string;

  @Column('int')
  age: number;

  @Column({ type: 'enum', enum: Sex })
  sex: Sex;

  @Column('text')
  personality: string;

  @Column('text')
  backstory: string;

  @Column({ length: 255 })
  model: string;

  @Column({ type: 'enum', enum: Provider })
  provider: Provider;

  @Column('uuid')
  locationId: string;

  @ManyToOne(() => LocationEntity, (location) => location.characters, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'locationId' })
  location: LocationEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateCharacterEntityInput = Omit<
  CharacterEntity,
  'id' | 'location' | 'createdAt' | 'updatedAt'
>;
export type UpdateCharacterEntityInput = Partial<
  Omit<CharacterEntity, 'location' | 'createdAt' | 'updatedAt'>
> & { id: string };
