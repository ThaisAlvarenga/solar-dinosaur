import './SiteMenu.css'

const MENU_LINKS = [
  { id: 'look-ahead', label: 'Looking Ahead', type: 'look-ahead' },
  { id: 'artist-statement', label: 'Overview', type: 'navigate' },
  { id: 'research', label: 'References', type: 'navigate' },
  { id: 'team', label: 'Contact', type: 'navigate' },
]

function MenuIcon({ name }) {
  switch (name) {
    case 'look-ahead':
      return (
        <svg
          className="menu-orbit-svg menu-orbit-svg--look-ahead"
          viewBox="0 0 89 84"
          aria-hidden="true"
        >
          <path d="M41.3046 11.7292H48.0172M37.5844 66.766H52.402M30.3659 1.75C28.7012 1.75 26.893 2.15583 25.2004 2.70972C20.6666 4.19337 17.7159 8.31357 16.3744 12.8914L5.39689 50.352C2.0632 61.7282 10.5931 73.1164 22.4477 73.1164C31.9763 73.1164 39.8085 65.6 40.2004 56.0795L41.8078 17.0387C42.0938 10.0914 38.6835 2.66039 31.779 1.8382C31.3006 1.78124 30.8277 1.75 30.3659 1.75ZM39.55 62.3812C39.55 72.8194 31.0882 81.2812 20.65 81.2812C10.2118 81.2812 1.75 72.8194 1.75 62.3812C1.75 51.943 10.2118 43.4812 20.65 43.4812C31.0882 43.4812 39.55 51.943 39.55 62.3812ZM58.4109 1.75C60.0756 1.75 61.8838 2.15583 63.5764 2.70972C68.1102 4.19337 71.061 8.31357 72.4024 12.8914L83.3799 50.352C86.7136 61.7282 78.1837 73.1164 66.3291 73.1164C56.8006 73.1164 48.9683 65.6 48.5764 56.0795L46.969 17.0387C46.683 10.0914 50.0933 2.66039 56.9978 1.8382C57.4762 1.78124 57.9491 1.75 58.4109 1.75ZM49.2268 62.3812C49.2268 72.8194 57.6886 81.2812 68.1268 81.2812C78.565 81.2812 87.0268 72.8194 87.0268 62.3812C87.0268 51.943 78.565 43.4812 68.1268 43.4812C57.6886 43.4812 49.2268 51.943 49.2268 62.3812Z" />
        </svg>
      )
    case 'artist-statement':
      return (
        <svg
          className="menu-orbit-svg menu-orbit-svg--overview"
          viewBox="0 0 75 94"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M59.1684 67.8744C59.1684 73.4665 54.6356 77.9994 49.0434 77.9994H11.7C6.10807 77.9994 1.57495 73.4665 1.57495 67.8744V31.2834C1.57495 28.5992 2.64082 26.0249 4.53825 24.1262L24.1095 4.5428C26.0084 2.64263 28.5846 1.575 31.2711 1.575H49.0434C54.6356 1.575 59.1684 6.10812 59.1684 11.7V67.8744ZM49.0434 71.2494C50.9078 71.2494 52.4184 69.7387 52.4184 67.8744V11.7C52.4184 9.83606 50.9073 8.325 49.0434 8.325H31.8552L31.8651 21.7336C31.8687 27.3283 27.3347 31.8658 21.7399 31.8658H8.32495V67.8744C8.32495 69.7387 9.83601 71.2494 11.7 71.2494H49.0434ZM13.0922 25.1158L25.1088 13.0918L25.1149 21.7384C25.1163 23.6033 23.6048 25.1158 21.7399 25.1158H13.0922Z"
          />
          <path d="M65.9832 18.1549C65.9832 16.2909 67.4943 14.7799 69.3582 14.7799C71.2221 14.7799 72.7332 16.2909 72.7332 18.1549V70.2063C72.7332 82.0111 63.1635 91.5813 51.3582 91.5813H18.2434C16.3795 91.5813 14.8684 90.0702 14.8684 88.2063C14.8684 86.3419 16.3795 84.8313 18.2434 84.8313H51.3582C59.4353 84.8313 65.9832 78.2833 65.9832 70.2063V18.1549Z" />
        </svg>
      )
    case 'research':
      return (
        <svg
          className="menu-orbit-svg menu-orbit-svg--references"
          viewBox="0 0 45 84"
          aria-hidden="true"
        >
          <path d="M31.1617 16.4548V57.9929C31.1617 62.948 27.145 66.9652 22.1895 66.9652C17.234 66.9652 13.2172 62.948 13.2172 57.9929V22.9348M31.1617 16.4548L31.1596 52.2603M31.1617 16.4548C31.1617 8.33355 24.5759 1.75 16.4547 1.75C8.33355 1.75 1.75 8.33355 1.75 16.4548V52.2603M42.6253 31.1597V61.2329C42.6253 72.5198 33.4755 81.67 22.1882 81.67C10.9012 81.67 1.75121 72.5198 1.75121 61.2329V31.1597" />
        </svg>
      )
    case 'team':
      return (
        <svg
          className="menu-orbit-svg menu-orbit-svg--contact"
          viewBox="0 0 77 84"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M57.7623 20.8916C57.7623 31.4084 49.1794 39.9891 38.5612 39.9891L38.517 39.9451C27.9429 39.9451 19.3156 31.3644 19.3156 20.8476C19.3156 10.3307 27.9871 1.75 38.5612 1.75C49.1351 1.75 57.7623 10.3747 57.7623 20.8916ZM51.126 20.8476C51.126 13.983 45.5073 8.35054 38.5612 8.35054C31.6594 8.35054 25.9962 13.983 25.9962 20.8476C25.9962 27.7121 31.6594 33.3446 38.5612 33.3446C45.463 33.3446 51.126 27.7121 51.126 20.8476Z"
          />
          <path d="M38.2501 46.5874C50.0628 46.5874 59.3094 49.8877 65.7245 56.4002V56.3562C74.7791 65.5358 74.7517 77.6839 74.7499 78.4676V78.49C74.7057 80.2942 73.2457 81.7463 71.4318 81.7463H71.3875C69.5293 81.7023 68.1136 80.2062 68.1136 78.402C68.1136 78.182 68.1136 68.1492 60.9464 60.9326C55.8143 55.7842 48.1604 53.144 38.2501 53.144C28.3397 53.144 20.6858 55.7842 15.5537 60.9326C8.38644 68.1932 8.38644 78.314 8.38644 78.402C8.38644 80.2062 6.92645 81.7463 5.11252 81.7463C3.5198 81.8343 1.75011 80.3382 1.75011 78.534L1.75007 78.5134C1.7483 77.7754 1.71914 65.5816 10.7755 56.4002C17.1906 49.8877 26.4373 46.5874 38.2501 46.5874Z" />
        </svg>
      )
    default:
      return null
  }
}

