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
    "team": *[_type == "teamMember"] | order(_createdAt asc)[0...6]{
      _id,
      name,
      role,
      bio,
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

export const investmentsQuery = groq`
  *[_type == "investment"] | order(_createdAt desc){
    _id,
    companyName,
    website,
    description,
    status,
    "logoUrl": coalesce(logo.asset->url, logoExternalUrl)
  }
`;

export const aboutPageQuery = groq`
  *[_type == "about" && _id == "about-main"][0]{
    _id,
    title,
    content
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
