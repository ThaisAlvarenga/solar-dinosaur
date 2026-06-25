export default function ChromeCtaArrow({ direction = 'left' }) {
  return (
    <span
      className={`chrome-cta-arrow chrome-cta-arrow--${direction}`}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 33 26"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0.512563 11.6495C-0.170854 12.3329 -0.170854 13.4409 0.512563 14.1243L11.6495 25.2613C12.3329 25.9447 13.441 25.9447 14.1244 25.2613C14.8078 24.5779 14.8078 23.4698 14.1244 22.7864L4.22487 12.8869L14.1244 2.98741C14.8078 2.30399 14.8078 1.19595 14.1244 0.512533C13.441 -0.170884 12.3329 -0.170884 11.6495 0.512533L0.512563 11.6495ZM1.75 12.8869V14.6369H32.725V12.8869V11.1369H1.75V12.8869Z"
          fill="#FFF"
        />
      </svg>
    </span>
  )
}
