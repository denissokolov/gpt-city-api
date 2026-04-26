import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sex } from './avatar.enum';

@Entity('avatars')
export class AvatarEntity {
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

export type CreateAvatarEntityInput = Omit<
  AvatarEntity,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateAvatarEntityInput = Partial<
  Omit<AvatarEntity, 'createdAt' | 'updatedAt'>
> & { id: string };
