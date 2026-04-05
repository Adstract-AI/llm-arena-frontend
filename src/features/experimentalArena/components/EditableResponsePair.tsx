import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { VoteChoice } from '../../arena/types'

type EditableResponseSide = 'A' | 'B'

export interface EditableResponseState {
  originalResponse: string
  editedResponse: string | null
  draftResponse: string
  isEditing: boolean
  isShowingEdited: boolean
}

interface EditableResponsePairProps {
  selectedVote: VoteChoice | null
  onSelectVote?: (vote: VoteChoice) => void
  disabled?: boolean
  reveal: boolean
  revealedModels?: {
    answer1Model: string
    answer2Model: string
  } | null
  canEditLatest: boolean
  answerAIsSubmitting?: boolean
  answerBIsSubmitting?: boolean
  answerAState: EditableResponseState
  answerBState: EditableResponseState
  onStartEdit: (side: EditableResponseSide) => void
  onDraftChange: (side: EditableResponseSide, value: string) => void
  onSubmitEdit: (side: EditableResponseSide) => void
  onToggleEdited: (side: EditableResponseSide) => void
}

function renderMarkdown(text: string) {
  return (
    <div className="response-card__markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => <pre className="response-card__code">{children}</pre>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export function EditableResponsePair({
  selectedVote,
  onSelectVote,
  disabled = false,
  reveal,
  revealedModels,
  canEditLatest,
  answerAIsSubmitting = false,
  answerBIsSubmitting = false,
  answerAState,
  answerBState,
  onStartEdit,
  onDraftChange,
  onSubmitEdit,
  onToggleEdited,
}: EditableResponsePairProps) {
  const canSelect = Boolean(onSelectVote) && !disabled

  function handleCardSelect(vote: VoteChoice) {
    const selectedText = window.getSelection()?.toString().trim()
    if (selectedText) {
      return
    }

    onSelectVote?.(vote)
  }

  function renderCard(
    side: EditableResponseSide,
    label: 'Model 1' | 'Model 2',
    vote: 'modelA' | 'modelB',
    modelName: string | undefined,
    state: EditableResponseState,
    isSubmittingEdit: boolean,
  ) {
    const isSelected = selectedVote === vote
    const className = [
      'response-card',
      isSelected ? 'response-card--selected' : null,
      canSelect ? null : 'response-card--static',
      state.isEditing ? 'response-card--editing' : null,
      state.editedResponse ? 'response-card--edited' : null,
    ]
      .filter(Boolean)
      .join(' ')

    const displayedResponse =
      state.isShowingEdited && state.editedResponse ? state.editedResponse : state.originalResponse

    return (
      <div className="response-column">
        <div className="response-column__header">
          <p className="response-column__title">{label}</p>
          {reveal && modelName ? <p className="response-column__meta">{modelName}</p> : null}
        </div>

        <div
          className={className}
          role={canSelect ? 'button' : undefined}
          tabIndex={canSelect && !state.isEditing ? 0 : -1}
          onClick={
            canSelect && !state.isEditing ? () => handleCardSelect(vote) : undefined
          }
          onKeyDown={
            canSelect && !state.isEditing
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleCardSelect(vote)
                  }
                }
              : undefined
          }
          aria-label={`Select ${label.toLowerCase()}`}
        >
          {canEditLatest || state.editedResponse ? (
            <div className="response-card__actions">
              {state.editedResponse && !state.isEditing ? (
                <button
                  type="button"
                  className={
                    state.isShowingEdited
                      ? 'response-card__icon-btn response-card__icon-btn--submitted response-card__icon-btn--active'
                      : 'response-card__icon-btn response-card__icon-btn--submitted'
                  }
                  data-tooltip={state.isShowingEdited ? 'Original response' : 'Submitted edition'}
                  onClick={(event) => {
                    event.stopPropagation()
                    onToggleEdited(side)
                  }}
                  aria-label={
                    state.isShowingEdited ? 'Show original response' : 'Show edited response'
                  }
                >
                  <CheckCircleRoundedIcon aria-hidden="true" />
                </button>
              ) : null}

              {canEditLatest ? (
                <button
                  type="button"
                  className={
                    state.isEditing
                      ? 'response-card__icon-btn response-card__icon-btn--active'
                      : 'response-card__icon-btn'
                  }
                  onClick={(event) => {
                    event.stopPropagation()
                    onStartEdit(side)
                  }}
                  aria-label={
                    state.isEditing
                      ? `Close editor for ${label.toLowerCase()}`
                      : `Edit ${label.toLowerCase()}`
                  }
                >
                  <EditRoundedIcon aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="response-card__content">
            {state.isEditing ? (
              <div
                className="response-card__edit-area"
                onClick={(event) => event.stopPropagation()}
              >
                <textarea
                  className="response-card__textarea"
                  value={state.draftResponse}
                  onChange={(event) => onDraftChange(side, event.target.value)}
                  placeholder="Refine this response..."
                />
                <div className="response-card__edit-footer">
                  <button
                    type="button"
                    className="btn btn--primary response-card__submit"
                    disabled={isSubmittingEdit}
                    onClick={() => onSubmitEdit(side)}
                  >
                    {isSubmittingEdit ? 'Saving...' : 'Submit'}
                  </button>
                </div>
              </div>
            ) : (
              renderMarkdown(displayedResponse)
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="duel-grid" aria-live="polite">
      {renderCard(
        'A',
        'Model 1',
        'modelA',
        reveal ? revealedModels?.answer1Model : undefined,
        answerAState,
        answerAIsSubmitting,
      )}
      {renderCard(
        'B',
        'Model 2',
        'modelB',
        reveal ? revealedModels?.answer2Model : undefined,
        answerBState,
        answerBIsSubmitting,
      )}
    </section>
  )
}
