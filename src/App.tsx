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
                <p className="hero-bio">Full Stack Developer with 3+ years of experience building and maintaining web
                    applications from front-end UI through back-end APIs and database design. Experienced leading small
                    development teams, mentoring developers, and establishing standards that measurably improve delivery
                    speed. Skilled in JavaScript, TypeScript, React, Angular, Node.js (Express/NestJS), Python, SQL, and
                    NoSQL databases. Known for integrating third-party APIs, translating complex technical work into
                    business value, and collaborating across development, design, and stakeholder teams to deliver
                    reliable, scalable software.</p>
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
                            title: 'Frontend',
                            tags: ['JavaScript', 'TypeScript', 'React', 'Angular', 'Bootstrap', 'HTML', 'CSS/SASS/SCSS/Tailwind']
                        },
                        {
                            title: 'Backend',
                            tags: ['OAuth 2.0 & Security', 'Node.js', 'Express', 'NestJS', 'PL/SQL', 'Python', 'Java']
                        },
                        {
                            title: 'Databases',
                            tags: ['SQL', 'Oracle Apex', 'MySQL', 'PostgreSQL', 'SQLite', 'Microsoft SQL Server', 'MongoDB (NoSQL)']
                        },
                        {
                            title: 'APIs & Integrations',
                            tags: ['Intuit API (payments/invoicing)', 'IP geolocation APIs', 'RESTful API Design', 'Third-party REST', 'GraphQL', 'Swagger API']
                        },
                        {
                            title: 'DevOps & Tools',
                            tags: ['Git/GitHub', 'Azure DevOps (CI/CD)', 'Docker', 'Render', 'Bash Scripting', 'Code Review', 'Jira', 'Agile / Scrum', 'SaaS']
                        },
                        {
                            title: 'Testing',
                            tags: ['Playwright (E2E)', 'utPLSQL (Unit)', 'Jest (Unit)']
                        },
                        {
                            title: 'Other Languages',
                            tags: ['C++', 'Kotlin', 'Swift', 'Rust', 'VBA']
                        },
                        {
                            title: 'Soft Skills',
                            tags: ['Cross-functional Collaboration', 'Leadership', 'Conflict Resolution', 'Adaptability', 'Self-Motivated', 'Attention to Detail', 'Continuous Learner', 'Problem-solving', 'Bilingual (Spanish)']
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
                            period: '09/2023 – 03/2026',
                            role: 'Lead Software Developer',
                            company: 'MobileDash LLC., Remote from Rexburg ID',
                            desc: [
                                'Led a team of 2–3 developers building two parallel applications (a legacy system and a new Oracle Apex platform serving 40–50 end users), owning full stack delivery across front-end UI, REST API development, and database architecture, while mentoring developers, unblocking blockers, and delegating tasks to keep the team moving.',
                                'Integrated the Intuit API end-to-end to replace manual cash and check collection with in-app invoicing and digital payment processing, reducing billing errors, accelerating revenue collection, and giving the business real-time visibility into invoice balances; implemented OAuth 2.0 token acquisition and automated renewal to maintain secure, uninterrupted sessions.',
                                'Redesigned the SQL database architecture for the Oracle Apex application from the ground up, resolving structural issues that caused slow queries, poor scalability, and data integrity bugs; the improved schema supported multi-entity construction work order and project data and delivered a measurable boost to overall application performance.',
                                'Built a lead intake form from scratch in the Oracle Apex platform that used dynamic dropdowns driven by admin-managed settings to route leads to the correct service or product, then automatically generated the associated purchase and work orders, eliminating a fully manual process from the legacy system and empowering company admins to update service configurations directly without routing changes through a third party.',
                                'Established and enforced developer standards and coding conventions across the team, reducing feature delivery time from 2–3 months down to 1–2 weeks and building a consistent, maintainable codebase that lowered the onboarding curve for new developers.',
                                'Built and maintained RESTful APIs using Node.js with Express and NestJS, and maintained MongoDB schemas and query performance on the legacy production application, keeping thousands of document retrievals reliable across diverse query types with minimal downtime during active parallel development.',
                                'Maintained and extended Angular components across the legacy application to ensure UI stability during parallel development, and integrated external APIs to capture IP address and consent metadata for terms and conditions compliance, creating accurate audit trails for legal and regulatory purposes.',
                                'Served as the primary technical liaison between development, design, and business stakeholders, translating feature requirements into technical plans, communicating trade-offs in non-technical terms, and helping leadership make informed product decisions without needing to interpret technical detail.',
                                'Reviewed and merged GitHub pull requests, enforced code quality standards, and participated in daily Agile/Scrum standups to surface blockers and keep cross-functional teams aligned across design, engineering, and product.']
                        },
                        {
                            period: '01/2023 – 04/2023',
                            role: 'Developer Intern',
                            company: 'The Church of Jesus Christ of Latter-day Saints, Remote from Riverton UT',
                            desc: [
                                'Contributed UI fixes and small feature improvements to a member-facing portal querying millions of documents, delivering changes that shipped to users across the full development cycle from coding to QA to production deployment.',
                                'Diagnosed and resolved front-end UI bugs in Angular components using TypeScript, Node.js, SASS, and Maven, working alongside developers to identify root causes and implement fixes that restored correct display and behavior for members using the portal.',
                                'Created and updated Jira bug, story, and feature tickets, performing requirement elicitation directly with stakeholders to define clear scope for other developers and ensure work was well-defined before implementation began.',
                                'Independently executed manual QA across bug fixes, PR reviews, and production deployments, applying workflow knowledge to run through test cases without needing them defined; reviewed and approved GitHub pull requests as part of the same quality gate process.',
                                'Upgraded Node.js dependencies including Bootstrap and Angular, resolving breaking changes in the codebase introduced by the version bumps; independently deployed application changes to staging and production via Azure DevOps CI/CD pipelines, taking full ownership of the release process while the engineering manager was unavailable.']
                        },
                        {
                            period: '02/2021 – 10/2022',
                            role: 'CAD Drafter',
                            company: 'HLE Inc., Blackfoot ID',
                            desc: [
                                'Drafted plans for surveyors and civil engineers using Civil3D, collaborating with state and local jurisdictions to meet regulatory requirements.']
                        },
                        {
                            period: '03/2020 – 02/2021',
                            role: 'Construction Estimator',
                            company: 'Mickelsen Construction Inc., Blackfoot ID',
                            desc: [
                                'Created civil estimates and Excel-based calculation tools to support vendor negotiations and project bidding.']
                        },
                    ].map(({period, role, company, desc}) => (
                        <div className="exp-item" key={company}>
                            <div className="exp-period">{period}</div>
                            <div>
                                <div className="exp-role">{role}</div>
                                <div className="exp-company">{company}</div>
                                <ul className="exp-desc">
                                    {desc.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ul>
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
                            design. Send me a message.</p>
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
