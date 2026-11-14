// Decorative currents drawn from geometry. This motif has no data inputs.
export function CurrentArt() {
  return <svg className="current-art" viewBox="0 0 640 470" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="current" x1="0" y1="1" x2=".86" y2=".1" gradientUnits="objectBoundingBox">
        <stop stopColor="#006EE9"/><stop offset=".43" stopColor="#83E7FF"/>
        <stop offset=".74" stopColor="#C78BFF"/><stop offset="1" stopColor="#E8A0FF"/>
      </linearGradient>
      <radialGradient id="sea"><stop stopColor="#153578"/><stop offset=".7" stopColor="#102451"/><stop offset="1" stopColor="#07113D"/></radialGradient>
      <clipPath id="disc"><circle cx="322" cy="232" r="166"/></clipPath>
    </defs>
    <g fill="none" stroke="#94b8fc" opacity=".26" strokeWidth=".8">
      <circle cx="322" cy="232" r="186" strokeDasharray="1 7"/>
      <ellipse cx="322" cy="232" rx="284" ry="98" transform="rotate(-26 322 232)"/>
    </g>
    <circle cx="322" cy="232" r="166" fill="url(#sea)"/>
    <g clipPath="url(#disc)" fill="none" stroke="url(#current)">
      {Array.from({ length: 76 }, (_, i) => {
        const offset = i * 4.6
        const curl = Math.sin(i / 16) * 62
        return <path key={i} strokeWidth={i % 5 === 0 ? 1.65 : 1.1}
          d={`M76 ${16 + offset} C190 ${-18 + offset}, 196 ${276 + curl}, 316 ${130 + offset * .57} S466 ${47 + offset * .8}, 551 ${offset + 47}`}/>
      })}
    </g>
    <circle cx="322" cy="232" r="166" fill="none" stroke="#83E7FF" opacity=".42" strokeWidth="1"/>
    <path d="M67 347c42 48 219-4 360-96 72-47 124-94 134-131" fill="none" stroke="#a4b9ff" opacity=".55"/>
    <g fill="#83E7FF"><circle cx="88" cy="312" r="2.8"/><circle cx="527" cy="89" r="1.8"/><circle cx="186" cy="72" r="1.5"/><circle cx="539" cy="323" r="1.8"/></g>
    <g fill="#E8A0FF"><path d="m473 57 2.3 7.7 7.7 2.3-7.7 2.3L473 77l-2.3-7.7-7.7-2.3 7.7-2.3z"/><circle cx="116" cy="365" r="3"/></g>
  </svg>
}
