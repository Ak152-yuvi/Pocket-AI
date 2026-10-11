# React + TypeScript + Vite

## Authentication on Netlify

When `VITE_API_URL` is not set, sign-in and registration use Netlify Identity instead of sending requests to a nonexistent `/api/auth/login` endpoint. Identity must be enabled for the site; the deployment feature marker is included in this change.

New users must create an account and confirm their email before signing in. The application processes the confirmation link, restores the Identity session on reload, and signs users out through Identity. Accounts from the separate FastAPI backend are not automatically migrated to Identity.

Setting `VITE_API_URL` to a deployed FastAPI origin or API root preserves the original backend authentication flow. The AI planners, history, and backend profile endpoints still require that backend; enabling Identity does not deploy the Python application or migrate its data. Rebuild and redeploy after changing `VITE_API_URL` because Vite reads it at build time.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
