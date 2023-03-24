#include <locale.h>
#include <langinfo.h>
#include <sstream> 
#include <iconv.h>
#include <errno.h>

#include "utils.h"

bool is_utf8_locale() {    
    setlocale(LC_ALL, "");    
    std::locale loc;
    std::string langInfo = nl_langinfo(CODESET);
    std::stringstream ss;
    for(auto elem : langInfo){
      ss << std::tolower(elem,loc);
    }
    return (ss.str().compare("utf-8") == 0);
}

void display_buffer(const unsigned char* buffer, size_t size) {
    for (size_t i=0; i<size; i++){
        printf("%02X:", buffer[i]);
    }
    printf("\n");
}

Ucs2Str utf8_to_ucs2(char* inbuf) {

    // UNICODE suport in ODBC is limitted to UCS-2
    // https://learn.microsoft.com/en-us/sql/odbc/reference/develop-app/unicode?redirectedfrom=MSDN&view=sql-server-ver16

    // Source: https://www.ibm.com/docs/en/zos/2.2.0?topic=functions-iconv-code-conversion
    // WARNING: mind the reverse source/target parameters in iconv_open


    Ucs2Str result { nullptr, 0, true, ""};    
    if (inbuf != nullptr) {
        result.length = count_utf8_code_points((const char*)inbuf);
        result.str = std::unique_ptr<WCHAR[]>(new WCHAR[result.length]);        
    } 
    else {
        return result;
    }
    
    char   *inptr;  // Pointer used for input buffer
    char   *outptr; // Pointer used for output buffer

    iconv_t cd;
    size_t inleft;  // number of bytes left in inbuf
    size_t outleft; // number of bytes left in outbuf
    int rc;

    if ((cd = iconv_open("UCS-2LE", "UTF-8")) == (iconv_t)(-1)) {
        result.valid = false;
        result.error = "Cannot open UCS-2 converter. ";
        return result;
        
    }

    inleft = strlen(inbuf);
    outleft = result.length*2;  // In UCS-2 each code point is store in 2 bytes
    inptr = (char*)inbuf;
    outptr = (char*)result.str.get();

    rc = iconv(cd, &inptr, &inleft, &outptr, &outleft);
    if (rc == -1) {
        result.valid = false;
        result.error = "Error converting UTF-8 to UCS-2LE. ";
    }
    iconv_close(cd);

    // Verify conversion
    // This is needed as iconv does not report when it does character replacement
    // for characters that are not available in the destination format.
    
    char inbuf_rebuilt[strlen(inbuf)+1]; // Account for temination char
    ucs2_to_utf8((char*)result.str.get(), inbuf_rebuilt, result.length);
    if (strcmp(inbuf, inbuf_rebuilt) != 0) {
        result.valid = false;
        result.error = "Input string is not UCS-2 compatible. ";
    }    
    
    /*
    // Debug helper
    printf("Comparison: %d\n", strcmp(inbuf, inbuf_rebuilt));
    printf("Input: [%s] - len: %d \n", inbuf, strlen(inbuf));
    printf("Input check: [%s] - len: %d\n", inbuf_rebuilt, strlen(inbuf_rebuilt));
    printf("Input size: %d; Output size: %d\n", strlen(inbuf), result.length);
    display_buffer((unsigned char*)result.str.get(), result.length*2);
    */  

    return result;
}

int ucs2_to_utf8(char* inbuf, char* outbuf, size_t inbuf_len) {

    char   *inptr;  /* Pointer used for input buffer  */
    char   *outptr; /* Pointer used for output buffer */

    iconv_t cd;     /* conversion descriptor          */
    size_t inleft; /* number of bytes left in inbuf  */
    size_t outleft;/* number of bytes left in outbuf */
    int rc;     /* return code of iconv()         */


    if ((cd = iconv_open("UTF-8", "UCS-2LE")) == (iconv_t)(-1)) {
        fprintf(stderr, "Cannot open UCS-2 converter\n");
        return -1;
    }

    inleft = inbuf_len*2;
    outleft = inbuf_len*2+1; // Worst case approximation
    inptr = (char*)inbuf;
    outptr = (char*)outbuf;

    rc = iconv(cd, &inptr, &inleft, &outptr, &outleft);
    if (rc == -1) {
        fprintf(stderr, "Error converting UCS-2LE to UTF-8.\n");
    } 
    iconv_close(cd);

    // Add 0 termination
    size_t out_len = inbuf_len*2+1 - outleft;
    outbuf[out_len] = 0;

    return rc;
}

size_t count_utf8_code_points(const char *s) {
    
    //Source: https://stackoverflow.com/questions/32936646/getting-the-string-length-on-utf-8-in-c

    size_t count = 0;
    while (*s) {
        count += (*s++ & 0xC0) != 0x80;
    }
    return count;
}
