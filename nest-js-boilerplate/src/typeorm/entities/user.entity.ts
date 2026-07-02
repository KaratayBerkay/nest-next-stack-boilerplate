import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Photo } from './photo.entity';

/**
 * #24/#107 TypeORM. The documented entity shape: `@Entity()` +
 * `@PrimaryGeneratedColumn()` + `@Column()`. Column types are inferred from the
 * TS types via `emitDecoratorMetadata` (on in this repo's tsconfig). The
 * `@OneToMany` relation to `Photo` proves the documented relations feature.
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  // cascade so persisting a User also persists its new photos in one save().
  @OneToMany(() => Photo, (photo) => photo.user, { cascade: true })
  photos: Photo[];
}
