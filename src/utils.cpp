#include <locale.h>
#include <langinfo.h>
#include <sstream> 
#include <iconv.h>

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

int utf8_to_utf16(char* inbuf, char* outbuf) {

    // Source: https://www.ibm.com/docs/en/zos/2.2.0?topic=functions-iconv-code-conversion
    // WARNING: mind the reverse source/target parameters in iconv_open

    char   *inptr;  /* Pointer used for input buffer  */
    char   *outptr; /* Pointer used for output buffer */

    iconv_t cd;     /* conversion descriptor          */
    size_t inleft; /* number of bytes left in inbuf  */
    size_t outleft;/* number of bytes left in outbuf */
    int rc;     /* return code of iconv()         */


    if ((cd = iconv_open("UTF-16LE", "UTF-8")) == (iconv_t)(-1)) {
        fprintf(stderr, "Cannot open converter\n");
        exit(8);
    }

    inleft = strlen(inbuf);
    outleft = inleft*2;    
    inptr = (char*)inbuf;
    outptr = (char*)outbuf;

    rc = iconv(cd, &inptr, &inleft, &outptr, &outleft);
    if (rc == -1) {
        fprintf(stderr, "Error converting UTF-8 to UTF-16LE.\n");
    }
    iconv_close(cd);

    return rc;
}

int utf16_to_utf8(char* inbuf, char* outbuf, size_t inbuf_len) {

    char   *inptr;  /* Pointer used for input buffer  */
    char   *outptr; /* Pointer used for output buffer */

    iconv_t cd;     /* conversion descriptor          */
    size_t inleft; /* number of bytes left in inbuf  */
    size_t outleft;/* number of bytes left in outbuf */
    int rc;     /* return code of iconv()         */


    if ((cd = iconv_open("UTF-8", "UTF-16LE")) == (iconv_t)(-1)) {
        fprintf(stderr, "Cannot open converter\n");
        exit(8);
    }

    inleft = inbuf_len*2;
    outleft = inbuf_len*2+1;
    inptr = (char*)inbuf;
    outptr = (char*)outbuf;

    rc = iconv(cd, &inptr, &inleft, &outptr, &outleft);
    if (rc == -1) {
        fprintf(stderr, "Error converting UTF-16LE to UTF-8.\n");
    } 
    iconv_close(cd);

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
