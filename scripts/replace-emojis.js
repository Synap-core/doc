import fs from 'fs';
import path from 'path';

// Common emoji to icon mapping
const emojiToIcon = {
  '🚀': 'Rocket',
  '📚': 'BookOpen', 
  '🛠️': 'Wrench',
  '🤖': 'Cpu',
  '🏠': 'Home',
  '🏗️': 'Layers',
  '🧠': 'Brain',
  '🎮': 'Server', // Control Plane
  '📱': 'Smartphone',
  '⚙️': 'Terminal',
  '🔧': 'Wrench',
  '📊': 'BarChart',
  '🔗': 'Link',
  '📦': 'Package',
  '📖': 'Book',
  '🎯': 'Target',
  '👥': 'Users',
  '🔒': 'Lock',
  '⚡': 'Zap',
  '🛡️': 'Shield',
  '🌐': 'Globe',
  '💡': 'Lightbulb',
  '📝': 'FileText',
  '📅': 'Calendar',
  '✅': 'Check',
  '👤': 'User',
  '🏢': 'Building',
  '📈': 'TrendingUp',
  '📷': 'Camera',
  '📌': 'Pin',
  '📰': 'Newspaper',
  '➡️': 'ArrowRight',
  '▶️': 'Play',
  '⚠️': 'AlertTriangle',
  '❓': 'HelpCircle',
  '❗': 'AlertCircle',
  '⭐': 'Star',
  '🌟': 'Sparkles',
  '✨': 'Sparkles',
  '🔥': 'Flame',
  '💧': 'Droplet',
  '💎': 'Gem',
  '🔑': 'Key',
  '🔐': 'Lock',
  '🔓': 'Unlock',
  '🔔': 'Bell',
  '📢': 'Megaphone',
  '📣': 'Speaker',
  '🔍': 'Search',
  '🔎': 'ZoomIn',
  '📁': 'Folder',
  '📂': 'FolderOpen',
  '🗂️': 'Files',
  '🗃️': 'Archive',
  '📋': 'Clipboard',
  '📎': 'Paperclip',
  '📏': 'Ruler',
  '📐': 'Square',
  '🔬': 'Microscope',
  '🔭': 'Telescope',
  '📡': 'Satellite',
  '💬': 'MessageSquare',
  '🗨️': 'MessageCircle',
  '🗯️': 'MessageSquare',
  '📞': 'Phone',
  '📧': 'Mail',
  '📨': 'Inbox',
  '📩': 'MailOpen',
  '📤': 'Send',
  '📥': 'Inbox',
  '📦': 'Package',
  '📫': 'Mailbox',
  '📬': 'Mailbox',
  '📭': 'Mailbox',
  '📮': 'Mailbox',
  '🗳️': 'Vote',
  '📊': 'BarChart',
  '📈': 'TrendingUp',
  '📉': 'TrendingDown',
  '📋': 'ClipboardList',
  '📁': 'Folder',
  '📂': 'FolderOpen',
  '🗂️': 'Files',
  '🗃️': 'Archive',
  '📅': 'Calendar',
  '📆': 'CalendarDays',
  '🗓️': 'Calendar',
  '📇': 'Contact',
  '🗃️': 'CardFileBox',
  '🗄️': 'FileCabinet',
  '📋': 'Clipboard',
  '📎': 'Paperclip',
  '🖇️': 'Link',
  '📏': 'Ruler',
  '📐': 'Square',
  '✂️': 'Scissors',
  '📍': 'MapPin',
  '📌': 'PushPin',
  '🔍': 'Search',
  '🔎': 'ZoomIn',
  '🔏': 'FileLock',
  '🔐': 'FileLock',
  '🔒': 'Lock',
  '🔓': 'Unlock',
  '🔔': 'Bell',
  '📢': 'Megaphone',
  '📣': 'Speaker',
  '📯': 'Bugle',
  '🔕': 'BellOff',
  '🎵': 'Music',
  '🎶': 'Music',
  '🏷️': 'Tag',
  '💰': 'DollarSign',
  '💴': 'Yen',
  '💵': 'DollarSign',
  '💶': 'Euro',
  '💷': 'PoundSterling',
  '💸': 'DollarSign',
  '💳': 'CreditCard',
  '🧾': 'Receipt',
  '💹': 'ChartLine',
  '✉️': 'Mail',
  '📧': 'Mail',
  '📨': 'Inbox',
  '📩': 'MailOpen',
  '📤': 'Send',
  '📥': 'Inbox',
  '📦': 'Package',
  '📫': 'Mailbox',
  '📬': 'Mailbox',
  '📭': 'Mailbox',
  '📮': 'Mailbox',
  '🗳️': 'Vote',
  '✏️': 'Edit',
  '✒️': 'Pen',
  '🖋️': 'Pen',
  '🖊️': 'Pen',
  '🖌️': 'Paintbrush',
  '🖍️': 'Palette',
  '📝': 'FileText',
  '💼': 'Briefcase',
  '📁': 'Folder',
  '📂': 'FolderOpen',
  '🗂️': 'Files',
  '🗃️': 'Archive',
  '📅': 'Calendar',
  '📆': 'CalendarDays',
  '🗓️': 'Calendar',
  '📇': 'Contact',
  '🗃️': 'CardFileBox',
  '🗄️': 'FileCabinet',
  '📋': 'Clipboard',
  '📎': 'Paperclip',
  '🖇️': 'Link',
  '📏': 'Ruler',
  '📐': 'Square',
  '✂️': 'Scissors',
  '📍': 'MapPin',
  '📌': 'PushPin',
  '🔍': 'Search',
  '🔎': 'ZoomIn',
  '🔏': 'FileLock',
  '🔐': 'FileLock',
  '🔒': 'Lock',
  '🔓': 'Unlock',
};

function replaceEmojisInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [emoji, iconName] of Object.entries(emojiToIcon)) {
    if (content.includes(emoji)) {
      changed = true;
      // Replace emoji with IconMap component
      content = content.replace(
        new RegExp(emoji, 'g'),
        `<IconMap name="${iconName}" size={20} className="inline ml-1" />`
      );
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Process all MDX files
const docsDir = path.join(process.cwd(), 'content/docs');
const files = [];

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
}

walkDir(docsDir);

console.log(`Found ${files.length} MDX files`);

let updatedCount = 0;
for (const file of files) {
  if (replaceEmojisInFile(file)) {
    updatedCount++;
  }
}

console.log(`Updated ${updatedCount} files`);