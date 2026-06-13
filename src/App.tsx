import {useEffect, useState} from 'react';
import emailjs from '@emailjs/browser';
import CoverLetterGenerator from "./modals/cover_letter_generator/CoverLetterGenerator";
import Counter from "./modals/counter/counter.tsx";
import './App.css';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

function App() {
    // Modal pages state
    const [coverLetterGeneratorIsOpen, setCoverLetterGeneratorIsOpen] = useState(false);
    const [counterIsOpen, setCounterIsOpen] = useState(false);

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

    useEffect(() => {
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

        return () => { // ← cleanup so observers don't leak on re-renders
            circleObserver.disconnect();
            barObserver.disconnect();
        };
    }, []); // ← empty array = runs once after first render

    return (
        <>
            <nav className="flex items-center bg-bg1 bottom-border1 justify-between top-0">
                <span
                    className="nav-logo flex items-center color-accent font-dm-mono font-15px weight-500 gap-6px tracking-004em">ANTONIO</span>
                <div className="nav-links flex items-center font-14px" id="nav-links">
                    <a className="color-text1 padding-10px-15px decoration-none" href="#about"
                       onClick={() => closeMenu()}>About me</a>
                    <a className="color-text1 padding-10px-15px decoration-none" href="#projects"
                       onClick={() => closeMenu()}>Portfolio</a>
                    <a className="color-text1 padding-10px-15px decoration-none" href="#skills"
                       onClick={() => closeMenu()}>Skills</a>
                    <a className="color-text1 padding-10px-15px decoration-none" href="#experience"
                       onClick={() => closeMenu()}>Resume</a>
                    <a className="color-text1 padding-10px-15px decoration-none" href="#contact"
                       onClick={() => closeMenu()}>Contact</a>
                </div>
                <div className="nav-right flex items-center gap-12px">
                    <button className="hamburger border-none cursor-pointer justify-center" id="hamburger"
                            onClick={() => toggleMenu()} aria-label="Toggle menu">
                        <span className="block height-2px"></span>
                        <span className="block height-2px"></span>
                        <span className="block height-2px"></span>
                    </button>
                    <button
                        className="theme-btn flex items-center bg-bg3 solid-border2 border-radius-20px color-text2 cursor-pointer font-dm-sans font-13px gap-6px"
                        onClick={() => {
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

            <section className="hero margin-0-auto max-width-960px padding-48px-32px" id="about">
                <div
                    className="hero-eyebrow flex items-center color-accent font-dm-mono font-12px gap-10px tracking-014em margin-bottom-16px uppercase">
                    I Am Antonio Saucedo
                </div>
                <h1 className="color-text3 weight-600 margin-bottom-24px uppercase">Software<br/><em
                    className="color-accent font-normal">Engineer</em></h1>
                <p className="hero-bio tracking-180em">Full Stack Developer with 3+ years of experience building and
                    maintaining web applications from front-end UI through back-end APIs and database design.
                    Experienced leading small development teams, mentoring developers, and establishing standards that
                    measurably improve delivery speed. Skilled in JavaScript, TypeScript, React, Angular, Node.js
                    (Express/NestJS), Python, SQL, and NoSQL databases. Known for integrating third-party APIs,
                    translating complex technical work into business value, and collaborating across development,
                    design, and stakeholder teams to deliver reliable, scalable software.</p>
                <div className="hero-cta flex flex-wrap gap-12px">
                    <a href="#projects"
                       className="btn-primary inline-block bg-accent border-none border-radius-4px color-text2 font-12px weight-500 tracking-004em padding-11px-24px decoration-none uppercase">View
                        Portfolio</a>
                    <a href="#contact"
                       className="btn-secondary inline-block bg-transparent solid-border2 border-radius-4px color-text1 font-12px weight-500 tracking-004em padding-11px-24px decoration-none uppercase">Contact
                        Me</a>
                </div>
                <div className="hero-locations flex top-border1">
                    <div>
                        <div className="loc-country font-13px weight-500 margin-bottom-3px">Remote</div>
                        <div className="loc-city font-dm-mono font-12px">Rigby, ID</div>
                    </div>
                    <div>
                        <div className="loc-country font-13px weight-500 margin-bottom-3px">Open to</div>
                        <div className="loc-city font-dm-mono font-12px">Full-time / Contract</div>
                    </div>
                    <div>
                        <div className="loc-country font-13px weight-500 margin-bottom-3px">Available</div>
                        <div className="loc-city font-dm-mono font-12px">Immediately</div>
                    </div>
                </div>
            </section>

            <section className="margin-0-auto max-width-960px padding-48px-32px" id="skills">
                <div className="section-header">
                    <h2 className="section-title weight-600 uppercase">Skills</h2>
                </div>
                <div className="skills-cards-grid grid gap-16px">
                    {[
                        {
                            title: 'Frontend',
                            tags: ['JavaScript', 'TypeScript', 'React', 'Vite', 'Angular', 'Bootstrap', 'HTML', 'CSS/SASS/SCSS/Tailwind', 'Responsive Design']
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
                            tags: ['Gemini Flash API', 'Intuit API (payments/invoicing)', 'IP geolocation APIs', 'RESTful API Design', 'Fetch API', 'JSON', 'Third-party REST', 'GraphQL', 'Swagger API']
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
                        <div className="skills-card flex flex-column bg-bg2 border-radius-4px gap-16px height-100"
                             key={title}>
                            <div className="skills-card-title font-14px weight-600">{title}</div>
                            <div
                                className="skills-card-tags flex flex-wrap font-dm-mono font-12px weight-500 gap-6px tracking-002em">
                                {tags.map(tag => (
                                    <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px"
                                          key={tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="quote-section bg-bg2 max-width-960px">
                <span className="quote-mark block color-accent margin-bottom-8px">"</span>
                <p className="quote-text tracking-170em margin-bottom-16px">Growth comes from putting yourself through
                    tough situations and
                    embracing the struggle.</p>
                <div className="quote-author font-dm-mono font-12px tracking-006em">— Antonio Saucedo</div>
            </div>

            <section className="margin-0-auto max-width-960px padding-48px-32px" id="projects">
                <div className="section-header">
                    <h2 className="section-title weight-600 uppercase">Portfolio</h2>
                </div>
                <div className="projects-grid grid gap-16px">
                    <div className="project-card bg-bg2 border-radius-4px">
                        <div className="project-header flex justify-between">
                            <div className="project-icon flex items-center bg-bg4 border-radius-4px justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <a className="project-link color-text1 font-dm-mono font-12px decoration-none"
                               href="https://mobiledash.net/" target="_blank">↗ Live</a>
                        </div>
                        <div className="project-name font-15px weight-500 margin-bottom-8px">MobileDash</div>
                        <div className="project-desc font-13px tracking-165em margin-bottom-16px">A cloud-based,
                            full-featured CRM platform built on Oracle APEX for exterior contractors, utilizing Oracle's
                            built-in authentication for secure, role-based access control and custom-developed plugins
                            to extend the framework for domain-specific needs. I was directly involved in implementing
                            and enhancing all major features throughout the development lifecycle.
                        </div>
                        <div
                            className="project-tags flex flex-wrap font-dm-mono font-12px weight-500 gap-6px tracking-002em">
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Git/GitHub</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Docker</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Bash Scripting</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Oracle Apex (OCI)</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">SaaS</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">OAuth & Security</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">HTML</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">CSS</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Tailwind</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">JavaScript</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">SQL</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">PL/SQL</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Intuit API (payments/invoicing)</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">IP geolocation APIs</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">RESTful API Design</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Third-party REST</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Playwright (E2E Testing)</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">utPLSQL (Unit Testing)</span>
                        </div>
                    </div>
                    <div className="project-card bg-bg2 border-radius-4px">
                        <div className="project-header flex justify-between">
                            <div className="project-icon flex items-center bg-bg4 border-radius-4px justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </div>
                            <button
                                className="project-link bg-transparent border-none color-text1 cursor-pointer font-dm-mono font-12px decoration-none"
                                onClick={() => setCoverLetterGeneratorIsOpen(true)}>↗ Open
                            </button>
                        </div>
                        <div className="project-name font-15px weight-500 margin-bottom-8px">Cover Letter Generator
                        </div>
                        <div className="project-desc font-13px tracking-165em margin-bottom-16px">A full-stack AI tool
                            that generates tailored cover letters from a job description and resume highlights, powered
                            by the Gemini Flash API with tone selection and a clean modal UI.
                        </div>
                        <div
                            className="project-tags flex flex-wrap font-dm-mono font-12px weight-500 gap-6px tracking-002em">
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Git/GitHub</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Vite</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">React</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">TypeScript</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">SASS</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">SCSS</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Gemini Flash API</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">RESTful API Design</span>
                        </div>
                    </div>
                    <CoverLetterGenerator isOpen={coverLetterGeneratorIsOpen}
                                          onClose={() => setCoverLetterGeneratorIsOpen(false)}/>
                    <div className="project-card bg-bg2 border-radius-4px">
                        <div className="project-header flex justify-between">
                            <div className="project-icon flex items-center bg-bg4 border-radius-4px justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </div>
                            <button
                                className="project-link bg-transparent border-none color-text1 cursor-pointer font-dm-mono font-12px decoration-none"
                                onClick={() => setCounterIsOpen(true)}>↗ Open
                            </button>
                        </div>
                        <div className="project-name font-15px weight-500 margin-bottom-8px">React Counter</div>
                        <div className="project-desc font-13px tracking-165em margin-bottom-16px">A React counter built
                            with useState and a clean modal UI.
                        </div>
                        <div
                            className="project-tags flex flex-wrap font-dm-mono font-12px weight-500 gap-6px tracking-002em">
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Git/GitHub</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Vite</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">React</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">TypeScript</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">SCSS</span>
                        </div>
                    </div>
                    <Counter isOpen={counterIsOpen} onClose={() => setCounterIsOpen(false)}/>
                    <div className="project-card bg-bg2 border-radius-4px">
                        <div className="project-header flex justify-between">
                            <div className="project-icon flex items-center bg-bg4 border-radius-4px justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                            </div>
                            <a className="project-link color-text1 font-dm-mono font-12px decoration-none"
                               href="https://antonio-saucedo.github.io/wdd230/" target="_blank">↗ Live</a>
                        </div>
                        <div className="project-name font-15px weight-500 margin-bottom-8px">WDD 230 – Web Frontend
                            Development
                        </div>
                        <div className="project-desc font-13px tracking-165em margin-bottom-16px">A collection of
                            frontend projects built throughout BYU-Idaho's Web Frontend Development course, covering
                            responsive design, DOM manipulation, JSON & Fetch API integration, live weather data,
                            progressive image loading, and a polished final site, Temple Inn & Suites.
                        </div>
                        <div
                            className="project-tags flex flex-wrap font-dm-mono font-12px weight-500 gap-6px tracking-002em">
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Git/GitHub</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">HTML</span>
                            <span className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">CSS</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">JavaScript</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Fetch API</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">JSON</span>
                            <span
                                className="tag bg-bg4 border-radius-20px color-text3 padding-4px-10px">Responsive Design</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="margin-0-auto max-width-960px padding-48px-32px" id="experience">
                <div className="section-header">
                    <h2 className="section-title weight-600 uppercase">My Resume</h2>
                    <a href="/AntonioResume_2026.pdf" download="AntonioResume_2026.pdf"
                       className="resume-download-btn items-center bg-transparent solid-border2 border-radius-4px color-text1 font-12px weight-500 gap-8px tracking-004em decoration-none uppercase">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download Resume
                    </a>
                </div>
                <div className="experience-list flex flex-column">
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
                        <div className="exp-item grid bottom-border1" key={company}>
                            <div
                                className="exp-period font-dm-mono font-11px tracking-004em padding-top-3px">{period}</div>
                            <div>
                                <div className="exp-role font-15px weight-500 margin-bottom-3px">{role}</div>
                                <div
                                    className="exp-company color-accent font-dm-mono font-12px tracking-004em margin-bottom-10px">{company}</div>
                                <ul className="exp-desc flex flex-column font-13px tracking-170em"> {desc.map((point, i) => (
                                    <li key={i}>{point}</li>))}</ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="margin-0-auto max-width-960px padding-48px-32px" id="contact">
                <div className="section-header">
                    <h2 className="section-title weight-600 uppercase">Contact Me</h2>
                </div>
                <div className="contact-wrap grid">
                    <div className="contact-text">
                        <p className="font-16px tracking-180em margin-bottom-24px">I'm always open to new opportunities,
                            collaborations, or just a conversation about software design. Send me a message.</p>
                        <div className="contact-links flex flex-column font-14px gap-12px margin-top-24px">
                            <a className="contact-link flex items-center color-text1 gap-10px decoration-none"
                               href="mailto:antonios.softwareengineer@gmail.com">
                                <div
                                    className="contact-link-icon flex items-center bg-bg2 solid-border1 border-radius-4px justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path
                                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                                antonios.softwareengineer@gmail.com
                            </a>
                            <a className="contact-link flex items-center color-text1 gap-10px decoration-none"
                               href="https://github.com/Antonio-Saucedo"
                               target="_blank">
                                <div
                                    className="contact-link-icon flex items-center bg-bg2 solid-border1 border-radius-4px justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path
                                            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                    </svg>
                                </div>
                                github.com/Antonio-Saucedo
                            </a>
                            <a className="contact-link flex items-center color-text1 gap-10px decoration-none"
                               href="https://www.linkedin.com/in/antoniojsaucedo"
                               target="_blank">
                                <div
                                    className="contact-link-icon flex items-center bg-bg2 solid-border1 border-radius-4px justify-center">
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
                    <div className="contact-form flex flex-column gap-12px">
                        <div className="form-row grid gap-12px">
                            <label htmlFor="from_name" className="contact-form-label font-16px">Name
                                <input id="from_name" name="from_name" type="text"
                                       className="form-input bg-bg2 solid-border2 border-radius-4px color-text1 font-dm-sans font-14px padding-10px-14px"
                                       placeholder="Your name" value={formData.from_name}
                                       onChange={handleChange}/></label>
                            <label htmlFor="from_email" className="contact-form-label font-16px">From
                                <input id="from_email" name="from_email" type="email"
                                       className="form-input bg-bg2 solid-border2 border-radius-4px color-text1 font-dm-sans font-14px padding-10px-14px"
                                       placeholder="Email" value={formData.from_email} onChange={handleChange}/></label>
                        </div>
                        <label htmlFor="subject" className="contact-form-label font-16px">Subject
                            <input id="subject" name="subject" type="text"
                                   className="form-input bg-bg2 solid-border2 border-radius-4px color-text1 font-dm-sans font-14px padding-10px-14px"
                                   placeholder="Subject" value={formData.subject} onChange={handleChange}/></label>
                        <label htmlFor="message" className="contact-form-label font-16px">Message
                            <textarea id="message" name="message"
                                      className="form-input form-textarea bg-bg2 solid-border2 border-radius-4px color-text1 font-dm-sans font-14px padding-10px-14px"
                                      placeholder="Your message..." value={formData.message}
                                      onChange={handleChange}/></label>
                        {status === 'success' && (
                            <div
                                className="form-status form-status--success border-radius-4px font-dm-mono font-13px padding-10px-14px">
                                ✓ Message sent! I'll get back to you soon.
                            </div>
                        )}
                        {status === 'error' && (
                            <div
                                className="form-status form-status--error bg-bg4 solid-border2 border-radius-4px color-text3 font-dm-mono font-13px padding-10px-14px">
                                ✗ Something went wrong. Please check all fields and try again.
                            </div>
                        )}
                        <button
                            className="form-submit flex items-center bg-accent border-none border-radius-4px color-text2 cursor-pointer font-dm-sans font-12px weight-500 gap-8px tracking-006em uppercase"
                            onClick={handleSubmit} disabled={status === 'sending'}>
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

            <footer
                className="flex items-center top-border1 font-dm-mono font-12px justify-between margin-0-auto max-width-960px padding-32px">
                <p>© 2026 Antonio Saucedo — All rights reserved</p>
                <p>Built with React + passion</p>
            </footer>
        </>
    )
}

export default App
