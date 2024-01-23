# Changelog

### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * fsx-types bumped from ^0.0.2 to ^0.0.3

## [0.4.0](https://github.com/humanwhocodes/fsx/compare/fsx-core-v0.3.0...fsx-core-v0.4.0) (2024-01-23)


### ⚠ BREAKING CHANGES

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37))

### Features

* Safer delete(); new deleteAll() method ([#37](https://github.com/humanwhocodes/fsx/issues/37)) ([2e85142](https://github.com/humanwhocodes/fsx/commit/2e85142e34bdc3cc18e18aa0b051cc9007fca4b8))
* write() to accept ArrayBuffer views as file contents ([1fd5517](https://github.com/humanwhocodes/fsx/commit/1fd55174a528ef3dcbabc154347006bec799f3f9))


### Bug Fixes

* Ensure type definitions are bundled with npm package ([342e6ca](https://github.com/humanwhocodes/fsx/commit/342e6ca3066cebc0f131f9e6737574103cc3adcc)), closes [#31](https://github.com/humanwhocodes/fsx/issues/31)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * fsx-types bumped from ^0.2.0 to ^0.3.0

## [0.3.0](https://github.com/humanwhocodes/fsx/compare/fsx-core-v0.2.0...fsx-core-v0.3.0) (2024-01-19)


### Features

* Add list() method ([#25](https://github.com/humanwhocodes/fsx/issues/25)) ([dad841b](https://github.com/humanwhocodes/fsx/commit/dad841b7c9f5312996ff23db9be36774af985157))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * fsx-types bumped from ^0.1.0 to ^0.2.0

## [0.2.0](https://github.com/humanwhocodes/fsx/compare/fsx-core-v0.1.1...fsx-core-v0.2.0) (2024-01-18)


### Features

* Add bytes() method, deprecate arrayBuffer() ([718c9c8](https://github.com/humanwhocodes/fsx/commit/718c9c84a0a1dcaef3cc032c882b1308e9cb3273))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * fsx-types bumped from ^0.0.3 to ^0.1.0

## [0.1.0](https://github.com/humanwhocodes/fsx/compare/fsx-core-v0.0.1...fsx-core-v0.1.0) (2024-01-06)

### Features

-   **core:** Add missing impl methods ([89d64de](https://github.com/humanwhocodes/fsx/commit/89d64de9caea64d2867c03875c6d67a22dff2b87))
-   **core:** Ensure write() validates file contents parameter. ([89cda51](https://github.com/humanwhocodes/fsx/commit/89cda51a973bb963ad92bcb37ce761e51aea9165))
-   **core:** Make logging more generic ([7b2c3b7](https://github.com/humanwhocodes/fsx/commit/7b2c3b72ea73fced857cb3e32f286058874625ec))
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
    -   devDependencies
        -   fsx-types bumped from ^0.0.0 to ^0.0.2
