import { useMemo, useState } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type {
  Citation,
  Message,
} from '@/types/chat'

type ChatMessageProps = {
  message: Message

  onRegenerate?: () => void

  onFeedback?: (
    feedback: 'like' | 'dislike'
  ) => void

  onVersionChange?: (
    version: number
  ) => void
}

const addCitationMarkers = (
  content: string,
  message: Message
) => {
  const supports =
    message.citationSupports ??
    []

  if (
    supports.length === 0
  ) {
    return content
  }

  let result = content

  const sortedSupports =
    [...supports].sort(
      (a, b) =>
        b.endIndex -
        a.endIndex
    )

  sortedSupports.forEach(
    (support) => {
      if (
        support.endIndex <
          0 ||
        support.endIndex >
          result.length
      ) {
        return
      }

      const markers =
        support.sourceIds
          .map(
            (id) =>
              `[${id}](citation://${id})`
          )
          .join('')

      result =
        result.slice(
          0,
          support.endIndex
        ) +
        markers +
        result.slice(
          support.endIndex
        )
    }
  )

  return result
}

function CitationLink({
  citation,
}: {
  citation: Citation
}) {
  return (
    <span className="group relative mx-0.5 inline-block">

      <a
        href={
          citation.url
        }
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-700 no-underline transition hover:bg-gray-300"
      >
        {citation.id}
      </a>

      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-72 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-left text-xs text-white shadow-xl group-hover:block">

        <span className="block font-semibold">
          {citation.title}
        </span>

        {citation.snippet && (
          <span className="mt-1 block text-gray-300">
            {
              citation.snippet
            }
          </span>
        )}

        <span className="mt-2 block break-all text-gray-400">
          {citation.url}
        </span>

      </span>

    </span>
  )
}

