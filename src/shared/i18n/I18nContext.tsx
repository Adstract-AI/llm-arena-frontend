import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "mk";

const LANGUAGE_STORAGE_KEY = "makarena-language";

const dictionaries = {
  en: {
    languageName: "English",
    languageShort: "EN",
    altLanguageShort: "MK",
    nav: {
      arena: "Arena",
      experimental: "Experimental",
      chat: "Chat",
      leaderboard: "Leaderboard",
      about: "About us",
    },
    topbar: {
      home: "MakArena home",
      mainNavigation: "Main navigation",
      openUserMenu: "Open user menu",
      closeUserMenu: "Close menu",
      userFallback: "MakArena user",
      menu: "Menu",
      navigation: "Navigation",
      account: "Account",
      preferences: "Preferences",
      login: "Login",
      logout: "Logout",
      deleteAccount: "Delete account",
      languagePicker: "Language",
      switchToLightMode: "Switch to light mode",
      switchToDarkMode: "Switch to dark mode",
    },
    deleteDialog: {
      eyebrow: "Delete account",
      title: "This action cannot be undone.",
      description:
        "Every sensitive piece of information connected to your account will be deleted. This step is irreversible.",
      cancel: "Cancel",
      deleting: "Deleting...",
      confirm: "Delete account",
      error: "Could not delete account.",
    },
    home: {
      eyebrow: "Compare. Vote. Contribute.",
      title: "Decide which AI model performed better.",
      description:
        "Compare models in Arena, test controlled runs in Experimental Arena, or jump into direct Chat mode. Evaluate anonymous conversations, vote on the full exchange, and see transparent results after each decision.",
      startComparing: "Start Comparing",
      tryExperimental: "Try Experimental",
      openChat: "Open Chat",
      howItWorks: "How It Works",
      howItWorksLabel: "How it works",
      step1: "Step 1",
      step2: "Step 2",
      alsoAvailable: "Also Available",
      anonymousArenaTitle: "Anonymous Arena Chat",
      anonymousArenaBody:
        "Start one arena conversation and compare two side-by-side model threads with hidden identities, so decisions stay focused on quality.",
      goToArena: "Go To Arena",
      quickVotingTitle: "Quick Voting + Reveal",
      quickVotingBody:
        "Continue for multiple turns if needed, then vote Model 1, Model 2, both, or neither. After voting, MakArena reveals which models were behind the conversation.",
      chatExperimentalTitle: "Chat + Experimental",
      chatExperimentalBody:
        "Need a fast answer? Use Chat mode for one-on-one conversations. Need more control? Experimental Arena lets you compare with parameter setup before the round starts.",
      exploreExperimental: "Explore Experimental",
    },
    about: {
      eyebrow: "About MakArena",
      title: "Blind evaluation for fairer model decisions.",
      lead: "MakArena compares anonymous models across a conversation, then uses user voting data to build transparent performance rankings. You can also use Chat mode for direct conversations with a single model, or Experimental Arena for more controlled comparison runs.",
      availableExperiences: "Available experiences",
      whatsAvailable: "What's available",
      arenaBody:
        "Put two anonymous models side by side and judge the quality of their answers without brand bias getting in the way.",
      chatBody:
        "Talk directly with one model when you want a fast answer, a longer conversation, or a simpler one-on-one flow.",
      experimentalTitle: "Experimental Arena",
      experimentalBody:
        "Shape the comparison before it starts by choosing how models and parameters behave, then see how those choices affect the outcome.",
      howMakArenaWorks: "How MakArena works",
      howItWorks: "How It Works",
      standardFlow: "Standard flow",
      arenaFlow: "Arena flow",
      additionalSetup: "Additional setup",
      experimentalAdds: "What Experimental Arena adds",
      arenaStep1Title: "Start with a prompt",
      arenaStep1Body: "Submit a question or task to begin the comparison.",
      arenaStep2Title: "Compare anonymous answers",
      arenaStep2Body:
        "Two hidden models respond side by side so quality stays front and center.",
      arenaStep3Title: "Continue or vote",
      arenaStep3Body:
        "Keep the conversation going for more turns, or vote when you have enough signal.",
      arenaStep4Title: "Reveal the models",
      arenaStep4Body: "Identities appear only after the vote is submitted.",
      experimentalStep1Title: "Choose the setup first",
      experimentalStep1Body:
        "Select whether the round compares the same model twice or two different models.",
      experimentalStep2Title: "Control parameter behavior",
      experimentalStep2Body:
        "Decide which parameters are active and how their values should be sampled.",
      experimentalStep3Title: "Run the comparison blind",
      experimentalStep3Body:
        "The conversation still follows the same anonymous compare-and-vote flow as Arena. After each round, you can also submit an improved version of the last response.",
      experimentalStep4Title: "See the extra detail after voting",
      experimentalStep4Body:
        "Once the vote is done, the models and the parameter values used in that round are revealed.",
      evaluationPrinciples: "Evaluation Principles",
      principle1: "Blind comparison reduces brand bias in judgment.",
      principle2:
        "Conversation-level voting captures model quality across multiple turns.",
      principle3: "Leaderboard metrics reflect real user preference signals.",
      fundingCollaboration: "Funding and collaboration",
      fundedBy: "Funded by",
      finkiLogoAlt: "Faculty of Computer Science and Engineering logo",
      legal: "Legal",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
    },
    auth: {
      signIn: "Sign In",
      signInTitle: "Sign in to access all the features",
      continueWithProvider: "Continue with a provider:",
      continueWithGithub: "Continue with GitHub",
      continueWithGoogle: "Continue with Google",
      disclaimerStart: "By signing in, you agree to the",
      disclaimerMiddle: "and",
      gateEyebrow: "Login required",
      gateAction: "Login",
      chatGateTitle: "Sign in to use Chat",
      chatGateDescription:
        "Sign in to start chatting and keep your conversations saved.",
      experimentalGateTitle: "Sign in to use Experimental Arena",
      experimentalGateDescription:
        "Sign in to explore all the features in the Experimental Arena.",
      githubConfigError: "GitHub OAuth client ID is missing.",
      googleConfigError: "Google OAuth client ID is missing.",
      callbackMissingCode:
        "The provider did not return a login code. Please try again.",
      callbackFailed: "Could not complete login.",
      backToLogin: "Back to Login",
      signingIn: "Signing you in…",
    },
    arena: {
      eyebrow: "Model Arena",
      introTitle: "Put two anonymous models head-to-head.",
      introBody:
        "Submit prompts, compare both responses, then vote. Model identities unlock after voting.",
      disclaimerLabel: "Model disclaimer",
      disclaimerTitle: "Keep in mind:",
      disclaimerLine1: "Responses may be slow, inaccurate, or hallucinated.",
      disclaimerLine2:
        "Always double-check important facts before relying on them.",
      responses: "Responses",
      generatingAnswers: "Generating answers",
      promptPlaceholder: "Ask to compare models...",
      promptLabel: "Your question",
      sendPrompt: "Send prompt",
      votePanelLabel: "Vote for best response",
      voteTitle: "Choose the better response",
      submitVote: "Submit Vote",
      voteModel1: "Model 1",
      voteModel1Helper: "First model is better",
      voteBothGood: "Both are good",
      voteBothGoodHelper: "Both were strong",
      voteBothBad: "Neither is good",
      voteBothBadHelper: "Both missed the mark",
      voteModel2: "Model 2",
      voteModel2Helper: "Second model is better",
      selectModel1: "Select model 1",
      selectModel2: "Select model 2",
      voteSubmitted: "Vote submitted",
      startNewChat: "Start New Chat",
      thanksVote: "Thanks, your vote has been counted.",
      winningModel: "Winning model",
      tie: "Tie",
      couldNotProcessPrompt: "Could not process your prompt.",
      couldNotSubmitVote: "Could not submit your vote.",
    },
    chat: {
      eyebrow: "Chat",
      introTitle: "Start a conversation.",
      introBody:
        "Select a model and begin chatting. Get instant answers, explore topics, and interact naturally.",
      couldNotLoadModels: "Could not load chat models.",
      couldNotSendMessage: "Could not send message.",
      modelFallback: "Model",
      generatingResponse: "Generating response",
      messageLabel: "Your message",
      chooseModel: "Choose model",
      chooseModelList: "Choose model",
      selectModel: "Select Model",
      aboutModel: (name: string) => `About ${name}`,
      noDescription: "No description available.",
      newSession: "New Session",
      placeholder: "Write a message...",
      sendMessage: "Send message",
    },
    experimental: {
      singleModel: "Single model",
      differentModels: "Different models",
      modelSpecific: "Model-specific",
      identical: "Identical",
      temperature: "Temperature",
      topP: "Top-p",
      topK: "Top-k",
      frequencyPenalty: "Frequency penalty",
      presencePenalty: "Presence penalty",
      uniform: "Uniform",
      normal: "Normal",
      beta: "Beta",
      modelSelection: "Model selection",
      modelSelectionHelper: "Choose how to run the comparison",
      parameters: "Parameters",
      parametersHelper:
        "Configure how parameter values are sampled for each run",
      on: "On",
      off: "Off",
      distribution: "Distribution",
      setupAria: "Experimental setup",
      setupInfoAria: "More info about experimental setup",
      eyebrow: "Experimental Arena",
      setupTitle: "Configure the setup, then start",
      setupConfirm: "Confirm setup",
      setupValidation: "Enable at least one parameter for this setup.",
      introTitle: "Compare with one extra layer of control.",
      introBody:
        "Keep the same Arena rhythm, but define the comparison setup first so you can test same-model runs or parameter-matched battles. After each prompt, you can also submit an improvement to refine the results.",
      disclaimerLabel: "Experimental arena disclaimer",
      disclaimerTitle: "Experimental mode:",
      disclaimerLine:
        "Parameter values stay hidden until after voting to preserve the blind-evaluation flow.",
      configurationSet: "Configuration set",
      change: "Change",
      currentSetup: "Current experiment setup",
      promptPlaceholderReady: "Ask to compare responses...",
      promptPlaceholderBlocked: "Set the experimental configuration first...",
      startNewExperiment: "Start New Experiment",
      viewParameters: "View parameters",
      hideParameters: "Hide parameters",
      couldNotSaveEdit: "Could not save your edited response.",
      refineResponse: "Refine this response...",
      saving: "Saving...",
      submit: "Submit",
      submittedEdition: "Submitted edition",
      originalResponse: "Original response",
      showOriginalResponse: "Show original response",
      showEditedResponse: "Show edited response",
      closeEditorFor: (label: string) =>
        `Close editor for ${label.toLowerCase()}`,
      editLabel: (label: string) => `Edit ${label.toLowerCase()}`,
      notUsed: "Not used",
      sameModelSameParameters: "Same model · same parameters",
      sameModelDifferentParameters: "Same model · different parameters",
      differentModelsSameParameters: "Different models · same parameters",
      differentModelsDifferentParameters:
        "Different models · different parameters",
      noneExposed: "none exposed",
      tooltipModelSelection: "Model selection",
      tooltipSingleModel: "Single model",
      tooltipSingleModelBody:
        "Runs the same model twice to compare how different parameter settings affect the response.",
      tooltipDifferentModels: "Different models",
      tooltipDifferentModelsBody:
        "Compares two different models on the same prompt.",
      tooltipParameters: "Parameters",
      tooltipModelSpecific: "Model-specific (Different parameters)",
      tooltipModelSpecificBody:
        "Each response uses independently sampled parameter values.",
      tooltipIdentical: "Identical",
      tooltipIdenticalBody: "Both responses use identical parameter settings.",
      tooltipTemperatureBody:
        "Controls randomness. Lower values make responses more focused, higher values make them more creative.",
      tooltipTopPBody:
        "Limits token selection to the most probable tokens within a cumulative probability threshold.",
      tooltipTopKBody:
        "Limits token selection to the top K most likely options.",
      tooltipFrequencyPenaltyBody:
        "Reduces repetition by penalizing tokens that appear frequently in the response.",
      tooltipPresencePenaltyBody:
        "Encourages introducing new topics by penalizing tokens that have already appeared.",
      tooltipDistributions: "Distributions",
      tooltipDistributionsIntro:
        "Defines how parameter values are sampled for each run.",
      tooltipUniformBody: "Values are sampled evenly across a defined range.",
      tooltipNormalBody:
        "Values are sampled around a central mean, with most values near the center and fewer at the extremes.",
      tooltipBetaBody:
        "Values are sampled within a bounded range with flexible skew, allowing bias toward lower or higher values.",
    },
    leaderboard: {
      eyebrow: "Leaderboard",
      title: "Model ranking by community votes.",
      loading: "Loading leaderboard...",
      noModels: "No models in leaderboard yet.",
      couldNotLoad: "Could not load leaderboard right now.",
      showStandardMetrics: "Show standard leaderboard metrics",
      showExperimentalMetrics: "Show experimental leaderboard metrics",
      tableAria: "Model leaderboard",
      rank: "Rank",
      model: "Model",
      elo: "ELO",
      winRate: "Win Rate",
      matches: "Matches",
      wins: "Wins",
      losses: "Losses",
      ties: "Ties",
      avgTemp: "Avg Temp",
      avgTopP: "Avg Top-p",
      avgTopK: "Avg Top-k",
      avgFreqPenalty: "Avg Freq Penalty",
      avgPresPenalty: "Avg Pres Penalty",
      avgWinningTemperature: "Average winning temperature",
      avgWinningTopP: "Average winning top-p",
      avgWinningTopK: "Average winning top-k",
      avgWinningFreqPenalty: "Average winning frequency penalty",
      avgWinningPresPenalty: "Average winning presence penalty",
      sortBy: (label: string) => `Sort by ${label}`,
    },
    modelDetails: {
      loading: "Loading model details...",
      missingModelName: "Model name is missing.",
      couldNotLoad: "Could not load model details right now.",
      profile: "Model Profile",
      providedBy: "Provided by",
      backToLeaderboard: "Back to Leaderboard",
      aboutModel: "About this model",
      aboutProvider: "About the provider",
      attributes: "Model attributes",
      fineTuned: "Fine-tuned",
      macedonianOptimized: "Macedonian-optimized",
      performance: "Performance",
      matchHistory: "Match History",
      responseProfile: "Response Profile",
      identifiers: "Identifiers",
      performanceDetails: [
        "ELO score is an overall strength rating based on arena match results. Higher usually means the model performs better against other models.",
        "Win rate is the share of all matches this model won.",
        "Non-tie win rate shows how often it won when a round had a clear winner and was not marked as a tie.",
      ],
      matchHistoryDetails: [
        "Matches is the total number of arena comparisons this model has appeared in.",
        "Wins, losses, and ties show the outcome breakdown across those comparisons.",
      ],
      responseProfileDetails: [
        "Prompt tokens are the average size of the user input sent to the model.",
        "Completion tokens are the average size of the model response.",
        "Total tokens combine prompt and completion size.",
        "Response length shows the average output length in characters, and latency shows how long responses usually take when available.",
      ],
      identifiersDetails: [
        "Model name is the label shown inside the arena UI.",
        "External model ID is the provider-side identifier used to reference the same model in backend systems.",
      ],
      moreInfoAbout: (title: string) => `More info about ${title}`,
      eloScore: "ELO score",
      nonTieWinRate: "Non-tie win rate",
      notAvailable: "Not available",
      avgPromptTokens: "Avg. prompt tokens",
      avgCompletionTokens: "Avg. completion tokens",
      avgTotalTokens: "Avg. total tokens",
      avgResponseLength: "Avg. response length",
      avgLatency: "Avg. latency",
      chars: "chars",
      wins: "Wins",
      losses: "Losses",
      ties: "Ties",
      experimentalWins: "Experimental wins",
      modelName: "Model name",
      externalModelId: "External model ID",
      copyModelName: "Copy model name",
      copyExternalModelId: "Copy external model ID",
      parameterAverages: "Parameter Averages",
      parameterAveragesDetails: [
        "These averages summarize the experimental parameter values used when this model won a revealed experimental round.",
        "When no experimental wins with tracked parameter data are available yet, these values remain unavailable.",
      ],
      avgTemperature: "Avg. temperature",
      avgTopP: "Avg. top-p",
      avgTopK: "Avg. top-k",
      avgFrequencyPenalty: "Avg. frequency penalty",
      avgPresencePenalty: "Avg. presence penalty",
    },
    legal: {
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      privacyTitle: "How MakArena handles your information.",
      privacyLead:
        "This page explains what information may be collected when you use MakArena, why it is used, and the care taken around your account and interaction data.",
      privacyInfoTitle: "Information we may store",
      privacyInfoBody:
        "MakArena may store account details such as your username and email address, along with usage data needed to operate the platform. This can include chat sessions, arena prompts, model responses, votes, leaderboard activity, and authentication-related records.",
      privacyWhyTitle: "Why this information is used",
      privacyWhyBody:
        "The information is used to authenticate users, support arena and chat functionality, improve model evaluation workflows, maintain platform reliability, and generate aggregate rankings and comparison insights.",
      privacyResponsibilityTitle: "Model output and user responsibility",
      privacyResponsibilityBody:
        "Model responses may be inaccurate, incomplete, biased, or hallucinated. You should verify important facts before relying on them, especially in cases involving health, law, finance, safety, or other high-impact decisions.",
      privacyDeletionTitle: "Account deletion",
      privacyDeletionBody:
        "You can request account deletion from the profile menu. Deleting your account is intended to remove sensitive account information connected to you, and this action is irreversible.",
      privacyUpdatesTitle: "Policy updates",
      privacyUpdatesBody:
        "This policy may be updated as MakArena evolves. Continued use of the platform after changes means the updated policy applies going forward.",
      readTerms: "Read Terms of Service",
      termsTitle: "The basic rules for using MakArena.",
      termsLead:
        "These terms outline acceptable use of the platform, your responsibility when using model outputs, and the expectations around accounts and platform access.",
      usePlatformTitle: "Use of the platform",
      usePlatformBody:
        "MakArena is provided for model comparison, exploration, and research-oriented interaction. You agree to use the platform responsibly and not attempt to disrupt, abuse, or misuse the service or its underlying systems.",
      accountsAccessTitle: "Accounts and access",
      accountsAccessBody:
        "Some features require authentication. You are responsible for the activity carried out through your account and for using supported sign-in providers in a lawful and appropriate way.",
      modelOutputsTitle: "Model outputs",
      modelOutputsBody:
        "Model outputs are generated automatically and may be incorrect, misleading, or harmful if relied on without review. MakArena does not guarantee that responses are accurate or fit for a particular purpose.",
      votesContentTitle: "Votes and submitted content",
      votesContentBody:
        "By using the platform, you understand that prompts, conversation turns, votes, and comparison outcomes may be used to operate the product and improve model evaluation workflows and reporting.",
      changesTitle: "Changes and availability",
      changesBody:
        "Features, routes, models, and platform behavior may change over time. Access can be modified, limited, or removed if needed for security, maintenance, or product changes.",
      readPrivacy: "Read Privacy Policy",
    },
  },
  mk: {
    languageName: "Македонски",
    languageShort: "МК",
    altLanguageShort: "EN",
    nav: {
      arena: "Arena",
      experimental: "Experimental",
      chat: "Chat",
      leaderboard: "Leaderboard",
      about: "За нас",
    },
    topbar: {
      home: "Почетна на MakArena",
      mainNavigation: "Главна навигација",
      openUserMenu: "Отвори корисничко мени",
      closeUserMenu: "Затвори мени",
      userFallback: "Корисник на MakArena",
      menu: "Мени",
      navigation: "Навигација",
      account: "Сметка",
      preferences: "Поставки",
      login: "Најава",
      logout: "Одјава",
      deleteAccount: "Избриши сметка",
      languagePicker: "Јазик",
      switchToLightMode: "Светол режим",
      switchToDarkMode: "Темен режим",
    },
    deleteDialog: {
      eyebrow: "Избриши сметка",
      title: "Оваа акција е неповратна.",
      description:
        "Секоја чувствителна информација поврзана со вашата сметка ќе биде избришана. Овој чекор е неповратен.",
      cancel: "Откажи",
      deleting: "Бришење...",
      confirm: "Избриши сметка",
      error: "Не успеавме да ја избришеме сметката.",
    },
    home: {
      eyebrow: "Споредувај. Гласај. Придонеси.",
      title: "Одлучи кој AI модел се покажал подобро.",
      description:
        "Споредувај модели во Arena, тестирај експериментални споредби или започни директен Chat. Оценувај анонимни разговори, гласај за подобриот одговор и следи транспарентни резултати по секоја одлука.",
      startComparing: "Започни со споредба",
      tryExperimental: "Пробај Experimental Arena",
      openChat: "Отвори Chat",
      howItWorks: "Како функционира",
      howItWorksLabel: "Како функционира",
      step1: "Чекор 1",
      step2: "Чекор 2",
      alsoAvailable: "Достапно и",
      anonymousArenaTitle: "Анонимни споредби",
      anonymousArenaBody:
        "Започни разговор и спореди два анонимни модели со скриени идентитети, за фокусот да остане на квалитетот на одговорите.",
      goToArena: "Отвори Arena",
      quickVotingTitle: "Гласај и откриј ги моделите",
      quickVotingBody:
        "Продолжи го разговорот ако ти треба повеќе контекст, па гласај за подобриот модел, за двата или за ниту еден. По гласањето, MakArena ги открива моделите зад разговорот.",
      chatExperimentalTitle: "Chat и Experimental",
      chatExperimentalBody:
        "Ти треба брз одговор? Користи Chat за директен разговор со модел. Сакаш повеќе контрола? Experimental Arena овозможува споредби со различни параметри и поставки.",
      exploreExperimental: "Истражи Experimental Arena",
    },
    about: {
      eyebrow: "За MakArena",
      title: "Анонимно оценување за пообјективни резултати.",
      lead: "MakArena споредува анонимни AI модели преку разговори, а гласовите од корисниците создаваат транспарентно рангирање според реални перформанси. Може да користиш и Chat за директен разговор со еден модел или Experimental Arena за понапредни и контролирани споредби.",
      availableExperiences: "Достапни искуства",
      whatsAvailable: "Што е достапно",
      arenaBody:
        "Спореди два анонимни модели и процени го квалитетот на нивните одговори без пристрасност.",
      chatBody:
        "Разговарај директно со еден модел кога сакаш брз одговор, подолг разговор или поедноставен еден-на-еден разговор.",
      experimentalTitle: "Experimental Arena",
      experimentalBody:
        "Обликувај ја споредбата пред да започне така што ќе избереш како ќе се однесуваат моделите и параметрите, и набљудувај како тие избори влијаат на резултатите.",
      howMakArenaWorks: "Како работи MakArena",
      howItWorks: "Како работи",
      standardFlow: "Стандарден тек",
      arenaFlow: "Тек на Арена",
      additionalSetup: "Дополнително поставување",
      experimentalAdds: "Што додава Експериментална Арена",
      arenaStep1Title: "Започни со промпт",
      arenaStep1Body: "Испрати прашање или задача за да започне споредбата.",
      arenaStep2Title: "Спореди анонимни одговори",
      arenaStep2Body:
        "Два скриени модели одговараат еден до друг за квалитетот да остане во прв план.",
      arenaStep3Title: "Продолжи или гласај",
      arenaStep3Body:
        "Продолжи го разговорот со повеќе пораки, или гласај кога ќе имаш доволно информации за крајна одлука.",
      arenaStep4Title: "Откриј ги моделите",
      arenaStep4Body: "Идентитетот на моделите се прикажува дури по гласањето.",
      experimentalStep1Title: "Избери тип на споредба",
      experimentalStep1Body:
        "Одбери дали сакаш споредба помеѓу ист модел со различни поставки или помеѓу два различни модели.",
      experimentalStep2Title: "Контролирај го однесувањето на параметрите",
      experimentalStep2Body:
        "Одлучи кои параметри се активни и како ќе се генерираат нивните вредности.",
      experimentalStep3Title: "Споредувај анонимно",
      experimentalStep3Body:
        "Разговорот и понатаму го следи истиот анонимен тек на спореди-и-гласај како Арена. По секоја рунда, можеш и да испратиш подобрена верзија на последниот одговор.",
      experimentalStep4Title: "Види дополнителни детали по гласање",
      experimentalStep4Body:
        "Кога гласањето е завршено, се откриваат моделите и вредностите на параметрите користени во таа рунда.",
      evaluationPrinciples: "Принципи на оценување",
      principle1:
        "Анонимната споредба ја намалува пристрасноста во проценката.",
      principle2:
        "Гласањето на ниво на разговор овозможува попрецизна проценка на квалитетот низ повеќе пораки.",
      principle3:
        "Метриките на Leaderboard-от се базираат на реални кориснички преференции и гласови.",
      fundingCollaboration: "Финансирање и соработка",
      fundedBy: "Финансирано од",
      finkiLogoAlt:
        "Лого на Факултет за информатички науки и компјутерско инженерство",
      legal: "Правно",
      privacyPolicy: "Политика за приватност",
      termsOfService: "Услови за користење",
    },
    auth: {
      signIn: "Најава",
      signInTitle: "Најави се за пристап до сите функционалности",
      continueWithProvider: "Продолжи со:",
      continueWithGithub: "Продолжи со GitHub",
      continueWithGoogle: "Продолжи со Google",
      disclaimerStart: "Со најавување се согласуваш со",
      disclaimerMiddle: "и",
      gateEyebrow: "Потребна е најава",
      gateAction: "Најава",
      chatGateTitle: "Најави се за да користиш Chat",
      chatGateDescription:
        "Најави се за да започнеш Chat и да ги зачуваш разговорите.",
      experimentalGateTitle: "Најави се за да користиш Experimental Arena",
      experimentalGateDescription:
        "Најави се за да ги истражиш сите функционалности во Experimental Arena.",
      githubConfigError: "Недостасува GitHub OAuth client ID.",
      googleConfigError: "Недостасува Google OAuth client ID.",
      callbackMissingCode:
        "Провајдерот не врати код за најава. Обиди се повторно.",
      callbackFailed: "Не успеавме да ја завршиме најавата.",
      backToLogin: "Назад кон најава",
      signingIn: "Ве најавуваме…",
    },
    arena: {
      eyebrow: "Арена",
      introTitle: "Спореди два анонимни модели еден наспроти друг.",
      introBody:
        "Посави прашање или задача, спореди ги двата одговори, па гласај. Идентитетот на моделите се открива по гласањето.",
      disclaimerLabel: "Напомена за модели",
      disclaimerTitle: "Имај на ум:",
      disclaimerLine1:
        "Одговорите може да бидат бавни, неточни или халуцинации.",
      disclaimerLine2:
        "Секогаш проверувај ги важните факти пред да ги сметаш за точни.",
      responses: "Одговори",
      generatingAnswers: "Се генерираат одговори",
      promptPlaceholder: "Постави прашање за да споредуваш модели...",
      promptLabel: "Твоето прашање",
      sendPrompt: "Постави прашање",
      votePanelLabel: "Гласај за најдобриот одговор",
      voteTitle: "Избери го подобриот одговор",
      submitVote: "Гласај",
      voteModel1: "Модел 1",
      voteModel1Helper: "Првиот модел е подобар",
      voteBothGood: "Двата се добри",
      voteBothGoodHelper: "И двата одговори беа добри",
      voteBothBad: "Ниту еден не е добар",
      voteBothBadHelper: "И двата одговори беа погрешни",
      voteModel2: "Модел 2",
      voteModel2Helper: "Вториот модел е подобар",
      selectModel1: "Избери модел 1",
      selectModel2: "Избери модел 2",
      voteSubmitted: "Гласот е испратен",
      startNewChat: "Започни нов разговор",
      thanksVote: "Благодариме, гласањето е евидентирано.",
      winningModel: "Победнички модел",
      tie: "Нерешено",
      couldNotProcessPrompt: "Не успеавме да го обработиме прашањето.",
      couldNotSubmitVote: "Не успеавме да го испратиме гласот.",
    },
    chat: {
      eyebrow: "Chat",
      introTitle: "Започни разговор.",
      introBody:
        "Избери модел и започни разговор. Добивај брзи одговори, истражувај различни теми и комуницирај без проблем.",
      couldNotLoadModels: "Не успеавме да ги вчитаме моделите за разговор.",
      couldNotSendMessage: "Не успеавме да ја испратиме пораката.",
      modelFallback: "Модел",
      generatingResponse: "Се генерира одговор",
      messageLabel: "Твојата порака",
      chooseModel: "Избери модел",
      chooseModelList: "Избери модел",
      selectModel: "Избери модел",
      aboutModel: (name: string) => `За ${name}`,
      noDescription: "Нема достапен опис.",
      newSession: "Нова сесија",
      placeholder: "Напиши порака...",
      sendMessage: "Испрати порака",
    },
    experimental: {
      singleModel: "Еден модел",
      differentModels: "Различни модели",
      modelSpecific: "Посебно по модел",
      identical: "Идентични",
      temperature: "Температура",
      topP: "Top-p",
      topK: "Top-k",
      frequencyPenalty: "Frequency penalty",
      presencePenalty: "Presence penalty",
      uniform: "Рамномерна",
      normal: "Нормална",
      beta: "Бета",
      modelSelection: "Избор на модели",
      modelSelectionHelper: "Избери како да се изврши споредбата",
      parameters: "Параметри",
      parametersHelper:
        "Постави како ќе се земаат вредностите на параметрите за секое извршување",
      on: "On",
      off: "Off",
      distribution: "Распределба",
      setupAria: "Експериментални поставувања",
      setupInfoAria: "Повеќе информации за експерименталната поставки",
      eyebrow: "Експериментална Арена",
      setupTitle: "Постави конфигурација, па започни",
      setupConfirm: "Потврди",
      setupValidation: "Овозможи барем еден параметар за оваа поставка.",
      introTitle: "Споредувај со поголема контрола.",
      introBody:
        "Задржи го истиот тек како во Arena, но прво постави модели и параметри за да тестираш различни типови споредби. По секој промпт, можеш дополнително да го подобриш одговорот, доколку е потребно.",
      disclaimerLabel: "Напомена за Experimental Arena",
      disclaimerTitle: "Важно:",
      disclaimerLine:
        "Вредностите на параметрите остануваат скриени до гласањето за да се зачува анонимното оценување.",
      configurationSet: "Конфигурацијата е поставена",
      change: "Промени",
      currentSetup: "Тековни поставувања",
      promptPlaceholderReady: "Побарај споредба на одговори...",
      promptPlaceholderBlocked:
        "Прво постави ја експерименталната конфигурација...",
      startNewExperiment: "Започни нов експеримент",
      viewParameters: "Прикажи параметри",
      hideParameters: "Сокриј параметри",
      couldNotSaveEdit: "Не успеавме да го зачуваме изменетиот одговор.",
      refineResponse: "Подобри го овој одговор...",
      saving: "Се зачувува...",
      submit: "Испрати",
      submittedEdition: "Испратена измена",
      originalResponse: "Оригинален одговор",
      showOriginalResponse: "Прикажи оригинален одговор",
      showEditedResponse: "Прикажи изменет одговор",
      closeEditorFor: (label: string) =>
        `Затвори уредувач за ${label.toLowerCase()}`,
      editLabel: (label: string) => `Измени ${label.toLowerCase()}`,
      notUsed: "Не се користи",
      sameModelSameParameters: "Ист модел · исти параметри",
      sameModelDifferentParameters: "Ист модел · различни параметри",
      differentModelsSameParameters: "Различни модели · исти параметри",
      differentModelsDifferentParameters:
        "Различни модели · различни параметри",
      noneExposed: "нема овозможени",
      tooltipModelSelection: "Избор на модели",
      tooltipSingleModel: "Еден модел",
      tooltipSingleModelBody:
        "Го извршува истиот модел двапати за да се спореди како различни параметри влијаат врз одговорот.",
      tooltipDifferentModels: "Различни модели",
      tooltipDifferentModelsBody:
        "Споредува два различни модели врз исто барање.",
      tooltipParameters: "Параметри",
      tooltipModelSpecific: "Посебно по модел (различни параметри)",
      tooltipModelSpecificBody:
        "Секој одговор користи независно избрани вредности на параметрите.",
      tooltipIdentical: "Идентични",
      tooltipIdenticalBody: "Двата одговори користат идентични параметри.",
      tooltipTemperatureBody:
        "Ја контролира креативноста и случајноста на одговорите. Пониските вредности создаваат пофокусирани одговори, додека повисоките овозможуваат поголема креативност.",
      tooltipTopPBody:
        "Го ограничува изборот на токени на најверојатните токени во рамки на кумулативен праг на веројатност.",
      tooltipTopKBody:
        "Го ограничува изборот на токени на топ K најверојатни опции.",
      tooltipFrequencyPenaltyBody:
        "Ја намалува повторливоста со казнување на токени што често се појавуваат во одговорот.",
      tooltipPresencePenaltyBody:
        "Поттикнува нови теми со казнување на токени што веќе се појавиле.",
      tooltipDistributions: "Распределби",
      tooltipDistributionsIntro:
        "Дефинира како се избираат вредностите на параметрите за секое извршување.",
      tooltipUniformBody:
        "Вредностите се земаат рамномерно низ дефиниран опсег.",
      tooltipNormalBody:
        "Вредностите се земаат околу централна средина, со повеќето вредности блиску до центарот и помалку на екстремите.",
      tooltipBetaBody:
        "Вредностите се земаат во ограничен опсег со флексибилно искривување, што овозможува наклон кон пониски или повисоки вредности.",
    },
    leaderboard: {
      eyebrow: "Leaderboard",
      title: "Ранг-листа на модели според кориснички гласови.",
      loading: "Се вчитува ранг-листата...",
      noModels: "Сè уште нема модели на ранг-листата.",
      couldNotLoad: "Не успеавме да ја вчитаме ранг-листата во моментов.",
      showStandardMetrics: "Прикажи стандардни метрики",
      showExperimentalMetrics: "Прикажи експериментални метрики",
      tableAria: "Рангирање на модели",
      rank: "Ранг",
      model: "Модел",
      elo: "ELO",
      winRate: "Стапка на победи",
      matches: "Натпревари",
      wins: "Победи",
      losses: "Порази",
      ties: "Нерешени",
      avgTemp: "Прос. темп.",
      avgTopP: "Прос. Top-p",
      avgTopK: "Прос. Top-k",
      avgFreqPenalty: "Прос. казна фрек.",
      avgPresPenalty: "Прос. казна прис.",
      avgWinningTemperature: "Просечна победничка температура",
      avgWinningTopP: "Просечно победничко top-p",
      avgWinningTopK: "Просечно победничко top-k",
      avgWinningFreqPenalty: "Просечна победничка казна за фреквенција",
      avgWinningPresPenalty: "Просечна победничка казна за присуство",
      sortBy: (label: string) => `Подреди по ${label}`,
    },
    modelDetails: {
      loading: "Се вчитуваат детали за моделот...",
      missingModelName: "Недостасува име на моделот.",
      couldNotLoad:
        "Не успеавме да ги вчитаме деталите за моделот во моментов.",
      profile: "Профил на модел",
      providedBy: "Обезбеден од",
      backToLeaderboard: "Назад кон рангирање",
      aboutModel: "За овој модел",
      aboutProvider: "За провајдерот",
      attributes: "Атрибути на моделот",
      fineTuned: "Fine-tuned",
      macedonianOptimized: "Оптимизиран за македонски",
      performance: "Перформанси",
      matchHistory: "Историја на натпревари",
      responseProfile: "Профил на одговори",
      identifiers: "Идентификатори",
      performanceDetails: [
        "ELO резултатот е вкупен рејтинг на сила базиран на резултатите од арената. Поголема вредност обично значи подобри перформанси против други модели.",
        "Стапката на победи е делот од сите натпревари во кои овој модел победил.",
        "Стапката на победи без нерешени покажува колку често победил кога рундата имала јасен победник и не била означена како нерешена.",
      ],
      matchHistoryDetails: [
        "Натпревари е вкупниот број споредби во арената во кои се појавил овој модел.",
        "Победи, порази и нерешени ја покажуваат распределбата на резултатите низ тие споредби.",
      ],
      responseProfileDetails: [
        "Prompt tokens е просечната големина на корисничкиот влез испратен до моделот.",
        "Completion tokens е просечната големина на одговорот од моделот.",
        "Total tokens ги комбинира големините на промптот и одговорот.",
        "Должината на одговорот ја покажува просечната должина на излезот во карактери, а латентноста колку обично траат одговорите.",
      ],
      identifiersDetails: [
        "Името на моделот е ознаката прикажана во UI-то на арената.",
        "Надворешниот ID на моделот е идентификаторот од страната на провајдерот што се користи во backend системите.",
      ],
      moreInfoAbout: (title: string) => `Повеќе информации за ${title}`,
      eloScore: "ELO резултат",
      nonTieWinRate: "Стапка на победи без нерешени",
      notAvailable: "Нема податоци",
      avgPromptTokens: "Прос. prompt токени",
      avgCompletionTokens: "Прос. completion токени",
      avgTotalTokens: "Прос. вкупно токени",
      avgResponseLength: "Прос. должина на одговор",
      avgLatency: "Прос. латентност",
      chars: "карактери",
      wins: "Победи",
      losses: "Порази",
      ties: "Нерешени",
      experimentalWins: "Експериментални победи",
      modelName: "Име на модел",
      externalModelId: "Надворешен ID на модел",
      copyModelName: "Копирај име на модел",
      copyExternalModelId: "Копирај надворешен ID на модел",
      parameterAverages: "Просеци на параметри",
      parameterAveragesDetails: [
        "Овие просечни вредности ги сумираат експерименталните вредности на параметрите користени кога овој модел победил во една експериментална рунда со соодветните изложени параметри.",
        "Кога сè уште нема експериментални победи со изложени параметри, овие вредности остануваат недостапни.",
      ],
      avgTemperature: "Прос. температура",
      avgTopP: "Прос. top-p",
      avgTopK: "Прос. top-k",
      avgFrequencyPenalty: "Прос. казна за фреквенција",
      avgPresencePenalty: "Прос. казна за присуство",
    },
    legal: {
      privacyPolicy: "Политика за приватност",
      termsOfService: "Услови за користење",
      privacyTitle: "Како MakArena постапува со твоите информации.",
      privacyLead:
        "Оваа страница објаснува кои информации може да се собираат кога користиш MakArena, зошто се користат и каква грижа се води околу податоците за сметката и интеракциите.",
      privacyInfoTitle: "Информации што може да ги чуваме",
      privacyInfoBody:
        "MakArena може да чува детали за сметката како корисничко име и е-пошта, заедно со податоци за користење потребни за платформата. Тоа може да вклучува разговорни сесии, промптови од арена, одговори од модели, гласови, активност во рангирањето и записи поврзани со автентикација.",
      privacyWhyTitle: "Зошто се користат овие информации",
      privacyWhyBody:
        "Информациите се користат за автентикација на корисници, поддршка на арена и разговорна функционалност, подобрување на тековите за евалуација на модели, одржување на сигурноста на платформата и создавање рангирања и увид во споредбите.",
      privacyResponsibilityTitle: "Одговори од модели и корисничка одговорност",
      privacyResponsibilityBody:
        "Одговорите од модели може да бидат неточни, нецелосни, пристрасни или халуцинирани. Треба да ги провериш важните факти пред да ги сметаш за точни, особено во ситуации поврзани со здравје, право, финансии, безбедност или други области со висок ризик.",
      privacyDeletionTitle: "Бришење сметка",
      privacyDeletionBody:
        "Може да побараш бришење на сметката од профилното мени. Бришењето има цел да ги отстрани чувствителните информации поврзани со тебе и оваа акција е неповратна.",
      privacyUpdatesTitle: "Ажурирања на политиката",
      privacyUpdatesBody:
        "Оваа политика може да се ажурира додека MakArena се развива. Продолженото користење на платформата по промени значи дека ажурираната политика важи понатаму.",
      readTerms: "Прочитај услови за користење",
      termsTitle: "Основните правила за користење на MakArena.",
      termsLead:
        "Овие услови го опишуваат прифатливото користење на платформата, твојата одговорност при користење на одговорите од моделите и очекувањата околу кориснички сметки и пристап до платформата.",
      usePlatformTitle: "Користење на платформата",
      usePlatformBody:
        "MakArena е наменета за споредба на модели, истражување и интеракција ориентирана кон истражување. Се согласуваш да ја користиш платформата одговорно и да не се обидуваш да ја нарушиш, злоупотребиш или погрешно употребиш услугата или нејзините основни системи.",
      accountsAccessTitle: "Сметки и пристап",
      accountsAccessBody:
        "Некои функционалности бараат автентикација. Ти си одговорен за активностите извршени преку твојата сметка и за користење на поддржаните провајдери за најава на легален и соодветен начин.",
      modelOutputsTitle: "Одговори од модели",
      modelOutputsBody:
        "Одговорите од модели се генерираат автоматски и може да бидат неточни, погрешно насочени или штетни ако се користат без проверка. MakArena не гарантира дека одговорите се точни или соодветни.",
      votesContentTitle: "Гласови и испратена содржина",
      votesContentBody:
        "Со користење на платформата, разбираш дека промптови, пораки од разговори, гласови и исходи од споредби може да се користат за работа на MakArena и подобрување на тековите и извештаите за евалуација на модели.",
      changesTitle: "Промени и достапност",
      changesBody:
        "Функционалности, рути, модели и однесување на платформата може да се менуваат со текот на времето. Пристапот може да биде изменет, ограничен или отстранет кога е потребно поради безбедност, одржување или промени на производот.",
      readPrivacy: "Прочитај политика за приватност",
    },
  },
} as const;

export type I18nDictionary = (typeof dictionaries)[Language];

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  strings: I18nDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "mk" ? "mk" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      strings: dictionaries[language],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
