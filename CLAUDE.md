# Project AI Instructions

## Project Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Project Structure

- `src/components` for reusable UI components.
- `src/pages` for application pages.
- `src/services` for API calls and backend communication.
- `src/types` for TypeScript types.
- `src/lib` for shared utility functions.

## Coding Guidelines

- Use functional React components.
- Use TypeScript for all new files.
- Keep components small and reusable.
- Use Tailwind CSS for styling.
- Use shadcn/ui components when appropriate.
- Keep API logic inside `src/services`.
- Do not call backend APIs directly from UI components.
- Keep the frontend independent from the backend.
- Use clear and descriptive names for files, functions, and variables.

## Current Frontend Behavior

The chat currently uses a fake API response from:

`src/services/chatApi.ts`

When the real backend is ready, replace the implementation in the service layer without changing the UI components.