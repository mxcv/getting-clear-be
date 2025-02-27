import { ColumnDecimalTransformer } from 'src/helpers/column-decimal-transformer';
import { Region } from 'src/localities/entities/region.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RegionCostEstimate {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  year?: number;

  @Column()
  tenderCount?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: new ColumnDecimalTransformer() })
  realExpenditures?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, transformer: new ColumnDecimalTransformer() })
  defenseExpenditures?: number;

  @ManyToOne(() => Region, { nullable: false })
  region?: Region;
}
