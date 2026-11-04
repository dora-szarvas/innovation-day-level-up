import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AiGradientFrame,
  Background,
  Button,
  Card,
  Chip,
  Header,
  Icon,
  InputSearch,
  MainNavigation,
  Tag,
  Text,
} from '@pearson-ux/nebula-design-system/alpha'
import {
  homeOutlinedRegular,
  playSquareOutlinedRegular,
  clipboardChecksOutlinedRegular,
  compassOutlinedRegular,
  gameControllerOutlinedRegular,
  gameControllerFilledRegular,
  sparkleWithWavesOutlinedRegular,
  magnifyingGlassOutlinedRegular,
  globeOutlinedRegular,
  sunOutlinedRegular,
} from '@pearson-ux/nebula-design-system/icons'
import library from '../data/library.json'
import { POSTERS } from '../game/assets.js'
import { useScrollingClass } from '../components/useScrollingClass.js'

/**
 * Responsive nav-variant hook (alpha-temporary) — see 07-nebula-grid-and-figma.mdc.
 * 'expanded' at >= 1440px, 'collapsed' below. Do not remove on regeneration.
 */
function useResponsiveNavVariant() {
  const [variant, setVariant] = useState('expanded')
  useEffect(() => {
    const update = () => setVariant(window.innerWidth < 1440 ? 'collapsed' : 'expanded')
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return variant
}

const navIcon = (outlined, filled = outlined) =>
  function NavIcon({ current }) {
    return <Icon svg={current ? filled : outlined} size={24} color={current ? 'primary' : 'secondary'} />
  }

// Only Level Up is live in the demo; the rest of the product shell is decoration.
const navItems = [
  { id: 'home', label: 'Home', href: '#/', icon: navIcon(homeOutlinedRegular) },
  { id: 'videos', label: 'Videos', href: '#/', icon: navIcon(playSquareOutlinedRegular) },
  { id: 'practice', label: 'Practice', href: '#/', icon: navIcon(clipboardChecksOutlinedRegular) },
  { id: 'explore', label: 'Explore', href: '#/', icon: navIcon(compassOutlinedRegular) },
  { id: 'levelup', label: 'Level Up', href: '#/', current: true, icon: navIcon(gameControllerOutlinedRegular, gameControllerFilledRegular) },
]

const TYPE_CHIP = { adventure: 'purple', arcade: 'green', strategy: 'blue' }
const TYPE_LABEL = Object.fromEntries(library.filters.map((f) => [f.id, f.label]))

function GameCard({ game, onPlay }) {
  const body = (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-x3 bg-non-interactive-background-secondary">
        {POSTERS[game.poster] && (
          <img
            src={POSTERS[game.poster]}
            alt=""
            className={`h-full w-full object-cover ${game.playable ? '' : 'opacity-90'}`}
            draggable="false"
          />
        )}
        {/* Coming soon: grey veil over the poster. #494949 is a design-specified value; Nebula has no matching token. */}
        {!game.playable && <div className="absolute inset-0 bg-[#494949]/30" aria-hidden="true" />}
        <div className="absolute left-x2 top-x2">
          {game.playable ? (
            <Chip label="New" color="turquoise" strength="intense" size="b-24" />
          ) : (
            <Chip label="Coming soon…" color="gray" strength="intense" size="b-24" />
          )}
        </div>
      </div>
      <div className="flex flex-col items-start gap-x1">
        <Chip label={TYPE_LABEL[game.type]} color={TYPE_CHIP[game.type]} size="b-16" />
        <Text as="h3" variant="label-bold" className="text-text-primary">
          {game.name}
        </Text>
        {game.desc && (
          <Text variant="label-small" className="text-text-secondary">
            {game.desc}
          </Text>
        )}
      </div>
    </>
  )

  const shell =
    'flex h-full w-full flex-col gap-x3 rounded-x4 border border-non-interactive-border-regular bg-non-interactive-background-primary p-x3 pb-x4 text-left'

  if (!game.playable) {
    return (
      <div className={shell} aria-disabled="true">
        {body}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play ${game.name}`}
      className={`${shell} cursor-pointer transition-transform duration-[var(--duration-sm,200ms)] ease-motion-pattern-standard-appear hover:-translate-y-x1 hover:border-interactive-border-hover hover:bg-non-interactive-background-secondary hover:shadow-card-secondary-glass-elevation focus-visible:[outline:var(--outline-width)_solid_var(--color-interactive-border-focus)] motion-reduce:hover:translate-y-0`}
    >
      {body}
    </button>
  )
}

export default function Library() {
  const navVariant = useResponsiveNavVariant()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const mainRef = useRef(null)
  useScrollingClass(mainRef)

  const q = query.trim().toLowerCase()
  const games = library.games.filter(
    (g) => (filter === 'all' || g.type === filter) && (!q || `${g.name} ${g.desc}`.toLowerCase().includes(q)),
  )

  return (
    <>
      <Background />
      <div className="flex h-screen overflow-hidden">
        <MainNavigation variant={navVariant} items={navItems} logoHref="#/" />
        <main ref={mainRef} className="scroll-quiet flex-1 overflow-y-auto p-x6">
          <Card variant="primaryGlassElevation" className="mx-auto flex w-full max-w-[1280px] flex-col gap-x8 p-x6">
            <div className="flex flex-col gap-x2">
              <Text variant="label-small" className="text-text-secondary">
                {library.course}
              </Text>
              <Header size="primary" titleHeadingLevel={1} title={library.title} subtext={library.lede} />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-x4">
              <div className="min-w-x50 max-w-[calc(var(--spacing-x50)*2+var(--spacing-x30))] flex-1">
                <InputSearch
                  label="Search games"
                  showLabel={false}
                  placeholder="Search games…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                />
              </div>
              <div role="group" aria-label="Filter by genre" className="flex flex-wrap gap-x2">
                {library.filters.map((f) => (
                  <Tag
                    key={f.id}
                    variant="selectable"
                    label={f.label}
                    size="medium"
                    selected={filter === f.id}
                    onSelectedChange={() => setFilter(f.id)}
                  />
                ))}
              </div>
            </div>

            {games.length ? (
              /* At most four columns (two rows of four on desktop); narrower screens still drop to 3, 2 or 1.
                  Each column is at least 208px and at least a quarter of the row; 25% minus 12px leaves room for
                  the three 16px gaps. */
              <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(max(calc(var(--spacing-x50)+var(--spacing-x2)),calc(25%_-_var(--spacing-x3))),1fr))] gap-x4 p-x0">
                {games.map((g) => (
                  <li key={g.id}>
                    <GameCard game={g} onPlay={() => navigate('/midnight-train')} />
                  </li>
                ))}
              </ul>
            ) : (
              <Text variant="body-regular" className="text-text-secondary">
                No games match “{query}”.
              </Text>
            )}
          </Card>
        </main>
        {/* Product utility rail from the Figma frame (AI, search, language, theme). Decorative in the demo. */}
        <div aria-hidden="true" className="flex w-x16 shrink-0 flex-col items-center gap-x6 py-x5">
          {/* AI chat button, as in the other Nebula prototypes (dac-left-nav ToolsRail): tertiary
              icon-only Button in the AI gradient ring, 24px "sparkle with waves" glyph.
              Not focusable here because the rail is decorative in this demo. */}
          <AiGradientFrame innerClassName="rounded-x2">
            <Button
              type="tertiary"
              size="medium"
              iconOnly
              ariaLabel="AI Assistant"
              tabIndex={-1}
              leadingIcon={<Icon svg={sparkleWithWavesOutlinedRegular} size={24} aria-hidden />}
            />
          </AiGradientFrame>
          <Icon svg={magnifyingGlassOutlinedRegular} size={20} color="primary" />
          <span className="flex-1" />
          <Icon svg={globeOutlinedRegular} size={20} color="primary" />
          <Icon svg={sunOutlinedRegular} size={20} color="primary" />
        </div>
      </div>
    </>
  )
}
