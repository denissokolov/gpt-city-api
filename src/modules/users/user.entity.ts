import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sex } from './user.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column('int')
  age: number;

  @Column({ type: 'enum', enum: Sex })
  sex: Sex;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  backstory: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export type CreateUserEntityInput = Omit<
  UserEntity,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateUserEntityInput = Partial<
  Omit<UserEntity, 'createdAt' | 'updatedAt'>
> & { id: string };
