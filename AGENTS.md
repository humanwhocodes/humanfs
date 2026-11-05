# Agent instructions

## Project overview

humanfs is a JavaScript filesystem API monorepo. The runtime implementations share a common API, with reusable core, type definitions, and implementation tests.

- `packages/core`: shared filesystem API and core behavior.
- `packages/types`: shared TypeScript definitions.
- `packages/test`: reusable implementation test suite.
- `packages/node`, `packages/deno`, `packages/web`, `packages/memory`, and `packages/box`: runtime and storage implementations.
- `docs`: user, design, and maintainer documentation.

Read the relevant design and operation docs in `docs/` before making API or behavior changes. For changes to an implementation method, follow `docs/maintaining.md` to update the shared types, core, implementation tester, runtime implementations, documentation, and package READMEs as applicable.

## Setup and validation

Use Node.js 24 or later. Install dependencies from the repository root with:

```shell
npm install
```

Run the relevant checks from the root:

```shell
npm test
npm test -w packages/node
npm run lint
```

The full test command runs all workspace tests, including `packages/deno`; install Deno 2 if testing that workspace or running the full suite. The web workspace may also require Playwright browsers; CI installs Chromium and Firefox before testing. For documentation-only changes, run checks when they are relevant to the edited content.

## Contribution workflow

- Add or update tests for behavior changes. Update docs when changing the public API.
- Code changes should be tied to an accepted issue; documentation-only changes do not require one. Follow `.github/PULL_REQUEST_TEMPLATE.md` when preparing a pull request.
- **Commit messages and pull request titles must use Conventional Commits format:** `type(scope): description` (scope is optional). Choose an accurate type such as `feat`, `fix`, `docs`, `test`, `refactor`, or `chore`; for example, `fix(node): handle missing files` or `docs: clarify setup`.
- Keep changes focused on the relevant workspace and preserve consistency across implementations that share the API.
