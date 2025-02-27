import { IsInt, IsNumber } from 'class-validator';

export class LocalityCostEstimateCreate {
  @IsInt()
  year: number;

  @IsNumber({}, { each: true })
  periods: number[];

  @IsNumber()
  includeFrom: number;
}
