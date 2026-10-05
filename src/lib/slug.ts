/** URL-safe id for a project or client — `?p=<slug>` opens that project's case study. */
export const projectSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
