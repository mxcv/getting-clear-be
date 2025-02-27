import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnDecimalTransformer } from 'src/helpers/column-decimal-transformer';
import { Locality } from 'src/localities/entities/locality.entity';

@Entity()
export class LocalityCostEstimate {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  year?: number;

  @Column()
  tenderCount?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: new ColumnDecimalTransformer() })
  realExpenditures?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: new ColumnDecimalTransformer() })
  expectedExpenditures?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: new ColumnDecimalTransformer() })
  defenseExpenditures?: number;

  @ManyToOne(() => Locality, { nullable: false })
  locality?: Locality;
}
