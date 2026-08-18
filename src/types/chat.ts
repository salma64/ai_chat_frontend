export type Citation = {
  id: number
  title: string
  url: string
  snippet?: string
}

export type CitationSupport = {
  startIndex: number
  endIndex: number
  text: string
  sourceIds: number[]
}

export type ResponseVersion = {
  content: string
  citations?: Citation[]
  citationSupports?: CitationSupport[]
  createdAt?: string
}

export type MessageMetadata = {
  model?: string
  responseTime?: number
  createdAt?: string
}

export type Message = {
  id: number
  role: 'user' | 'assistant'
  content: string

  versions?: ResponseVersion[]
  currentVersion?: number

  citations?: Citation[]
  citationSupports?: CitationSupport[]

  metadata?: MessageMetadata

  feedback?: 'like' | 'dislike' | null
}