export default function SiteMenu({
  isOpen,
  onToggle,
  activeView = 'main',
  onNavigate,
  onLookAhead,
}) {
  const closeMenu = () => onToggle(false)

  const handleHubClick = () => {
    onNavigate('main')
    closeMenu()
  }

  const handleItemClick = (link) => {
    if (link.type === 'look-ahead') {
      onLookAhead()
    } else {
      onNavigate(link.id)
    }

    closeMenu()
  }

  return (
    <div className="site-menu">
      <button
        type="button"
        className="site-logo menu-toggle"
        onClick={() => onToggle(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="site-menu-overlay"
      >
        solar-dinosaur
      </button>

      {isOpen && (
        <button
          type="button"
          className="menu-close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        </button>
      )}

      <div
        id="site-menu-overlay"
        className={`menu-overlay${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
        onClick={closeMenu}
        role="presentation"
      >
        <div
          className="menu-overlay-panel"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="menu-radial">
            <div className="menu-rings-glow" aria-hidden="true" />

            <svg
              className="menu-ring-outer-band"
              viewBox="0 0 781 1441"
              preserveAspectRatio="xMinYMid meet"
              aria-hidden="true"
            >
              <defs>
                <filter
                  id="menu-outer-noise"
                  x="-674.448"
                  y="-11.9485"
                  width="1455.4"
                  height="1455.4"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.39 0.39"
                    stitchTiles="stitch"
                    numOctaves="3"
                    result="noise"
                    seed="6336"
                  />
                  <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                  <feComponentTransfer in="alphaNoise" result="coloredNoise1">
                    <feFuncA
                      type="discrete"
                      tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
                    />
                  </feComponentTransfer>
                  <feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
                  <feFlood floodColor="rgba(0, 0, 0, 0.25)" result="color1Flood" />
                  <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
                  <feMerge result="effect1_noise">
                    <feMergeNode in="shape" />
                    <feMergeNode in="color1" />
                  </feMerge>
                </filter>
                <radialGradient
                  id="menu-outer-fill"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(53.2503 715.75) rotate(60) scale(670.193 714.902)"
                >
                  <stop stopColor="#FFEE00" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#FFD500" stopOpacity="0" />
                </radialGradient>
                <mask
                  id="menu-outer-stroke-mask"
                  maskUnits="userSpaceOnUse"
                  x="-674.499"
                  y="-12.0001"
                  width="1456"
                  height="1456"
                  fill="black"
                >
                  <rect fill="white" x="-674.499" y="-12.0001" width="1456" height="1456" />
                  <path d="M778 715.75C778 1116.02 453.519 1440.5 53.2503 1440.5C-347.018 1440.5 -671.499 1116.02 -671.499 715.75C-671.499 315.482 -347.018 -9.00006 53.2503 -9.00006C453.519 -9.00006 778 315.482 778 715.75ZM-522.304 715.75C-522.304 1033.62 -264.62 1291.3 53.2503 1291.3C371.12 1291.3 628.805 1033.62 628.805 715.75C628.805 397.88 371.12 140.195 53.2503 140.195C-264.62 140.195 -522.304 397.88 -522.304 715.75Z" />
                </mask>
              </defs>
              <g filter="url(#menu-outer-noise)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M778 715.75C778 1116.02 453.519 1440.5 53.2503 1440.5C-347.018 1440.5 -671.499 1116.02 -671.499 715.75C-671.499 315.482 -347.018 -9.00006 53.2503 -9.00006C453.519 -9.00006 778 315.482 778 715.75ZM-522.304 715.75C-522.304 1033.62 -264.62 1291.3 53.2503 1291.3C371.12 1291.3 628.805 1033.62 628.805 715.75C628.805 397.88 371.12 140.195 53.2503 140.195C-264.62 140.195 -522.304 397.88 -522.304 715.75Z"
                  fill="url(#menu-outer-fill)"
                />
                <path
                  d="M778 715.75C778 1116.02 453.519 1440.5 53.2503 1440.5C-347.018 1440.5 -671.499 1116.02 -671.499 715.75C-671.499 315.482 -347.018 -9.00006 53.2503 -9.00006C453.519 -9.00006 778 315.482 778 715.75ZM-522.304 715.75C-522.304 1033.62 -264.62 1291.3 53.2503 1291.3C371.12 1291.3 628.805 1033.62 628.805 715.75C628.805 397.88 371.12 140.195 53.2503 140.195C-264.62 140.195 -522.304 397.88 -522.304 715.75Z"
                  fill="none"
                  stroke="rgba(255, 174, 0, 0.5)"
                  strokeWidth="2.948"
                  vectorEffect="non-scaling-stroke"
                  mask="url(#menu-outer-stroke-mask)"
                />
              </g>
            </svg>

            <svg
              className="menu-rings"
              viewBox="0 0 360 760"
              preserveAspectRatio="xMinYMid meet"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="menu-ring-arc-gold"
                  gradientUnits="userSpaceOnUse"
                  x1="6"
                  y1="48"
                  x2="240"
                  y2="712"
                >
                  <stop offset="0%" stopColor="#ffaf46" />
                  <stop offset="40%" stopColor="#ffaf46" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ffe046" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path className="menu-ring menu-ring--middle" d="M 6 88 A 292 292 0 0 1 6 672" />
              <path className="menu-ring menu-ring--inner" d="M 6 128 A 252 252 0 0 1 6 632" />
            </svg>

            <button
              type="button"
              className={`menu-hub${activeView === 'main' ? ' is-active' : ''}`}
              onClick={handleHubClick}
              aria-label="Return to main visualization"
              aria-current={activeView === 'main' ? 'page' : undefined}
            >
              <span className="menu-hub-title">Solar</span>
              <span className="menu-hub-subtitle">Dinosaur</span>
            </button>

            <nav className="menu-orbit" aria-label="Site sections">
              <ul className="menu-orbit-list">
                {MENU_LINKS.map((link) => (
                  <li
                    key={link.id}
                    className={`menu-orbit-item menu-orbit-item--${link.id}${activeView === link.id ? ' is-active' : ''}`}
                  >
                    <button
                      type="button"
                      className="menu-orbit-button"
                      onClick={() => handleItemClick(link)}
                      aria-current={activeView === link.id ? 'page' : undefined}
                    >
                      <span className="menu-orbit-icon">
                        <MenuIcon name={link.id} />
                      </span>
                      <span className="menu-orbit-label">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="menu-overlay-brand" onClick={(event) => event.stopPropagation()}>
          <p className="menu-overlay-brand-text">
            <span className="menu-overlay-brand-title">Fulton County</span>
            <span className="menu-overlay-brand-subtitle">Arts &amp; Culture</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export { MENU_LINKS }
