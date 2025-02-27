export interface InspectionResult {
  details: InspectionDetails;
  corruptionProbability: InspectionCorruptionProbability;
}

export interface InspectionDetails {
  expectedTotalPrice: number | null;
  expectedItemPricesPerOne: { classification: string; unit: string; quantity: number; price: number }[];
  realExpectedPriceRatio: number | null;
  realTotalPrice: number | null;
  locality: string | null;
  localityYearEstimateRatio: number | null;
  previosSupplierTenderPrices: { [supplierId: string]: InspectionSupplierTenders };
  isDefence: boolean;
}

export interface InspectionCorruptionProbability {
  locality: number | null;
  items: number | null;
  suppliers: number;
  total: number;
}

export interface InspectionSupplierTenders {
  count: number;
  average: number;
  max: number;
}
