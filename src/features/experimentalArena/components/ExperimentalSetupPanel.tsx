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
  helper: string
}> = [
  {
    value: 'same',
    label: 'Same model',
    helper: 'Same model twice with different parameter settings',
  },
  {
    value: 'different',
    label: 'Different models',
    helper: 'Compare two different models',
  },
]

const parameterModeOptions: Array<{
  value: ExperimentalParameterMode
  label: string
  helper: string
}> = [
  {
    value: 'random',
    label: 'Random parameters',
    helper: 'Each response uses random settings',
  },
  {
    value: 'same',
    label: 'Same parameters',
    helper: 'Both responses use the same settings',
  },
]

const parameterControlRows: Array<{
  key: ExperimentalParameterKey
  label: string
}> = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'topP', label: 'Top-p' },
  { key: 'topK', label: 'Top-k' },
  { key: 'frequencyPenalty', label: 'Frequency penalty' },
  { key: 'presencePenalty', label: 'Presence penalty' },
]

const distributionOptions: Array<{
  value: ExperimentalDistributionType
  label: string
}> = [
  { value: 'uniform', label: 'Uniform' },
  { value: 'normal', label: 'Normal' },
  { value: 'triangular', label: 'Triangular' },
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
        <p className="eyebrow">Experimental Arena</p>
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
              <span className="experimental-toggle__title">{option.label}</span>
              <span className="experimental-toggle__helper">{option.helper}</span>
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
                <span className="experimental-toggle__title">{option.label}</span>
                <span className="experimental-toggle__helper">{option.helper}</span>
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
                    <span className="experimental-parameter-row__label">
                      {parameter.label}
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
                      <span className="experimental-parameter-row__field-label">
                        Distribution
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
