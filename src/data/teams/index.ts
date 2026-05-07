import pulsarTeamPhoto from "./photos/pulsar/pulsar-team.png?url"
import pulsarDronePhoto from "./photos/pulsar/drone.jpeg?url"
import pulsarElectronicsPhoto from "./photos/pulsar/electronics.jpeg?url"
import pulsarLogosPhoto from "./photos/pulsar/logos.jpeg?url"
import pulsarPeoplePhoto from "./photos/pulsar/people.jpeg?url"
import pulsarRoverOnePhoto from "./photos/pulsar/rover-1.jpeg?url"
import pulsarRoverTwoPhoto from "./photos/pulsar/rover-2.jpeg?url"
import pulsarRoverThreePhoto from "./photos/pulsar/rover-3.jpeg?url"

export interface Team {
  id: TeamId
  name: string
  focus: TeamFocus
  description: string
  color: TeamColor
  socialLinks: TeamSocialLink[]
  heroImageUrl?: string
  galleryImages?: string[]
}

export enum TeamId {
  PULSAR = "pulsar",
  TECHTRAX = "techtrax",
  NOXP = "noxp",
}

export enum TeamFocus {
  EUROPEAN_ROVER_CHALLENGE = "European Rover Challenge",
  BFMC_COMPETITION = "BFMC Competition",
  NXP_CUP_COMPETITION = "NXP Cup Competition",
}

export enum TeamColor {
  PULSAR = "var(--color-accent-pulsar)",
  TECHTRAX = "var(--color-accent-bosch)",
  DRIFT_LAB = "var(--color-accent-nxp)",
}

export enum TeamSocialPlatform {
  INSTAGRAM = "Instagram",
  GITHUB = "GitHub",
}

export interface TeamSocialLink {
  platform: TeamSocialPlatform
  url: string
}

export const teams = [
  {
    id: TeamId.PULSAR,
    name: "PULSAR",
    focus: TeamFocus.EUROPEAN_ROVER_CHALLENGE,
    description:
      "Student team designing and building autonomous planetary rovers for the European Rover Challenge.",
    color: TeamColor.PULSAR,
    socialLinks: [
      {
        platform: TeamSocialPlatform.INSTAGRAM,
        url: "https://www.instagram.com/pulsar.upb/",
      },
      {
        platform: TeamSocialPlatform.GITHUB,
        url: "https://github.com/pulsarupb",
      },
    ],
    heroImageUrl: pulsarTeamPhoto,
    galleryImages: [
      pulsarDronePhoto,
      pulsarElectronicsPhoto,
      pulsarLogosPhoto,
      pulsarPeoplePhoto,
      pulsarRoverOnePhoto,
      pulsarRoverTwoPhoto,
      pulsarRoverThreePhoto,
      pulsarTeamPhoto,
    ],
  },
  {
    id: TeamId.TECHTRAX,
    name: "TechTrax",
    focus: TeamFocus.BFMC_COMPETITION,
    description:
      "Competing in the Bosch Future Mobility Challenge with autonomous driving solutions.",
    color: TeamColor.TECHTRAX,
    socialLinks: [],
  },
  {
    id: TeamId.NOXP,
    name: "NoXp",
    focus: TeamFocus.NXP_CUP_COMPETITION,
    description:
      "Developing high-speed autonomous racing vehicles for the NXP Cup competition.",
    color: TeamColor.DRIFT_LAB,
    socialLinks: [],
  },
] satisfies Team[]

export function teamSlug(team: Pick<Team, "id">): string {
  return team.id
}

export function teamDisplayName(teamId: TeamId): string {
  const team = teams.find((entry) => entry.id === teamId)
  return team?.name ?? teamId
}

export default teams
