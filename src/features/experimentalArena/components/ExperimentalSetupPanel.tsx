import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import type {
  ExperimentalDistributionType,
  ExperimentalModelMode,
  ExperimentalParameterKey,
  ExperimentalParameterMode,
  ExperimentalSetup,
} from '../types'

interface ExperimentalSetupPanelProps {
  value: ExperimentalSetup
  onModelModeChange: (mode: ExperimentalModelMode) => void
  onParameterModeChange: (mode: ExperimentalParameterMode) => void
  onParameterEnabledChange: (key: ExperimentalParameterKey, enabled: boolean) => void
  onParameterDistributionChange: (
    key: ExperimentalParameterKey,
    distribution: ExperimentalDistributionType,
  ) => void
  onConfirm: () => void
  validationMessage?: string | null
}

const modelModeOptions: Array<{
  value: ExperimentalModelMode
  label: string
}> = [
  {
    value: 'same',
    label: 'Same model',
  },
  {
    value: 'different',
    label: 'Different models',
  },
]

const parameterModeOptions: Array<{
  value: ExperimentalParameterMode
  label: string
}> = [
  {
    value: 'random',
    label: 'Random parameters',
  },
  {
    value: 'same',
    label: 'Same parameters',
  },
]

const parameterControlRows: Array<{
  key: ExperimentalParameterKey
  label: string
}> = [
  {
    key: 'temperature',
    label: 'Temperature',
  },
  {
    key: 'topP',
    label: 'Top-p',
  },
  {
    key: 'topK',
    label: 'Top-k',
  },
  {
    key: 'frequencyPenalty',
    label: 'Frequency penalty',
  },
  {
    key: 'presencePenalty',
    label: 'Presence penalty',
  },
]

const distributionOptions: Array<{
  value: ExperimentalDistributionType
  label: string
}> = [
  { value: 'uniform', label: 'Uniform' },
  { value: 'normal', label: 'Normal' },
  { value: 'beta', label: 'Beta' },
]

const setupTooltipSections: Array<{
  title: string
  items: Array<{ title?: string; body: string }>
}> = [
  {
    title: 'Model selection',
    items: [
      {
        title: 'Same model',
        body: 'Runs the same model twice to compare how different parameter settings affect the response.',
      },
      {
        title: 'Different models',
        body: 'Compares two different models on the same prompt.',
      },
    ],
  },
  {
    title: 'Parameters',
    items: [
      {
        title: 'Random parameters',
        body: 'Each response uses independently sampled parameter values.',
      },
      {
        title: 'Same parameters',
        body: 'Both responses use identical parameter settings.',
      },
      {
        title: 'Temperature',
        body: 'Controls randomness. Lower values make responses more focused, higher values make them more creative.',
      },
      {
        title: 'Top-p',
        body: 'Limits token selection to the most probable tokens within a cumulative probability threshold.',
      },
      {
        title: 'Top-k',
        body: 'Limits token selection to the top K most likely options.',
      },
      {
        title: 'Frequency penalty',
        body: 'Reduces repetition by penalizing tokens that appear frequently in the response.',
      },
      {
        title: 'Presence penalty',
        body: 'Encourages introducing new topics by penalizing tokens that have already appeared.',
      },
    ],
  },
  {
    title: 'Distributions',
    items: [
      {
        body: 'Defines how parameter values are sampled for each run.',
      },
      {
        title: 'Uniform',
        body: 'Values are sampled evenly across a defined range.',
      },
      {
        title: 'Normal',
        body: 'Values are sampled around a central mean, with most values near the center and fewer at the extremes.',
      },
      {
        title: 'Beta',
        body: 'Values are sampled within a bounded range with flexible skew, allowing bias toward lower or higher values.',
      },
    ],
  },
]

