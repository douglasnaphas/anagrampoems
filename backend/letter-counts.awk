BEGIN {
  printf("{")
}
{
    # Remove carriage returns so appending to output doesn't overwrite
    gsub(/\r/, "")

    if(NR == 1) {
      output = "\n  "
    }
    else {
      output = ",\n  "
    }

    output = output "\"" $0 "\": "

    # Initialize an array to count occurrences of each letter
    split("abcdefghijklmnopqrstuvwxyz", letters, "")
    for (i = 1; i <= length(letters); i++) {
        counts[letters[i]] = 0
    }

    # Count occurrences of each letter in the line
    for (i = 1; i <= length($0); i++) {
        char = substr($0, i, 1)
        if (char in counts) {
            counts[char]++
        }
    }

    # Print the counts array
    output = output "["
    for (i = 0; i < length(letters); i++) {
        letter = letters[i + 1]
        output = output counts[letter]
        if (i < length(letters) - 1) {
            output = output ", "
        }
    }
    output = output "]"
    printf("%s", output)

    # Clear the counts array for the next line
    delete counts
}
END {
  printf("\n}\n")
}
