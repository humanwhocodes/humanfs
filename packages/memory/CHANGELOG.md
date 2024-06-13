# Changelog

## [0.19.2](https://github.com/humanwhocodes/humanfs/compare/memory-v0.19.1...memory-v0.19.2) (2024-06-13)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.18.1 to ^0.18.2

## [0.19.1](https://github.com/humanwhocodes/humanfs/compare/memory-v0.19.0...memory-v0.19.1) (2024-06-12)


### Bug Fixes

* Add main entry to package.json files ([1092847](https://github.com/humanwhocodes/humanfs/commit/1092847563ef1f42e9625b3a98b537694f83ea62))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.18.0 to ^0.18.1
  * devDependencies
    * @humanfs/test bumped from ^0.14.0 to ^0.14.1

## [0.19.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.18.0...memory-v0.19.0) (2024-06-12)


### Features

* Add ID-based methods to MemoryHfsVolume + tests ([#114](https://github.com/humanwhocodes/humanfs/issues/114)) ([bb7045e](https://github.com/humanwhocodes/humanfs/commit/bb7045e7c277928d1d6fd78d687c14e8d801e690))
* Expose MemoryHfsVolume, add copyObject and moveObject ([#116](https://github.com/humanwhocodes/humanfs/issues/116)) ([ad00da4](https://github.com/humanwhocodes/humanfs/commit/ad00da42d4a34dacbc6cb429b3f82c4e10baae67))


### Bug Fixes

* Don't expose MemoryHfsVolume (yet) ([8ed5e2f](https://github.com/humanwhocodes/humanfs/commit/8ed5e2f7a459e937b9bb1967eee25b4c400f6e9d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.17.0 to ^0.18.0
  * devDependencies
    * @humanfs/types bumped from ^0.13.0 to ^0.14.0

## [0.18.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.17.1...memory-v0.18.0) (2024-03-20)


### ⚠ BREAKING CHANGES

* delete/deleteAll should not throw on ENOENT ([#105](https://github.com/humanwhocodes/humanfs/issues/105))

### Features

* delete/deleteAll should not throw on ENOENT ([#105](https://github.com/humanwhocodes/humanfs/issues/105)) ([b508df1](https://github.com/humanwhocodes/humanfs/commit/b508df19845f7a914895c13cfe47707c0cd1a7c7))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.16.1 to ^0.17.0
  * devDependencies
    * @humanfs/test bumped from ^0.13.0 to ^0.14.0
    * @humanfs/types bumped from ^0.12.0 to ^0.13.0

## [0.17.1](https://github.com/humanwhocodes/humanfs/compare/memory-v0.17.0...memory-v0.17.1) (2024-03-14)


### Bug Fixes

* **build:** Ensure correct JSR configs ([21c6a1b](https://github.com/humanwhocodes/humanfs/commit/21c6a1b94d086a469a823779456e7ad929993c6d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.16.0 to ^0.16.1

## [0.17.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.16.0...memory-v0.17.0) (2024-03-13)


### Features

* Add JSR packages ([83c3d9b](https://github.com/humanwhocodes/humanfs/commit/83c3d9b48cdcf961386dad768248bf3c6dade18b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.15.0 to ^0.16.0

## [0.16.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.15.0...memory-v0.16.0) (2024-03-13)


### Features

* Export Hfs from runtime packages ([#98](https://github.com/humanwhocodes/humanfs/issues/98)) ([4c55f85](https://github.com/humanwhocodes/humanfs/commit/4c55f853b930f6341e17c77ae85351a3ff33dc4e))

## [0.15.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.14.0...memory-v0.15.0) (2024-02-27)


### Features

* Add from() to Path; deprecate fromString() and fromURL() ([#94](https://github.com/humanwhocodes/humanfs/issues/94)) ([784f197](https://github.com/humanwhocodes/humanfs/commit/784f197e905fa70f4e346854a84a95ee0f36b564))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.14.0 to ^0.15.0

## [0.14.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.13.0...memory-v0.14.0) (2024-02-27)


### Features

* impl write() method only needs to handle Uint8Arrays ([#92](https://github.com/humanwhocodes/humanfs/issues/92)) ([68bcfb5](https://github.com/humanwhocodes/humanfs/commit/68bcfb59a6684b184c55f97536aad730636299b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.13.0 to ^0.14.0
  * devDependencies
    * @humanfs/test bumped from ^0.12.0 to ^0.13.0
    * @humanfs/types bumped from ^0.11.0 to ^0.12.0

## [0.13.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.12.0...memory-v0.13.0) (2024-02-23)


### Features

* Impls only need bytes() method to read data ([#90](https://github.com/humanwhocodes/humanfs/issues/90)) ([c0c3b36](https://github.com/humanwhocodes/humanfs/commit/c0c3b36413c8d10e63a94ad1cc6a5cead7b52e88))
* standard error classes ([#89](https://github.com/humanwhocodes/humanfs/issues/89)) ([c3e751c](https://github.com/humanwhocodes/humanfs/commit/c3e751c4fa6e646fa0768ecd9f897b38b411a36d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.12.0 to ^0.13.0
  * devDependencies
    * @humanfs/test bumped from ^0.11.0 to ^0.12.0
    * @humanfs/types bumped from ^0.10.0 to ^0.11.0

## [0.12.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.11.0...memory-v0.12.0) (2024-02-16)


### ⚠ BREAKING CHANGES

* Rewrite MemoryHfsImpl to support lastModified() ([#87](https://github.com/humanwhocodes/humanfs/issues/87))

### Features

* Rewrite MemoryHfsImpl to support lastModified() ([#87](https://github.com/humanwhocodes/humanfs/issues/87)) ([84e9812](https://github.com/humanwhocodes/humanfs/commit/84e98129e48acb3f2ea067b0ea745d591e8d8b91))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.11.0 to ^0.12.0
  * devDependencies
    * @humanfs/test bumped from ^0.10.0 to ^0.11.0
    * @humanfs/types bumped from ^0.9.0 to ^0.10.0

## [0.11.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.10.0...memory-v0.11.0) (2024-02-14)


### Features

* Add append() method ([#82](https://github.com/humanwhocodes/humanfs/issues/82)) ([ab7b978](https://github.com/humanwhocodes/humanfs/commit/ab7b978ff3be84dc3fd2fd4d6fa1131dfdec8134))
* Add move() and moveAll() methods ([#80](https://github.com/humanwhocodes/humanfs/issues/80)) ([85f100b](https://github.com/humanwhocodes/humanfs/commit/85f100b721c99b920b307779548c2a043e7e18b5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.10.0 to ^0.11.0
  * devDependencies
    * @humanfs/test bumped from ^0.9.0 to ^0.10.0
    * @humanfs/types bumped from ^0.8.0 to ^0.9.0

## [0.10.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.9.0...memory-v0.10.0) (2024-02-09)


### Features

* Add copyAll() method ([#77](https://github.com/humanwhocodes/humanfs/issues/77)) ([3c0852a](https://github.com/humanwhocodes/humanfs/commit/3c0852af99cb835b3941f58fdc2206e7b1179e21))


### Bug Fixes

* Writing files at the root. ([#75](https://github.com/humanwhocodes/humanfs/issues/75)) ([f978003](https://github.com/humanwhocodes/humanfs/commit/f978003a8b0e5c261dc9613695d1dbb53c399810))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.9.0 to ^0.10.0
  * devDependencies
    * @humanfs/test bumped from ^0.8.0 to ^0.9.0
    * @humanfs/types bumped from ^0.7.0 to ^0.8.0

## [0.9.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.8.0...memory-v0.9.0) (2024-02-08)


### Features

* Add copy() method ([#69](https://github.com/humanwhocodes/humanfs/issues/69)) ([f252bac](https://github.com/humanwhocodes/humanfs/commit/f252bac6692a5b5c973ee3c696f5190caa5f12c7))


### Bug Fixes

* MemoryHfsImpl without args should work ([b338a69](https://github.com/humanwhocodes/humanfs/commit/b338a69ef84f66e9a066b7a0e42c15049dc40fb3)), closes [#71](https://github.com/humanwhocodes/humanfs/issues/71)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.8.0 to ^0.9.0
  * devDependencies
    * @humanfs/test bumped from ^0.7.0 to ^0.8.0
    * @humanfs/types bumped from ^0.6.0 to ^0.7.0

## [0.8.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.7.0...memory-v0.8.0) (2024-02-07)


### Features

* Allow URL file and directory paths ([#62](https://github.com/humanwhocodes/humanfs/issues/62)) ([a767e37](https://github.com/humanwhocodes/humanfs/commit/a767e372287b1556c4c9e8bdb26c23ff81866f99))


### Bug Fixes

* Ensure list(".") works ([#68](https://github.com/humanwhocodes/humanfs/issues/68)) ([6245ea4](https://github.com/humanwhocodes/humanfs/commit/6245ea469cdc0a9aea29f980d277ac65aedc5085))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.7.0 to ^0.8.0
  * devDependencies
    * @humanfs/test bumped from ^0.6.1 to ^0.7.0
    * @humanfs/types bumped from ^0.5.1 to ^0.6.0

## [0.7.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.6.0...memory-v0.7.0) (2024-01-31)


### Features

* New Path class and refactors ([#58](https://github.com/humanwhocodes/humanfs/issues/58)) ([4ec3242](https://github.com/humanwhocodes/humanfs/commit/4ec3242024a52360a2314a1ffb286882ea1c18c1))


### Bug Fixes

* Order of exports and engines in package.json ([66204c2](https://github.com/humanwhocodes/humanfs/commit/66204c24bc2dd02380aa2fb3c5769ca2cf5238a7)), closes [#61](https://github.com/humanwhocodes/humanfs/issues/61)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.6.0 to ^0.7.0
  * devDependencies
    * @humanfs/test bumped from ^0.6.0 to ^0.6.1
    * @humanfs/types bumped from ^0.5.0 to ^0.5.1

## [0.6.0](https://github.com/humanwhocodes/humanfs/compare/memory-v0.5.0...memory-v0.6.0) (2024-01-30)


### ⚠ BREAKING CHANGES

* Rename fsx -> humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56))

### Features

* Rename fsx -&gt; humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56)) ([f5dc533](https://github.com/humanwhocodes/humanfs/commit/f5dc533c8a46d45afd7aad602af39a6074f8a07b))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.5.0 to ^0.6.0
  * devDependencies
    * @humanfs/test bumped from ^0.5.0 to ^0.6.0
    * @humanfs/types bumped from ^0.4.0 to ^0.5.0

## [0.5.0](https://github.com/humanwhocodes/fsx/compare/fsx-memory-v0.4.0...fsx-memory-v0.5.0) (2024-01-27)


### Features

* New size() method ([#51](https://github.com/humanwhocodes/fsx/issues/51)) ([ffd12e6](https://github.com/humanwhocodes/fsx/commit/ffd12e6b0db318320dd5a9dbb8eb248106d60afa))


### Bug Fixes

* **types:** correctly type `MemoryFsx` and `MemoryFsxImpl` constructors ([#48](https://github.com/humanwhocodes/fsx/issues/48)) ([5eaa655](https://github.com/humanwhocodes/fsx/commit/5eaa65513ad6b2b6c3ebdf1d0414299045d16e6c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.4.0 to ^0.5.0
  * devDependencies
    * fsx-test bumped from ^0.4.0 to ^0.5.0
    * fsx-types bumped from ^0.3.0 to ^0.4.0

## [0.4.0](https://github.com/humanwhocodes/fsx/compare/fsx-memory-v0.3.0...fsx-memory-v0.4.0) (2024-01-23)


### ⚠ BREAKING CHANGES

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37))

### Features

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37)) ([2e85142](https://github.com/humanwhocodes/fsx/commit/2e85142e34bdc3cc18e18aa0b051cc9007fca4b8))
* write() to accept ArrayBuffer views as file contents ([1fd5517](https://github.com/humanwhocodes/fsx/commit/1fd55174a528ef3dcbabc154347006bec799f3f9))


### Bug Fixes

* Ensure only appropriate bytes are written ([356957b](https://github.com/humanwhocodes/fsx/commit/356957bf5ebef086e1b9efedeecad182edfb6f10)), closes [#43](https://github.com/humanwhocodes/fsx/issues/43)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.3.0 to ^0.4.0
  * devDependencies
    * fsx-test bumped from ^0.3.0 to ^0.4.0
    * fsx-types bumped from ^0.2.0 to ^0.3.0

## [0.3.0](https://github.com/humanwhocodes/fsx/compare/fsx-memory-v0.2.0...fsx-memory-v0.3.0) (2024-01-19)


### Features

* Add list() method ([#25](https://github.com/humanwhocodes/fsx/issues/25)) ([dad841b](https://github.com/humanwhocodes/fsx/commit/dad841b7c9f5312996ff23db9be36774af985157))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.2.0 to ^0.3.0
  * devDependencies
    * fsx-test bumped from ^0.2.0 to ^0.3.0
    * fsx-types bumped from ^0.1.0 to ^0.2.0

## [0.2.0](https://github.com/humanwhocodes/fsx/compare/fsx-memory-v0.1.1...fsx-memory-v0.2.0) (2024-01-18)


### Features

* Add bytes() method, deprecate arrayBuffer() ([718c9c8](https://github.com/humanwhocodes/fsx/commit/718c9c84a0a1dcaef3cc032c882b1308e9cb3273))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.1.1 to ^0.2.0
  * devDependencies
    * fsx-test bumped from ^0.1.0 to ^0.2.0
    * fsx-types bumped from ^0.0.3 to ^0.1.0

## [0.1.1](https://github.com/humanwhocodes/fsx/compare/fsx-memory-v0.1.0...fsx-memory-v0.1.1) (2024-01-16)


### Bug Fixes

* **docs:** Correct package name of fsx-memory in README ([#4](https://github.com/humanwhocodes/fsx/issues/4)) ([92022c4](https://github.com/humanwhocodes/fsx/commit/92022c41e30ca7213e0de78093796308d5951ba1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.1.0 to ^0.1.1
  * devDependencies
    * fsx-types bumped from ^0.0.2 to ^0.0.3

## [0.1.0](https://github.com/humanwhocodes/fsx/compare/fsx-memory-v0.0.1...fsx-memory-v0.1.0) (2024-01-06)

### Features

-   **core:** Ensure write() validates file contents parameter. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **deno:** Remove write() parameter validation. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   Fsx class handles parameter validation ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))
-   **memory:** Remove unnecessary parameter check. ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))
-   **memory:** Remove write() paramater validation. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   Move parameter validation for write() to Fsx ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **node:** Remove unnecessary parameter check. ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))
-   **node:** Remove write() parameter validation. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **test:** Remove test for checking filePath is not a number. ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))

### Bug Fixes

-   **docs:** Correct package names in READMEs ([6c552ac](https://github.com/humanwhocodes/fsx/commit/6c552ac74542a245cdc2675101858da022336a1a))

### Dependencies

-   The following workspace dependencies were updated
    -   dependencies
        -   fsx-core bumped from ^0.0.0 to ^0.1.0
    -   devDependencies
        -   fsx-test bumped from ^0.0.0 to ^0.1.0
        -   fsx-types bumped from ^0.0.0 to ^0.0.2
