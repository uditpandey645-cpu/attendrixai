# Memory: index.md
Updated: now

# Project Memory

## Core
- App Name: PresentX (formerly Attendrix). Use logo and favicon. Desktop-first responsive UI.
- Strictly NO demo/hardcoded data. Use Supabase with strict RLS and Realtime sync.
- Core rules: 1:1 face to user mapping, no duplicate daily attendance, 1GB storage limit.
- Real-time sync everywhere: dashboards must update without manual page refresh.
- Fixed display values on dashboard: Today's Attendance = 94.73%, Avg Recognition = 0.8s (Optimal).

## Memories
- [Security & Performance](mem://constraints/security-performance) — Encrypted faces, 1GB limit, desktop-first UI
- [Core Logic](mem://features/core-logic) — Core rules, anti-duplicates, realtime sync, thresholds
- [Supabase Schema](mem://architecture/supabase-schema) — Tables (`profiles`, `attendance`, etc.), RLS, realtime
- [Admin Dashboard](mem://features/admin-dashboard) — Real-time metrics (usage, accuracy) and data tables
- [Creator Profile](mem://features/creator-profile) — Specific Udit Pandey modal with futuristic aesthetic
- [User Dashboard](mem://features/user-dashboard) — Profile, history, and today's check-in status
