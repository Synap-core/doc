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
    
    // Architecture
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/ecosystem-analysis',
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
        'architecture/sdk-strategy',
        'architecture/hub-protocol-flow',
        {
          type: 'category',
          label: 'Core Concepts',
          items: [
            'architecture/core-concepts/data-sovereignty',
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
          label: 'SDK',
          items: [
            'development/sdk/sdk-reference',
            'development/sdk/react-integration',
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
    
    // API Reference
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/event-types-catalog',
        'api/event-schema',                 
        {
          type: 'category',
          label: 'SDK',
          items: [
            'api/client-sdk',
            'api/unified-sdk',
          ],
        },
        {
          type: 'category',
          label: 'Data Pod',
          items: [
            'api/data-pod/overview',
            'api/data-pod/authentication',
            'api/data-pod/notes',
            'api/data-pod/chat',
            'api/data-pod/events',
            'api/data-pod/hub',
            'api/data-pod/api-keys',
          ],
        },
        {
          type: 'category',
          label: 'Hub Protocol',
          items: [
            'api/hub-protocol/overview',
            'api/hub-protocol/authentication',
            'api/hub-protocol/data-request',
            'api/hub-protocol/insight-submission',
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
