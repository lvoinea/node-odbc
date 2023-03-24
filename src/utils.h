#ifndef _SRC_UTILS_H
#define _SRC_UTILS_H

#include<sqltypes.h>

typedef struct Ucs2Str {
    std::unique_ptr<WCHAR[]> str;
    size_t length;
    bool valid;
    std::string error;
} Ucs2Str;

// Returns true is the user locale corresponds to a UTF-8 page
bool is_utf8_locale();

// Convert a UTF-8 buffer to UCS-2LE
Ucs2Str utf8_to_ucs2(char* inbuf);

// Convert a UCS-2LE buffer to UTF-8 (0 terminated)
int ucs2_to_utf8(char* inbuf, char* outbuf, size_t inbuf_len);

// Compute the number of code points in an UTF-8 string
size_t count_utf8_code_points(const char *s);

#endif

