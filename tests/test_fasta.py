import unittest

from backend.fasta import FastaValidationError, normalize_fasta


class NormalizeFastaTests(unittest.TestCase):
    def normalize(self, text: str):
        return normalize_fasta(text, max_records=2, max_sequence_length=50)

    def test_normalizes_multiline_lowercase_sequences(self):
        normalized, names = self.normalize(">peptide one\nacdef\nghi\n")

        self.assertEqual(normalized, ">peptide one\nACDEFGHI\n")
        self.assertEqual(names, ["peptide one"])

    def test_rejects_sequence_without_header(self):
        with self.assertRaisesRegex(FastaValidationError, "before a FASTA header"):
            self.normalize("ACDEFGHI")

    def test_rejects_invalid_amino_acid(self):
        with self.assertRaisesRegex(FastaValidationError, "invalid character 'X'"):
            self.normalize(">bad\nACDEFGX\n")

    def test_rejects_too_many_records(self):
        fasta = ">one\nACDEFGH\n>two\nACDEFGH\n>three\nACDEFGH\n"

        with self.assertRaisesRegex(FastaValidationError, "2-peptide limit"):
            self.normalize(fasta)


if __name__ == "__main__":
    unittest.main()
