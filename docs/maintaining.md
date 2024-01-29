
# Maintaining fsx

This document contains common processes used in maintaining fsx so they don't get lost.

## Add a New Package

1. Create the new package under `packages`.
1. Update `.release-please-manifest.json` with the starting version of 0.1.0.
1. Update `release-please-config.json` to point to the new package.
1. Update `.github/workflows/release-please.yml` to pubish the new package to npm.

## Add a New Impl Method

1. Update the type definition in `packages/types`.
1. Update the `Fsx` class and tests in `package/core`.
1. Update `FsxImplTester` in `packages/test`.
1. Update each impl.
1. Update documentation in `docs`.
1. Update package READMEs.
