import './App.css'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import accessCityTitle from './assets/accesscity.png'
import sueAvatar128 from './assets/sue/Comp_128.webp'
import sueAvatar256 from './assets/sue/Comp_256.webp'
import sueAvatar384 from './assets/sue/Comp_384.webp'
import sueAvatar512 from './assets/sue/Comp_512.webp'
import sueAvatar1080 from './assets/sue/Comp_1080.webp'
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

  const [lang, setLang] = createSignal<'sv' | 'en'>('sv')

  const STORAGE_STAGE_KEY = 'accesscity:stage'
  const STORAGE_LANG_KEY = 'accesscity:lang'

  const [titleShiftPx, setTitleShiftPx] = createSignal(0)

  let titleEl: HTMLImageElement | undefined
  let bubbleEl: HTMLDivElement | undefined
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
    disabled?: boolean
  }> => [
    {
      title: t('Om', 'About'),
      description: t('En kort video om konceptet', 'A short video about the concept'),
      icon: conceptIcon,
      href: 'https://proxy.kokokaka.com/accesscity.mp4',
    },
    {
      title: t('Prova', 'Try'),
      description: t('Utvärdera prototypen för vidare förbättringar', 'Evaluate the prototype for further improvements'),
      icon: sensorMapIcon,
      href:
        'https://www.figma.com/proto/fSyMubGaRLLj7Toka8d4X3/Access-city_Prototype_Jan-Feb-2026?node-id=28-338&t=TE0wDr5AlTbZJx33-1&scaling=contain&content-scaling=fixed&page-id=26%3A4058&starting-point-node-id=28%3A338&hide-ui=1',
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

    const onResize = () => {
      requestAnimationFrame(updateTitleShift)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    onResize()

    onCleanup(() => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    })
  })

  createEffect(() => {
    avatarVisible()
    titleRaised()
    showPrototypes()
    requestAnimationFrame(updateTitleShift)
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
              if (prototype.href) {
                try {
                  sessionStorage.setItem(STORAGE_STAGE_KEY, 'menu')
                  sessionStorage.setItem(STORAGE_LANG_KEY, lang())
                } catch {
                }
                window.setTimeout(() => {
                  window.open(prototype.href!, '_blank', 'noopener,noreferrer')
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
        <img
          class="avatar__image"
          src={sueAvatar512}
          srcset={`${sueAvatar128} 128w, ${sueAvatar256} 256w, ${sueAvatar384} 384w, ${sueAvatar512} 512w, ${sueAvatar1080} 1080w`}
          sizes="(max-width: 380px) 128px, (max-width: 520px) 256px, (max-width: 768px) 384px, 512px"
          alt="Sue"
        />
      </div>
    </main>
  )
}

export default App
