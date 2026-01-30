import Papa from 'papaparse';
import { BiomarkerData, ParsedCSVRow, HistoricalDataPoint } from './types';

function parseRange(rangeStr: string | undefined): [number, number] | undefined {
  if (!rangeStr) return undefined;
  
  const dashMatch = rangeStr.match(/^([\d.]+)-([\d.]+)$/);
  if (dashMatch) {
    return [parseFloat(dashMatch[1]), parseFloat(dashMatch[2])];
  }
  
  const lessThanMatch = rangeStr.match(/^<([\d.]+)$/);
  if (lessThanMatch) {
    const val = parseFloat(lessThanMatch[1]);
    return [0, val];
  }
  
  const greaterThanMatch = rangeStr.match(/^>([\d.]+)$/);
  if (greaterThanMatch) {
    const val = parseFloat(greaterThanMatch[1]);
    return [val, val * 2];
  }
  
  return undefined;
}

export function determineStatus(
  value: number,
  ranges: BiomarkerData['ranges']
): 'optimal' | 'in-range' | 'out-of-range' {
  if (ranges.optimal) {
    const [min, max] = ranges.optimal;
    if (value >= min && value <= max) return 'optimal';
  }
  
  if (ranges.inRange) {
    const [min, max] = ranges.inRange;
    if (value >= min && value <= max) return 'in-range';
  }
  
  return 'out-of-range';
}

function parseHistoricalData(
  row: ParsedCSVRow,
  ranges: BiomarkerData['ranges'],
  unit: string
): HistoricalDataPoint[] {
  const historicalData: HistoricalDataPoint[] = [];
  const dataPairs: Array<{ date?: string; value?: string; index: number }> = [];
  
  Object.keys(row).forEach(key => {
    const lowerKey = key.toLowerCase().trim();
    
    if (lowerKey.includes('date') && !lowerKey.includes('range')) {
      const match = lowerKey.match(/(\d+)/);
      const index = match ? parseInt(match[1], 10) : 0;
      if (!dataPairs[index]) {
        dataPairs[index] = { index };
      }
      dataPairs[index].date = row[key]?.trim();
    } else if ((lowerKey.includes('value') || lowerKey.includes('result') || lowerKey.includes('reading')) && 
               !lowerKey.includes('range') && 
               !lowerKey.includes('graph') &&
               !lowerKey.includes('current')) {
      const match = lowerKey.match(/(\d+)/);
      const index = match ? parseInt(match[1], 10) : 0;
      if (!dataPairs[index]) {
        dataPairs[index] = { index };
      }
      dataPairs[index].value = row[key]?.trim();
    }
  });
  
  dataPairs.forEach(pair => {
    if (pair.date && pair.value) {
      const value = parseFloat(pair.value);
      if (!isNaN(value)) {
        const status = determineStatus(value, ranges);
        historicalData.push({
          value,
          date: pair.date,
          status,
        });
      }
    }
  });
  
  return historicalData.sort((a, b) => {
    try {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) {
        return a.date.localeCompare(b.date);
      }
      return dateA - dateB;
    } catch {
      return a.date.localeCompare(b.date);
    }
  });
}

function calculateGraphBounds(ranges: BiomarkerData['ranges']): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  
  Object.values(ranges).forEach(range => {
    if (range) {
      min = Math.min(min, range[0]);
      max = Math.max(max, range[1]);
    }
  });
  
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
}

export async function parseBiomarkerCSV(csvPath: string): Promise<ParsedCSVRow[]> {
  const response = await fetch(csvPath);
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<ParsedCSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error),
    });
  });
}

export function createBiomarkerData(
  row: ParsedCSVRow,
  value: number,
  demographic: string = 'Male_18-39'
): BiomarkerData {
  const getValue = (key: string): string | undefined => {
    const hyphenKey = key as keyof ParsedCSVRow;
    const underscoreKey = key.replace(/-/g, '_') as keyof ParsedCSVRow;
    const underscoreHyphenKey = key.replace(/_/g, '-') as keyof ParsedCSVRow;
    
    return (row[hyphenKey] || row[underscoreKey] || row[underscoreHyphenKey]) as string | undefined;
  };
  
  const optimalKey = `${demographic}_Optimal`;
  const inRangeKey = `${demographic}_InRange`;
  const outOfRangeKey = `${demographic}_OutOfRange`;
  
  const optimal = getValue(optimalKey);
  const inRange = getValue(inRangeKey);
  const outOfRange = getValue(outOfRangeKey);
  
  if (!optimal && !inRange && !outOfRange) {
    console.warn(`No range data found for demographic ${demographic}. Available keys:`, Object.keys(row));
  }
  
  const ranges: BiomarkerData['ranges'] = {
    optimal: parseRange(optimal),
    inRange: parseRange(inRange),
    outOfRange: parseRange(outOfRange),
  };
  
  let graphMin: number;
  let graphMax: number;
  
  if (row.Graph_Range) {
    const graphRange = parseRange(row.Graph_Range);
    if (graphRange) {
      [graphMin, graphMax] = graphRange;
    } else {
      [graphMin, graphMax] = calculateGraphBounds(ranges);
    }
  } else {
    [graphMin, graphMax] = calculateGraphBounds(ranges);
  }
  
  const status = determineStatus(value, ranges);
  const historicalData = parseHistoricalData(row, ranges, row.Unit);
  
  return {
    name: row.Biomarker_Name,
    unit: row.Unit,
    value,
    status,
    ranges,
    graphMin,
    graphMax,
    historicalData: historicalData.length > 0 ? historicalData : undefined,
  };
}
