/**
 * https://ideone.com/vf7Rpl
 * https://stackoverflow.com/questions/38340871/efficient-algorithm-for-phrase-anagrams
 */

#include <iostream>
#include <string>
#include <vector>

using namespace std;

// assume we only work with lowercase letters from a to z

string words[] = {"pea", "nut", "butter", "peanut", "a", "but", "ten", "erupt"};
const int WORD_COUNT = sizeof(words)/sizeof(words[0]);
const int NUM_CHARS = 'z' - 'a' + 1;
const int OTHER_CHARS = NUM_CHARS;

typedef int OccurrenceCount[NUM_CHARS + 1];
typedef int BitMask;

const BitMask ONLY_OTHER_CHARS = (1 << OTHER_CHARS);

BitMask words_bm[WORD_COUNT];
typedef vector<string> ResultType;
ResultType anagramWords = ResultType();

// return a number in range 0..NUM_CHARS
// OTHER_CHARS is a special code for characters not in 'a'..'z'
inline int charCode(char c) {
	unsigned int code = c - 'a';
	return code > NUM_CHARS ? OTHER_CHARS : code;
}

// BitMask = a bit mask of which characters exists in a string
// it can be used as a quick word filter, 
// i.e if a word contains character(s) which are not in the input string,
// then it cannot be a word in the anagram
BitMask getBitMask(const string& s) {
	BitMask result = ONLY_OTHER_CHARS;		// as we don't care about other characters, always set its bit to 1
	for (string::const_iterator iter = s.begin(); iter != s.end(); ++iter) {
		result |= (1 << charCode(*iter));
	}
	return result;
}

BitMask getBitMask(const OccurrenceCount& oc) {
	BitMask result = ONLY_OTHER_CHARS;		// as we don't care about other characters, always set its bit to 1
	for (int i = 0; i < NUM_CHARS; ++i) {
		if (oc[i]) result |= (1 << i);
	}
	return result;
}

void getOccurrenceCount(const string& s, OccurrenceCount& oc, bool zeroFill = true) {
	if (zeroFill) std::fill(oc, oc + NUM_CHARS, 0);
	for (string::const_iterator iter = s.begin(); iter != s.end(); ++iter) {
		++oc[charCode(*iter)];
	}
}

void init()
{
	for (int i = 0; i < WORD_COUNT; ++i) {
		words_bm[i] = getBitMask(words[i]);
	}
}

void printOC(const OccurrenceCount& oc)
{
	for (int i = 0; i <= NUM_CHARS; ++i) {
		if (oc[i] == 0) continue;
		cout << char('a' + i) << ": " << oc[i] << ", ";
	}
	cout << endl;
}

void findAnagram(OccurrenceCount& oc, int startIndex = 0)
{
//	printOC(oc);
	BitMask bitmask = getBitMask(oc);
	if (bitmask == ONLY_OTHER_CHARS) {	// now the character pool is empty, i.e we have found an anagram
	    for (ResultType::iterator iter = anagramWords.begin(); iter != anagramWords.end(); ++iter)
	    	cout << *iter << " ";
	    cout << endl;
		return;
	}
	
	for (; startIndex < WORD_COUNT; ++startIndex) {
		// filter words that contain characters not in input
		if ((bitmask | words_bm[startIndex]) != bitmask) continue;
		
		const string& word = words[startIndex];
		
		// update <oc> to exclude characters in <word>
		bool wordOk = true;
		for (string::const_iterator iter = word.begin(); iter != word.end(); ++iter) {
			if (--oc[charCode(*iter)] < 0) wordOk = false; 	// the character pool cannot allocate this word
		}
		
		if (wordOk) {
			//cout << "-word: " << word << endl;
			anagramWords.push_back(word);
			findAnagram(oc, startIndex);
			// return the anagramWords to its original state
			anagramWords.pop_back();
		}
		// as with any backtracking algorithm, we have to recover the global states, in this case <oc>
		for (string::const_iterator iter = word.begin(); iter != word.end(); ++iter) {
			++oc[charCode(*iter)];
		}
	}
}

int main() {
	init();
	
	string inputString = "peanutbutterpeanutbutter";
	OccurrenceCount oc = {0};
	getOccurrenceCount(inputString, oc, false);
	findAnagram(oc, 0);
	
	return 0;
}
