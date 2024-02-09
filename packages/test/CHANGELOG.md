# Changelog

## [0.9.0](https://github.com/humanwhocodes/humanfs/compare/test-v0.8.0...test-v0.9.0) (2024-02-09)


### Features

* Add copyAll() method ([#77](https://github.com/humanwhocodes/humanfs/issues/77)) ([3c0852a](https://github.com/humanwhocodes/humanfs/commit/3c0852af99cb835b3941f58fdc2206e7b1179e21))

## [0.8.0](https://github.com/humanwhocodes/humanfs/compare/test-v0.7.0...test-v0.8.0) (2024-02-08)


### Features

* Add copy() method ([#69](https://github.com/humanwhocodes/humanfs/issues/69)) ([f252bac](https://github.com/humanwhocodes/humanfs/commit/f252bac6692a5b5c973ee3c696f5190caa5f12c7))

## [0.7.0](https://github.com/humanwhocodes/humanfs/compare/test-v0.6.1...test-v0.7.0) (2024-02-07)


### Features

* Allow URL file and directory paths ([#62](https://github.com/humanwhocodes/humanfs/issues/62)) ([a767e37](https://github.com/humanwhocodes/humanfs/commit/a767e372287b1556c4c9e8bdb26c23ff81866f99))
* HfsImplTester specify optional methods ([fb4098a](https://github.com/humanwhocodes/humanfs/commit/fb4098a993ff8ad186a956560599afc543260f6f))


### Bug Fixes

* Ensure list(".") works ([#68](https://github.com/humanwhocodes/humanfs/issues/68)) ([6245ea4](https://github.com/humanwhocodes/humanfs/commit/6245ea469cdc0a9aea29f980d277ac65aedc5085))

## [0.6.1](https://github.com/humanwhocodes/humanfs/compare/test-v0.6.0...test-v0.6.1) (2024-01-31)


### Bug Fixes

* Order of exports and engines in package.json ([66204c2](https://github.com/humanwhocodes/humanfs/commit/66204c24bc2dd02380aa2fb3c5769ca2cf5238a7)), closes [#61](https://github.com/humanwhocodes/humanfs/issues/61)

## [0.6.0](https://github.com/humanwhocodes/humanfs/compare/test-v0.5.0...test-v0.6.0) (2024-01-30)


### ⚠ BREAKING CHANGES

* Rename fsx -> humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56))

### Features

* Rename fsx -&gt; humanfs ([#56](https://github.com/humanwhocodes/humanfs/issues/56)) ([f5dc533](https://github.com/humanwhocodes/humanfs/commit/f5dc533c8a46d45afd7aad602af39a6074f8a07b))

## [0.5.0](https://github.com/humanwhocodes/fsx/compare/fsx-test-v0.4.0...fsx-test-v0.5.0) (2024-01-27)


### Features

* New size() method ([#51](https://github.com/humanwhocodes/fsx/issues/51)) ([ffd12e6](https://github.com/humanwhocodes/fsx/commit/ffd12e6b0db318320dd5a9dbb8eb248106d60afa))

## [0.4.0](https://github.com/humanwhocodes/fsx/compare/fsx-test-v0.3.0...fsx-test-v0.4.0) (2024-01-23)


### ⚠ BREAKING CHANGES

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37))

### Features

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37)) ([2e85142](https://github.com/humanwhocodes/fsx/commit/2e85142e34bdc3cc18e18aa0b051cc9007fca4b8))
* write() to accept ArrayBuffer views as file contents ([1fd5517](https://github.com/humanwhocodes/fsx/commit/1fd55174a528ef3dcbabc154347006bec799f3f9))


### Bug Fixes

* Ensure only appropriate bytes are written ([356957b](https://github.com/humanwhocodes/fsx/commit/356957bf5ebef086e1b9efedeecad182edfb6f10)), closes [#43](https://github.com/humanwhocodes/fsx/issues/43)
* Ensure type definitions are bundled with npm package ([342e6ca](https://github.com/humanwhocodes/fsx/commit/342e6ca3066cebc0f131f9e6737574103cc3adcc)), closes [#31](https://github.com/humanwhocodes/fsx/issues/31)

## [0.3.0](https://github.com/humanwhocodes/fsx/compare/fsx-test-v0.2.0...fsx-test-v0.3.0) (2024-01-19)


### Features

* Add list() method ([#25](https://github.com/humanwhocodes/fsx/issues/25)) ([dad841b](https://github.com/humanwhocodes/fsx/commit/dad841b7c9f5312996ff23db9be36774af985157))

## [0.2.0](https://github.com/humanwhocodes/fsx/compare/fsx-test-v0.1.0...fsx-test-v0.2.0) (2024-01-18)


### Features

* Add bytes() method, deprecate arrayBuffer() ([718c9c8](https://github.com/humanwhocodes/fsx/commit/718c9c84a0a1dcaef3cc032c882b1308e9cb3273))

## [0.1.0](https://github.com/humanwhocodes/fsx/compare/fsx-test-v0.0.1...fsx-test-v0.1.0) (2024-01-06)

### Features

-   Fsx class handles parameter validation ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))
-   **memory:** Remove unnecessary parameter check. ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))
-   **node:** Remove unnecessary parameter check. ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))
-   **test:** Ensure outputDir is provided to FsxImplTester ([3493eaa](https://github.com/humanwhocodes/fsx/commit/3493eaaf91331cd7169b7340029e6e426fbc4ecf))
-   **test:** Remove test for checking filePath is not a number. ([1072b55](https://github.com/humanwhocodes/fsx/commit/1072b55e506390cccc7142f53bdd8c74d8dc0f60))

### Bug Fixes

-   **docs:** Correct package names in READMEs ([6c552ac](https://github.com/humanwhocodes/fsx/commit/6c552ac74542a245cdc2675101858da022336a1a))
