import {useEffect, useState} from 'react'
import emailjs from '@emailjs/browser'
import './App.css'

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function App() {
    // Nav bar
    const toggleMenu = () => {
        const nav = document.getElementById('nav-links');
        const burger = document.getElementById('hamburger');
        nav?.classList.toggle('nav-open');
        burger?.classList.toggle('hamburger-open');
    };

    const closeMenu = () => {
        document.getElementById('nav-links')?.classList.remove('nav-open');
        document.getElementById('hamburger')?.classList.remove('hamburger-open');
    };

    const [formData, setFormData] = useState({
        from_name: '',
        from_email: '',
        subject: '',
        message: '',
    })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleSubmit = async () => {
        if (!formData.from_name || !formData.from_email || !formData.message) {
            setStatus('error')
            return
        }
        setStatus('sending')
        try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData, EMAILJS_PUBLIC_KEY)
            setStatus('success')
            setFormData({from_name: '', from_email: '', subject: '', message: ''})
        } catch {
            setStatus('error')
        }
    }

    useEffect(() => {                 // ← add this block
        const circumference = 2 * Math.PI * 45;

        const circleObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const el = e.target as SVGCircleElement;
                    const pct = parseFloat(el.getAttribute('data-pct') || '0');
                    el.style.strokeDasharray = String(circumference);
                    el.style.strokeDashoffset = String(circumference - (pct / 100) * circumference);
                    circleObserver.unobserve(el);
                }
            });
        }, {threshold: 0.3});

        document.querySelectorAll<SVGCircleElement>('.circle-fill').forEach(el => {
            el.style.strokeDasharray = String(circumference);
            el.style.strokeDashoffset = String(circumference);
            circleObserver.observe(el);
        });

        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const el = e.target as HTMLElement;
                    el.style.width = el.dataset.w + '%';
                    barObserver.unobserve(el);
                }
            });
        }, {threshold: 0.3});

        document.querySelectorAll<HTMLElement>('.skill-fill').forEach(el => barObserver.observe(el));

        return () => {                  // ← cleanup so observers don't leak on re-renders
            circleObserver.disconnect();
            barObserver.disconnect();
        };
    }, []);                           // ← empty array = runs once after first render

    return (
        <>
            <nav>
                <span className="nav-logo">ANTONIO</span>
                <div className="nav-links" id="nav-links">
                    <a href="#about" onClick={() => closeMenu()}>About me</a>
                    <a href="#projects" onClick={() => closeMenu()}>Portfolio</a>
                    <a href="#skills" onClick={() => closeMenu()}>Skills</a>
                    <a href="#experience" onClick={() => closeMenu()}>Resume</a>
                    <a href="#contact" onClick={() => closeMenu()}>Contact</a>
                </div>
                <div className="nav-right">
                    <button className="hamburger" id="hamburger" onClick={() => toggleMenu()} aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <button className="theme-btn" onClick={() => {
                        const isDark = document.body.getAttribute('data-theme') === 'dark';
                        document.body.setAttribute('data-theme', isDark ? '' : 'dark');
                        const icon = document.getElementById('theme-icon');
                        const label = document.getElementById('theme-label');
                        if (icon) icon.textContent = isDark ? '☽' : '☀';
                        if (label) label.textContent = isDark ? 'Dark' : 'Light';
                    }}>
                        <span id="theme-icon">☽</span> <span id="theme-label">Dark</span>
                    </button>
                </div>
            </nav>

            <section className="hero" id="about">
                <div className="hero-eyebrow">I Am Antonio Saucedo</div>
                <h1>Software<br/><em>Engineer</em></h1>
                <p className="hero-bio">With full-stack experience spanning front-end development, backend architecture,
                    and database design. Skilled in Software design principles and web development, with proficiency
                    across multiple programming languages and a strong ability to work with and manipulate data to meet
                    project requirements. Known for attention to detail and a methodical approach to solving complex
                    problems efficiently.</p>
                <div className="hero-cta">
                    <a href="#projects" className="btn-primary">View Portfolio</a>
                    <a href="#contact" className="btn-secondary">Contact Me</a>
                </div>
                <div className="hero-locations">
                    <div>
                        <div className="loc-country">Remote</div>
                        <div className="loc-city">Rigby, ID</div>
                    </div>
                    <div>
                        <div className="loc-country">Open to</div>
                        <div className="loc-city">Full-time / Contract</div>
                    </div>
                    <div>
                        <div className="loc-country">Available</div>
                        <div className="loc-city">Immediately</div>
                    </div>
                </div>
            </section>

            <section id="skills">
                <div className="section-header">
                    <h2 className="section-title">Skills</h2>
                </div>
                <div className="skills-cards-grid">
                    {[
                        {
                            title: 'Languages',
                            tags: ['HTML', 'JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'PL/SQL', 'C++', 'Kotlin', 'Swift', 'VBA', 'Bash Scripting']
                        },
                        {
                            title: 'Frameworks & Libraries',
                            tags: ['Node.js', 'React', 'Angular', 'Oracle Apex (OCI)', 'Bootstrap', 'SASS/SCSS/CSS', 'Playwright (E2E Testing)', 'utPLSQL (Unit Testing)']
                        },
                        {
                            title: 'Databases & Tools',
                            tags: ['Git/GitHub', 'Docker', 'Azure DevOps (CI/CD)', 'Jira', 'Render', 'MySQL', 'MongoDB (NoSQL)', 'Microsoft SQL Server', 'PostgreSQL', 'SQLite']
                        },
                        {
                            title: 'Skills & Concepts',
                            tags: ['RESTful API Design', 'GraphQL', 'OAuth & Security', 'Swagger API', 'SaaS', 'Agile/Scrum']
                        },
                    ].map(({title, tags}) => (
                        <div className="skills-card" key={title}>
                            <div className="skills-card-title">{title}</div>
                            <div className="skills-card-tags">
                                {tags.map(tag => (
                                    <span className="skills-card-tag" key={tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="quote-section">
                <span className="quote-mark">"</span>
                <p className="quote-text">Growth comes from putting yourself through tough situations and embracing the
                    struggle.</p>
                <div className="quote-author">— Antonio Saucedo</div>
            </div>

            <section id="projects">
                <div className="section-header">
                    <h2 className="section-title">Portfolio</h2>
                </div>
                <div className="projects-grid">
                    <div className="project-card">
                        <div className="project-header">
                            <div className="project-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <a className="project-link" href="https://app.mobiledash.net/" target="_blank">↗ Live</a>
                        </div>
                        <div className="project-name">MobileDash</div>
                        <div className="project-desc">A cloud-based, full-featured CRM platform built on Oracle APEX for
                            exterior contractors, utilizing Oracle's built-in authentication for secure, role-based
                            access control and custom-developed plugins to extend the framework for domain-specific
                            needs. I was directly involved in implementing and enhancing all major features throughout
                            the development lifecycle.
                        </div>
                        <div className="project-tags">
                            <span className="tag">Git/GitHub</span>
                            <span className="tag">Docker</span>
                            <span className="tag">Oracle Apex (OCI)</span>
                            <span className="tag">SaaS</span>
                            <span className="tag">OAuth & Security</span>
                            <span className="tag">HTML</span>
                            <span className="tag">CSS</span>
                            <span className="tag">JavaScript</span>
                            <span className="tag">SQL</span>
                            <span className="tag">PL/SQL</span>
                            <span className="tag">Playwright (E2E Testing)</span>
                            <span className="tag">utPLSQL (Unit Testing)</span>
                            <span className="tag">RESTful API Design</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="experience">
                <div className="section-header">
                    <h2 className="section-title">My Resume</h2>
                    <a href="/AntonioResume_2026.pdf" download="AntonioResume_2026.pdf" className="resume-download-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download Resume
                    </a>
                </div>
                <div className="experience-list">
                    {[
                        {
                            period: '09/2023 – Now',
                            role: 'Lead Software Developer',
                            company: 'MobileDash',
                            desc: [
                                'Worked with management to lead development team.',
                                'Developed application that queries thousands of documents to retrieve documents based on various query types.',
                                'Developed Web application pages, functionality and databases using Oracle Apex.',
                                'Worked on GitHub tickets to improve application frontend/backend using WebStorm, SaaS, Node, SCSS, TypeScript, Angular, Git.',
                                'Review, approve, and merge GitHub pull requests.',
                                'Report on work completed during daily standup meetings.']
                        },
                        {
                            period: '01/2023 – 04/2023',
                            role: 'Developer Intern',
                            company: 'The Church of Jesus Christ of Latter-day Saints',
                            desc: [
                                'Helped in development of application that queries millions of documents to retrieve documents based on various query types.',
                                'Worked on Jira bug/story/feature tickets to improve application frontend/backend using IntelliJ, Node, SASS, Typescript, Angular, Maven, Azure DevOps, Git.',
                                'Upgrade node dependencies (bootstrap, angular, others as needed).',
                                'Helped review/approve/merge GitHub pull requests.',
                                'QA user-based bug fixes and feature development.',
                                'Requirement elicitation to prepared Jira tickets for software developers.',
                                'Report on work completed during daily Agile standup meetings.']
                        },
                        {
                            period: '02/2021 – 10/2022',
                            role: 'CAD Drafter',
                            company: 'Harper Leavitt Engineering Inc.',
                            desc: [
                                'Worked in a team setting to meet the needs of clients and meet deadlines.',
                                'Communicated with state and local jurisdictions to meet requirements.',
                                'Drafted for surveyors and civil engineers using Civil3D.']
                        },
                        {
                            period: '03/2020 – 02/2021',
                            role: 'Construction Estimator',
                            company: 'Mickelsen Construction Inc.',
                            desc: [
                                'Created civil estimates for clients working with vendors for best prices.',
                                'Created excel sheets for effective calculations.']
                        },
                    ].map(({period, role, company, desc}) => (
                        <div className="exp-item" key={company}>
                            <div className="exp-period">{period}</div>
                            <div>
                                <div className="exp-role">{role}</div>
                                <div className="exp-company">{company}</div>
                                {desc.length === 1 ? (
                                    <div className="exp-desc">{desc[0]}</div>
                                ) : (
                                    <ul className="exp-desc">
                                        {desc.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="contact">
                <div className="section-header">
                    <h2 className="section-title">Contact Me</h2>
                </div>
                <div className="contact-wrap">
                    <div className="contact-text">
                        <p>I'm always open to new opportunities, collaborations, or just a conversation about software
                            design.
                            Drop me a message.</p>
                        <div className="contact-links">
                            <a className="contact-link" href="mailto:antonios.softwareengineer@gmail.com">
                                <div className="contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path
                                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                                antonios.softwareengineer@gmail.com
                            </a>
                            <a className="contact-link" href="https://github.com/Antonio-Saucedo" target="_blank">
                                <div className="contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path
                                            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                    </svg>
                                </div>
                                github.com/Antonio-Saucedo
                            </a>
                            <a className="contact-link" href="https://www.linkedin.com/in/antoniojsaucedo"
                               target="_blank">
                                <div className="contact-link-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path
                                            d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                        <rect x="2" y="9" width="4" height="12"/>
                                        <circle cx="4" cy="4" r="2"/>
                                    </svg>
                                </div>
                                linkedin.com/in/antoniojsaucedo
                            </a>
                        </div>
                    </div>
                    <div className="contact-form">
                        <div className="form-row">
                            <input className="form-input" type="text" name="from_name" placeholder="Your name"
                                   value={formData.from_name} onChange={handleChange}/>
                            <input className="form-input" type="email" name="from_email" placeholder="Email"
                                   value={formData.from_email} onChange={handleChange}/>
                        </div>
                        <input className="form-input" type="text" name="subject" placeholder="Subject"
                               value={formData.subject} onChange={handleChange}/>
                        <textarea className="form-input form-textarea" name="message" placeholder="Your message..."
                                  value={formData.message} onChange={handleChange}/>
                        {status === 'success' && (
                            <div className="form-status form-status--success">
                                ✓ Message sent! I'll get back to you soon.
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="form-status form-status--error">
                                ✗ Something went wrong. Please check all fields and try again.
                            </div>
                        )}
                        <button className="form-submit" onClick={handleSubmit} disabled={status === 'sending'}>
                            {status === 'sending' ? 'Sending...' : 'Send message'}
                            {status !== 'sending' && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            <footer>
                <p>© 2026 Antonio Saucedo — All rights reserved</p>
                <p>Built with React + passion</p>
            </footer>
        </>
    )
}

export default App
