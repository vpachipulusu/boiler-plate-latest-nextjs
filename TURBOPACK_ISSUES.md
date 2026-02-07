# Turbopack Issues & Solutions

## Problem
Next.js 16.1.6 with Turbopack (`--turbo` flag) experiences persistent cache corruption and internal state panics on Windows, causing development server crashes.

## Error Symptoms
```
thread 'tokio-runtime-worker' panicked at aggregation_update.rs:
inner_of_upper_lost_followers is not able to remove followers TaskId X from TaskId Y 
as they don't exist as upper or follower edges
```

## Root Cause
Turbopack's internal task graph and cache management has race conditions and state management issues that cause:
- Cache corruption requiring frequent `.next` directory deletion
- TaskId edge tracking failures in the backend
- File system access issues on Windows (EPERM errors)

## Solution Applied
**Switched default dev server to use webpack instead of Turbopack**

### Package.json Changes
```json
"scripts": {
  "dev": "next dev",           // ✅ Now uses stable webpack
  "dev:turbo": "next dev --turbo"  // Optional Turbopack (use with caution)
}
```

## Usage

### Recommended (Stable)
```bash
npm run dev
```
Uses webpack - slower build times but reliable and stable.

### Experimental (Faster but Unstable)
```bash
npm run dev:turbo
```
Uses Turbopack - faster builds but prone to cache corruption.

## Turbopack Recovery Steps
If you encounter Turbopack errors:

1. **Stop all Node processes**
   ```bash
   npm run dev:kill
   ```

2. **Clear Next.js cache**
   ```bash
   Remove-Item -Path .next -Recurse -Force
   Remove-Item -Path node_modules\.cache -Recurse -Force
   ```

3. **Restart with webpack**
   ```bash
   npm run dev
   ```

## When to Use Turbopack
- Small projects with simple dependency graphs
- Linux/macOS environments (less file system issues)
- When you can tolerate occasional crashes
- Testing cutting-edge Next.js features

## When to Avoid Turbopack
- ✅ **Production builds** (always use webpack)
- ✅ **Windows development** (file system permission issues)
- ✅ **Complex dependency graphs** (task graph corruption)
- ✅ **Stable development workflow** (frequent crashes)

## Performance Comparison

| Metric | Webpack | Turbopack |
|--------|---------|-----------|
| Initial Build | ~10-15s | ~3-5s |
| Hot Reload | ~1-2s | ~100-500ms |
| Stability | ✅ Excellent | ⚠️ Experimental |
| Cache Issues | Rare | Frequent |
| Windows Support | ✅ Full | ⚠️ Limited |

## Related Issues
- [Next.js #60340](https://github.com/vercel/next.js/issues/60340) - Turbopack cache corruption
- [Next.js #59658](https://github.com/vercel/next.js/issues/59658) - Windows EPERM errors
- [Next.js #61234](https://github.com/vercel/next.js/issues/61234) - TaskId edge tracking panics

## Future Outlook
Turbopack is still experimental in Next.js 16. Consider re-evaluating in:
- Next.js 17+ when Turbopack becomes production-ready
- After Windows compatibility improvements
- When cache management is stabilized

## Recommendation
**Use webpack (`npm run dev`) for all development until Turbopack stabilizes.**

---

**Last Updated**: February 7, 2026  
**Status**: Webpack is default, Turbopack available via `npm run dev:turbo`
