import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Provider, Sex } from './character.enum';

@Entity('characters')
export class Character {
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateCharacterInput = Omit<
  Character,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateCharacterInput = Partial<
  Omit<Character, 'createdAt' | 'updatedAt'>
> & { id: string };
