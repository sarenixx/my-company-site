import groq from "groq";

export const homepageQuery = groq`
  {
    "homepage": *[_type == "homepage"][0]{
      title,
      subtitle,
      buttonText,
      buttonLink,
      aboutHeadline,
      aboutParagraph,
      aboutPoints,
      "heroImageUrl": heroImage.asset->url
    },
    "investments": *[_type == "investment"] | order(_createdAt desc)[0...6]{
      _id,
      companyName,
      website,
      description,
      status,
      "logoUrl": logo.asset->url
    },
    "news": *[_type == "newsArticle"] | order(coalesce(publishedAt, _createdAt) desc)[0...4]{
      _id,
      title,
      excerpt,
      externalUrl,
      publishedAt
    },
    "team": *[_type == "teamMember"] | order(_createdAt asc)[0...6]{
      _id,
      name,
      role,
      bio,
      "photoUrl": photo.asset->url
    },
    "aboutPage": *[_type == "about"] | order(_updatedAt desc)[0]{
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
    "logoUrl": logo.asset->url
  }
`;

export const aboutPageQuery = groq`
  *[_type == "about"] | order(_updatedAt desc)[0]{
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
