// PrintResume.tsx renders live off resume/climbs state and stays hidden via
// #print-resume { display: none } (see styles/global.css). This just flips
// the page over to showing only that element for the duration of the
// browser's own print dialog - "Save as PDF" there is what actually
// produces the file, there's no PDF library involved.
export function triggerResumePrint(name: string): void {
  const prevTitle = document.title
  document.title = `${name} — Climbing Resume`
  document.body.classList.add('print-resume-mode')

  window.addEventListener(
    'afterprint',
    () => {
      document.title = prevTitle
      document.body.classList.remove('print-resume-mode')
    },
    { once: true },
  )

  window.print()
}