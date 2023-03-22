#ifndef _SRC_UTILS_H
#define _SRC_UTILS_H

// Returns true is the user locale corresponds to a UTF-8 page
bool is_utf8_locale();

// Convert a UTF-8 buffer to UTF-16LE
int utf8_to_utf16(char* inbuf, char* outbuf);

// Convert a UTF-16LE buffer to UTF-8
int utf16_to_utf8(char* inbuf, char* outbuf, size_t inbuf_len);

// Compute the number of code points in an UTF-8 string
size_t count_utf8_code_points(const char *s);

#endif

