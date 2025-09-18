
# Copilot Instructions for `vibe-finance-planner`

## Project Overview
- **Framework:** React 19 + TypeScript, built with Vite
- **Entry Point:** `src/main.tsx` (mounts root component)
- **Main UI:** `src/App.tsx` (expand as needed)
- **Pages:** Organized under `src/pages/` (e.g., `car-finance-planner`, `salary-planner`, `home`, `not-found`)
- **Styling:** CSS files in `src/` (e.g., `index.css`)
- **Constants & Utilities:** Shared logic in `src/constants.ts`, `src/hooks.ts`, etc.

## Build & Development
- **Start dev server:** `npm run dev` (Vite)
- **Build for production:** `npm run build`
- **Preview build:** `npm run preview`
- **Lint:** `npm run lint` (ESLint, React/TypeScript)

## TypeScript
- **Config:** `tsconfig.app.json` (strict, modern, React JSX)
- **Bundler:** Vite (ESNext modules)
- **Strictness:** All strict flags enabled; unused code is an error

## Patterns & Conventions
- **Component Structure:** Pages and components in `src/pages/` and `src/`
- **No global state management or routing libraries yet**
- **Functional React components only**
- **Import assets from `public/` as needed**
- **Keep code modular and ready for future expansion**

## External Dependencies
- **React 19**
- **Vite**
- **ESLint** (React/TypeScript plugins)

## Key Files & Folders
- `src/main.tsx`: React root rendering
- `src/App.tsx`: Main app logic
- `src/pages/`: Page components and planners
- `vite.config.ts`: Vite + React plugin config
- `tsconfig.app.json`: TypeScript config
- `public/`: Static assets

## Project-Specific Notes
- No backend/API integration
- No advanced routing or state management yet
- All calculations and types for planners are in their respective page folders
- Strict TypeScript and linting—fix all errors/warnings

---

**Example: Adding a new page or component**
1. Create a new folder or file in `src/pages/` (e.g., `src/pages/new-feature/Feature.tsx`)
2. Import and use it in `App.tsx` or another page/component
3. Add styles in `index.css` or a new CSS file

---

For questions, review `vite.config.ts`, `tsconfig.app.json`, and `package.json` for up-to-date config and scripts.
