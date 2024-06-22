{
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
    output = "["
    for (i = 0; i < length(letters); i++) {
        letter = letters[i + 1]
        output = output counts[letter]
        if (i < length(letters) - 1) {
            output = output ", "
        }
    }
    output = output "]"
    print output

    # Clear the counts array for the next line
    delete counts
}
