import groq from "groq";

export const homepageQuery = groq`
  {
    "homepage": *[_type == "homepage" && _id == "homepage-main"][0]{
      title,
      subtitle,
      buttonText,
      buttonLink,
      aboutHeadline,
      aboutParagraph,
      aboutPoints,
      heroHeadline,
      heroHeadlineEmphasis,
      heroSubheadline,
      heroBackgroundLogoUrl,
      portfolioTickerItems[]{
        label,
        logoUrl,
        logoAlt
      },
      portfolioCtaText,
      portfolioCtaLink,
      aboutSectionTitle,
      aboutParagraphs,
      aboutStats[]{
        value,
        label
      },
      teamSectionTitle,
      teamSectionSubtitle,
      teamSectionDescription,
      teamPrimaryCtaText,
      teamPrimaryCtaLink,
      teamSecondaryCtaText,
      teamSecondaryCtaLink,
      platformSectionTitle,
      platformSectionSubtitle,
      resourcesSectionTitle,
      resourcesSectionSubtitle,
      resourcesCtaText,
      resourcesCtaLink,
      footerBrand,
      footerEmail,
      footerSocialLinks[]{
        label,
        url
      },
      footerLinks[]{
        label,
        url
      },
      "heroImageUrl": coalesce(heroImage.asset->url, heroImageUrl)
    },
    "investments": *[_type == "investment"] | order(_createdAt desc)[0...6]{
      _id,
      companyName,
      website,
      description,
      status,
      "logoUrl": coalesce(logo.asset->url, logoExternalUrl)
    },
    "news": *[_type == "newsArticle"] | order(coalesce(publishedAt, _createdAt) desc)[0...4]{
      _id,
      title,
      excerpt,
      sourcePublication,
      externalUrl,
      publishedAt
    },
    "team": *[_type == "teamMember"] | order(name asc)[0...6]{
      _id,
      name,
      role,
      bio,
      linkedin,
      email,
      "photoUrl": coalesce(photo.asset->url, photoExternalUrl)
    },
    "aboutPage": *[_type == "about" && _id == "about-main"][0]{
      _id,
      title,
      content
    },
    "jobs": *[_type == "jobPosting" && coalesce(isActive, true) == true] | order(_createdAt desc)[0...3]{
      _id,
      title,
      department,
      location,
      applyUrl,
      description
    }
  }
`;

export const homepageMockupQuery = groq`
  {
    "homepage": *[_type == "homepage" && _id == "homepage-main"][0]{
      title,
      subtitle,
      buttonText,
      buttonLink,
      aboutHeadline,
      aboutParagraph,
      aboutPoints,
      heroHeadline,
      heroHeadlineEmphasis,
      heroSubheadline,
      heroBackgroundLogoUrl,
      portfolioTickerItems[]{
        label,
        logoUrl,
        logoAlt
      },
      portfolioCtaText,
      portfolioCtaLink,
      aboutSectionTitle,
      aboutParagraphs,
      aboutStats[]{
        value,
        label
      },
      teamSectionTitle,
      teamSectionSubtitle,
      teamSectionDescription,
      teamPrimaryCtaText,
      teamPrimaryCtaLink,
      teamSecondaryCtaText,
      teamSecondaryCtaLink,
      platformSectionTitle,
      platformSectionSubtitle,
      resourcesSectionTitle,
      resourcesSectionSubtitle,
      resourcesCtaText,
      resourcesCtaLink,
      footerBrand,
      footerEmail,
      footerSocialLinks[]{
        label,
        url
      },
      footerLinks[]{
        label,
        url
      },
      "heroImageUrl": coalesce(heroImage.asset->url, heroImageUrl)
    },
    "investments": *[_type == "investment"] | order(companyName asc)[0...12]{
      _id,
      companyName,
      website,
      "logoUrl": coalesce(logo.asset->url, logoExternalUrl)
    },
    "latestNews": *[_type == "newsArticle"] | order(coalesce(publishedAt, _createdAt) desc)[0...4]{
      _id,
      title,
      sourcePublication,
      externalUrl
    },
    "teamCount": count(*[_type == "teamMember"]),
    "openRolesCount": count(*[_type == "jobPosting" && coalesce(isActive, true) == true])
  }
`;

export const aboutLandingQuery = groq`
  {
    "homepage": *[_type == "homepage" && _id == "homepage-main"][0]{
      title,
      subtitle,
      buttonText,
      buttonLink,
      aboutHeadline,
      aboutParagraph,
      aboutPoints,
      "heroImageUrl": coalesce(heroImage.asset->url, heroImageUrl)
    },
    "aboutPage": *[_type == "about" && _id == "about-main"][0]{
      _id,
      title,
      content
    }
  }
`;

export const investmentsQuery = groq`
  *[_type == "investment"] | order(companyName asc){
    _id,
    companyName,
    website,
    description,
    status,
    "logoUrl": coalesce(logo.asset->url, logoExternalUrl),
    "relatedNews": *[_type == "newsArticle" && references(^._id)] | order(coalesce(publishedAt, _createdAt) desc)[0...6]{
      _id,
      title,
      sourcePublication,
      externalUrl,
      publishedAt
    }
  }
`;

export const aboutPageQuery = groq`
  *[_type == "about" && _id == "about-main"][0]{
    _id,
    title,
    content
  }
`;

export const teamPageQuery = groq`
  *[_type == "teamMember"] | order(name asc){
    _id,
    name,
    role,
    linkedin,
    email,
    bio,
    "photoUrl": coalesce(photo.asset->url, photoExternalUrl)
  }
`;

export const newsPageQuery = groq`
  *[_type == "newsArticle"] | order(coalesce(publishedAt, _createdAt) desc){
    _id,
    title,
    excerpt,
    sourcePublication,
    externalUrl,
    publishedAt,
    "relatedInvestmentName": relatedInvestment->companyName
  }
`;

export const jobsQuery = groq`
  *[_type == "jobPosting" && coalesce(isActive, true) == true] | order(_createdAt desc){
    _id,
    title,
    department,
    location,
    applyUrl,
    description
  }
`;
