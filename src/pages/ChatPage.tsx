import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { ChatMessage } from '@/components/ChatMessage'
import { ChatInput } from '@/components/ChatInput'

import type {
  Citation,
  CitationSupport,
  Message,
  ResponseVersion,
} from '@/types/chat'

type Conversation = {
  conversationId: string
  title: string
  updatedAt: string
}

type ChatHistoryItem = {
  _id: string
  userMessage: string
  assistantMessage: string

  versions?: {
    content: string
    citations?: Citation[]
    citationSupports?: CitationSupport[]
    createdAt?: string
  }[]

  currentVersion?: number

  citations?: Citation[]
  citationSupports?: CitationSupport[]

  feedback?: 'like' | 'dislike' | null
}

type StreamResult = {
  text: string
  citations: Citation[]
  citationSupports: CitationSupport[]
}

const getConversationId = () => {
  let conversationId =
    localStorage.getItem('conversationId')

  if (!conversationId) {
    conversationId = crypto.randomUUID()

    localStorage.setItem(
      'conversationId',
      conversationId
    )
  }

  return conversationId
}

export function ChatPage() {
  const [
    conversationId,
    setConversationId,
  ] = useState(
    getConversationId()
  )

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([])

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true)

  const [
    isStreaming,
    setIsStreaming,
  ] = useState(false)

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([])

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isStreaming])

  const loadConversations =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            'http://localhost:3000/api/conversations'
          )

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }

        const data =
          await response.json()

        setConversations(data)
      } catch (error) {
        console.error(
          'Failed to load conversations:',
          error
        )
      }
    }, [])

  useEffect(() => {
    const loadHistory =
      async () => {
        setLoadingHistory(true)

        try {
          const response =
            await fetch(
              `http://localhost:3000/api/history/${conversationId}`
            )

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}`
            )
          }

          const history:
            ChatHistoryItem[] =
            await response.json()

          const loadedMessages:
            Message[] = []

          history.forEach(
            (chat, index) => {
              loadedMessages.push({
                id:
                  index * 2 + 1,

                role: 'user',

                content:
                  chat.userMessage,
              })

              let versions:
                ResponseVersion[]

              if (
                chat.versions &&
                chat.versions.length > 0
              ) {
                versions =
                  chat.versions.map(
                    (version) => ({
                      content:
                        version.content,

                      citations:
                        version.citations ??
                        [],

                      citationSupports:
                        version.citationSupports ??
                        [],

                      createdAt:
                        version.createdAt,
                    })
                  )
              } else {
                versions = [
                  {
                    content:
                      chat.assistantMessage,

                    citations:
                      chat.citations ??
                      [],

                    citationSupports:
                      chat.citationSupports ??
                      [],
                  },
                ]
              }

              const currentVersion =
                typeof chat.currentVersion ===
                  'number' &&
                chat.currentVersion >= 0 &&
                chat.currentVersion <
                  versions.length
                  ? chat.currentVersion
                  : versions.length - 1

              const activeVersion =
                versions[
                  currentVersion
                ]

              loadedMessages.push({
                id:
                  index * 2 + 2,

                role:
                  'assistant',

                content:
                  activeVersion.content,

                versions,

                currentVersion,

                citations:
                  activeVersion.citations ??
                  [],

                citationSupports:
                  activeVersion.citationSupports ??
                  [],

                feedback:
                  chat.feedback ??
                  null,
              })
            }
          )

          if (
            loadedMessages.length ===
            0
          ) {
            loadedMessages.push({
              id: 1,

              role:
                'assistant',

              content:
                'Hello! How can I help you today?',

              versions: [
                {
                  content:
                    'Hello! How can I help you today?',
                  citations: [],
                  citationSupports: [],
                },
              ],

              currentVersion: 0,

              citations: [],

              citationSupports: [],
            })
          }

          setMessages(
            loadedMessages
          )
        } catch (error) {
          console.error(
            'History load error:',
            error
          )

          setMessages([
            {
              id: 1,

              role:
                'assistant',

              content:
                'Hello! How can I help you today?',

              versions: [
                {
                  content:
                    'Hello! How can I help you today?',
                  citations: [],
                  citationSupports: [],
                },
              ],

              currentVersion: 0,

              citations: [],

              citationSupports: [],
            },
          ])
        } finally {
          setLoadingHistory(false)
        }
      }

    loadHistory()
  }, [conversationId])

  useEffect(() => {
    loadConversations()
  }, [
    conversationId,
    loadConversations,
  ])

  const handleNewChat = () => {
    if (isStreaming) return

    const newConversationId =
      crypto.randomUUID()

    localStorage.setItem(
      'conversationId',
      newConversationId
    )

    setConversationId(
      newConversationId
    )
  }

  const handleOpenConversation = (
    selectedConversationId: string
  ) => {
    if (isStreaming) return

    localStorage.setItem(
      'conversationId',
      selectedConversationId
    )

    setConversationId(
      selectedConversationId
    )
  }

  const streamResponse = async (
    content: string,
    assistantId: number,
    regenerate = false
  ): Promise<StreamResult> => {
    const response =
      await fetch(
        'http://localhost:3000/api/chat',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            message: content,
            conversationId,
            regenerate,
          }),
        }
      )

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      )
    }

    if (!response.body) {
      throw new Error(
        'No response stream'
      )
    }

    const reader =
      response.body.getReader()

    const decoder =
      new TextDecoder()

    let buffer = ''
    let streamedText = ''

    let citations:
      Citation[] = []

    let citationSupports:
      CitationSupport[] = []

    while (true) {
      const {
        done,
        value,
      } =
        await reader.read()

      if (done) break

      buffer +=
        decoder.decode(
          value,
          {
            stream: true,
          }
        )

      const events =
        buffer.split('\n\n')

      buffer =
        events.pop() || ''

      for (
        const event of events
      ) {
        if (
          !event.startsWith(
            'data: '
          )
        ) {
          continue
        }

        const data =
          event.slice(6)

        if (
          data === '[DONE]'
        ) {
          continue
        }

        let parsed

        try {
          parsed =
            JSON.parse(data)
        } catch (error) {
          console.error(
            'Stream parse error:',
            error
          )

          continue
        }

        if (parsed.error) {
          throw new Error(
            parsed.error
          )
        }

        if (
          parsed.type ===
          'citations'
        ) {
          citations =
            parsed.citations ??
            []

          citationSupports =
            parsed.citationSupports ??
            []

          continue
        }

        if (parsed.text) {
          streamedText +=
            parsed.text

          setMessages(
            (prev) =>
              prev.map(
                (message) =>
                  message.id ===
                  assistantId
                    ? {
                        ...message,

                        content:
                          message.content +
                          parsed.text,
                      }
                    : message
              )
          )
        }
      }
    }

    await loadConversations()

    return {
      text:
        streamedText,

      citations,

      citationSupports,
    }
  }

  const getErrorMessage = (
    error: unknown
  ) => {
    let errorMessage =
      'Something went wrong. Please try again.'

    if (
      error instanceof Error
    ) {
      if (
        error.message.includes(
          '429'
        ) ||
        error.message
          .toLowerCase()
          .includes(
            'rate limit'
          )
      ) {
        errorMessage =
          'Rate limit reached. Please wait a moment and try again.'
      } else if (
        error.message.includes(
          '503'
        ) ||
        error.message
          .toLowerCase()
          .includes('busy')
      ) {
        errorMessage =
          'Gemini is temporarily busy. Please try again shortly.'
      } else if (
        error.message.includes(
          '500'
        )
      ) {
        errorMessage =
          'The server encountered an error. Please try again.'
      } else if (
        error.message.includes(
          'Failed to fetch'
        )
      ) {
        errorMessage =
          'Cannot connect to the backend server.'
      }
    }

    return errorMessage
  }

  const handleSend = async (
    content: string
  ) => {
    if (isStreaming) return

    const userMessage:
      Message = {
      id: Date.now(),
      role: 'user',
      content,
    }

    const assistantId =
      Date.now() + 1

    const assistantMessage:
      Message = {
      id:
        assistantId,

      role:
        'assistant',

      content: '',

      versions: [],

      currentVersion: 0,

      citations: [],

      citationSupports: [],
    }

    setMessages(
      (prev) => [
        ...prev,
        userMessage,
        assistantMessage,
      ]
    )

    setIsStreaming(true)

    try {
      const result =
        await streamResponse(
          content,
          assistantId,
          false
        )

      const firstVersion:
        ResponseVersion = {
        content:
          result.text,

        citations:
          result.citations,

        citationSupports:
          result.citationSupports,
      }

      setMessages(
        (prev) =>
          prev.map(
            (message) =>
              message.id ===
              assistantId
                ? {
                    ...message,

                    content:
                      result.text,

                    versions: [
                      firstVersion,
                    ],

                    currentVersion:
                      0,

                    citations:
                      result.citations,

                    citationSupports:
                      result.citationSupports,
                  }
                : message
          )
      )
    } catch (error) {
      console.error(
        'Chat error:',
        error
      )

      const errorMessage =
        getErrorMessage(
          error
        )

      setMessages(
        (prev) =>
          prev.map(
            (message) =>
              message.id ===
              assistantId
                ? {
                    ...message,
                    content:
                      errorMessage,
                  }
                : message
          )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleRegenerate =
    async (
      assistantMessageId:
        number
    ) => {
      if (isStreaming) return

      const assistantIndex =
        messages.findIndex(
          (message) =>
            message.id ===
            assistantMessageId
        )

      if (
        assistantIndex <= 0
      ) {
        return
      }

      const previousMessage =
        messages[
          assistantIndex - 1
        ]

      const assistantMessage =
        messages[
          assistantIndex
        ]

      if (
        previousMessage.role !==
        'user'
      ) {
        return
      }

      const existingVersions:
        ResponseVersion[] =
        assistantMessage.versions &&
        assistantMessage.versions
          .length > 0
          ? [
              ...assistantMessage.versions,
            ]
          : [
              {
                content:
                  assistantMessage.content,

                citations:
                  assistantMessage.citations ??
                  [],

                citationSupports:
                  assistantMessage.citationSupports ??
                  [],
              },
            ]

      setMessages(
        (prev) =>
          prev.map(
            (message) =>
              message.id ===
              assistantMessageId
                ? {
                    ...message,
                    content: '',
                    citations: [],
                    citationSupports: [],
                  }
                : message
          )
      )

      setIsStreaming(true)

      try {
        const result =
          await streamResponse(
            previousMessage.content,
            assistantMessageId,
            true
          )

        const newVersion:
          ResponseVersion = {
          content:
            result.text,

          citations:
            result.citations,

          citationSupports:
            result.citationSupports,
        }

        const newVersions = [
          ...existingVersions,
          newVersion,
        ]

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message.id ===
                assistantMessageId
                  ? {
                      ...message,

                      content:
                        result.text,

                      versions:
                        newVersions,

                      currentVersion:
                        newVersions.length -
                        1,

                      citations:
                        result.citations,

                      citationSupports:
                        result.citationSupports,

                      feedback:
                        null,
                    }
                  : message
            )
        )
      } catch (error) {
        console.error(
          'Regenerate error:',
          error
        )

        const errorMessage =
          getErrorMessage(
            error
          )

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message.id ===
                assistantMessageId
                  ? {
                      ...message,
                      content:
                        errorMessage,
                    }
                  : message
            )
        )
      } finally {
        setIsStreaming(false)
      }
    }

  const handleVersionChange = (
    assistantMessageId: number,
    newVersion: number
  ) => {
    setMessages(
      (prev) =>
        prev.map(
          (message) => {
            if (
              message.id !==
                assistantMessageId ||
              !message.versions
            ) {
              return message
            }

            const version =
              message.versions[
                newVersion
              ]

            if (!version) {
              return message
            }

            return {
              ...message,

              content:
                version.content,

              currentVersion:
                newVersion,

              citations:
                version.citations ??
                [],

              citationSupports:
                version.citationSupports ??
                [],
            }
          }
        )
    )
  }

  const handleFeedback =
    async (
      assistantMessageId: number,
      feedback:
        | 'like'
        | 'dislike'
    ) => {
      const assistantIndex =
        messages.findIndex(
          (message) =>
            message.id ===
            assistantMessageId
        )

      if (
        assistantIndex <= 0
      ) {
        return
      }

      const previousMessage =
        messages[
          assistantIndex - 1
        ]

      if (
        previousMessage.role !==
        'user'
      ) {
        return
      }

      try {
        const response =
          await fetch(
            'http://localhost:3000/api/feedback',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  conversationId,

                  userMessage:
                    previousMessage.content,

                  feedback,
                }),
            }
          )

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          )
        }

        setMessages(
          (prev) =>
            prev.map(
              (message) =>
                message.id ===
                assistantMessageId
                  ? {
                      ...message,
                      feedback,
                    }
                  : message
            )
        )
      } catch (error) {
        console.error(
          'Feedback error:',
          error
        )
      }
    }

  return (
    <div className="flex min-h-screen bg-gray-100 p-4">

      <div className="mx-auto flex h-[700px] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-lg">

        <aside className="flex w-64 flex-col border-r bg-gray-50">

          <div className="border-b p-4">

            <button
              onClick={
                handleNewChat
              }
              disabled={
                isStreaming
              }
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              + New Chat
            </button>

          </div>

          <div className="flex-1 overflow-y-auto p-3">

            <p className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
              Conversations
            </p>

            <div className="space-y-1">

              {conversations.length ===
              0 ? (
                <p className="px-2 py-3 text-sm text-gray-400">
                  No conversations yet
                </p>
              ) : (
                conversations.map(
                  (
                    conversation
                  ) => (
                    <button
                      key={
                        conversation.conversationId
                      }
                      onClick={() =>
                        handleOpenConversation(
                          conversation.conversationId
                        )
                      }
                      disabled={
                        isStreaming
                      }
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                        conversation.conversationId ===
                        conversationId
                          ? 'bg-gray-200 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <p className="truncate">
                        {
                          conversation.title
                        }
                      </p>
                    </button>
                  )
                )
              )}

            </div>

          </div>

        </aside>

        <div className="flex flex-1 flex-col">

          <header className="border-b px-6 py-4">

            <h1 className="text-xl font-semibold">
              AI Assistant
            </h1>

            <p className="text-sm text-gray-500">
              Ask me anything
            </p>

          </header>

          <main className="flex-1 space-y-4 overflow-y-auto p-6">

            {loadingHistory ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">

                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

                Loading chat history...

              </div>
            ) : (
              messages.map(
                (message) => (
                  <ChatMessage
                    key={
                      message.id
                    }

                    message={
                      message
                    }

                    onRegenerate={
                      message.role ===
                        'assistant' &&
                      !isStreaming
                        ? () =>
                            handleRegenerate(
                              message.id
                            )
                        : undefined
                    }

                    onFeedback={
                      message.role ===
                        'assistant' &&
                      !isStreaming
                        ? (
                            feedback
                          ) =>
                            handleFeedback(
                              message.id,
                              feedback
                            )
                        : undefined
                    }

                    onVersionChange={
                      message.role ===
                      'assistant'
                        ? (
                            version
                          ) =>
                            handleVersionChange(
                              message.id,
                              version
                            )
                        : undefined
                    }
                  />
                )
              )
            )}

            {isStreaming && (
              <div className="flex justify-start">

                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">

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

                  <span className="ml-1">
                    Gemini is thinking...
                  </span>

                </div>

              </div>
            )}

            <div
              ref={
                messagesEndRef
              }
            />

          </main>

          <ChatInput
            onSend={
              handleSend
            }

            disabled={
              isStreaming ||
              loadingHistory
            }
          />

        </div>

      </div>

    </div>
  )
}