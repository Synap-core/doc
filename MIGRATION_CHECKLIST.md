# Migration Checklist: Separating Documentation Repository

This checklist covers all steps needed before separating the documentation into its own repository.

## ✅ Pre-Migration Checklist

### 1. Update GitHub References

**Files to update:**
- [ ] `docusaurus.config.ts`:
  - [ ] `projectName`: Change from `synap-backend` to `synap-docs` (or your chosen name)
  - [ ] `editUrl`: Update to point to new repo path
  - [ ] Footer links: Update GitHub links
  - [ ] Navbar links: Update GitHub links

**Search and replace:**
```bash
# Find all occurrences
grep -r "github.com/synap/synap-backend" .

# Replace with new repo URL (example)
# OLD: https://github.com/synap/synap-backend
# NEW: https://github.com/synap/synap-docs
```

### 2. Update Configuration

- [ ] `docusaurus.config.ts`: Update `organizationName` and `projectName`
- [ ] `package.json`: Update `name` field if needed
- [ ] Verify `url` and `baseUrl` are correct for production

### 3. Assets Review

- [ ] Check `static/img/` for placeholder images:
  - [ ] Replace `docusaurus-social-card.jpg` with actual Synap branding
  - [ ] Replace `logo.svg` with actual Synap logo
  - [ ] Replace `favicon.ico` with actual favicon
  - [ ] Remove unused Docusaurus example images

### 4. Documentation Files

- [ ] Review all markdown files for broken internal links
- [ ] Update any hardcoded paths that reference the main repo
- [ ] Ensure all Mermaid diagrams use `MermaidFullscreen` component
- [ ] Verify all code examples are up-to-date

### 5. Repository Setup

- [ ] Create new repository (e.g., `synap-docs`)
- [ ] Initialize with proper `.gitignore` (already present)
- [ ] Set up branch protection rules
- [ ] Configure GitHub Pages settings (if using GitHub Pages)

### 6. CI/CD Setup

- [ ] Review `.github/workflows/deploy.yml`
- [ ] Update CNAME if using custom domain
- [ ] Test deployment workflow
- [ ] Set up deployment secrets if needed

### 7. Dependencies

- [ ] Verify all dependencies are in `package.json`
- [ ] No dependencies on parent monorepo packages
- [ ] Lock file (`pnpm-lock.yaml`) is up-to-date

## 📋 Post-Migration Tasks

### 1. Update Main Repository

- [ ] Add link to documentation in main repo README
- [ ] Update any documentation links in main repo
- [ ] Update CI/CD if it referenced docs

### 2. Communication

- [ ] Update any external links pointing to docs
- [ ] Notify team of new repository location
- [ ] Update project documentation references

### 3. Testing

- [ ] Test local development: `pnpm start`
- [ ] Test production build: `pnpm build`
- [ ] Test deployment process
- [ ] Verify all links work
- [ ] Test Mermaid diagrams in fullscreen mode
- [ ] Test dark/light mode switching
- [ ] Test mobile responsiveness

## 🔧 Quick Update Script

After creating the new repository, run this to update all GitHub references:

```bash
# Update docusaurus.config.ts
sed -i '' 's|synap-backend|synap-docs|g' docusaurus.config.ts

# Update all markdown files (be careful with this!)
find docs -name "*.md" -exec sed -i '' 's|github.com/synap/synap-backend|github.com/synap/synap-docs|g' {} \;
```

**⚠️ Review changes carefully before committing!**

## 📝 Notes

- The documentation is now **fully independent** - no dependencies on parent repo
- All components (MermaidFullscreen, etc.) are self-contained
- Build process is standalone
- Can be deployed to any static hosting service

## 🚀 Deployment Options

1. **GitHub Pages**: Already configured in workflow
2. **Vercel**: Connect repo, auto-deploys
3. **Netlify**: Connect repo, auto-deploys
4. **Cloudflare Pages**: Connect repo, auto-deploys

All options work with the static build output in `build/` directory.

