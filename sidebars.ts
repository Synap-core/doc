import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    // Getting Started
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quickstart',
        'getting-started/why-events',
        'getting-started/next-steps',
      ],
    },
    
    // Concepts (NEW!)
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/what-is-synap',
        'concepts/event-sourcing-explained',
        'concepts/knowledge-graph',
        'concepts/branching-conversations',
        'concepts/multi-agent-system',
        'concepts/data-sovereignty',
      ],
    },
    
    // Architecture
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/ecosystem-analysis',
        'architecture/core-patterns',
        'architecture/permission-model',
        'architecture/event-flow',
        {
          type: 'category',
          label: 'Events & Automation',      
          items: [
            'architecture/events/event-architecture',
            'architecture/events/automation-system',
            'architecture/events/event-metadata',
          ],
        },
        'architecture/ai-architecture',
        'architecture/hub-protocol-flow',
        {
          type: 'category',
          label: 'Core Concepts',
          items: [
            'architecture/core-concepts/hub-spoke',
            'architecture/core-concepts/plugin-system',
          ],
        },
        {
          type: 'category',
          label: 'Components',
          items: [
            'architecture/components/data-pod',
            'architecture/components/client-sdk',
          ],
        },
        {
          type: 'category',
          label: 'Security',
          items: [
            'architecture/security/authentication',
            'architecture/security/data-confidentiality',
          ],
        },
        'architecture/storage',
      ],
    },
    
    // Tutorials (NEW!)
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/minute-demo',
        'tutorials/build-knowledge-graph-view',
      ],
    },
    
    // Guides (reorganized)
    {
      type: 'category',
      label: 'Guides',
      items: [
        {
          type: 'category',
          label: 'By Use Case',
          items: [
            'guides/by-use-case/second-brain',
            'guides/by-use-case/team-collaboration',
          ],
        },
      ],
    },
    
    // Development
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/setup',
        {
          type: 'category',
          label: 'Core Contribution',
          items: [
            'development/core-contribution/overview',
            'development/core-contribution/monorepo-structure',
            'development/core-contribution/router-development',
          ],
        },
        {
          type: 'category',
          label: 'Plugin Development',
          items: [
            'development/plugin-development/overview',
            'development/plugin-development/direct-plugins',
            'development/plugin-development/remote-plugins',
            'development/plugin-development/hybrid-plugins',
            'development/plugin-development/intelligence-registry',
          ],
        },
        {
          type: 'category',
          label: 'Data Pod SDK',
          items: [
            'development/sdk/overview',
            'development/sdk/basic-usage',
            'development/sdk/react-integration',
            'development/sdk/sdk-reference',
          ],
        },
        {
          type: 'category',
          label: 'Contributing',
          items: [
            'development/contributing/code-style',
            'development/contributing/testing',
          ],
        },
      ],
    },
    
    // Integrations
    {
      type: 'category',
      label: 'Integrations',                
      items: [
        'integrations/webhooks-guide',       
        'integrations/n8n',                  
      ],
    },
    
    // Deployment
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/overview',
        {
          type: 'category',
          label: 'Data Pod',
          items: [
            'deployment/data-pod/self-hosted',
            'deployment/data-pod/docker',
            'deployment/data-pod/production',
          ],
        },
        {
          type: 'category',
          label: 'Infrastructure',
          items: [
            'deployment/infrastructure/database',
            'deployment/infrastructure/storage',
          ],
        },
      ],
    },
    
    // Reference (Quick lookup)
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/event-catalog',
        'reference/events-api',
      ],
    },
    
    // Resources (NEW!)
    {
      type: 'category',
      label: 'Resources',
      items: [
        {
          type: 'category',
          label: 'Comparisons',
          items: [
            'resources/comparisons/vs-notion',
            'resources/comparisons/vs-obsidian',
          ],
        },
      ],
    },
    
    // Strategy
    {
      type: 'category',
      label: 'Strategy',
      items: [
        'strategy/vision',
        'strategy/roadmap',
      ],
    },
  ],
};

export default sidebars;
