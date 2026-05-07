import { getCollection, type CollectionEntry } from "astro:content"
import membersData, { memberSlug, type Member } from "../members"
import { TeamId } from "../teams"

export type BlogPost = CollectionEntry<"blog">

const memberBySlug = new Map(membersData.map((member) => [memberSlug(member), member]))

function byPublishDateDesc(a: BlogPost, b: BlogPost): number {
  return b.data.publishDate.getTime() - a.data.publishDate.getTime()
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", (entry) => !entry.data.draft)
  return posts.sort(byPublishDateDesc)
}

export async function getPostsByTeam(teamId: TeamId): Promise<BlogPost[]> {
  const posts = await getPublishedPosts()
  return posts.filter((post) => post.data.team === teamId)
}

export async function getPostsByMember(member: Member): Promise<BlogPost[]> {
  const slug = memberSlug(member)
  const posts = await getPublishedPosts()
  return posts.filter((post) => post.data.members.includes(slug))
}

export function postSlug(post: BlogPost): string {
  return post.id.replace(/\.md$/i, "")
}

export function resolvePostMembers(post: BlogPost): Member[] {
  return post.data.members
    .map((slug) => memberBySlug.get(slug))
    .filter((member): member is Member => Boolean(member))
}

export function resolvePostTeam(post: BlogPost): TeamId {
  return post.data.team
}
