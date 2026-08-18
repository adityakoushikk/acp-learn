VALID_AMINO_ACIDS = frozenset("ACDEFGHIKLMNPQRSTVWY")
MIN_SEQUENCE_LENGTH = 7
MAX_HEADER_LENGTH = 200


class FastaValidationError(ValueError):
    """Raised when submitted FASTA data is unsafe or malformed."""


def normalize_fasta(
    text: str,
    *,
    max_records: int,
    max_sequence_length: int,
) -> tuple[str, list[str]]:
    """Validate FASTA input and return normalized text plus record names."""
    if not isinstance(text, str) or not text.strip():
        raise FastaValidationError("Input cannot be empty.")

    records: list[tuple[str, str]] = []
    current_name: str | None = None
    sequence_parts: list[str] = []

    def finish_record() -> None:
        if current_name is None:
            return

        sequence = "".join(sequence_parts).upper()
        if len(sequence) < MIN_SEQUENCE_LENGTH:
            raise FastaValidationError(
                f"Sequence for >{current_name} is too short. "
                f"Must be at least {MIN_SEQUENCE_LENGTH} amino acids."
            )
        if len(sequence) > max_sequence_length:
            raise FastaValidationError(
                f"Sequence for >{current_name} exceeds the "
                f"{max_sequence_length}-amino-acid limit."
            )

        invalid = sorted(set(sequence) - VALID_AMINO_ACIDS)
        if invalid:
            raise FastaValidationError(
                f"Sequence for >{current_name} contains invalid character "
                f"'{invalid[0]}'."
            )

        records.append((current_name, sequence))
        if len(records) > max_records:
            raise FastaValidationError(
                f"Input contains more than the {max_records}-peptide limit."
            )

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        line = raw_line.strip()
        if not line:
            continue

        if line.startswith(">"):
            finish_record()
            current_name = line[1:].strip()
            sequence_parts = []
            if not current_name:
                raise FastaValidationError(
                    f"FASTA header on line {line_number} must include a name."
                )
            if len(current_name) > MAX_HEADER_LENGTH:
                raise FastaValidationError(
                    f"FASTA header on line {line_number} exceeds "
                    f"{MAX_HEADER_LENGTH} characters."
                )
        else:
            if current_name is None:
                raise FastaValidationError(
                    f"Sequence data on line {line_number} appears before a FASTA header."
                )
            sequence_parts.append(line)

    if current_name is None:
        raise FastaValidationError(
            "Input does not appear to be in FASTA format. "
            "Each record must start with '>'."
        )

    finish_record()
    normalized = "".join(f">{name}\n{sequence}\n" for name, sequence in records)
    return normalized, [name for name, _sequence in records]
