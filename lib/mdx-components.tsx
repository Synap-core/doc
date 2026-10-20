import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

/**
 * MDX component map for the docs collection: the fumadocs defaults (headings
 * with anchors, code blocks, Card/Cards, Callout) plus Steps and Tabs, so a
 * page can use them without an import.
 */
export const mdxComponents = {
  ...defaultMdxComponents,
  Step,
  Steps,
  Tab,
  Tabs,
};
