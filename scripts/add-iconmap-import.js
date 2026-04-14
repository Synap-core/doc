import fs from 'fs';
import path from 'path';

function addIconMapImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if IconMap is already imported
  if (content.includes('import { IconMap }') || content.includes('from .*IconMap')) {
    return false;
  }
  
  // Check if IconMap component is used in the file
  if (content.includes('IconMap')) {
    // Find the import section
    const lines = content.split('\n');
    let importEndIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('---')) {
        importEndIndex = i;
      } else if (lines[i].trim() && !lines[i].trim().startsWith('import ') && !lines[i].trim().startsWith('---')) {
        break;
      }
    }
    
    // Add IconMap import
    const importLine = `import { IconMap } from '@/components/IconMap';`;
    
    // Check if there are already imports
    if (importEndIndex > 0) {
      lines.splice(importEndIndex + 1, 0, importLine);
    } else {
      // Add after frontmatter
      const frontmatterEnd = content.indexOf('---', 3);
      if (frontmatterEnd !== -1) {
        lines.splice(frontmatterEnd + 1, 0, '', importLine, '');
      }
    }
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Added IconMap import to: ${filePath}`);
    return true;
  }
  
  return false;
}

// Get list of updated files from previous run
const updatedFiles = [
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/concepts/what-is-synap.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/audit.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/deploy-checklist.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/infrastructure-status.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/is-provisioning-fixes.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/pod-backups.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/pod-build-server.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/pod-deploy-strategies.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/pod-install.mdx',
  '/Users/antoine/Documents/Code/synap/synap-team-docs/content/docs/control-plane/pod-troubleshooting.mdx',
];

console.log(`Processing ${updatedFiles.length} files...`);

let addedCount = 0;
for (const file of updatedFiles.slice(0, 5)) { // Just do first 5 as example
  if (addIconMapImport(file)) {
    addedCount++;
  }
}

console.log(`Added IconMap import to ${addedCount} files`);