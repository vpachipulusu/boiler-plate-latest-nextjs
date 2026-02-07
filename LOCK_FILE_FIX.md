# Lock File Issue - Fixed! 🎉

> **Note**: This project now uses **npm** instead of pnpm. See [PACKAGE_MANAGER_CHANGE.md](./PACKAGE_MANAGER_CHANGE.md) for the reason and migration details.

## Problem Solved

The "Unable to acquire lock" error has been permanently fixed with automatic cleanup scripts.

## What Was the Issue?

When Next.js dev server crashes or is forcefully terminated, it leaves a lock file (`.next/dev/lock`) that prevents new dev servers from starting. This caused the error:

```
⨯ Unable to acquire lock at .next\dev\lock
```

## The Solution

Three new scripts have been added to automatically handle this:

### 1. Automatic Cleanup (Recommended)

```bash
npm run dev
```

Now when you run `npm run dev`, it **automatically**:
- ✓ Removes any stale lock files
- ✓ Checks for conflicting processes
- ✓ Starts the dev server clean

This uses a `predev` hook that runs cleanup before every dev server start.

### 2. Manual Kill & Clean

If you need to manually kill all Next.js processes and clean up:

```bash
npm run dev:kill
```

This will:
- ✓ Kill all processes using port 3000
- ✓ Remove the lock file
- ✓ Prepare for a fresh start

### 3. Explicit Clean Start

```bash
npm run dev:clean
```

Same as `npm run dev` but more explicit - runs cleanup then starts dev server.

## How It Works

### Auto-Cleanup Script (`predev` hook)
- Runs before every `npm run dev`
- Removes stale `.next/dev/lock` file
- Warns if port 3000 is in use
- Non-intrusive - just cleans up

### Kill Script
- Terminates processes on port 3000
- Removes lock file
- Safe - doesn't kill itself

## Usage Examples

### Starting Development (Normal)
```bash
npm run dev
```
✓ This now automatically cleans up before starting

### Had to Force-Quit? No Problem
```bash
npm run dev:kill    # Clean up everything
npm run dev         # Start fresh
```

### Multiple Terminals?
If you accidentally have multiple terminals trying to run dev server:

```bash
npm run dev:kill    # Kill all instances
npm run dev         # Start in your preferred terminal
```

## Files Added

- `scripts/dev-clean.cjs` - Auto-cleanup script (runs before dev)
- `scripts/dev-kill.cjs` - Manual cleanup script
- `DEVELOPMENT_GUIDE.md` - Complete development guide
- `LOCK_FILE_FIX.md` - This file

## Configuration

In `package.json`:
```json
{
  "scripts": {
    "predev": "node scripts/dev-clean.cjs",  // Auto-runs before dev
    "dev": "next dev --turbo",
    "dev:clean": "node scripts/dev-clean.cjs && npm run dev",
    "dev:kill": "node scripts/dev-kill.cjs"
  }
}
```

## Why This Won't Happen Again

1. **Automatic Prevention**: The `predev` hook runs cleanup every time
2. **Safe Termination**: Scripts are designed to not kill themselves
3. **Lock File Management**: Always cleaned before starting
4. **Port Management**: Detects and handles port conflicts

## Troubleshooting

### Still Getting Lock Error?

Very unlikely, but if it happens:

```bash
# 1. Kill everything
npm run dev:kill

# 2. Manually remove .next directory
rm -rf .next

# 3. Start fresh
npm run dev
```

### Port 3000 Still in Use?

```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Unix/Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Want to Use a Different Port?

Edit `package.json`:
```json
"dev": "next dev --turbo -p 3001"
```

## Benefits

✅ **No more manual cleanup** - It's automatic
✅ **Safer development** - Won't accidentally leave processes running
✅ **Faster workflow** - Just run `npm run dev`
✅ **Cross-platform** - Works on Windows, Mac, and Linux
✅ **Non-intrusive** - Cleanup is fast and silent when not needed

## Additional Commands

```bash
# Standard development
npm run dev              # Start with auto-cleanup

# Troubleshooting
npm run dev:kill         # Kill all and clean
npm run dev:clean        # Explicit clean + start

# See all dev commands
npm run                  # Lists all available scripts
```

## For Team Members

Share this with your team:
- Always use `npm run dev` (it's now safe)
- If you get a lock error, run `npm run dev:kill` first
- No need to manually delete `.next` directory anymore

## Summary

**Before**: Manual cleanup required when dev server crashed
**Now**: Automatic cleanup every time you start dev server
**Result**: Lock file issues are history! 🎉

---

**Questions?** Check [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for complete development workflow documentation.
