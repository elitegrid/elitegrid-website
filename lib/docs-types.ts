export interface TocItem {
  depth: 2 | 3
  text: string
  id: string
}

export interface DocPage {
  num: string
  slug: string
  title: string
  blurb: string
  html: string
  toc: TocItem[]
}

export interface Manual {
  framework: string
  label: string
  overview: DocPage
  chapters: DocPage[]
}
