import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { Sex } from './avatar.enum';

@Entity('avatars')
export class AvatarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Index()
  @Column('uuid')
  userId: string;

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
  'id' | 'user' | 'createdAt' | 'updatedAt'
>;
export type UpdateAvatarEntityInput = Partial<
  Omit<AvatarEntity, 'user' | 'userId' | 'createdAt' | 'updatedAt'>
> & { id: string };
