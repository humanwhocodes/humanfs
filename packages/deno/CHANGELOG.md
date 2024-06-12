# Changelog

## [0.16.2](https://github.com/humanwhocodes/humanfs/compare/deno-v0.16.1...deno-v0.16.2) (2024-06-12)


### Bug Fixes

* Add main entry to package.json files ([1092847](https://github.com/humanwhocodes/humanfs/commit/1092847563ef1f42e9625b3a98b537694f83ea62))

## [0.16.1](https://github.com/humanwhocodes/humanfs/compare/deno-v0.16.0...deno-v0.16.1) (2024-06-12)


### Bug Fixes

* **deps:** update dependency @humanwhocodes/retry to ^0.3.0 ([#113](https://github.com/humanwhocodes/humanfs/issues/113)) ([c6b42f5](https://github.com/humanwhocodes/humanfs/commit/c6b42f5063ef90459daa4dd1d19bcefc7d9a0e86))

## [0.16.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.15.2...deno-v0.16.0) (2024-03-20)


### ⚠ BREAKING CHANGES

* delete/deleteAll should not throw on ENOENT ([#105](https://github.com/humanwhocodes/humanfs/issues/105))

### Features

* delete/deleteAll should not throw on ENOENT ([#105](https://github.com/humanwhocodes/humanfs/issues/105)) ([b508df1](https://github.com/humanwhocodes/humanfs/commit/b508df19845f7a914895c13cfe47707c0cd1a7c7))


### Bug Fixes

* Deno runtime package JSR deploy ([ea2d8f3](https://github.com/humanwhocodes/humanfs/commit/ea2d8f399b385735b1d36e7796767b4518b44a2f))

## [0.15.2](https://github.com/humanwhocodes/humanfs/compare/deno-v0.15.1...deno-v0.15.2) (2024-03-14)


### Bug Fixes

* **build:** Ensure correct JSR configs ([21c6a1b](https://github.com/humanwhocodes/humanfs/commit/21c6a1b94d086a469a823779456e7ad929993c6d))

## [0.15.1](https://github.com/humanwhocodes/humanfs/compare/deno-v0.15.0...deno-v0.15.1) (2024-03-13)


### Bug Fixes

* package.json/deno.json conflict ([1a6f13b](https://github.com/humanwhocodes/humanfs/commit/1a6f13b4d58c1458e726b036868018428314b232))

## [0.15.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.14.0...deno-v0.15.0) (2024-03-13)


### Features

* Add JSR package ([#100](https://github.com/humanwhocodes/humanfs/issues/100)) ([7718643](https://github.com/humanwhocodes/humanfs/commit/7718643d8bc7eb8c4777b597837e135352e6b32b))
* Export Hfs from runtime packages ([#98](https://github.com/humanwhocodes/humanfs/issues/98)) ([4c55f85](https://github.com/humanwhocodes/humanfs/commit/4c55f853b930f6341e17c77ae85351a3ff33dc4e))

## [0.14.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.13.0...deno-v0.14.0) (2024-02-27)


### Features

* impl write() method only needs to handle Uint8Arrays ([#92](https://github.com/humanwhocodes/humanfs/issues/92)) ([68bcfb5](https://github.com/humanwhocodes/humanfs/commit/68bcfb59a6684b184c55f97536aad730636299b5))

## [0.13.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.12.0...deno-v0.13.0) (2024-02-23)


### Features

* Impls only need bytes() method to read data ([#90](https://github.com/humanwhocodes/humanfs/issues/90)) ([c0c3b36](https://github.com/humanwhocodes/humanfs/commit/c0c3b36413c8d10e63a94ad1cc6a5cead7b52e88))

## [0.12.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.11.0...deno-v0.12.0) (2024-02-16)


### ⚠ BREAKING CHANGES

* Rewrite MemoryHfsImpl to support lastModified() ([#87](https://github.com/humanwhocodes/humanfs/issues/87))

### Features

* Add lastModified() method ([#84](https://github.com/humanwhocodes/humanfs/issues/84)) ([9cbcd03](https://github.com/humanwhocodes/humanfs/commit/9cbcd03c86e4c1bed5985e10da6ab452e8c2b44c))
* Rewrite MemoryHfsImpl to support lastModified() ([#87](https://github.com/humanwhocodes/humanfs/issues/87)) ([84e9812](https://github.com/humanwhocodes/humanfs/commit/84e98129e48acb3f2ea067b0ea745d591e8d8b91))

## [0.11.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.10.0...deno-v0.11.0) (2024-02-14)


### Features

* Add append() method ([#82](https://github.com/humanwhocodes/humanfs/issues/82)) ([ab7b978](https://github.com/humanwhocodes/humanfs/commit/ab7b978ff3be84dc3fd2fd4d6fa1131dfdec8134))
* Add move() and moveAll() methods ([#80](https://github.com/humanwhocodes/humanfs/issues/80)) ([85f100b](https://github.com/humanwhocodes/humanfs/commit/85f100b721c99b920b307779548c2a043e7e18b5))

## [0.10.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.9.0...deno-v0.10.0) (2024-02-09)


### Features

* Add copyAll() method ([#77](https://github.com/humanwhocodes/humanfs/issues/77)) ([3c0852a](https://github.com/humanwhocodes/humanfs/commit/3c0852af99cb835b3941f58fdc2206e7b1179e21))

## [0.9.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.8.0...deno-v0.9.0) (2024-02-08)


### Features

* Add copy() method ([#69](https://github.com/humanwhocodes/humanfs/issues/69)) ([f252bac](https://github.com/humanwhocodes/humanfs/commit/f252bac6692a5b5c973ee3c696f5190caa5f12c7))

## [0.8.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.7.1...deno-v0.8.0) (2024-02-07)


### Features

* Allow URL file and directory paths ([#62](https://github.com/humanwhocodes/humanfs/issues/62)) ([a767e37](https://github.com/humanwhocodes/humanfs/commit/a767e372287b1556c4c9e8bdb26c23ff81866f99))


### Bug Fixes

* Ensure list(".") works ([#68](https://github.com/humanwhocodes/humanfs/issues/68)) ([6245ea4](https://github.com/humanwhocodes/humanfs/commit/6245ea469cdc0a9aea29f980d277ac65aedc5085))

## [0.7.1](https://github.com/humanwhocodes/humanfs/compare/deno-v0.7.0...deno-v0.7.1) (2024-01-31)


### Bug Fixes

* Order of exports and engines in package.json ([66204c2](https://github.com/humanwhocodes/humanfs/commit/66204c24bc2dd02380aa2fb3c5769ca2cf5238a7)), closes [#61](https://github.com/humanwhocodes/humanfs/issues/61)

## [0.7.0](https://github.com/humanwhocodes/humanfs/compare/deno-v0.6.0...deno-v0.7.0) (2024-01-30)


### ⚠ BREAKING CHANGES

* Rename fsx -> humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56))

### Features

* Rename fsx -&gt; humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56)) ([f5dc533](https://github.com/humanwhocodes/humanfs/commit/f5dc533c8a46d45afd7aad602af39a6074f8a07b))

## [0.6.0](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.5.0...fsx-deno-v0.6.0) (2024-01-27)


### Features

* New size() method ([#51](https://github.com/humanwhocodes/fsx/issues/51)) ([ffd12e6](https://github.com/humanwhocodes/fsx/commit/ffd12e6b0db318320dd5a9dbb8eb248106d60afa))

## [0.5.0](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.4.0...fsx-deno-v0.5.0) (2024-01-23)


### ⚠ BREAKING CHANGES

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37))

### Features

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37)) ([2e85142](https://github.com/humanwhocodes/fsx/commit/2e85142e34bdc3cc18e18aa0b051cc9007fca4b8))
* write() to accept ArrayBuffer views as file contents ([1fd5517](https://github.com/humanwhocodes/fsx/commit/1fd55174a528ef3dcbabc154347006bec799f3f9))


### Bug Fixes

* Ensure only appropriate bytes are written ([356957b](https://github.com/humanwhocodes/fsx/commit/356957bf5ebef086e1b9efedeecad182edfb6f10)), closes [#43](https://github.com/humanwhocodes/fsx/issues/43)

## [0.4.0](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.3.0...fsx-deno-v0.4.0) (2024-01-19)


### Features

* Add list() method ([#25](https://github.com/humanwhocodes/fsx/issues/25)) ([dad841b](https://github.com/humanwhocodes/fsx/commit/dad841b7c9f5312996ff23db9be36774af985157))

## [0.3.0](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.2.0...fsx-deno-v0.3.0) (2024-01-18)


### Features

* Add bytes() method, deprecate arrayBuffer() ([718c9c8](https://github.com/humanwhocodes/fsx/commit/718c9c84a0a1dcaef3cc032c882b1308e9cb3273))

## [0.2.0](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.1.1...fsx-deno-v0.2.0) (2024-01-17)


### Features

* Add EMFILE/ENFILE retry ([c2db624](https://github.com/humanwhocodes/fsx/commit/c2db624f974e111017a3783ac8d4ea9a4a3a87e6))

## [0.1.1](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.1.0...fsx-deno-v0.1.1) (2024-01-16)


### Bug Fixes

* Ensure isFile/isDirectory rethrow non-ENOENT errors. ([d31ee56](https://github.com/humanwhocodes/fsx/commit/d31ee56788e898cbc1fc0d6a54d1551f9b17cd45)), closes [#14](https://github.com/humanwhocodes/fsx/issues/14)

## [0.1.0](https://github.com/humanwhocodes/fsx/compare/fsx-deno-v0.0.1...fsx-deno-v0.1.0) (2024-01-06)

### Features

-   **core:** Ensure write() validates file contents parameter. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **deno:** Remove write() parameter validation. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **memory:** Remove write() paramater validation. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   Move parameter validation for write() to Fsx ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **node:** Remove write() parameter validation. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))

### Bug Fixes

-   **docs:** Correct package names in READMEs ([6c552ac](https://github.com/humanwhocodes/fsx/commit/6c552ac74542a245cdc2675101858da022336a1a))
