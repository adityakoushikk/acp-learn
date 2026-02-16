const VALID_AMINO_ACIDS = "ACDEFGHIKLMNPQRSTVWY";

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateFasta(text: string): ValidationResult {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: "Input cannot be empty." };
  }

  const lines = trimmed.split(/\r?\n/);
  let header: string | null = null;
  let sequence = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith(">")) {
      // Validate the previous record before starting a new one
      if (header !== null) {
        const result = validateRecord(header, sequence);
        if (!result.valid) return result;
      }
      header = line;
      sequence = "";
    } else {
      sequence += line;
    }
  }

  // Validate the last record
  if (header === null) {
    return {
      valid: false,
      error:
        "Input does not appear to be in FASTA format. Each record must start with '>'.",
    };
  }

  return validateRecord(header, sequence);
}

function validateRecord(header: string, sequence: string): ValidationResult {
  if (sequence.length < 7) {
    return {
      valid: false,
      error: `Sequence for ${header} is too short. Must be at least 7 amino acids.`,
    };
  }

  for (const char of sequence.toUpperCase()) {
    if (!VALID_AMINO_ACIDS.includes(char)) {
      return {
        valid: false,
        error: `Sequence for ${header} contains invalid character '${char}'. Valid amino acids: ${VALID_AMINO_ACIDS}`,
      };
    }
  }

  return { valid: true, error: null };
}
