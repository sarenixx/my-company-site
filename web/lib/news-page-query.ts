import groq from "groq";

export const newsPageWithCompaniesQuery = groq`
  {
    "news": *[_type == "newsArticle"] | order(coalesce(publishedAt, _createdAt) desc){
      _id,
      title,
      excerpt,
      sourcePublication,
      externalUrl,
      publishedAt,
      "relatedInvestmentId": relatedInvestment->_id,
      "relatedInvestmentName": relatedInvestment->companyName
    },
    "portfolioCompanies": *[_type == "investment"] | order(companyName asc){
      _id,
      companyName
    }
  }
`;
