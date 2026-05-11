import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import type {
  ExperimentalDistributionType,
  ExperimentalModelMode,
  ExperimentalParameterKey,
  ExperimentalParameterMode,
  ExperimentalSetup,
} from '../types'
import { useI18n } from '../../../shared/i18n/I18nContext'

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

export function ExperimentalSetupPanel({
  value,
  onModelModeChange,
  onParameterModeChange,
  onParameterEnabledChange,
  onParameterDistributionChange,
  onConfirm,
  validationMessage,
}: ExperimentalSetupPanelProps) {
  const { strings } = useI18n()
  const modelModeOptions = [
    { value: 'same' as const, label: strings.experimental.singleModel },
    { value: 'different' as const, label: strings.experimental.differentModels },
  ]
  const parameterModeOptions = [
    { value: 'random' as const, label: strings.experimental.modelSpecific },
    { value: 'same' as const, label: strings.experimental.identical },
  ]
  const parameterControlRows = [
    { key: 'temperature' as const, label: strings.experimental.temperature },
    { key: 'topP' as const, label: strings.experimental.topP },
    { key: 'topK' as const, label: strings.experimental.topK },
    { key: 'frequencyPenalty' as const, label: strings.experimental.frequencyPenalty },
    { key: 'presencePenalty' as const, label: strings.experimental.presencePenalty },
  ]
  const distributionOptions = [
    { value: 'uniform' as const, label: strings.experimental.uniform },
    { value: 'normal' as const, label: strings.experimental.normal },
    { value: 'beta' as const, label: strings.experimental.beta },
  ]
  const setupTooltipSections = [
    {
      title: strings.experimental.tooltipModelSelection,
      items: [
        {
          title: strings.experimental.tooltipSingleModel,
          body: strings.experimental.tooltipSingleModelBody,
        },
        {
          title: strings.experimental.tooltipDifferentModels,
          body: strings.experimental.tooltipDifferentModelsBody,
        },
      ],
    },
    {
      title: strings.experimental.tooltipParameters,
      items: [
        {
          title: strings.experimental.tooltipModelSpecific,
          body: strings.experimental.tooltipModelSpecificBody,
        },
        {
          title: strings.experimental.tooltipIdentical,
          body: strings.experimental.tooltipIdenticalBody,
        },
        { title: strings.experimental.temperature, body: strings.experimental.tooltipTemperatureBody },
        { title: strings.experimental.topP, body: strings.experimental.tooltipTopPBody },
        { title: strings.experimental.topK, body: strings.experimental.tooltipTopKBody },
        {
          title: strings.experimental.frequencyPenalty,
          body: strings.experimental.tooltipFrequencyPenaltyBody,
        },
        {
          title: strings.experimental.presencePenalty,
          body: strings.experimental.tooltipPresencePenaltyBody,
        },
      ],
    },
    {
      title: strings.experimental.tooltipDistributions,
      items: [
        { body: strings.experimental.tooltipDistributionsIntro },
        { title: strings.experimental.uniform, body: strings.experimental.tooltipUniformBody },
        { title: strings.experimental.normal, body: strings.experimental.tooltipNormalBody },
        { title: strings.experimental.beta, body: strings.experimental.tooltipBetaBody },
      ],
    },
  ]

  return (
    <aside className="experimental-setup-card" aria-label={strings.experimental.setupAria}>
      <div className="experimental-setup-card__header">
        <div className="experimental-setup-card__header-top">
          <p className="eyebrow">{strings.experimental.eyebrow}</p>
          <span className="model-section-info-wrap experimental-setup-card__info-wrap">
            <button
              type="button"
              className="model-section-info"
              aria-label={strings.experimental.setupInfoAria}
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
        <h3>{strings.experimental.setupTitle}</h3>
      </div>

      <section className="experimental-setup-card__section">
        <div className="experimental-setup-card__section-copy">
          <p className="model-details__copy-label">{strings.experimental.modelSelection}</p>
          <p className="experimental-setup-card__helper">{strings.experimental.modelSelectionHelper}</p>
        </div>

        <div className="experimental-toggle-group" role="radiogroup" aria-label={strings.experimental.modelSelection}>
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
          <p className="model-details__copy-label">{strings.experimental.parameters}</p>
          <p className="experimental-setup-card__helper">{strings.experimental.parametersHelper}</p>
        </div>

        {value.modelMode === 'different' ? (
          <div
            className="experimental-toggle-group"
            role="radiogroup"
            aria-label={strings.experimental.parameters}
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
                      {setting.enabled ? strings.experimental.on : strings.experimental.off}
                    </span>
                  </button>
                </div>

                {setting.enabled ? (
                  <div className="experimental-parameter-row__expanded">
                    <label className="experimental-parameter-row__field">
                      <span className="experimental-parameter-row__field-label-row">
                        <span className="experimental-parameter-row__field-label">
                          {strings.experimental.distribution}
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
          {strings.experimental.setupConfirm}
        </button>
      </div>
    </aside>
  )
}
