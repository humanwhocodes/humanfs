# Changelog

## [0.7.1](https://github.com/humanwhocodes/humanfs/compare/node-v0.7.0...node-v0.7.1) (2024-01-31)


### Bug Fixes

* Order of exports and engines in package.json ([66204c2](https://github.com/humanwhocodes/humanfs/commit/66204c24bc2dd02380aa2fb3c5769ca2cf5238a7)), closes [#61](https://github.com/humanwhocodes/humanfs/issues/61)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @humanfs/core bumped from ^0.6.0 to ^0.7.0
  * devDependencies
    * @humanfs/test bumped from ^0.6.0 to ^0.6.1
    * @humanfs/types bumped from ^0.5.0 to ^0.5.1

## [0.7.0](https://github.com/humanwhocodes/humanfs/compare/node-v0.6.1...node-v0.7.0) (2024-01-30)


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

## [0.6.1](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.6.0...fsx-node-v0.6.1) (2024-01-29)


### Bug Fixes

* NodeFsx not working without arguments ([cce67e0](https://github.com/humanwhocodes/fsx/commit/cce67e0fa0f0ababc0b802b84101306ec168fd5e)), closes [#52](https://github.com/humanwhocodes/fsx/issues/52)

## [0.6.0](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.5.0...fsx-node-v0.6.0) (2024-01-27)


### Features

* New size() method ([#51](https://github.com/humanwhocodes/fsx/issues/51)) ([ffd12e6](https://github.com/humanwhocodes/fsx/commit/ffd12e6b0db318320dd5a9dbb8eb248106d60afa))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.4.0 to ^0.5.0
  * devDependencies
    * fsx-test bumped from ^0.4.0 to ^0.5.0
    * fsx-types bumped from ^0.3.0 to ^0.4.0

## [0.5.0](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.4.0...fsx-node-v0.5.0) (2024-01-23)


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

## [0.4.0](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.3.0...fsx-node-v0.4.0) (2024-01-19)


### Features

* Add list() method ([#25](https://github.com/humanwhocodes/fsx/issues/25)) ([dad841b](https://github.com/humanwhocodes/fsx/commit/dad841b7c9f5312996ff23db9be36774af985157))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.2.0 to ^0.3.0
  * devDependencies
    * fsx-test bumped from ^0.2.0 to ^0.3.0
    * fsx-types bumped from ^0.1.0 to ^0.2.0

## [0.3.0](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.2.1...fsx-node-v0.3.0) (2024-01-18)


### Features

* Add bytes() method, deprecate arrayBuffer() ([718c9c8](https://github.com/humanwhocodes/fsx/commit/718c9c84a0a1dcaef3cc032c882b1308e9cb3273))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.1.1 to ^0.2.0
  * devDependencies
    * fsx-test bumped from ^0.1.0 to ^0.2.0
    * fsx-types bumped from ^0.0.3 to ^0.1.0

## [0.2.1](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.2.0...fsx-node-v0.2.1) (2024-01-17)


### Bug Fixes

* **deps:** Retry logic in read/write operations ([9a6b62d](https://github.com/humanwhocodes/fsx/commit/9a6b62d6300799bb405893cb0a59be1988c558d5))

## [0.2.0](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.1.0...fsx-node-v0.2.0) (2024-01-16)


### Features

* Add EMFILE/ENFILE retrying for Node.js ([#19](https://github.com/humanwhocodes/fsx/issues/19)) ([cfd2402](https://github.com/humanwhocodes/fsx/commit/cfd2402d10e2974963124391483d0592ce4d469c))


### Bug Fixes

* Ensure isFile/isDirectory rethrow non-ENOENT errors. ([d31ee56](https://github.com/humanwhocodes/fsx/commit/d31ee56788e898cbc1fc0d6a54d1551f9b17cd45)), closes [#14](https://github.com/humanwhocodes/fsx/issues/14)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * fsx-core bumped from ^0.1.0 to ^0.1.1
  * devDependencies
    * fsx-types bumped from ^0.0.2 to ^0.0.3

## [0.1.0](https://github.com/humanwhocodes/fsx/compare/fsx-node-v0.0.1...fsx-node-v0.1.0) (2024-01-06)

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
-   **node:** parameter name in NodeFsxImpl ([ac9d2f3](https://github.com/humanwhocodes/fsx/commit/ac9d2f3ebc7181c861f7477edc5a42e59610488a))

### Dependencies

-   The following workspace dependencies were updated
    -   dependencies
        -   fsx-core bumped from ^0.0.0 to ^0.1.0
    -   devDependencies
        -   fsx-test bumped from ^0.0.0 to ^0.1.0
        -   fsx-types bumped from ^0.0.0 to ^0.0.2
