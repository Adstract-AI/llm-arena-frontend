import { useState } from 'react'
import SendRoundedIcon from '@mui/icons-material/SendRounded'

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>
  loading: boolean
  disabled?: boolean
}

export function PromptInput({ onSubmit, loading, disabled = false }: PromptInputProps) {
  const [value, setValue] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleaned = value.trim()
    if (!cleaned) {
      return
    }

    await onSubmit(cleaned)
    setValue('')
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      <label htmlFor="arena-prompt" className="sr-only">
        Your question
      </label>

      <div className="chat-composer">
        <input
          id="arena-prompt"
          className="chat-composer__input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask something to compare two model answers..."
          disabled={loading || disabled}
        />

        <button
          type="submit"
          className="chat-composer__send"
          disabled={loading || disabled || !value.trim()}
          aria-label={loading ? 'Generating responses' : 'Send prompt'}
          title={loading ? 'Generating responses' : 'Send prompt'}
        >
          <SendRoundedIcon aria-hidden="true" className="chat-composer__send-icon" />
        </button>
      </div>
    </form>
  )
}
