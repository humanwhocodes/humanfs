# Changelog

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
