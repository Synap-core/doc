'use client';

import { SpaceCard, SpaceGrid } from './SpaceCard';
import { spaces } from '@/lib/spaces';
import { useAuth } from './AuthProvider';

export function TeamSpacesGrid() {
  const { isAuthenticated } = useAuth();
  const teamSpaces = spaces.filter(space => space.requireAuth);

  if (!isAuthenticated) {
    return (
      <div className="p-6 rounded-xl border border-fd-border bg-fd-card text-center">
        <p className="text-fd-foreground mb-2">
          Team spaces are hidden
        </p>
        <p className="text-sm text-fd-muted-foreground">
          Sign in to access {teamSpaces.length} team documentation spaces
        </p>
      </div>
    );
  }

  return (
    <SpaceGrid>
      {teamSpaces.map((space) => (
        <SpaceCard
          key={space.id}
          title={space.title}
          description={space.description}
          icon={space.icon}
          href={space.path}
          variant="default"
        />
      ))}
    </SpaceGrid>
  );
}

export function PublicSpacesGrid({ limit }: { limit?: number }) {
  const publicSpaces = spaces.filter(space => !space.requireAuth);
  const displaySpaces = limit ? publicSpaces.slice(0, limit) : publicSpaces;

  return (
    <SpaceGrid>
      {displaySpaces.map((space) => (
        <SpaceCard
          key={space.id}
          title={space.title}
          description={space.description}
          icon={space.icon}
          href={space.path}
          variant="public"
        />
      ))}
    </SpaceGrid>
  );
}
