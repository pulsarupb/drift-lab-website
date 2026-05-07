import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"
import { TeamId } from "./data/teams"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishDate: z.coerce.date(),
    team: z.nativeEnum(TeamId),
    members: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
})

export const collections = {
  blog,
}
