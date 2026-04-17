# EduSocial React

React migration foundation for the old `Refat4_*` HTML prototype.

## How to access

To open the project locally:

```bash
cd "C:\Users\andre\OneDrive\Documentos\New project\edusocial-react"
npm install
npm run dev
```

After that, open the local URL shown by Vite in the terminal. In most cases it will be:

```text
http://localhost:5173
```

For a production preview:

```bash
npm run build
npm run preview
```

This project is already versioned in GitHub here:

[https://github.com/felipefsz/Edu](https://github.com/felipefsz/Edu)

At this stage there is no public deployed site yet. The current access path is local development via Vite.

## What changed in this step

- Replaced the monolithic HTML mentality with a real multi-file React app.
- Normalized domain naming to English: `name`, `classroom`, `gradeBySubject`, `chatGroups`, `tasks`, `notices`, `notifications`.
- Removed the inline HTML database as the app source of truth.
- Centralized state, preferences, modal handling, notifications, theme, language, search, and persistence in React.
- Added a modern shell with:
  - expanding search
  - visible notification badge
  - dark/light mode
  - PT/EN toggle
  - ESC to close open overlays
  - teacher/student role-aware pages

## Current pages

- `Feed`
- `Messages`
- `Tasks`
- `Analytics`
- `Settings`
- `Profile`

## Architecture

```text
src/
  app/
    App.tsx
    AppState.tsx
    translations.ts
    types.ts
  components/
    AppLayout.tsx
    ChartBlocks.tsx
    ModalLayer.tsx
    NotificationBell.tsx
    PostCard.tsx
    SearchBar.tsx
  data/
    mockData.ts
  pages/
    AnalyticsPage.tsx
    FeedPage.tsx
    LandingPage.tsx
    MessagesPage.tsx
    ProfilePage.tsx
    SettingsPage.tsx
    TasksPage.tsx
  styles/
    global.css
  utils/
    selectors.ts
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Notes

- Routing uses `HashRouter`, which is safer for static hosting.
- The current data layer is mock data on purpose so a real backend can replace it later with low friction.
- The legacy HTML can stay as reference while the React version grows in stages.

## Suggested next migration steps

1. Replace mock data with a real API adapter.
2. Move feed, messaging, and task writes to a backend service.
3. Add optimistic updates and server synchronization.
4. Split teacher analytics into dedicated charts and filters.
5. Introduce file upload and real authentication.
