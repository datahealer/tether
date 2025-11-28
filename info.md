Domain,Locked-In Understanding
Data Ownership,"Everything meaningful is per-couple: progress, streak, milestones, rhythm, last drop, refreshes, entitlements, question history, onboarding profile, etc."
Couple Lifecycle,Two users → form couple → shared couple document becomes source of truth. Both users reference the same couple ID.
Question Serving Core Rule,One cycle = N live tethers (N = number of unlocked categories). First answer in the cycle instantly clears all other live tethers and locks the chosen question for both partners.
State Machine per Question,"served → (first answer) waiting_for_partner → (second answer) completed 
OR expires → unanswered_expired 
OR refreshed → skipped_refresh"
Cooldowns,Both cooldown types currently 14 days but must be separately configurable.
Free User Packs,Exactly 2 categories auto-selected using onboarding goals + relationship context. Premium = all 10. Temporary unlocks = time-limited overrides that keep progress.
Refreshes,Two pools: per-cycle default (1 or 3) → consumed first. Permanent balance → consumed second. Never expire.
Rhythm,"Pure elapsed-time intervals anchored to Last_Tether_Drop (server timestamp). Daily=24h, Twice-weekly=72h, Weekly=168h."
Streak Logic,Increments only on completed cycles (at least one tether completed in that cycle). Missed cycles do NOT reset streak — they just don’t increase it.
Milestones,"Based on total completed tethers (not streak): 5, 10, 25, 50, 100. One-time triggers."
Trial & Entitlements,7-day trial = full Premium for both partners. Server-side receipt validation mandatory. Tier changes never wipe progress.
Onboarding → Tagging,"Direct mapping: relationship stage, length, living type, kids, goals → filter questions by corresponding tags. Rhythm influences difficulty curve (daily = lighter)."
Question Selection,Filter by tags + onboarding profile + not in cooldown + not already completed + (free users: only top 40 per unlocked category). Random weighted choice from eligible pool.
Real-time Critical Path,First answer → lock cycle → instantly reflect on partner’s device (needs WebSocket or aggressive polling + push).
Offline & Sync,Must support offline answer queueing → sync on reconnect → server arbitrates using server timestamps.