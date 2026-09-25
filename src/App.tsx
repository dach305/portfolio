import { useEffect, useRef, useState } from 'react'
import { MotionConfig, motion, useMotionValueEvent, useReducedMotion, useScroll, type Variants } from 'framer-motion'
import './App.css'
import CursorGlow from './components/CursorGlow'
import { useCarouselNavigation } from './components/useCarouselNavigation'

type ProjectCategory = 'Short Form Projects' | 'Square / Personal Projects'
type AspectRatio = 'portrait' | 'square'

interface Project {
  title: string
  category: ProjectCategory
  year: string
  thumbnail?: string
  video?: string
  aspectRatio: AspectRatio
  client?: string
  views?: string
  featured?: boolean
}

interface ProjectGroup {
  label: string
  title: ProjectCategory
  note: string
  aspectRatio: AspectRatio
  projects: Project[]
}

const makeProjects = (category: ProjectCategory, aspectRatio: AspectRatio, count: number): Project[] =>
  Array.from({ length: count }, (_, index) => ({
    title: `${category.split(' ')[0]} Project ${String(index + 1).padStart(2, '0')}`,
    category,
    year: index < 2 ? '2026' : '2025',
    aspectRatio,
  }))

const projectGroups: ProjectGroup[] = [
  { label: 'A / Vertical edits', title: 'Short Form Projects', note: 'Social edits and concise stories.', aspectRatio: 'portrait', projects: makeProjects('Short Form Projects', 'portrait', 6) },
  { label: 'C / Self-directed', title: 'Square / Personal Projects', note: 'Studies made outside commissioned work.', aspectRatio: 'square', projects: makeProjects('Square / Personal Projects', 'square', 5) },
]

const easeOut = [0.22, 1, 0.36, 1] as const
const viewport = { once: true, amount: 0.16, margin: '0px 0px -7% 0px' } as const
const navSections = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const
type NavSection = (typeof navSections)[number]['id']

function useAnimationVariants() {
  const reduceMotion = useReducedMotion()
  const duration = reduceMotion ? 0 : 0.62

  const fadeUp: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration, ease: easeOut } },
  }
  const fadeIn: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0 },
    visible: { opacity: 1, transition: { duration: reduceMotion ? 0 : 0.55, ease: easeOut } },
  }
  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: reduceMotion ? 0 : 0.04 } },
  }
  const cardFadeUp: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.5, ease: easeOut } },
  }
  const slowFadeUp: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.78, ease: easeOut } },
  }

  return { fadeUp, fadeIn, staggerContainer, cardFadeUp, slowFadeUp }
}

function Header() {
  const { fadeIn } = useAnimationVariants()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 12)
  const [activeSection, setActiveSection] = useState<NavSection | null>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : ''
    return navSections.some(({ id }) => id === hash) ? hash as NavSection : null
  })
  useMotionValueEvent(scrollY, 'change', (latest) => setIsScrolled(latest > 12))

  useEffect(() => {
    const sections = navSections.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section))
    const observer = new IntersectionObserver((entries) => {
      const current = entries.find((entry) => entry.isIntersecting)
      if (current) setActiveSection(current.target.id as NavSection)
    }, { rootMargin: '-15% 0px -45% 0px', threshold: 0 })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return <motion.header className={`site-header${isScrolled ? ' is-scrolled' : ''}`} variants={fadeIn} initial="hidden" animate="visible"><div className="header-inner"><a className="wordmark" href="#top" aria-label="editedbydach, back to top">editedbydach</a><nav aria-label="Main navigation">{navSections.map(({ id, label }) => <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : undefined} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setActiveSection(id)}>{label}</a>)}</nav></div></motion.header>
}

function Hero() {
  const { fadeUp, staggerContainer } = useAnimationVariants()
  return <motion.section className="hero content-shell" id="top" aria-labelledby="hero-title" variants={staggerContainer} initial="hidden" animate="visible">
    <motion.div className="hero-kicker" variants={fadeUp}>Independent creative / UK</motion.div>
    <motion.h1 id="hero-title" variants={fadeUp}><span>Video editor &amp;</span><span className="hero-indent">motion designer.</span></motion.h1>
    <motion.p className="hero-intro" variants={fadeUp}>Working with creators and artists to make clear, considered work crafted with intention.</motion.p>
    <motion.div className="hero-facts" aria-label="Experience and disciplines" variants={fadeUp}><span>9 years in After Effects</span><span>6 years freelance</span><span>2D / 3D / Editing</span></motion.div>
    <motion.a className="scroll-cue" href="#reel" variants={fadeUp}><span>View selected work</span><i aria-hidden="true" /></motion.a>
  </motion.section>
}

function Reel() {
  const { fadeUp, staggerContainer } = useAnimationVariants()
  return <motion.section className="reel content-shell" id="reel" aria-labelledby="reel-title" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
    <motion.div className="reel-frame media-placeholder" variants={fadeUp}><span className="placeholder-index">Showreel placeholder</span><button className="reel-play" type="button" aria-label="Showreel placeholder"><span>Reel coming soon</span><i aria-hidden="true" /></button><span className="reel-time">16:9</span></motion.div>
    <motion.div className="reel-meta" variants={fadeUp}><h2 id="reel-title">Reel / 2026</h2><p>Editing · Motion · 3D</p><p className="reel-note">Selected frames and experiments</p></motion.div>
  </motion.section>
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { cardFadeUp } = useAnimationVariants()
  return <motion.article className={`project-card project-${project.aspectRatio}`} variants={cardFadeUp}>
    <a href="#contact" aria-label={`${project.title}, ${project.year}`}>
      <div className="project-media media-placeholder"><span className="placeholder-index">Media {String(index + 1).padStart(2, '0')}</span><span className="project-arrow" aria-hidden="true">↗</span></div>
      <div className="project-meta"><h3>{project.title}</h3><time>{project.year}</time></div>
    </a>
  </motion.article>
}

