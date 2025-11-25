# Synap Documentation

This is the official documentation website for [Synap](https://synap.ai), an event-sourced knowledge backend with AI capabilities.

Built with [Docusaurus](https://docusaurus.io/), a modern static website generator.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- pnpm 8.15+

### Installation

```bash
pnpm install
```

### Local Development

```bash
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Preview Build

```bash
pnpm serve
```

This command serves the built site locally for testing.

## 📁 Project Structure

```
.
├── docs/              # Documentation markdown files
├── src/
│   ├── components/   # React components (MermaidFullscreen, etc.)
│   ├── css/          # Custom styles
│   └── pages/        # Custom pages
├── static/           # Static assets (images, etc.)
├── docusaurus.config.ts  # Docusaurus configuration
└── sidebars.ts       # Sidebar navigation structure
```

## 🎨 Features

- **Mermaid Diagrams**: Interactive, zoomable diagrams with fullscreen support
- **Multi-language**: English and French support
- **Dark Mode**: Automatic theme switching
- **Type-safe**: TypeScript throughout
- **Responsive**: Mobile-friendly design

## 📝 Contributing

### Adding New Documentation

1. Create a new `.md` file in the appropriate `docs/` subdirectory
2. Add the file to `sidebars.ts` to include it in navigation
3. Use the `MermaidFullscreen` component for diagrams:

```tsx
import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Diagram Title"
  value={`graph TD
    A --> B`} 
/>
```

### Updating Existing Documentation

- All markdown files are in `docs/`
- Update `sidebars.ts` if you change the structure
- Run `pnpm build` to check for broken links

## 🚢 Deployment

### GitHub Pages

```bash
GIT_USER=<Your GitHub username> pnpm deploy
```

### Vercel / Netlify

The site can be deployed to any static hosting service. The build output is in the `build/` directory.

### Environment Variables

No environment variables are required for local development or build.

## 🔗 Links

- **Documentation**: https://docs.synap.ai
- **Main Repository**: https://github.com/Synap-core/backend
- **Issues**: https://github.com/Synap-core/backend/issues

## 📄 License

This documentation is part of the Synap project. See the main repository for license information.
