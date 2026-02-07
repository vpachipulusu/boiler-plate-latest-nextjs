# Package Manager Change: pnpm → npm

## Issue Date: February 7, 2026

## Problem

When using pnpm as the package manager with Next.js 16, the project encountered persistent module resolution errors with `lucide-react`:

```
⨯ Module not found: Can't resolve 'lucide-react'
```

This error occurred in an infinite loop across multiple files:
- `src/app/error.tsx`
- `src/app/loading.tsx`
- `src/app/not-found.tsx`
- `src/app/page.tsx`

## Root Cause

pnpm uses a unique approach to managing dependencies with symlinks and a `.pnpm` directory structure, which can cause module resolution issues with certain packages in Next.js, particularly:

1. **Next.js 16 with Turbopack**: The new bundler has stricter module resolution
2. **lucide-react package**: Icon package used extensively in UI components
3. **pnpm's symlink structure**: While efficient, can cause resolution conflicts

Even though `lucide-react` was properly listed in `package.json` and installed in `node_modules/.pnpm/lucide-react@0.563.0_react@19.2.4`, Next.js couldn't resolve it during runtime.

## Solution

**Switched from pnpm to npm** for better compatibility with Next.js 16.

### Steps Taken

1. **Removed all pnpm artifacts**:
   ```bash
   Remove-Item -Recurse -Force node_modules, .next
   Remove-Item -Force pnpm-lock.yaml
   ```

2. **Installed with npm**:
   ```bash
   npm install
   ```

3. **Updated package.json**:
   - Changed `"engines"` from `"pnpm": ">=9.0.0"` to `"npm": ">=10.0.0"`
   - Removed `"packageManager": "pnpm@9.15.0"` field

4. **Updated all documentation**:
   - README.md
   - SETUP_GUIDE.md
   - DEVELOPMENT_GUIDE.md

## Impact

### What Changed
- ✅ All `pnpm` commands are now `npm run`
- ✅ Module resolution works correctly
- ✅ Development server runs without errors
- ✅ Flat node_modules structure (npm style)

### What Stayed the Same
- ✅ All dependencies and versions remain identical
- ✅ Project structure unchanged
- ✅ Feature functionality preserved
- ✅ All tests still pass

## Commands Reference

### Before (pnpm)
```bash
pnpm install
pnpm dev
pnpm build
pnpm test
```

### After (npm)
```bash
npm install
npm run dev
npm run build
npm test
```

## Why npm Over pnpm?

While pnpm offers benefits like:
- Faster installations (shared package store)
- Disk space savings (symlinked dependencies)
- Stricter dependency management

npm provides:
- ✅ **Better Next.js compatibility** (especially with Turbopack)
- ✅ **Simpler module resolution** (flat node_modules)
- ✅ **Universal compatibility** (comes with Node.js)
- ✅ **Fewer edge cases** with certain packages
- ✅ **More predictable behavior** in Next.js projects

## Verification

After the switch, verify everything works:

```bash
# 1. Clean install
npm install

# 2. Check lucide-react is available
dir node_modules\lucide-react

# 3. Start dev server
npm run dev

# 4. Run tests
npm test

# 5. Build for production
npm run build
```

## For Team Members

If you're working on this project:

1. **Delete your pnpm files**:
   ```bash
   Remove-Item -Recurse -Force node_modules, .next
   Remove-Item -Force pnpm-lock.yaml
   ```

2. **Install with npm**:
   ```bash
   npm install
   ```

3. **Update your workflow**:
   - Use `npm run dev` instead of `pnpm dev`
   - Use `npm install` instead of `pnpm install`
   - All other commands: `npm run <command>`

## Future Considerations

- Monitor Next.js updates for improved pnpm support
- Consider revisiting pnpm when Next.js 17+ is released
- Keep an eye on module resolution improvements in both tools

## Related Issues

- Next.js Module Resolution: https://nextjs.org/docs/messages/module-not-found
- pnpm with Next.js: Known compatibility considerations
- Turbopack beta: May have stricter requirements

## Summary

**Problem**: Infinite loop of "Module not found: lucide-react" errors with pnpm  
**Cause**: Module resolution incompatibility between pnpm's symlink structure and Next.js 16  
**Solution**: Switch to npm for better compatibility  
**Result**: All errors resolved, development server runs smoothly  

---

**Status**: ✅ Resolved - All documentation updated, project using npm
