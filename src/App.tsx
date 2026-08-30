import { useEffect, useRef, useState } from 'react'
import frameSheet from './assets/motion-frames.png'
import './App.css'

type ProjectCategory = 'Client Work' | 'Long Form' | 'Short Form' | 'Personal' | 'Motion Design' | '2D / 3D'

interface Project {
  title: string
  category: ProjectCategory
  year: string
  thumbnail: string
  video?: string
  aspectRatio: 'landscape' | 'portrait' | 'square' | 'wide'
  client?: string
  views?: string
  featured?: boolean
  position: string
}

const projects: Project[] = [
  { title: 'Orbit Study', category: 'Motion Design', year: '2026', thumbnail: frameSheet, aspectRatio: 'landscape', featured: true, position: '0% 0%' },
  { title: 'Veil / Form', category: 'Personal', year: '2026', thumbnail: frameSheet, aspectRatio: 'portrait', position: '33.333% 0%' },
  { title: 'Concrete Notes', category: '2D / 3D', year: '2025', thumbnail: frameSheet, aspectRatio: 'portrait', position: '66.666% 0%' },
  { title: 'Studio Portrait', category: 'Short Form', year: '2025', thumbnail: frameSheet, aspectRatio: 'wide', client: 'Independent artist', position: '0% 100%' },
  { title: 'Liquid Memory', category: 'Client Work', year: '2025', thumbnail: frameSheet, aspectRatio: 'square', position: '33.333% 100%' },
  { title: 'Terrain_01', category: 'Personal', year: '2024', thumbnail: frameSheet, aspectRatio: 'landscape', position: '66.666% 100%' },
  { title: 'Threshold', category: 'Long Form', year: '2024', thumbnail: frameSheet, aspectRatio: 'square', position: '100% 100%' },
]

const filters = ['All', 'Client Work', 'Long Form', 'Short Form', 'Personal', 'Motion Design', '2D / 3D'] as const

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible')
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return ref
}

function Header() {
  return <header className="site-header"><a className="wordmark" href="#top" aria-label="editedbydach, back to top">editedbydach</a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav></header>
}

function Hero() {
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <div className="hero-kicker">Independent creative / UK</div>
    <h1 id="hero-title"><span>Video editor &amp;</span><span className="hero-indent">motion designer.</span></h1>
    <p className="hero-intro">Working with creators and artists to make clear, considered work crafted with intention.</p>
    <div className="hero-facts" aria-label="Experience and disciplines"><span>9 years in After Effects</span><span>6 years freelance</span><span>2D / 3D / Editing</span></div>
    <a className="scroll-cue" href="#reel"><span>Scroll to reel</span><i aria-hidden="true" /></a>
  </section>
}

function Reel() {
  const ref = useReveal()
  return <section className="reel reveal" id="reel" ref={ref} aria-labelledby="reel-title">
    <div className="reel-frame"><div className="reel-image" style={{ backgroundImage: `url(${frameSheet})` }} role="img" aria-label="Abstract monochrome motion design reel placeholder" /><button className="reel-play" type="button" aria-label="Play showreel"><span>Play reel</span><i aria-hidden="true" /></button><span className="reel-time">01:24</span></div>
    <div className="reel-meta"><h2 id="reel-title">REEL / 2026</h2><p>Editing · Motion · 3D</p><p className="reel-note">Selected frames and experiments</p></div>
  </section>
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return <article className={`project-card project-${project.aspectRatio}`} style={{ '--delay': `${index * 55}ms` } as React.CSSProperties}>
    <a href="#contact" aria-label={`${project.title}, ${project.category}, ${project.year}`}>
      <div className="project-media"><div className="project-image" style={{ backgroundImage: `url(${project.thumbnail})`, backgroundPosition: project.position }} role="img" aria-label={`${project.title} project placeholder`} /><span className="project-arrow" aria-hidden="true">↗</span>{project.category === 'Personal' && <span className="experiment-tag">Experiment</span>}</div>
      <div className="project-meta"><h3>{project.title}</h3><p>{project.category}</p><p>{project.client ?? project.views ?? 'Selected work'}</p><time>{project.year}</time></div>
    </a>
  </article>
}

function ProjectGrid() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All')
  const ref = useReveal()
  const visibleProjects = activeFilter === 'All' ? projects : projects.filter((project) => project.category === activeFilter)
  return <section className="work-section" id="work" aria-labelledby="work-title">
    <div className="section-heading"><p className="eyebrow">01 / Selected work</p><h2 id="work-title">A mix of commissioned<br />and self-directed work.</h2></div>
    <div className="filters" role="group" aria-label="Filter projects">{filters.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
    <div className="project-grid reveal" ref={ref}>{visibleProjects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}</div>
  </section>
}

function About() {
  const ref = useReveal()
  return <section className="about reveal" id="about" ref={ref} aria-labelledby="about-title">
    <div className="about-statement"><p className="eyebrow">02 / About</p><h2 id="about-title">Nine years<br />making things<br /><em>move.</em></h2></div>
    <div className="about-copy"><p>Currently a 25 year old freelance video editor with 9 years of experience in Adobe After Effects. Alongside this, an intermediate working knowledge of Illustrator and Blender, primarily using these for 2D and 3D asset creation.</p><p>6 years experience freelancing, working with small content creators and artists on YouTube and Instagram. I also have my own editing page where I’ve built a small following uploading my work.</p><p>This site is a collection of some of the projects I've worked on along the way. I enjoy working closely with clients to create work that's clear, considered, and crafted with intention.</p><div className="software" aria-label="Software"><span>After Effects</span><span>Illustrator</span><span>Blender</span></div></div>
  </section>
}

function Contact() {
  return <section className="contact" id="contact" aria-labelledby="contact-title"><p className="eyebrow">03 / Contact</p><h2 id="contact-title">Have something in mind?<br /><span>Let’s make it move.</span></h2><a className="contact-link" href="mailto:hello@example.com"><span>Start a conversation</span><span aria-hidden="true">↗</span></a><div className="social-links"><a href="#contact">Email</a><a href="#contact">Instagram</a><a href="#contact">YouTube</a></div></section>
}

function Footer() {
  return <footer><p>© 2026 editedbydach</p><p>Video editor &amp; motion designer</p><a href="#top">Back to top ↑</a></footer>
}

function App() {
  return <><Header /><main><Hero /><Reel /><ProjectGrid /><About /><Contact /></main><Footer /></>
}

export default App
