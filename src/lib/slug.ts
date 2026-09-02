/** URL-safe id for a project, used to deep-link the Fun page's showcase to one card. */
export const projectSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
