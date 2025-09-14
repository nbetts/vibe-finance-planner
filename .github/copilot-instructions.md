# Copilot Instructions for `finance-planner`

## Project Overview
- **Framework:** React 19 + TypeScript, built with Vite
- **Entry Point:** `src/main.tsx` (mounts `App` to DOM)
- **App Component:** `src/App.tsx` (main UI logic)
- **Styling:** CSS files in `src/` (e.g., `App.css`, `index.css`)

## Build & Development
- **Start dev server:** `npm run dev` (runs Vite)
- **Build for production:** `npm run build` (TypeScript build, then Vite)
- **Preview production build:** `npm run preview`
- **Lint:** `npm run lint` (ESLint with React/TypeScript plugins)

## TypeScript
- **Config:** `tsconfig.app.json` (strict, modern, React JSX)
- **Bundler:** Vite with ESNext modules
- **Strictness:** All strict flags enabled, unused code is an error

## Patterns & Conventions
- **Component Structure:** Flat, all logic in `App.tsx` (expand as needed)
- **No custom hooks, context, or state management yet**
- **Use functional React components**
- **Import assets from `src/assets/` or `public/` as needed**

## External Dependencies
- **React 19**
- **Vite** (for dev/build)
- **ESLint** (with React/TypeScript plugins)

## Key Files
- `src/App.tsx`: Main app logic
- `src/main.tsx`: React root rendering
- `vite.config.ts`: Vite + React plugin config
- `tsconfig.app.json`: TypeScript strict config
- `public/`: Static assets

## Project-Specific Notes
- No backend or API integration present
- No routing, state management, or advanced patterns yet
- Keep code modular and ready for future expansion
- Follow strict TypeScript and linting rules—fix all errors/warnings

---

**Example: Adding a new component**
1. Create `src/MyComponent.tsx` as a functional component
2. Import and use it in `App.tsx`
3. Add styles in `App.css` or a new CSS file

---

For questions, review `vite.config.ts`, `tsconfig.app.json`, and `package.json` for up-to-date config and scripts.
