# 010 Lighter first visit

**Feature Branch**: `cursor/lighter-first-visit-602e`

**Created**: 2026-11-08

**Status**: Draft

**Input**: Make the first download substantially lighter before Task 10, with room to grow, without removing content, art, or audio or lowering quality.

## Goal

A child's first visit should download the home screen and the app shell, not every lesson bank in the game. Later lessons, pictures, and recorded-voice lookups are saved when they are used. ⚙️ Download for offline play still saves everything. An update must keep banks and pictures that are already on the device.

Measured on current main (after commit 8e331ac) before this change, the same way `tools/test/lightload.js` counts (each file once, text gzipped, images as stored):

| | Files | Unique bytes | Requests | Bytes if every request is counted |
|---|---|---|---|---|
| First visit on main | 195 | 1,870,825 | 294 | 2,759,593 |

The historical lightload gate was 1,999,921 bytes. New lesson text was being trimmed to stay under 2 MB because the service worker precached every bank on install.

## User Scenarios & Testing

### User Story 1 - A small first open (Priority: P1)

A child opens Word Realms for the first time. The map appears. The phone does not download every realm, Singapore pack, and Learn pack in the background.

**Why this priority**: This is the download the 2 MB gate keeps hitting.

**Independent Test**: Load the map once and list the requests. Far banks such as `data/c2/reading.json` are absent. The byte total is well under 2 MB.

**Acceptance Scenarios**:

1. **Given** a new save, **When** the map finishes loading, **Then** the first visit is under 1.45 MB by the lightload count and does not request other realms' lesson banks.
2. **Given** the same visit, **When** the shell files load, **Then** each `js/` and `css/` file is requested once. The worker stores that response. Install does not fetch the shell again, and the page does not fetch it again to fill the cache.

### User Story 2 - Another level, then offline (Priority: P1)

The child opens a different realm online. That realm's questions are saved. After a reload with no network, that realm still opens. A realm they have never opened explains, kindly, that it is not on the device yet. Stars, crowns, and unlocks stay as they were.

**Independent Test**: Open A2 vocab online, go offline, reload, open it again. Open an unvisited bank offline and see the kind note, not a broken page.

### User Story 3 - Download, reload, and update (Priority: P2)

A grown-up or child taps Download in Settings. Stories and pictures are saved. Offline play then reaches a realm that was never opened. When a new version of the app arrives, banks already in the old precache are copied into `wrdata` before that precache is deleted. Pictures stay in the art cache. Recorded lines stay in the voice cache.

**Independent Test**: Download, then open a far realm offline. Seed an old `wr-…` cache and run the adopt step; the seeded bank is in `wrdata`.

### User Story 4 - Poor network (Priority: P2)

If a bank cannot be fetched, the child stays on a working screen, sees a short kind note, and loses nothing.

**Independent Test**: Abort one bank request. No page error. The note appears. The map or realm is still usable.

## Edge Cases

- Save-Data / cellular: install still does not pull every bank. The home JSON (realms, shop, anchors, counts, lesson index) is small and is kept so the map can open offline.
- The voice lookup file (`assets/voice/manifest.json`) loads on the first spoken line, not with the map. Recordings are unchanged. If that lookup is not on the device yet, the device voice speaks that line, which is the existing fallback.
- Supabase is never cached. No service-role key is read.
- No new home tile. Typing fields keep `WR.noAssist`.
- Task 10 (thinking skills) and Task 11 are out of scope.

## Out of scope

- Removing or compressing lesson text, pictures, or MP3s.
- Lazy-loading maths topic code. The map shows crown counts from those files, so they stay in the shell.
- Publishing or claiming the live site has this change.

## Done when

- First-visit unique bytes are substantially below 1,870,825, with far banks absent.
- Counting every request (a repeated shell file counts again) stays close to that unique total. The unique total alone is not the cold-start transfer.
- A visited level works offline after reload. An unvisited level fails kindly.
- Download still fills art and banks. Old precached banks survive into `wrdata`.
- `tools/test/lightload.js`, `tools/test/pwa.js`, and `tools/test/firstload.js` cover this.
- Review notes do not say this is live until it is published and checked on the live site.
