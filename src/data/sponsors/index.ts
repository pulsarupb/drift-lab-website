export interface Sponsor {
  id: string
  name: string
  category?: string
  description?: string
  websiteUrl?: string
  logoUrl?: string
}

const sponsors: Sponsor[] = [
  {
    id: "purequad",
    name: "PureQuad",
    category: "Money",
    websiteUrl: "https://www.purequad.com/",
  },
  {
    id: "fimm",
    name: "FIMM",
    category: "Academic",
    websiteUrl: "http://www.mecanica.pub.ro/new/",
  },
  {
    id: "tech-con",
    name: "Tech-Con",
    category: "Products",
    websiteUrl: "https://tech-con.ro/en/",
  },
  {
    id: "nxp",
    name: "NXP",
    category: "Products",
    websiteUrl: "https://www.nxp.com/",
    logoUrl: "/nxp-logo.svg",
  },
  {
    id: "kiwisolar",
    name: "kiwisolar",
    category: "Products",
    websiteUrl: "https://kiwisolar.ro/",
  },
  {
    id: "mouser",
    name: "Mouser",
    category: "Discount",
    websiteUrl: "https://ro.mouser.com/",
  },
  {
    id: "campus",
    name: "CAMPUS",
    category: "Academic",
  },
  {
    id: "aft",
    name: "AFT",
    category: "Technical",
  },
  {
    id: "agora-robotics",
    name: "Agora Robotics",
    category: "Technical",
  },
]

export default sponsors
