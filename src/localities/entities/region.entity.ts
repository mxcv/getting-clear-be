import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Locality } from './locality.entity';

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @OneToMany(() => Locality, (locality) => locality.region)
  localities?: Locality[];
}
