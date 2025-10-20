// Helper function to convert Excel serial date to JavaScript Date
export function excelSerialToDate(serial: number): Date {
  // Excel epoch starts at 1900-01-01, but Excel incorrectly treats 1900 as a leap year
  // Excel dates > 59 (after Feb 28, 1900) are off by 1 day due to this bug
  // We need to subtract 2 from the serial: 1 for the bug, 1 for the epoch offset
  const adjustedSerial = serial > 59 ? serial - 2 : serial - 1;

  // Use UTC to avoid timezone offset issues
  const epoch = Date.UTC(1900, 0, 1); // January 1, 1900 UTC (day 1 in Excel)
  return new Date(epoch + adjustedSerial * 86400000); // 86400000 ms = 1 day
}

// Helper function to parse birthday field (string or Excel serial number)
export function parseBirthday(birthday: string | number | undefined): Date | null {
  if (!birthday) return null;

  // If it's a number, it's an Excel serial date
  if (typeof birthday === 'number') {
    return excelSerialToDate(birthday);
  }

  // If it's a string, try to parse it
  const parsed = new Date(birthday);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Helper function to parse score (string or number)
export function parseScore(score: string | number | undefined): number | undefined {
  if (score === undefined || score === null || score === '') return undefined;

  const parsed = typeof score === 'string' ? parseInt(score, 10) : score;
  return isNaN(parsed) ? undefined : parsed;
}

// Helper function to parse and normalize multiple chronotypes
// Supports formats: "Lion (Bear)", "Lion, Bear", "Lion/Bear"
export function parseChronotypes(chronotypeString: string): ('Lion' | 'Bear' | 'Wolf' | 'Dolphin')[] {
  if (!chronotypeString || !chronotypeString.trim()) {
    return [];
  }

  // Remove parentheses and split by commas, slashes, or spaces
  const cleaned = chronotypeString.replace(/[()]/g, ' ');
  const parts = cleaned.split(/[,/\s]+/).filter(p => p.trim());

  const validTypes: ('Lion' | 'Bear' | 'Wolf' | 'Dolphin')[] = [];
  const typeMap: Record<string, 'Lion' | 'Bear' | 'Wolf' | 'Dolphin'> = {
    lion: 'Lion',
    bear: 'Bear',
    wolf: 'Wolf',
    dolphin: 'Dolphin',
  };

  for (const part of parts) {
    const normalized = part.trim().toLowerCase();
    if (typeMap[normalized]) {
      validTypes.push(typeMap[normalized]);
    }
  }

  return validTypes;
}
