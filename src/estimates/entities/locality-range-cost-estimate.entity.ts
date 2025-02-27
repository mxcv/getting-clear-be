import { ColumnDecimalTransformer } from 'src/helpers/column-decimal-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LocalityRangeCostEstimate {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  year?: number;

  @Column()
  populationFrom?: number;

  @Column({ nullable: true })
  populationTo?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new ColumnDecimalTransformer() })
  averageExpenditurePerPerson?: number;
}
