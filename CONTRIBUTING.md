# Contributing to Synap Documentation

Thank you for your interest in contributing to the Synap documentation!

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Documentation Guidelines](#documentation-guidelines)
- [Adding Diagrams](#adding-diagrams)
- [Style Guide](#style-guide)
- [Submitting Changes](#submitting-changes)

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/synap-docs.git`
3. Install dependencies: `pnpm install`
4. Start the dev server: `pnpm start`
5. Make your changes
6. Test locally: `pnpm build`
7. Submit a pull request

## 📝 Documentation Guidelines

### File Structure

- Place files in the appropriate `docs/` subdirectory
- Use kebab-case for file names: `my-new-page.md`
- Add frontmatter to all pages:

```markdown
---
sidebar_position: 1
---

# Page Title
```

### Content Standards

- **Be clear and concise**: Write for developers of all levels
- **Use examples**: Show, don't just tell
- **Keep it updated**: Remove outdated information
- **Link appropriately**: Link to related pages and external resources

## 🎨 Adding Diagrams

Use the `MermaidFullscreen` component for all diagrams:

```tsx
import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Diagram Title"
  value={`graph TD
    A[Start] --> B[Process]
    B --> C[End]`} 
/>
```

### Diagram Best Practices

- Keep diagrams focused and readable
- Use descriptive node labels
- Avoid `@` symbols in Mermaid labels (use `synap/client` instead of `@synap/client`)
- Test diagrams in both light and dark modes

## ✍️ Style Guide

### Code Blocks

Use appropriate language tags:

```typescript
// TypeScript example
const client = new SynapClient();
```

```bash
# Shell command
pnpm install
```

### Links

- **Internal links**: Use relative paths: `[Link Text](./other-page.md)`
- **External links**: Use full URLs: `[Synap](https://synap.ai)`

### Headings

- Use `##` for main sections
- Use `###` for subsections
- Keep heading hierarchy logical

## 🔄 Submitting Changes

1. **Create a branch**: `git checkout -b my-documentation-update`
2. **Make your changes**: Edit files, add new content
3. **Test locally**: Run `pnpm build` to check for errors
4. **Commit**: Use clear, descriptive commit messages
5. **Push**: `git push origin my-documentation-update`
6. **Pull Request**: Open a PR with a clear description

### PR Guidelines

- Describe what you changed and why
- Reference related issues if applicable
- Ensure the build passes
- Request review from maintainers

## 🐛 Reporting Issues

If you find errors or have suggestions:

1. Check if an issue already exists
2. Create a new issue with:
   - Clear title
   - Description of the problem
   - Steps to reproduce (if applicable)
   - Screenshots (if helpful)

## ❓ Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review closed issues/PRs

Thank you for helping improve Synap documentation! 🎉

