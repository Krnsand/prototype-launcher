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

  const [page, setPage] = createSignal<'landing' | 'menu' | 'figma'>('landing')

  const [figmaLoading, setFigmaLoading] = createSignal(false)
  const [figmaLoadingToken, setFigmaLoadingToken] = createSignal(0)

  const [videoOverlayOpen, setVideoOverlayOpen] = createSignal(false)

  const [videoMuted, setVideoMuted] = createSignal(true)

  const STORAGE_STAGE_KEY = 'accesscity:stage'

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
  // greetingAudio.muted = true
  // greetingAudio.volume = 0

  const instructionAudio = new Audio(instructionMp3)
  instructionAudio.preload = 'auto'
    // ta bort under för att kicka igång ljud igen
  // instructionAudio.muted = true
  // instructionAudio.volume = 0

  const prototypes = (): Array<{
    title: string
    description: string
    icon: string
    href?: string
    type?: 'video' | 'figma'
    disabled?: boolean
  }> => [
    {
      title: 'Om',
      description: 'En kort video om konceptet',
      icon: conceptIcon,
      href: VIDEO_URL,
      type: 'video',
    },
    {
      title: 'Prova',
      description: 'Utvärdera prototypen för vidare förbättringar',
      icon: sensorMapIcon,
      href: FIGMA_EMBED_URL,
      type: 'figma',
    },
    {
      title: 'Try it',
      description: 'Evaluate the prototype for further improvements',
      icon: sensorMapIcon,
      href: FIGMA_EMBED_URL,
      type: 'figma',
    },
    {
      title: 'Arenakarta',
      description: 'Hitta rätt i arenan',
      icon: scandinaviumMapIcon,
      disabled: true,
    },
    {
      title: 'Aviseringar',
      description: 'Få aviseringar och notiser',
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
    if (window.location.hash === '#figma') {
      setPage('figma')
      setFigmaLoading(true)
      setFigmaLoadingToken(Date.now())
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
      const storedStage = sessionStorage.getItem(STORAGE_STAGE_KEY)
      if (storedStage === 'menu') {
        setTitleRaised(true)
        setShowPrototypes(true)
        setButtonHidden(true)
        setPage('menu')
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
    if (!videoOverlayOpen()) return
    if (!videoEl) return

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
      setPage('menu')

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
    setFigmaLoading(false)
    if (window.location.hash) {
      window.history.pushState({}, '', window.location.pathname + window.location.search)
    }
  }

  const handleOpenVideo = () => {
    setVideoOverlayOpen(true)
    setVideoMuted(false)
    if (videoEl) {
      videoEl.pause()
      try {
        videoEl.currentTime = 0
      } catch {
      }
      videoEl.load()
      videoEl.muted = false
      const p = videoEl.play()
      if (p && typeof (p as Promise<void>).catch === 'function') {
        ;(p as Promise<void>).catch(() => {})
      }
    }
  }

  const handleOpenFigma = () => {
    try {
      sessionStorage.setItem(STORAGE_STAGE_KEY, 'menu')
    } catch {
    }

    setButtonHidden(true)
    setAvatarVisible(false)
    setTitleRaised(true)
    setShowPrototypes(true)
    setFigmaLoading(true)
    setFigmaLoadingToken(Date.now())
    setPage('figma')
    window.history.pushState({ page: 'figma' }, '', '#figma')
  }

  const handleBackToMenu = () => {
    setPage('menu')
    setFigmaLoading(false)
    if (window.location.hash === '#figma') {
      window.history.replaceState({}, '', window.location.pathname + window.location.search)
    }
  }

  const handleCloseVideoOverlay = () => {
    setVideoOverlayOpen(false)
    setVideoMuted(true)
    if (videoEl) {
      videoEl.pause()
      videoEl.currentTime = 0
      videoEl.muted = true
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
          when={page() !== 'figma'}
          fallback={
            <div class="figma-page" aria-label="Prototype">
              <iframe
                class="figma-page__frame"
                src={FIGMA_EMBED_URL}
                allowfullscreen
                loading="eager"
                referrerpolicy="no-referrer"
                title="Prototype"
                onLoad={() => {
                  const token = figmaLoadingToken()
                  const elapsed = Date.now() - token
                  const minMs = 900
                  const remaining = Math.max(0, minMs - elapsed) + 450
                  window.setTimeout(() => {
                    setFigmaLoading(false)
                  }, remaining)
                }}
              />
              <Show when={figmaLoading()}>
                <div class="figma-page__loader" aria-label="Loading">
                  <div class="figma-page__spinner" aria-hidden="true" />
                </div>
              </Show>
              <button class="video-page__close" type="button" onClick={handleBackToMenu} aria-label="Close">
                <span class="video-page__close-icon">×</span>
              </button>
            </div>
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
            class="landing__start"
            classList={{ 'landing__start--hidden': buttonHidden() }}
            type="button"
            onClick={handleStart}
            disabled={startLocked()}
          >
            Starta
          </button>

          <button
            class="landing__back"
            classList={{ 'landing__back--shown': showPrototypes() && page() === 'menu' }}
            type="button"
            onClick={handleBackToLanding}
          >
            Tillbaka
          </button>

          <div
            class="prototype-cards"
            classList={{ 'prototype-cards--shown': showPrototypes() }}
            aria-label="Prototype list"
          >
            {prototypes().slice(0, 3).map((prototype, i) => (
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
            Hej och välkommen till AccessCity Göteborg!
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

      <div class="video-overlay" classList={{ 'video-overlay--open': videoOverlayOpen() }} aria-label="Concept video">
        <div class="video-overlay__backdrop" onClick={handleCloseVideoOverlay} />
        <div class="video-overlay__content">
          <video
            class="video-overlay__video"
            src={VIDEO_URL}
            ref={(el) => {
              videoEl = el
            }}
            autoplay
            muted={videoMuted()}
            controls
            playsinline
            preload="auto"
            onClick={() => {
              if (!videoEl) return
              if (!videoMuted()) return
              setVideoMuted(false)
              videoEl.muted = false
              const p = videoEl.play()
              if (p && typeof (p as Promise<void>).catch === 'function') {
                ;(p as Promise<void>).catch(() => {})
              }
            }}
          />

          <button class="video-page__close" type="button" onClick={handleCloseVideoOverlay} aria-label="Close">
            <span class="video-page__close-icon">×</span>
          </button>

          <Show when={videoMuted()}>
            <button
              class="video-page__unmute"
              type="button"
              onClick={() => {
                if (!videoEl) return
                setVideoMuted(false)
                videoEl.muted = false
                const p = videoEl.play()
                if (p && typeof (p as Promise<void>).catch === 'function') {
                  ;(p as Promise<void>).catch(() => {})
                }
              }}
            >
              Slå på ljud
            </button>
          </Show>
        </div>
      </div>
    </main>
  )
}

export default App
