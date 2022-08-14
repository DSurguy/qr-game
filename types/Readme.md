This package now has to be built every time it changes.

When it just had types consumed, it was totally fine to get inlined. As soon as I added the enum, real constant values were being exported and used, and it now has to be compiled.