================================================================================
                    BATTLEFIELD 6 PORTAL - AI MAX SDK
                         Pattern Library v1.3
================================================================================

Welcome to the AI-optimized SDK for building Battlefield 6 Portal mods!

This toolkit is designed to help AI coding assistants (Claude, Gemini, Cursor,
Windsurf, etc.) build Portal mods correctly and efficiently.

================================================================================
Installation
================================================================================

Unpack into existing Portal SDK file.

================================================================================
GETTING STARTED
================================================================================

1. CHOOSE YOUR AI ASSISTANT

   Pick the instruction file that matches your AI:
   - CLAUDE.md   - For Claude (Claude Code, Claude.ai, etc.)
   - GEMINI.md   - For Google Gemini
   - AGENTS.md   - For other AI assistants (Cursor, Windsurf, etc.)

2. POINT YOUR AI TO THE INSTRUCTIONS

   When starting a session, tell your AI:
   "Read CLAUDE.md (or AGENTS.md/GEMINI.md) to understand how to build Portal mods"

3. START BUILDING

   Just describe what you want:
   - "Build me a gun game mod"
   - "Create a zombie survival mode"
   - "Make a 1v1 duel arena"

================================================================================
WHAT'S INCLUDED
================================================================================

patterns/
  The heart of the SDK. 35+ verified code patterns covering:
  - Event hooks and state management
  - Player spawning, equipment, cameras
  - Economy systems, vehicles, capture points
  - UI widgets, notifications
  - Audio (music, SFX, voice-over)
  - Spatial triggers, world icons, VFX
  - AI behaviors (18 functions)

processes/
  Step-by-step workflows for:
  - Discovery (gathering requirements)
  - Planning (complex mods)
  - Building (code generation)
  - Validation (error checking)
  - Troubleshooting (runtime issues)
  - Experimental features

bf6-portal-utils-master/
  Community utility library with 11 modules:
  - Events, Timers, Logger
  - SolidUI, Raycast
  - Performance stats, and more

spatial-generator/
  Tools for programmatically generating spatial JSON files
  (map layouts, object placements, etc.)
  NOTE: This is basic and untested - good for making a simple testing space and not much else!

experimental/
  Sandbox for undocumented/experimental SDK features

agents/
  Agent architecture documentation for building
  context-efficient AI workflows

dev/
  Reference materials including the original comprehensive
  SDK documentation

templates/
  Per-mod template structures

================================================================================
CRITICAL RULES FOR AI ASSISTANTS
================================================================================

1. BF2042 vs BF6 ISOLATION
   Battlefield 2042 was internally "Battlefield 6" - the code is similar but
   NOT compatible. NEVER use web-sourced BF2042 examples. Only use patterns
   from this local SDK.

2. GetObjId RULE
   SDK objects (teams, players, vehicles) cannot use === for comparison:

   WRONG:  if (team1 === team2) { }
   RIGHT:  if (mod.GetObjId(team1) === mod.GetObjId(team2)) { }

3. NEVER INVENT FUNCTIONS
   Every mod.* call must exist in the SDK. AI models tend to invent
   plausible-sounding functions that don't exist. Always validate!

================================================================================
DEBUGGING
================================================================================

Portal logs are located at:
C:\Users\{username}\AppData\Local\Temp\Battlefield 6\PortalLog.txt

Use console.log() in your mod code to write debug messages there.

================================================================================
SUPPORT & COMMUNITY
================================================================================

This is a community-maintained SDK. For questions and support:
- Check the patterns/ folder first - most answers are there
- Review processes/troubleshooting.md for common issues
- Check experimental/ for undocumented features

This version is a BETA. Please give feedback to help us improve.

Credit: BFPortal.gg // Anthropic // Gregg Bayes-Brown

================================================================================
VERSION INFO
================================================================================

SDK Version: 1.1.3.0
Pattern Library: v1.3 (Full SDK Coverage)

================================================================================
