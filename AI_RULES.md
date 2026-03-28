# AI Development Rules & Tech Stack

This document outlines the architectural standards and library preferences for the **Magalhães & Gomes - IA Jurídica** project.

## Tech Stack Overview

- **React 19 & TypeScript**: Core framework and type system for building the user interface.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework used for all styling and responsive design.
- **Supabase**: Backend-as-a-Service for Authentication and PostgreSQL database (Admin settings).
- **Google Gemini API**: Powering the legal AI logic and audio-to-text transcription.
- **React Router DOM**: Client-side routing for Landing, Chat, Login, and Admin pages.
- **Lucide React**: Standardized icon library for the entire application.
- **React Markdown**: Used for rendering AI responses with proper legal formatting.
- **Shadcn/UI**: Base for UI components, emphasizing accessibility and clean design.

## Library & Implementation Rules

### 1. Styling & Layout
- **Strict Tailwind**: Use Tailwind CSS utility classes exclusively. Avoid custom CSS files or CSS modules.
- **Responsive First**: Always ensure components are mobile-friendly using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).
- **Color Palette**: Respect the primary project colors: `bg-[#0B1120]` (Background), `text-champagne` (`#C5A059`), and `bg-[#1A2333]` (Card surfaces).

### 2. UI Components
- **Shadcn/UI Pattern**: Prioritize using Shadcn/UI components.
- **Iconography**: Use `lucide-react` for all UI icons. Do not import icons from other libraries.
- **Animations**: Use Tailwind's `animate-in`, `fade-in`, and `slide-in` classes for transitions.

### 3. State & Logic
- **Data Persistence**: Use `localStorage` for temporary chat history and Supabase for persistent administrative settings.
- **Authentication**: Use the `AuthContext` provided in `App.tsx` for managing user sessions.
- **Audio Processing**: Use the `transcribeAudio` service in `services/gemini.ts` for voice input handling.

### 4. Code Structure
- **File Organization**: Keep components in `src/components/`, pages in `src/pages/`, and business logic/services in `src/services/`.
- **Modularity**: Create small, focused components (under 100 lines when possible). Use the `cn` utility from `lib/utils.ts` for class merging.

### 5. AI Interaction
- **Streaming**: AI responses must always be streamed for a better user experience.
- **System Prompt**: Any changes to AI behavior must be made via the `generateSystemInstruction` function in `constants.ts`.
- **Markdown**: Always wrap AI content in the `MarkdownText` component to ensure consistent legal formatting.

---
*Note: Always refer to this document before adding new dependencies or refactoring core logic.*