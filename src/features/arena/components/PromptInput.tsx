import { useState } from 'react'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import { useI18n } from '../../../shared/i18n/I18nContext'

interface PromptInputProps {
  onSubmit: (prompt: string) => Promise<void>
  loading: boolean
  disabled?: boolean
  placeholder?: string
}

export function PromptInput({
  onSubmit,
  loading,
  disabled = false,
  placeholder,
}: PromptInputProps) {
  const { strings } = useI18n()
  const [value, setValue] = useState('')
  const resolvedPlaceholder = placeholder ?? strings.arena.promptPlaceholder

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
        {strings.arena.promptLabel}
      </label>

      <div className="chat-composer">
        <input
          id="arena-prompt"
          className="chat-composer__input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={resolvedPlaceholder}
          disabled={loading || disabled}
        />

        <button
          type="submit"
          className="chat-composer__send"
          disabled={loading || disabled || !value.trim()}
          aria-label={loading ? strings.arena.generatingAnswers : strings.arena.sendPrompt}
          title={loading ? strings.arena.generatingAnswers : strings.arena.sendPrompt}
        >
          <SendRoundedIcon aria-hidden="true" className="chat-composer__send-icon" />
        </button>
      </div>
    </form>
  )
}
