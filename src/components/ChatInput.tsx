import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ChatInputProps = {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] =
    useState('')

  const handleSend = () => {
    if (
      !message.trim() ||
      disabled
    ) {
      return
    }

    onSend(
      message.trim()
    )

    setMessage('')
  }

  return (
    <div className="flex gap-2 border-t p-4">

      <input
        type="text"
        value={message}
        disabled={disabled}
        onChange={(e) =>
          setMessage(
            e.target.value
          )
        }
        onKeyDown={(e) => {
          if (
            e.key ===
              'Enter' &&
            !e.shiftKey
          ) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder={
          disabled
            ? 'Waiting for response...'
            : 'Type your message...'
        }
        className="flex-1 rounded-lg border px-4 py-2 outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      />

      <Button
        onClick={
          handleSend
        }
        disabled={
          disabled ||
          !message.trim()
        }
      >
        {disabled
          ? 'Thinking...'
          : 'Send'}
      </Button>

    </div>
  )
}