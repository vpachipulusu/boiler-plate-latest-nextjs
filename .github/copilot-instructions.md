# GitHub Copilot Instructions

## Agent Skills

This project includes specialized agent skills for enhanced development workflows. Skills are automatically loaded from `.agents/skills/`.

### Available Skills

<skills>
<skill>
<name>browser-use</name>
<description>Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, or extract information from web pages.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\browser-use\SKILL.md</file>
</skill>
<skill>
<name>capacitor-best-practices</name>
<description>Best practices for Capacitor app development including project structure, plugin usage, performance optimization, security, and deployment. Use this skill when reviewing Capacitor code, setting up new projects, or optimizing existing apps.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\capacitor-best-practices\SKILL.md</file>
</skill>
<skill>
<name>find-skills</name>
<description>Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\find-skills\SKILL.md</file>
</skill>
<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\frontend-design\SKILL.md</file>
</skill>
<skill>
<name>next-best-practices</name>
<description>Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\next-best-practices\SKILL.md</file>
</skill>
<skill>
<name>vercel-react-native-skills</name>
<description>React Native and Expo best practices for building performant mobile apps. Use</description>
<file>c:\MainData\NewSourceCode\boiler-plate-latest-nextjs\.agents\skills\vercel-react-native-skills\SKILL.md</file>
</skill>
</skills>

### Usage

When you ask GitHub Copilot to perform tasks related to these domains, it will automatically utilize the appropriate skill and follow the detailed guidelines defined in `.agents/skills/<skill-name>/SKILL.md`.

## Project Context

This is a Next.js SaaS boilerplate with the following stack:
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Stripe integration for payments
- Firebase for authentication
- Capacitor for mobile app deployment

Copilot should follow the established patterns and conventions in this codebase when generating or modifying code.
