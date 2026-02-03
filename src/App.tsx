import './App.css'
import { createSignal, onCleanup } from 'solid-js'
import accessCityTitle from './assets/accesscity.png'
import sueAvatar from './assets/sue.webp'
import greetingMp3 from './assets/hej.mp3'
import instructionMp3 from './assets/instruktion.mp3'

type PrototypeIcon = 'movie' | 'sonar' | 'map' | 'alert'

function PrototypeIconSvg(props: { name: PrototypeIcon }) {
  switch (props.name) {
    case 'movie':
      return (
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v8h16V8H4Zm2-3 1.2-2h2.2L8.2 5H6Zm5 0 1.2-2h2.2L13.2 5H11Zm5 0 1.2-2h2.2L18.2 5H16Z"
          />
        </svg>
      )
    case 'sonar':
      return (
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 12.75a.75.75 0 0 1-.75-.75V3h1.5v9a.75.75 0 0 1-.75.75Zm0 8.75A9.5 9.5 0 0 1 2.5 12h1.5a8 8 0 1 0 16 0h1.5A9.5 9.5 0 0 1 12 21.5Zm0-4.5A5 5 0 0 1 7 12h1.5a3.5 3.5 0 1 0 7 0H17a5 5 0 0 1-5 5Z"
          />
          <path fill="currentColor" d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        </svg>
      )
    case 'map':
      return (
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15 5.5 9 3 3.5 5.2a1 1 0 0 0-.6.9v14.6a1 1 0 0 0 1.4.9L9 19l6 2.5 5.5-2.2a1 1 0 0 0 .6-.9V3.8a1 1 0 0 0-1.4-.9L15 5.5ZM10 4.6l4 1.7v13.1l-4-1.7V4.6Zm-1.5.2v13.1l-4 1.7V6.5l4-1.7Zm7 1.5 4-1.7v13.1l-4 1.7V6.3Z"
          />
        </svg>
      )
    case 'alert':
      return (
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Zm-2 .5H7V11a5 5 0 1 1 10 0v5.5Z"
          />
        </svg>
      )
  }
}

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
    icon: PrototypeIcon
    href?: string
    disabled?: boolean
  }> = [
    { title: 'Konceptet', description: 'En kort video om konceptet', icon: 'movie', href: 'https://proxy.kokokaka.com/accesscity.mp4' },
    {
      title: 'Sensorkartläggning',
      description: 'Navigera i arenan med lätthet',
      icon: 'sonar',
      href:
        'https://www.figma.com/proto/fSyMubGaRLLj7Toka8d4X3/Access-city_Prototype_Jan-Feb-2026?node-id=28-338&t=TE0wDr5AlTbZJx33-1&scaling=contain&content-scaling=fixed&page-id=26%3A4058&starting-point-node-id=28%3A338&hide-ui=1',
    },
    { title: 'Arenakarta', description: 'Hitta rätt i arenan', icon: 'map', disabled: true },
    { title: 'Aviseringar', description: 'Få aviseringar och notiser', icon: 'alert', disabled: true },
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
                <PrototypeIconSvg name={prototype.icon} />
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
