import { Helmet } from "react-helmet-async";

const DEFAULT_IMAGE = "https://resilium-platform.com/opengraph.jpg";
const SITE_NAME = "Resilium";

interface PageSEOProps {
  title: string;
  description: string;
  canonical: string;
  noIndex?: boolean;
  ogImage?: string;
}

export function PageSEO({ title, description, canonical, noIndex = false, ogImage }: PageSEOProps) {
  const image = ogImage ?? DEFAULT_IMAGE;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="resilium-platform.com" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

export function NoIndexPage() {
  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}
