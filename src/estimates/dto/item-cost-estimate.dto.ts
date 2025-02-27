import { IsInt } from 'class-validator';

export class ItemCostEstimateCreate {
  @IsInt()
  year: number;
}
