import './App.css'
import { Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import accessCityTitle from './assets/accesscity.png'
import sueAvatar512 from './assets/sue/Comp_512.webp'
import greetingMp3 from './assets/hej.mp3'
import instructionMp3 from './assets/instruktion.mp3'
import conceptIcon from './assets/concept.png'
import sensorMapIcon from './assets/sensor_map.png'
import scandinaviumMapIcon from './assets/scandinavium_map.png'
import sensoryAlertsIcon from './assets/sensory_alerts.png'

// type PrototypeIcon = string

function App() {
  const [buttonHidden, setButtonHidden] = createSignal(false)
  const [avatarVisible, setAvatarVisible] = createSignal(false)
  const [showPrototypes, setShowPrototypes] = createSignal(false)
  const [titleRaised, setTitleRaised] = createSignal(false)
  const [startLocked, setStartLocked] = createSignal(false)
  const [selectedPrototypeIndex, setSelectedPrototypeIndex] = createSignal<number | null>(null)

  const [page, setPage] = createSignal<'landing' | 'menu' | 'video' | 'figma'>('landing')

  const [lang, setLang] = createSignal<'sv' | 'en'>('sv')

  const STORAGE_STAGE_KEY = 'accesscity:stage'
  const STORAGE_LANG_KEY = 'accesscity:lang'

  const VIDEO_URL = 'https://proxy.kokokaka.com/accesscity.mp4'
  const FIGMA_PROTO_URL =
    'https://www.figma.com/proto/fSyMubGaRLLj7Toka8d4X3/Access-city_Prototype_Jan-Feb-2026?node-id=28-338&t=TE0wDr5AlTbZJx33-1&scaling=contain&content-scaling=fixed&page-id=26%3A4058&starting-point-node-id=28%3A338&hide-ui=1'
  const FIGMA_EMBED_URL = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(FIGMA_PROTO_URL)}`

  const [titleShiftPx, setTitleShiftPx] = createSignal(0)

  let titleEl: HTMLImageElement | undefined
  let bubbleEl: HTMLDivElement | undefined
  let videoEl: HTMLVideoElement | undefined
  let titleBumperObserver: ResizeObserver | undefined

  const bubbleDelayMs = 1500

  const greetingAudio = new Audio(greetingMp3)
  greetingAudio.preload = 'auto'
    // ta bort under för att kicka igång ljud igen
  greetingAudio.muted = true
  greetingAudio.volume = 0

  const instructionAudio = new Audio(instructionMp3)
  instructionAudio.preload = 'auto'
    // ta bort under för att kicka igång ljud igen
  instructionAudio.muted = true
  instructionAudio.volume = 0

  const t = (sv: string, en: string) => (lang() === 'sv' ? sv : en)

  const prototypes = (): Array<{
    title: string
    description: string
    icon: string
    href?: string
    type?: 'video' | 'figma'
    disabled?: boolean
  }> => [
    {
      title: t('Om', 'About'),
      description: t('En kort video om konceptet', 'A short video about the concept'),
      icon: conceptIcon,
      href: VIDEO_URL,
      type: 'video',
    },
    {
      title: t('Prova', 'Try'),
      description: t('Utvärdera prototypen för vidare förbättringar', 'Evaluate the prototype for further improvements'),
      icon: sensorMapIcon,
      href: FIGMA_EMBED_URL,
      type: 'figma',
    },
    {
      title: t('Arenakarta', 'Arena map'),
      description: t('Hitta rätt i arenan', 'Find your way in the arena'),
      icon: scandinaviumMapIcon,
      disabled: true,
    },
    {
      title: t('Aviseringar', 'Alerts'),
      description: t('Få aviseringar och notiser', 'Receive alerts and notifications'),
      icon: sensoryAlertsIcon,
      disabled: true,
    },
  ]

  let postStartTimeoutId: number | undefined
  let followUpSpeechTimeoutId: number | undefined

  const stopAudio = () => {
    greetingAudio.pause()
    greetingAudio.currentTime = 0
    instructionAudio.pause()
    instructionAudio.currentTime = 0
  }

  const updateTitleShift = () => {
    if (!titleEl || !bubbleEl) {
      setTitleShiftPx(0)
      return
    }

    setTitleShiftPx(0)
  }

  const syncPageFromLocation = () => {
    if (window.location.hash === '#video') {
      setPage('video')
      setButtonHidden(true)
      setAvatarVisible(false)
      setTitleRaised(true)
      setShowPrototypes(true)
      return
    }

    if (window.location.hash === '#figma') {
      setPage('figma')
      setButtonHidden(true)
      setAvatarVisible(false)
      setTitleRaised(true)
      setShowPrototypes(true)
      return
    }

    if (showPrototypes()) {
      setPage('menu')
      return
    }

    setPage('landing')
  }

  onMount(() => {
    try {
      const storedLang = sessionStorage.getItem(STORAGE_LANG_KEY)
      if (storedLang === 'sv' || storedLang === 'en') setLang(storedLang)

      const storedStage = sessionStorage.getItem(STORAGE_STAGE_KEY)
      if (storedStage === 'menu') {
        setButtonHidden(true)
        setAvatarVisible(false)
        setTitleRaised(true)
        setShowPrototypes(true)
      }
    } catch {
    }

    syncPageFromLocation()

    const onPopState = () => {
      syncPageFromLocation()
    }

    window.addEventListener('popstate', onPopState)

    const onResize = () => {
      requestAnimationFrame(updateTitleShift)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    onResize()

    onCleanup(() => {
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (titleBumperObserver) titleBumperObserver.disconnect()
    })
  })

  createEffect(() => {
    avatarVisible()
    titleRaised()
    showPrototypes()
    requestAnimationFrame(updateTitleShift)
  })

  createEffect(() => {
    if (page() !== 'video') return
    if (!videoEl) return

    try {
      videoEl.currentTime = 0
    } catch {
    }

    const p = videoEl.play()
    if (p && typeof (p as Promise<void>).catch === 'function') {
      ;(p as Promise<void>).catch(() => {})
    }
  })

  createEffect(() => {
    if (!avatarVisible() || !titleEl || !bubbleEl) {
      titleBumperObserver?.disconnect()
      titleBumperObserver = undefined
      return
    }

    if (!titleBumperObserver) {
      titleBumperObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateTitleShift)
      })
    }

    titleBumperObserver.disconnect()
    titleBumperObserver.observe(titleEl)
    titleBumperObserver.observe(bubbleEl)

    requestAnimationFrame(updateTitleShift)

    onCleanup(() => {
      titleBumperObserver?.disconnect()
      titleBumperObserver = undefined
    })
  })

  const playAudio = (audio: HTMLAudioElement) => {
    stopAudio()
    audio.currentTime = 0
    void audio.play().catch(() => {
    })
  }

  const warmUpAudio = (src: string) => {
    const warmUp = new Audio(src)
    warmUp.muted = true
    warmUp.volume = 0
    void warmUp.play()
      .then(() => {
        warmUp.pause()
        warmUp.currentTime = 0
      })
      .catch(() => {
      })
  }

  const handleStart = () => {
    if (startLocked()) return
    setStartLocked(true)
    setButtonHidden(true)
    setAvatarVisible(true)

    stopAudio()
    warmUpAudio(instructionMp3)
    playAudio(greetingAudio)

    postStartTimeoutId = window.setTimeout(() => {
      setAvatarVisible(false)
      setTitleRaised(true)
      setShowPrototypes(true)

      followUpSpeechTimeoutId = window.setTimeout(() => {
        playAudio(instructionAudio)
      }, 650)
    }, 5000)
  }

  const handleBackToLanding = () => {
    try {
      sessionStorage.removeItem(STORAGE_STAGE_KEY)
    } catch {
    }

    setSelectedPrototypeIndex(null)
    setShowPrototypes(false)
    setTitleRaised(false)
    setAvatarVisible(false)
    setButtonHidden(false)
    setStartLocked(false)
    setPage('landing')
    if (window.location.hash) {
      window.history.pushState({}, '', window.location.pathname + window.location.search)
    }
  }

  const handleOpenVideo = () => {
    try {
      sessionStorage.setItem(STORAGE_STAGE_KEY, 'menu')
      sessionStorage.setItem(STORAGE_LANG_KEY, lang())
    } catch {
    }

    setButtonHidden(true)
    setAvatarVisible(false)
    setTitleRaised(true)
    setShowPrototypes(true)
    setPage('video')
    window.history.pushState({ page: 'video' }, '', '#video')
  }

  const handleOpenFigma = () => {
    try {
      sessionStorage.setItem(STORAGE_STAGE_KEY, 'menu')
      sessionStorage.setItem(STORAGE_LANG_KEY, lang())
    } catch {
    }

    setButtonHidden(true)
    setAvatarVisible(false)
    setTitleRaised(true)
    setShowPrototypes(true)
    setPage('figma')
    window.history.pushState({ page: 'figma' }, '', '#figma')
  }

  const handleBackToMenu = () => {
    setPage('menu')
    if (window.location.hash === '#video' || window.location.hash === '#figma') {
      window.history.back()
    }
  }

  onCleanup(() => {
    if (postStartTimeoutId !== undefined) window.clearTimeout(postStartTimeoutId)
    if (followUpSpeechTimeoutId !== undefined) window.clearTimeout(followUpSpeechTimeoutId)
    stopAudio()
  })

  return (
    <main
      class="landing"
      classList={{ 'landing--avatar-shown': avatarVisible() }}
      aria-label="AccessCity landing page"
    >
      <div class="landing__overlay" classList={{ 'landing__overlay--stage2': showPrototypes() }} />
      <div class="landing__content">
        <Show
          when={page() !== 'video' && page() !== 'figma'}
          fallback={
            <Show
              when={page() === 'video'}
              fallback={
                <div class="figma-page" aria-label="Prototype">
                  <iframe
                    class="figma-page__frame"
                    src={FIGMA_EMBED_URL}
                    allowfullscreen
                    loading="eager"
                    referrerpolicy="no-referrer"
                    title="Prototype"
                  />
                  <button class="video-page__close" type="button" onClick={handleBackToMenu} aria-label="Close">
                    <span class="video-page__close-icon">×</span>
                  </button>
                </div>
              }
            >
              <div class="video-page" aria-label="Concept video">
                <video
                  class="video-page__video"
                  src={VIDEO_URL}
                  ref={(el) => {
                    videoEl = el
                  }}
                  autoplay
                  muted
                  controls
                  playsinline
                  preload="auto"
                />
                <button class="video-page__close" type="button" onClick={handleBackToMenu} aria-label="Close">
                  <span class="video-page__close-icon">×</span>
                </button>
              </div>
            </Show>
          }
        >
          <img
            class="landing__title"
            classList={{ 'landing__title--raised': titleRaised(), 'landing__title--cards': showPrototypes() }}
            src={accessCityTitle}
            alt="AccessCity"
            ref={(el) => {
              titleEl = el
            }}
            style={{ '--title-shift': `${titleShiftPx()}px` }}
          />
          <button
            class="landing__cta"
            classList={{ 'landing__cta--hidden': buttonHidden(), 'landing__cta--gone': showPrototypes() }}
            type="button"
            onClick={handleStart}
            disabled={startLocked()}
          >
            {t('Starta', 'Start')}
          </button>

          <div
            class="landing__lang"
            classList={{ 'landing__lang--hidden': buttonHidden() || showPrototypes() }}
            aria-label="Language"
            style={{ display: showPrototypes() ? 'none' : 'flex' }}
          >
            <button
              type="button"
              class="landing__lang-option"
              classList={{ 'landing__lang-option--active': lang() === 'sv' }}
              onClick={() => setLang('sv')}
            >
              Svenska
            </button>
            <button
              type="button"
              class="landing__lang-option"
              classList={{ 'landing__lang-option--active': lang() === 'en' }}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>

          <button
            class="landing__back"
            classList={{ 'landing__back--shown': showPrototypes() }}
            type="button"
            onClick={handleBackToLanding}
          >
            {t('Tillbaka', 'Back')}
          </button>

          <div
            class="prototype-cards"
            classList={{ 'prototype-cards--shown': showPrototypes() }}
            aria-label="Prototype list"
          >
            {prototypes().slice(0, 2).map((prototype, i) => (
              <button
                class="prototype-card"
                classList={{ 'prototype-card--active': selectedPrototypeIndex() === i }}
                style={{ '--i': i, '--delay': `${i * 400}ms` }}
                type="button"
                disabled={prototype.disabled}
                onClick={() => {
                  if (prototype.disabled) return
                  setSelectedPrototypeIndex(i)

                  if (prototype.type === 'video') {
                    handleOpenVideo()
                    return
                  }

                  if (prototype.type === 'figma') {
                    handleOpenFigma()
                    return
                  }

                  if (prototype.href) {
                    try {
                      sessionStorage.setItem(STORAGE_STAGE_KEY, 'menu')
                      sessionStorage.setItem(STORAGE_LANG_KEY, lang())
                    } catch {
                    }
                    window.setTimeout(() => {
                      window.location.assign(prototype.href!)
                    }, 80)
                  }
                }}
              >
                <div class="prototype-card__icon" aria-hidden="true">
                  <img src={prototype.icon} alt="" />
                </div>
                <div class="prototype-card__text">
                  <div class="prototype-card__title">{prototype.title}</div>
                  <div class="prototype-card__description">{prototype.description}</div>
                </div>
              </button>
            ))}
          </div>
        </Show>
      </div>

      <div
        class="avatar"
        classList={{ 'avatar--shown': avatarVisible() }}
        style={{ '--bubble-delay': `${bubbleDelayMs}ms` }}
        aria-live="polite"
      >
        <div
          class="avatar__bubble"
          ref={(el) => {
            bubbleEl = el
          }}
        >
          <div class="avatar__bubble-text">
            {t('Hej och välkommen till AccessCity Göteborg!', 'Hello and welcome to AccessCity Gothenburg!')}
          </div>
        </div>
        <Show when={avatarVisible()}>
          <img
            class="avatar__image"
            src={sueAvatar512}
            srcset={`${sueAvatar512} 512w`}
            sizes="512px"
            alt="Sue"
          />
        </Show>
      </div>
    </main>
  )
}

export default App
