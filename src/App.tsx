import './App.css'
import { createSignal, onCleanup } from 'solid-js'
import accessCityTitle from './assets/accesscity.png'
import sueAvatar from './assets/sue.webp'
import greetingMp3 from './assets/hej.mp3'
import instructionMp3 from './assets/instruktion.mp3'
import conceptIcon from './assets/concept.png'
import sensorMapIcon from './assets/sensor_map.png'
import scandinaviumMapIcon from './assets/scandinavium_map.png'
import sensoryAlertsIcon from './assets/sensory_alerts.png'

type PrototypeIcon = string

function App() {
  const [buttonHidden, setButtonHidden] = createSignal(false)
  const [avatarVisible, setAvatarVisible] = createSignal(false)
  const [showPrototypes, setShowPrototypes] = createSignal(false)
  const [titleRaised, setTitleRaised] = createSignal(false)
  const [startLocked, setStartLocked] = createSignal(false)
  const [selectedPrototypeIndex, setSelectedPrototypeIndex] = createSignal<number | null>(null)

  const bubbleDelayMs = 1500

  const greetingAudio = new Audio(greetingMp3)
  greetingAudio.preload = 'auto'

  const instructionAudio = new Audio(instructionMp3)
  instructionAudio.preload = 'auto'

  const prototypes: Array<{
    title: string
    description: string
    icon: string
    href?: string
    disabled?: boolean
  }> = [
    {
      title: 'Om',
      description: 'En kort video om konceptet',
      icon: conceptIcon,
      href: 'https://proxy.kokokaka.com/accesscity.mp4',
    },
    {
      title: 'Prova',
      description: 'Utvärdera prototypen för vidare utvecklingsförbättringar',
      icon: sensorMapIcon,
      href:
        'https://www.figma.com/proto/fSyMubGaRLLj7Toka8d4X3/Access-city_Prototype_Jan-Feb-2026?node-id=28-338&t=TE0wDr5AlTbZJx33-1&scaling=contain&content-scaling=fixed&page-id=26%3A4058&starting-point-node-id=28%3A338&hide-ui=1',
    },
    { title: 'Arenakarta', description: 'Hitta rätt i arenan', icon: scandinaviumMapIcon, disabled: true },
    { title: 'Aviseringar', description: 'Få aviseringar och notiser', icon: sensoryAlertsIcon, disabled: true },
  ]

  let postStartTimeoutId: number | undefined
  let followUpSpeechTimeoutId: number | undefined

  const stopAudio = () => {
    greetingAudio.pause()
    greetingAudio.currentTime = 0
    instructionAudio.pause()
    instructionAudio.currentTime = 0
  }

  const playAudio = (audio: HTMLAudioElement) => {
    stopAudio()
    audio.currentTime = 0
    void audio.play().catch(() => {
    })
  }

  const warmUpAudio = (src: string) => {
    const warmUp = new Audio(src)
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

    warmUpAudio(greetingMp3)
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
    <main class="landing" aria-label="AccessCity landing page">
      <div class="landing__overlay" classList={{ 'landing__overlay--stage2': showPrototypes() }} />
      <div class="landing__content">
        <img
          class="landing__title"
          classList={{ 'landing__title--raised': titleRaised() }}
          src={accessCityTitle}
          alt="AccessCity"
        />
        <button
          class="landing__cta"
          classList={{ 'landing__cta--hidden': buttonHidden(), 'landing__cta--gone': showPrototypes() }}
          type="button"
          onClick={handleStart}
          disabled={startLocked()}
        >
          Starta
        </button>

        <div
          class="prototype-cards"
          classList={{ 'prototype-cards--shown': showPrototypes() }}
          aria-label="Prototype list"
        >
          {prototypes.map((prototype, i) => (
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
        <div class="avatar__bubble">
          <div class="avatar__bubble-text">Hej och välkommen till AccessCity Göteborg!</div>
        </div>
        <img class="avatar__image" src={sueAvatar} alt="Sue" />
      </div>
    </main>
  )
}

export default App