export function ExperimentalSetupPanel({
  value,
  onModelModeChange,
  onParameterModeChange,
  onParameterEnabledChange,
  onParameterDistributionChange,
  onConfirm,
  validationMessage,
}: ExperimentalSetupPanelProps) {
  return (
    <aside className="experimental-setup-card" aria-label="Experimental setup">
      <div className="experimental-setup-card__header">
        <div className="experimental-setup-card__header-top">
          <p className="eyebrow">Experimental Arena</p>
          <span className="model-section-info-wrap experimental-setup-card__info-wrap">
            <button
              type="button"
              className="model-section-info"
              aria-label="More info about experimental setup"
              aria-describedby="experimental-setup-tooltip"
            >
              <InfoOutlinedIcon aria-hidden="true" className="model-section-info__icon" />
            </button>
            <span
              id="experimental-setup-tooltip"
              role="tooltip"
              className="model-section-tooltip experimental-setup-card__tooltip"
            >
              {setupTooltipSections.map((section) => (
                <span
                  key={section.title}
                  className="experimental-setup-card__tooltip-section"
                >
                  <span className="experimental-setup-card__tooltip-title">
                    {section.title}
                  </span>
                  {section.items.map((detail) => (
                    <span
                      key={`${detail.title ?? 'note'}-${detail.body}`}
                      className="model-section-tooltip__item"
                    >
                      {detail.title ? <strong>{detail.title}:</strong> : null}{' '}
                      {detail.body}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </span>
        </div>
        <h3>Configure the setup, then start</h3>
      </div>

      <section className="experimental-setup-card__section">
        <div className="experimental-setup-card__section-copy">
          <p className="model-details__copy-label">Model selection</p>
          <p className="experimental-setup-card__helper">
            Choose how to run the comparison
          </p>
        </div>

        <div className="experimental-toggle-group" role="radiogroup" aria-label="Model mode">
          {modelModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value.modelMode === option.value}
              className={
                value.modelMode === option.value
                  ? 'experimental-toggle experimental-toggle--selected'
                  : 'experimental-toggle'
              }
              onClick={() => onModelModeChange(option.value)}
            >
              <span className="experimental-toggle__title-row">
                <span className="experimental-toggle__title">{option.label}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="experimental-setup-card__section">
        <div className="experimental-setup-card__section-copy">
          <p className="model-details__copy-label">Parameters</p>
          <p className="experimental-setup-card__helper">
            Values revealed after voting is completed
          </p>
        </div>

        {value.modelMode === 'different' ? (
          <div
            className="experimental-toggle-group"
            role="radiogroup"
            aria-label="Parameter mode"
          >
            {parameterModeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value.parameterMode === option.value}
                className={
                  value.parameterMode === option.value
                    ? 'experimental-toggle experimental-toggle--selected'
                    : 'experimental-toggle'
                }
                onClick={() => onParameterModeChange(option.value)}
              >
                <span className="experimental-toggle__title-row">
                  <span className="experimental-toggle__title">{option.label}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="experimental-parameter-list">
          {parameterControlRows.map((parameter) => {
            const setting = value.parameters[parameter.key]

            return (
              <div key={parameter.key} className="experimental-parameter-row">
                <div className="experimental-parameter-row__main">
                  <div className="experimental-parameter-row__copy">
                    <span className="experimental-parameter-row__label-row">
                      <span className="experimental-parameter-row__label">
                        {parameter.label}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={setting.enabled}
                    className={
                      setting.enabled
                        ? 'experimental-switch experimental-switch--enabled'
                        : 'experimental-switch'
                    }
                    onClick={() =>
                      onParameterEnabledChange(parameter.key, !setting.enabled)
                    }
                  >
                    <span className="experimental-switch__track">
                      <span className="experimental-switch__thumb" />
                    </span>
                    <span className="experimental-switch__label">
                      {setting.enabled ? 'On' : 'Off'}
                    </span>
                  </button>
                </div>

                {setting.enabled ? (
                  <div className="experimental-parameter-row__expanded">
                    <label className="experimental-parameter-row__field">
                      <span className="experimental-parameter-row__field-label-row">
                        <span className="experimental-parameter-row__field-label">
                          Distribution
                        </span>
                      </span>
                      <select
                        className="experimental-select"
                        value={setting.distribution}
                        onChange={(event) =>
                          onParameterDistributionChange(
                            parameter.key,
                            event.target.value as ExperimentalDistributionType,
                          )
                        }
                      >
                        {distributionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      {validationMessage ? (
        <p className="experimental-setup-card__validation" role="alert">
          {validationMessage}
        </p>
      ) : null}

      <div className="experimental-setup-card__footer">
        <button type="button" className="btn btn--primary" onClick={onConfirm}>
          Set configuration
        </button>
      </div>
    </aside>
  )
}
