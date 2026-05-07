export interface Team {
  id: TeamId
  name: string
  focus: TeamFocus
  description: string
  color: TeamColor
}

export enum TeamId {
  PULSAR = "pulsar",
  TECHTRAX = "techtrax",
  DRIFT_LAB = "drift-lab",
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

export const teams = [
  {
    id: TeamId.PULSAR,
    name: "PULSAR",
    focus: TeamFocus.EUROPEAN_ROVER_CHALLENGE,
    description:
      "Student team designing and building autonomous planetary rovers for the European Rover Challenge.",
    color: TeamColor.PULSAR,
  },
  {
    id: TeamId.TECHTRAX,
    name: "TechTrax",
    focus: TeamFocus.BFMC_COMPETITION,
    description:
      "Competing in the Bosch Future Mobility Challenge with autonomous driving solutions.",
    color: TeamColor.TECHTRAX,
  },
  {
    id: TeamId.DRIFT_LAB,
    name: "Drift Lab",
    focus: TeamFocus.NXP_CUP_COMPETITION,
    description:
      "Developing high-speed autonomous racing vehicles for the NXP Cup competition.",
    color: TeamColor.DRIFT_LAB,
  },
] satisfies Team[]

export default teams