export function ChatMessage({
  message,
  onRegenerate,
  onFeedback,
  onVersionChange,
}: ChatMessageProps) {
  const isUser =
    message.role ===
    'user'

  const [
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
  ] = useState(false)

  const [
    feedbackSubmitted,
    setFeedbackSubmitted,
  ] = useState<
    'like' | 'dislike' | null
  >(
    message.feedback ??
      null
  )

  const [
    isMetadataOpen,
    setIsMetadataOpen,
  ] = useState(false)

  const versions =
    message.versions ??
    []

  const currentVersion =
    message.currentVersion ??
    0

  const hasMultipleVersions =
    versions.length > 1

  const citations =
    message.citations ??
    []

  const markdownContent =
    useMemo(
      () =>
        addCitationMarkers(
          message.content,
          message
        ),
      [
        message.content,
        message.citationSupports,
      ]
    )

  const handleLike =
    () => {
      if (!onFeedback) {
        return
      }

      onFeedback('like')

      setFeedbackSubmitted(
        'like'
      )
    }

  const handleDislikeClick =
    () => {
      setIsFeedbackModalOpen(
        true
      )
    }

  const confirmDislike =
    () => {
      if (!onFeedback) {
        return
      }

      onFeedback(
        'dislike'
      )

      setFeedbackSubmitted(
        'dislike'
      )

      setIsFeedbackModalOpen(
        false
      )
    }

  const goToPreviousVersion =
    () => {
      if (
        !onVersionChange ||
        currentVersion <= 0
      ) {
        return
      }

      onVersionChange(
        currentVersion - 1
      )
    }

  const goToNextVersion =
    () => {
      if (
        !onVersionChange ||
        currentVersion >=
          versions.length -
            1
      ) {
        return
      }

      onVersionChange(
        currentVersion + 1
      )
    }

  return (
    <>
      <div
        className={`flex ${
          isUser
            ? 'justify-end'
            : 'justify-start'
        }`}
      >
        <div className="max-w-[75%]">

          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              isUser
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">
                {
                  message.content
                }
              </p>
            ) : message.content ? (
              <div className="space-y-2 leading-relaxed">

                <ReactMarkdown
                  remarkPlugins={[
                    remarkGfm,
                  ]}
                  components={{
                    h1: ({
                      children,
                    }) => (
                      <h1 className="mb-3 mt-2 text-xl font-bold">
                        {
                          children
                        }
                      </h1>
                    ),

                    h2: ({
                      children,
                    }) => (
                      <h2 className="mb-2 mt-3 text-lg font-bold">
                        {
                          children
                        }
                      </h2>
                    ),

                    h3: ({
                      children,
                    }) => (
                      <h3 className="mb-2 mt-3 font-bold">
                        {
                          children
                        }
                      </h3>
                    ),

                    p: ({
                      children,
                    }) => (
                      <p className="my-2">
                        {
                          children
                        }
                      </p>
                    ),

                    ul: ({
                      children,
                    }) => (
                      <ul className="my-2 list-disc space-y-1 pl-6">
                        {
                          children
                        }
                      </ul>
                    ),

                    ol: ({
                      children,
                    }) => (
                      <ol className="my-2 list-decimal space-y-1 pl-6">
                        {
                          children
                        }
                      </ol>
                    ),

                    li: ({
                      children,
                    }) => (
                      <li>
                        {
                          children
                        }
                      </li>
                    ),

                    strong: ({
                      children,
                    }) => (
                      <strong className="font-semibold">
                        {
                          children
                        }
                      </strong>
                    ),

                    blockquote: ({
                      children,
                    }) => (
                      <blockquote className="my-3 border-l-4 border-gray-300 pl-4 italic text-gray-600">
                        {
                          children
                        }
                      </blockquote>
                    ),

                    a: ({
                      href,
                      children,
                    }) => {
                      if (
                        href?.startsWith(
                          'citation://'
                        )
                      ) {
                        const id =
                          Number(
                            href.replace(
                              'citation://',
                              ''
                            )
                          )

                        const citation =
                          citations.find(
                            (
                              item
                            ) =>
                              item.id ===
                              id
                          )

                        if (
                          !citation
                        ) {
                          return (
                            <span>
                              [
                              {
                                id
                              }
                              ]
                            </span>
                          )
                        }

                        return (
                          <CitationLink
                            citation={
                              citation
                            }
                          />
                        )
                      }

                      return (
                        <a
                          href={
                            href
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2"
                        >
                          {
                            children
                          }
                        </a>
                      )
                    },

                    code: ({
                      children,
                      className,
                      ...props
                    }) => {
                      const isBlock =
                        Boolean(
                          className
                        )

                      if (
                        isBlock
                      ) {
                        return (
                          <code
                            className={`${className ?? ''} block overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-gray-100`}
                            {...props}
                          >
                            {
                              children
                            }
                          </code>
                        )
                      }

                      return (
                        <code
                          className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs"
                          {...props}
                        >
                          {
                            children
                          }
                        </code>
                      )
                    },

                    pre: ({
                      children,
                    }) => (
                      <pre className="my-3 overflow-x-auto rounded-lg bg-gray-900">
                        {
                          children
                        }
                      </pre>
                    ),
                  }}
                >
                  {
                    markdownContent
                  }
                </ReactMarkdown>

              </div>
            ) : (
              <div className="flex items-center gap-1 py-1">

                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />

                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                  style={{
                    animationDelay:
                      '150ms',
                  }}
                />

                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                  style={{
                    animationDelay:
                      '300ms',
                  }}
                />

              </div>
            )}
          </div>

          {!isUser && (
            <>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">

                {onRegenerate && (
                  <button
                    onClick={
                      onRegenerate
                    }
                    className="hover:text-black"
                  >
                    Regenerate
                  </button>
                )}

                {hasMultipleVersions && (
                  <div className="flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1">

                    <button
                      onClick={
                        goToPreviousVersion
                      }
                      disabled={
                        currentVersion <=
                        0
                      }
                      className="font-bold hover:text-black disabled:opacity-30"
                    >
                      ‹
                    </button>

                    <span>
                      {
                        currentVersion +
                        1
                      }
                      {' / '}
                      {
                        versions.length
                      }
                    </span>

                    <button
                      onClick={
                        goToNextVersion
                      }
                      disabled={
                        currentVersion >=
                        versions.length -
                          1
                      }
                      className="font-bold hover:text-black disabled:opacity-30"
                    >
                      ›
                    </button>

                  </div>
                )}

                {onFeedback && (
                  <>
                    <button
                      onClick={
                        handleLike
                      }
                      title="Like"
                    >
                      👍
                    </button>

                    <button
                      onClick={
                        handleDislikeClick
                      }
                      title="Dislike"
                    >
                      👎
                    </button>
                  </>
                )}

                <button
                  onClick={() =>
                    setIsMetadataOpen(
                      !isMetadataOpen
                    )
                  }
                  className="hover:text-black"
                >
                  {isMetadataOpen
                    ? 'Hide details ▲'
                    : 'Response details ▼'}
                </button>

                {feedbackSubmitted && (
                  <span className="text-gray-400">
                    Feedback saved
                  </span>
                )}

              </div>

              {citations.length >
                0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">

                  <span className="font-medium">
                    Sources:
                  </span>

                  {citations.map(
                    (
                      citation
                    ) => (
                      <CitationLink
                        key={
                          citation.id
                        }
                        citation={
                          citation
                        }
                      />
                    )
                  )}

                </div>
              )}

              {isMetadataOpen && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600">

                  <div className="grid gap-2">

                    <div>
                      <span className="font-semibold text-gray-800">
                        Model:
                      </span>{' '}
                      gemini-3.5-flash
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">
                        Response type:
                      </span>{' '}
                      SSE streamed
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">
                        Format:
                      </span>{' '}
                      Markdown
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">
                        Grounding:
                      </span>{' '}
                      {citations.length >
                      0
                        ? 'Google Search'
                        : 'No web sources returned'}
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">
                        Sources:
                      </span>{' '}
                      {
                        citations.length
                      }
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">
                        Versions:
                      </span>{' '}
                      {Math.max(
                        versions.length,
                        1
                      )}
                    </div>

                  </div>

                </div>
              )}

            </>
          )}

        </div>
      </div>

      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">

            <h2 className="text-lg font-semibold text-gray-900">
              Submit feedback
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to mark this response as unhelpful?
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setIsFeedbackModalOpen(
                    false
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={
                  confirmDislike
                }
                className="rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Submit
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  )
}