import sys

# Define file paths
file1 = "google-10000-english-usa.txt"
file2 = "words_alpha.txt"

# Load words from both files into sets
def load_words(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return set(line.strip() for line in file)

# Load the words
words_file1 = load_words(file1)
words_file2 = load_words(file2)

# Compute the set difference
missing_words = words_file1 - words_file2

# Output missing words
output_file = "missing_words.txt"
with open(output_file, 'w', encoding='utf-8') as output:
    for word in sorted(missing_words):
        output.write(word + "\n")

print(f"Missing words written to {output_file}")
if len(sys.argv) != 4:
    print("Usage: python set_diff.py <file1> <file2> <output_file>")
    sys.exit(1)

file1 = sys.argv[1]
file2 = sys.argv[2]
output_file = sys.argv[3]

# Load the words
words_file1 = load_words(file1)
words_file2 = load_words(file2)

# Compute the set difference
missing_words = words_file1 - words_file2

# Output missing words
with open(output_file, 'w', encoding='utf-8') as output:
    for word in sorted(missing_words):
        output.write(word + "\n")

print(f"Missing words written to {output_file}")