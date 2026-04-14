// Export all components
export { AuthGuard } from './AuthGuard';
export { SpaceSwitcher } from './SpaceSwitcher';
export { SignIn } from './auth/SignIn';
export { TeamSpacesGrid, PublicSpacesGrid } from './SpaceGrids';
export { Hero, HeroCard } from './Hero';
export { SpaceCard, SpaceGrid } from './SpaceCard';

// Fumadocs components re-exported for convenience
// Note: MDX files should import directly from 'fumadocs-ui/components/*' 
// to avoid type issues and ensure proper styling

export {
  NavigationMenu,
  NavigationMenuSection,
  NavigationMenuItem,
  QuickActionsMenu
} from './ui/navigation-menu';
