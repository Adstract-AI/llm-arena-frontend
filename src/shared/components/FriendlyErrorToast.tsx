import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useEffect, useId, useState } from 'react'

interface FriendlyErrorToastProps {
  detail: string
  message?: string
}

export function FriendlyErrorToast({
  detail,
  message = 'Something went wrong. Please try again.',
}: FriendlyErrorToastProps) {
  const detailsId = useId()
  const [shouldRender, setShouldRender] = useState(true)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    setShouldRender(true)
    setIsClosing(false)
  }, [detail, message])

  function dismissToast() {
    setIsClosing(true)
    window.setTimeout(() => {
      setShouldRender(false)
    }, 180)
  }

  if (!shouldRender) {
    return null
  }

  return (
    <section
      className={
        isClosing
          ? 'friendly-error-toast friendly-error-toast--closing'
          : 'friendly-error-toast'
      }
      role="alert"
    >
      <div className="friendly-error-toast__content">
        <strong>{message}</strong>
        <div className="friendly-error-toast__message-row">
          <p>The request could not be completed right now.</p>
          <div className="friendly-error-toast__actions">
            <span className="friendly-error-toast__details-wrap">
              <button
                type="button"
                className="friendly-error-toast__details"
                aria-label="Show technical error details"
                aria-describedby={detailsId}
              >
                <InfoOutlinedIcon
                  aria-hidden="true"
                  className="friendly-error-toast__details-icon"
                />
              </button>
              <span
                id={detailsId}
                className="friendly-error-toast__tooltip"
                role="tooltip"
              >
                {detail}
              </span>
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="friendly-error-toast__close"
        aria-label="Dismiss error message"
        onClick={dismissToast}
      >
        <CloseRoundedIcon
          aria-hidden="true"
          className="friendly-error-toast__close-icon"
        />
      </button>
    </section>
  )
}
