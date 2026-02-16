// Client-side validation script
document.getElementById('peptideForm').addEventListener('submit', function (e) {
  const text = document.getElementById('peptides').value.trim();
  if (!text) {
    alert("Input cannot be empty.");
    e.preventDefault();
    return;
  }
  const validAminoAcids = "ACDEFGHIKLMNPQRSTVWY";
  const lines = text.split(/\r?\n/);
  let error = "";
  let header = null;
  let sequence = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith(">")) {
      // If we have a previous record, validate it first.
      if (header !== null) {
        if (sequence.length < 7) {
          error = "Sequence for " + header + " is too short. Must be at least 7 amino acids.";
          break;
        }
        for (let char of sequence.toUpperCase()) {
          if (!validAminoAcids.includes(char)) {
            error = "Sequence for " + header + " contains invalid characters.";
            break;
          }
        }
        if (error) break;
      }
      header = line; // new header found
      sequence = "";
    } else {
      sequence += line; // build up sequence lines
    }
  }
  // Validate the last record
  if (!error && header !== null) {
    if (sequence.length < 7) {
      error = "Sequence for " + header + " is too short. Must be at least 7 amino acids.";
    }
    for (let char of sequence.toUpperCase()) {
      if (!validAminoAcids.includes(char)) {
        error = "Sequence for " + header + " contains invalid characters.";
        break;
      }
    }
  } else if (header === null) {
    error = "Input does not appear to be in FASTA format. Each record must start with '>'";
  }
  if (error) {
    e.preventDefault();
    alert(error);
  }
});

// Event listener for the sample FASTA button
document.getElementById("loadSample").addEventListener("click", function () {
  fetch("/get_sample_fasta")
    .then(response => response.text())
    .then(data => {
      document.getElementById("peptides").value = data;
    })
    .catch(error => {
      console.error("Error loading sample FASTA:", error);
      alert("Could not load sample FASTA data.");
    });
});