function CarouselControl({ direction, title, trackId, onMove }: {
  direction: -1 | 1
  title: string
  trackId: string
  onMove: (direction: -1 | 1) => void
}) {
  return <div className={`carousel-control carousel-control-${direction === -1 ? 'previous' : 'next'}`}>
    <button type="button" onClick={() => onMove(direction)} aria-label={`${direction === -1 ? 'Previous' : 'Next'} ${title}`} aria-controls={trackId}>
      <span aria-hidden="true">{direction === -1 ? '<' : '>'}</span>
    </button>
  </div>
}

function ProjectSection({ group, sectionIndex }: { group: ProjectGroup; sectionIndex: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { fadeUp, staggerContainer } = useAnimationVariants()
  const reduceMotion = useReducedMotion()
  const move = useCarouselNavigation(trackRef, reduceMotion)

  return <motion.section className={`project-group group-${group.aspectRatio}`} aria-labelledby={`project-group-${sectionIndex}`} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
    <motion.div className="group-heading" variants={fadeUp}>
      <div><p className="group-label">{group.label}</p><h3 id={`project-group-${sectionIndex}`}>{group.title}</h3></div>
      <p className="group-note">{group.note}</p>
    </motion.div>
    <div className="carousel-viewport">
      <CarouselControl direction={-1} title={group.title} trackId={`project-track-${sectionIndex}`} onMove={move} />
      <motion.div className="project-track" id={`project-track-${sectionIndex}`} ref={trackRef} tabIndex={0} aria-label={`${group.title}, horizontally scrollable`} variants={staggerContainer}>{group.projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}</motion.div>
      <CarouselControl direction={1} title={group.title} trackId={`project-track-${sectionIndex}`} onMove={move} />
    </div>
  </motion.section>
}

function ProjectGrid() {
  const { fadeUp, staggerContainer } = useAnimationVariants()
  return <section className="work-section content-shell" id="work" aria-labelledby="work-title">
    <motion.div className="section-heading" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}><motion.p className="eyebrow" variants={fadeUp}>01 / Selected work</motion.p><motion.h2 id="work-title" variants={fadeUp}>Commissioned work and ongoing studies.</motion.h2></motion.div>
    <div className="project-groups">{projectGroups.map((group, index) => <ProjectSection key={group.title} group={group} sectionIndex={index} />)}</div>
  </section>
}

function About() {
  const { fadeUp, staggerContainer } = useAnimationVariants()
  return <motion.section className="about content-shell" id="about" aria-labelledby="about-title" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={viewport}>
    <motion.div className="about-label" variants={fadeUp}><p className="eyebrow">MORE ABOUT ME</p></motion.div>
    <motion.div className="about-content" variants={staggerContainer}>
      <motion.h2 id="about-title" variants={fadeUp}>placeholder</motion.h2>
      <motion.div className="about-copy" variants={fadeUp}><p>Currently a 25 year old freelance video editor with 9 years of experience in Adobe After Effects. Alongside this, an intermediate working knowledge of Illustrator and Blender, primarily using these for 2D and 3D asset creation.</p><p>6 years experience freelancing, working with small content creators and artists on YouTube and Instagram. I also have my own editing page where I’ve built a small following uploading my work.</p><p>This site is a collection of some of the projects I've worked on along the way. I enjoy working closely with clients to create work that's clear, considered, and crafted with intention.</p></motion.div>
      <motion.div className="about-socials" variants={fadeUp} aria-label="Social links"><a href="#about" aria-label="YouTube"><span aria-hidden="true">▶</span></a><a href="#about" aria-label="Instagram"><span aria-hidden="true">◎</span></a><a href="mailto:hello@example.com" aria-label="Email"><span aria-hidden="true">✉</span></a></motion.div>
    </motion.div>
  </motion.section>
}

function Contact() {
  const { fadeUp, slowFadeUp, staggerContainer } = useAnimationVariants()
  return <motion.section className="contact" id="contact" aria-labelledby="contact-title" variants={slowFadeUp} initial="hidden" whileInView="visible" viewport={viewport}><motion.div className="contact-inner" variants={staggerContainer}><motion.p className="eyebrow" variants={fadeUp}>03 / Contact</motion.p><motion.h2 id="contact-title" variants={slowFadeUp}>Have something in mind?<br /><span>Let’s make it move.</span></motion.h2><motion.a className="contact-link" href="mailto:hello@example.com" variants={fadeUp}><span>Start a conversation</span><span aria-hidden="true">↗</span></motion.a><motion.div className="social-links" variants={fadeUp}><a href="#contact">Email</a><a href="#contact">Instagram</a><a href="#contact">YouTube</a></motion.div></motion.div></motion.section>
}

function Footer() {
  const { fadeIn } = useAnimationVariants()
  return <motion.footer className="content-shell" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}><p>© 2026 editedbydach</p><p>Video editor &amp; motion designer</p><a href="#top">Back to top ↑</a></motion.footer>
}

function App() {
  return <MotionConfig reducedMotion="user"><CursorGlow /><Header /><main><Hero /><Reel /><ProjectGrid /><About /><Contact /></main><Footer /></MotionConfig>
}

export default App
