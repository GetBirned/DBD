export interface PlatformLogo {
  name: string
  logo: string
}

export const platforms: PlatformLogo[] = [
  { name: 'WordPress', logo: '/logos/platform_logos/wordpress.svg' },
  { name: 'Squarespace', logo: '/logos/platform_logos/squarespace.svg' },
  { name: 'Wix', logo: '/logos/platform_logos/wix.svg' },
  { name: 'Shopify', logo: '/logos/platform_logos/shopify.svg' },
  // Not a company — reusing the site's own </> mark, which opens the Projects chapter.
  { name: 'Custom Code', logo: '/logos/codeSymbol.webp' },
]
