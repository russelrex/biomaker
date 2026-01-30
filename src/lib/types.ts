export interface RangeData {
  optimal?: string;
  inRange?: string;
  outOfRange?: string;
}

export interface HistoricalDataPoint {
  value: number;
  date: string;
  status: 'optimal' | 'in-range' | 'out-of-range';
}

export interface BiomarkerData {
  name: string;
  unit: string;
  value: number;
  status: 'optimal' | 'in-range' | 'out-of-range';
  ranges: {
    optimal?: [number, number];
    inRange?: [number, number];
    outOfRange?: [number, number];
  };
  graphMin: number;
  graphMax: number;
  historicalData?: HistoricalDataPoint[];
}

export interface ParsedCSVRow {
  Biomarker_Name: string;
  Unit: string;
  'Male_18-39_Optimal'?: string;
  'Male_18-39_InRange'?: string;
  'Male_18-39_OutOfRange'?: string;
  Male_18_39_Optimal?: string;
  Male_18_39_InRange?: string;
  Male_18_39_OutOfRange?: string;
  Graph_Range?: string;
  Standard_Reference_Range_Male?: string;
  [key: string]: string | undefined;
}
