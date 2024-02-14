# Changelog

## [0.9.0](https://github.com/humanwhocodes/humanfs/compare/types-v0.8.0...types-v0.9.0) (2024-02-14)


### Features

* Add append() method ([#82](https://github.com/humanwhocodes/humanfs/issues/82)) ([ab7b978](https://github.com/humanwhocodes/humanfs/commit/ab7b978ff3be84dc3fd2fd4d6fa1131dfdec8134))
* Add move() and moveAll() methods ([#80](https://github.com/humanwhocodes/humanfs/issues/80)) ([85f100b](https://github.com/humanwhocodes/humanfs/commit/85f100b721c99b920b307779548c2a043e7e18b5))

## [0.8.0](https://github.com/humanwhocodes/humanfs/compare/types-v0.7.0...types-v0.8.0) (2024-02-09)


### Features

* Add copyAll() method ([#77](https://github.com/humanwhocodes/humanfs/issues/77)) ([3c0852a](https://github.com/humanwhocodes/humanfs/commit/3c0852af99cb835b3941f58fdc2206e7b1179e21))

## [0.7.0](https://github.com/humanwhocodes/humanfs/compare/types-v0.6.0...types-v0.7.0) (2024-02-08)


### Features

* Add copy() method ([#69](https://github.com/humanwhocodes/humanfs/issues/69)) ([f252bac](https://github.com/humanwhocodes/humanfs/commit/f252bac6692a5b5c973ee3c696f5190caa5f12c7))

## [0.6.0](https://github.com/humanwhocodes/humanfs/compare/types-v0.5.1...types-v0.6.0) (2024-02-07)


### Features

* Allow URL file and directory paths ([#62](https://github.com/humanwhocodes/humanfs/issues/62)) ([a767e37](https://github.com/humanwhocodes/humanfs/commit/a767e372287b1556c4c9e8bdb26c23ff81866f99))

## [0.5.1](https://github.com/humanwhocodes/humanfs/compare/types-v0.5.0...types-v0.5.1) (2024-01-31)


### Bug Fixes

* Order of exports and engines in package.json ([66204c2](https://github.com/humanwhocodes/humanfs/commit/66204c24bc2dd02380aa2fb3c5769ca2cf5238a7)), closes [#61](https://github.com/humanwhocodes/humanfs/issues/61)

## [0.5.0](https://github.com/humanwhocodes/humanfs/compare/types-v0.4.0...types-v0.5.0) (2024-01-30)


### ⚠ BREAKING CHANGES

* Rename fsx -> humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56))

### Features

* Rename fsx -&gt; humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56)) ([f5dc533](https://github.com/humanwhocodes/humanfs/commit/f5dc533c8a46d45afd7aad602af39a6074f8a07b))

## [0.4.0](https://github.com/humanwhocodes/fsx/compare/fsx-types-v0.3.0...fsx-types-v0.4.0) (2024-01-27)


### Features

* New size() method ([#51](https://github.com/humanwhocodes/fsx/issues/51)) ([ffd12e6](https://github.com/humanwhocodes/fsx/commit/ffd12e6b0db318320dd5a9dbb8eb248106d60afa))

## [0.3.0](https://github.com/humanwhocodes/fsx/compare/fsx-types-v0.2.0...fsx-types-v0.3.0) (2024-01-23)


### ⚠ BREAKING CHANGES

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37))

### Features

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37)) ([2e85142](https://github.com/humanwhocodes/fsx/commit/2e85142e34bdc3cc18e18aa0b051cc9007fca4b8))
* write() to accept ArrayBuffer views as file contents ([1fd5517](https://github.com/humanwhocodes/fsx/commit/1fd55174a528ef3dcbabc154347006bec799f3f9))


### Bug Fixes

* **types:** Ensure FsxImpl methods also return undefined ([14eadc6](https://github.com/humanwhocodes/fsx/commit/14eadc66b19e40d7406a166e019004d9888075d3)), closes [#32](https://github.com/humanwhocodes/fsx/issues/32)

## [0.2.0](https://github.com/humanwhocodes/fsx/compare/fsx-types-v0.1.0...fsx-types-v0.2.0) (2024-01-19)


### Features

* Add list() method ([#25](https://github.com/humanwhocodes/fsx/issues/25)) ([dad841b](https://github.com/humanwhocodes/fsx/commit/dad841b7c9f5312996ff23db9be36774af985157))

## [0.1.0](https://github.com/humanwhocodes/fsx/compare/fsx-types-v0.0.3...fsx-types-v0.1.0) (2024-01-18)


### Features

* Add bytes() method, deprecate arrayBuffer() ([718c9c8](https://github.com/humanwhocodes/fsx/commit/718c9c84a0a1dcaef3cc032c882b1308e9cb3273))

## [0.0.3](https://github.com/humanwhocodes/fsx/compare/fsx-types-v0.0.2...fsx-types-v0.0.3) (2024-01-16)


### Bug Fixes

* Ensure isFile/isDirectory rethrow non-ENOENT errors. ([d31ee56](https://github.com/humanwhocodes/fsx/commit/d31ee56788e898cbc1fc0d6a54d1551f9b17cd45)), closes [#14](https://github.com/humanwhocodes/fsx/issues/14)

## [0.0.2](https://github.com/humanwhocodes/fsx/compare/fsx-types-v0.0.1...fsx-types-v0.0.2) (2024-01-06)

### Bug Fixes

-   **docs:** Correct package names in READMEs ([6c552ac](https://github.com/humanwhocodes/fsx/commit/6c552ac74542a245cdc2675101858da022336a1a))
