import axios from 'axios';
import Papa from 'papaparse';
import { ParsedCSVRow } from './types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1zjJQokNREZWuQftsGlMLJ8F9esi1Ti979mWl3aHLBR4/export?format=csv';

async function fetchFromGoogleSheets(): Promise<ParsedCSVRow[]> {
  try {
    const url = `${CSV_URL}&t=${Date.now()}`;
    const response = await axios.get<string>(url, {
      timeout: 15000,
      headers: {
        'Cache-Control': 'no-cache',
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    if (!response.data || response.data.trim().length === 0) {
      throw new Error('Empty response from CSV URL');
    }

    if (response.data.includes('<HTML>') || response.data.includes('<html>')) {
      throw new Error('Received HTML instead of CSV. The Google Sheets URL may be incorrect or the sheet may not be publicly accessible.');
    }

    return new Promise((resolve, reject) => {
      Papa.parse<ParsedCSVRow>(response.data, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          return header.trim();
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV Parse errors:', results.errors);
          }
          
          const validData = results.data.filter((row: any) => {
            const name = row.Biomarker_Name || row['Biomaker Name'];
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
              return false;
            }
            const trimmedName = name.trim();
            if (trimmedName.includes('Graph Value') || trimmedName.toLowerCase().includes('value:')) {
              return false;
            }
            return true;
          });
          
          if (validData.length === 0) {
            reject(new Error('No valid data rows found in CSV'));
          }
          
          console.log('Parsed CSV rows:', results.data.length, 'total,', validData.length, 'valid');
          console.log('CSV headers:', results.meta.fields);
          
          resolve(validData);
        },
        error: (error: Error) => {
          console.error('PapaParse error:', error);
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        },
      });
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please check your internet connection.');
      }
      if (error.response) {
        if (error.response.status === 403) {
          throw new Error('Access denied. The Google Sheet may not be publicly accessible.');
        }
        if (error.response.status === 404) {
          throw new Error('CSV file not found. Please check the Google Sheets URL.');
        }
        throw new Error(`Failed to fetch data: ${error.response.status} ${error.response.statusText}`);
      }
      if (error.request) {
        throw new Error('No response from server. Please check your internet connection.');
      }
      throw new Error('Connection failed. Please check your internet connection.');
    }
    throw error;
  }
}

async function fetchFromLocalFile(): Promise<ParsedCSVRow[]> {
  try {
    const response = await fetch('/biomarkers.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse<ParsedCSVRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('Local CSV Parse errors:', results.errors);
          }
          
          const validData = results.data.filter((row: any) => {
            const name = row.Biomarker_Name || row['Biomaker Name'];
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
              return false;
            }
            const trimmedName = name.trim();
            if (trimmedName.includes('Graph Value') || trimmedName.toLowerCase().includes('value:')) {
              return false;
            }
            return true;
          });
          
          if (validData.length === 0) {
            reject(new Error('No valid data rows found in local CSV'));
          }
          
          console.log('Local CSV parsed:', results.data.length, 'total,', validData.length, 'valid rows');
          resolve(validData);
        },
        error: (error: Error) => reject(error),
      });
    });
  } catch (error) {
    throw new Error(`Failed to load local CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchBiomarkerData(): Promise<ParsedCSVRow[]> {
  let googleSheetsData: ParsedCSVRow[] | null = null;
  
  try {
    googleSheetsData = await fetchFromGoogleSheets();
    
    const hasMetabolic = googleSheetsData.some(row => {
      const name = (row.Biomarker_Name || (row as any)['Biomaker Name'])?.trim();
      return name === 'Metabolic Health Score' || (name?.startsWith('Metabolic') && !name.includes('Graph'));
    });
    
    const hasCreatine = googleSheetsData.some(row => {
      const name = (row.Biomarker_Name || (row as any)['Biomaker Name'])?.trim();
      return name === 'Creatine' || name === 'Creatinine' || (name?.toLowerCase().includes('creatin') && !name.includes('Graph'));
    });
    
    if (hasMetabolic && hasCreatine) {
      console.log('Google Sheets has all required biomarkers');
      return googleSheetsData;
    } else {
      console.warn(`Google Sheets missing required biomarkers. Has Metabolic: ${hasMetabolic}, Has Creatine: ${hasCreatine}. Trying local file...`);
      throw new Error('Required biomarkers not found in Google Sheets');
    }
  } catch (error) {
    console.warn('Failed to fetch from Google Sheets or missing data, trying local file:', error);
    try {
      const localData = await fetchFromLocalFile();
      console.log('Successfully loaded from local CSV file');
      return localData;
    } catch (localError) {
      if (googleSheetsData && googleSheetsData.length > 0) {
        console.warn('Using Google Sheets data despite missing some biomarkers');
        return googleSheetsData;
      }
      throw new Error(`Failed to fetch data from both Google Sheets and local file. Google Sheets error: ${error instanceof Error ? error.message : 'Unknown'}. Local file error: ${localError instanceof Error ? localError.message : 'Unknown'}`);
    }
  }
}
