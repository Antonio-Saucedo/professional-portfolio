import {Fragment, lazy, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import type {
    ReactNode,
    ChangeEvent,
    SyntheticEvent,
    KeyboardEvent,
    ComponentType,
    SVGProps,
    LazyExoticComponent
} from 'react';
import emailjs from '@emailjs/browser';
import './App.css';

import WindIcon from './assets/weatherIcons/wind.png';
import ByuIIcon from './assets/educationIcons/byui.svg'

// Modals are lazy-loaded making modals reset state on close.
const CoverLetterGenerator = lazy(() => import('./modals/cover_letter_generator/CoverLetterGenerator.tsx'));
const Counter = lazy(() => import('./modals/counter/counter.tsx'));
const TicTacToe = lazy(() => import('./modals/tictactoe/TicTacToe.tsx'));

// Lazy loader map: icon name -> dynamic import of the ?react component.
// Vite's import.meta.glob with a function-returning (non-eager) result keeps
// these as on-demand imports, each becoming its own chunk.
const SKILL_ICON_LOADERS = import.meta.glob('./assets/skillsIcons/*.svg', {
    query: '?react',
}) as Record<string, () => Promise<{ default: ComponentType<SVGProps<SVGSVGElement>> }>>;

// Cache of already-created lazy components, so repeated lookups of the same
// icon name reuse the same React.lazy() instance instead of remounting fresh.
const skillIconCache = new Map<string, LazyExoticComponent<ComponentType<SVGProps<SVGSVGElement>>>>();

// Email variables
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Weather API
const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY;
const GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const REVERSE_GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/reverse';
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_COOKIE_NAME = 'weather_pref';
const WEATHER_COOKIE_MAX_AGE_DAYS = 400;
const WEATHER_GRADIENTS: Record<string, WeatherGradient> = {
    clearDay: {from: '#EF9F27', to: '#185FA5'},
    clearNight: {from: '#042C53', to: '#26215C'},
    clouds: {from: '#5F5E5A', to: '#185FA5'},
    rain: {from: '#185FA5', to: '#085041'},
    storm: {from: '#26215C', to: '#2C2C2A'},
    snow: {from: '#85B7EB', to: '#E6F1FB'},
    fog: {from: '#888780', to: '#B4B2A9'},
    default: {from: '#185FA5', to: '#0F6E56'},
};
const REGION_DISPLAY_NAMES = new Intl.DisplayNames(['en'], {type: 'region'});
const DEFAULT_WEATHER_PREF: WeatherPref = {
    lat: 43.6671,
    lon: -111.7702,
    label: 'Rigby, ID, United States',
    units: 'imperial',
};

const WEATHER_ICON_MODULES = import.meta.glob('./assets/weatherIcons/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

const WEATHER_ICONS: Record<string, string> = Object.fromEntries(
    Object.entries(WEATHER_ICON_MODULES).map(([path, url]) => {
        const filename = path.split('/').pop()!.replace('.png', '');
        return [filename, url];
    })
);

// Module scope: these never change between renders, so building them inside components
// would recreate each array/object on re-render (they don't depend on props or state).
const SKILLS: { title: string; tags: { name: string; iconFile: string }[] }[] = [
    {
        title: 'Frontend',
        tags: [
            {name: 'JavaScript', iconFile: 'javascript'},
            {name: 'TypeScript', iconFile: 'typescript'},
            {name: 'React', iconFile: 'react'},
            {name: 'Vite', iconFile: 'vite'},
            {name: 'Angular', iconFile: 'angular'},
            {name: 'Bootstrap', iconFile: 'bootstrap'},
            {name: 'HTML', iconFile: 'html'},
            {name: 'CSS', iconFile: 'css'},
            {name: 'SASS/SCSS', iconFile: 'sass'},
            {name: 'Tailwind', iconFile: 'tailwind'},
            {name: 'Responsive Design', iconFile: 'responsiveDesign'},
        ]
    },
    {
        title: 'Backend',
        tags: [
            {name: 'OAuth 2.0 & Security', iconFile: 'oauth'},
            {name: 'Node.js', iconFile: 'nodejs'},
            {name: 'Express', iconFile: 'express'},
            {name: 'NestJS', iconFile: 'nestjs'},
            {name: 'PL/SQL', iconFile: 'plsql'},
            {name: 'Python', iconFile: 'python'},
            {name: 'Java', iconFile: 'java'},
        ]
    },
    {
        title: 'Databases',
        tags: [
            {name: 'SQL', iconFile: 'sql'},
            {name: 'Oracle Apex', iconFile: 'oracleApex'},
            {name: 'MySQL', iconFile: 'mysql'},
            {name: 'PostgreSQL', iconFile: 'postgresql'},
            {name: 'SQLite', iconFile: 'sqlite'},
            {name: 'Microsoft SQL Server', iconFile: 'microsoftSqlServer'},
            {name: 'MongoDB', iconFile: 'mongoDb'},
        ]
    },
    {
        title: 'APIs',
        tags: [
            {name: 'Gemini Flash API', iconFile: 'geminiFlashApi'},
            {name: 'Intuit API', iconFile: 'intuitApi'},
            {name: 'IP geolocation APIs', iconFile: 'ipGeolocationApi'},
            {name: 'RESTful API Design', iconFile: 'restfulApi'},
            {name: 'Fetch API', iconFile: 'fetchApi'},
            {name: 'JSON', iconFile: 'json'},
            {name: 'Third-party REST', iconFile: 'thirdPartyRest'},
            {name: 'GraphQL', iconFile: 'graphQl'},
            {name: 'Swagger API', iconFile: 'swagger'},
        ]
    },
    {
        title: 'DevOps & Tools',
        tags: [
            {name: 'Git', iconFile: 'git'},
            {name: 'GitHub', iconFile: 'github'},
            {name: 'GitHub Actions (CI/CD)', iconFile: 'githubActions'},
            {name: 'Azure DevOps (CI/CD)', iconFile: 'azureDevops'},
            {name: 'Docker', iconFile: 'docker'},
            {name: 'Render', iconFile: 'render'},
            {name: 'Bash Scripting', iconFile: 'bashScripting'},
            {name: 'Code Review', iconFile: 'codeReview'},
            {name: 'Jira', iconFile: 'jira'},
            {name: 'Agile / Scrum', iconFile: 'agileScrum'},
            {name: 'SaaS', iconFile: 'saas'},
        ]
    },
    {
        title: 'IDEs',
        tags: [
            {name: 'WebStorm', iconFile: 'webstorm'},
            {name: 'VSCode', iconFile: 'vscode'},
            {name: 'IntelliJ', iconFile: 'intellij'},
        ]
    },
    {
        title: 'AI Tools',
        tags: [
            {name: 'Claude', iconFile: 'claude'},
            {name: 'Gemini', iconFile: 'gemini'},
            {name: 'ChatGPT', iconFile: 'chatgpt'},
        ]
    },
    {
        title: 'Testing',
        tags: [
            {name: 'Playwright (E2E)', iconFile: 'playwright'},
            {name: 'utPLSQL (Unit)', iconFile: 'utplsql'},
            {name: 'Vitest (Unit)', iconFile: 'vitest'},
            {name: 'Jest (Unit)', iconFile: 'jest'},
        ]
    },
    {
        title: 'Other Languages',
        tags: [
            {name: 'C++', iconFile: 'cpp'},
            {name: 'Kotlin', iconFile: 'kotlin'},
            {name: 'Swift', iconFile: 'swift'},
            {name: 'Rust', iconFile: 'rust'},
            {name: 'VBA', iconFile: 'vba'},
        ]
    },
    {
        title: 'Soft Skills',
        tags: [
            {name: 'Collaboration', iconFile: 'collaboration'},
            {name: 'Leadership', iconFile: 'leadership'},
            {name: 'Conflict Resolution', iconFile: 'conflictResolution'},
            {name: 'Adaptability', iconFile: 'adaptability'},
            {name: 'Self-Motivated', iconFile: 'selfMotivated'},
            {name: 'Attention to Detail', iconFile: 'attentionToDetail'},
            {name: 'Continuous Learner', iconFile: 'continuousLearner'},
            {name: 'Problem-solving', iconFile: 'problemSolving'},
            {name: 'Bilingual (Spanish)', iconFile: 'bilingual'},
        ]
    },
];

const EXPERIENCE_ITEMS = [
    {
        period: '09/2023 – 03/2026',
        role: 'Lead Software Developer',
        company: 'MobileDash LLC., Remote from Rexburg ID',
        desc: [
            'Team Lead & Mentorship: Owned sprint planning, task delegation, code reviews, and daily Agile standups; unblocked developers to maintain delivery momentum.',
            'Intuit API Integration: Built end-to-end invoicing and digital payment flow (OAuth 2.0 with auto-renewal), replacing manual cash/check collection and giving leadership real-time billing visibility.',
            'Database Redesign: Rebuilt Oracle Apex SQL schema from scratch, resolving slow queries, scalability issues, and data-integrity bugs across multi-entity construction work orders.',
            'Lead Intake Automation: Built a dynamic lead form that auto-routes submissions and generates purchase and work orders, eliminating a fully manual legacy process and enabling admins to update configs without developer involvement.',
            'Delivery Speed: Established team coding standards and conventions, cutting feature delivery from 2–3 months down to 1–2 weeks and reducing new-developer onboarding time.',
            'Backend & APIs: Built and maintained RESTful APIs (Node.js/Express, NestJS) and managed MongoDB schemas on the legacy production app with minimal downtime during parallel development.',
            'Compliance Integration: Integrated IP-geolocation APIs to capture consent metadata for terms-and-conditions audit trails; maintained Angular UI components throughout parallel development.',
            'Stakeholder Communication: Served as primary liaison between engineering, design, and business stakeholders — translating technical trade-offs into plain language to support informed product decisions.']
    },
    {
        period: '01/2023 – 04/2023',
        role: 'Developer Intern',
        company: 'The Church of Jesus Christ of Latter-day Saints, Remote from Riverton UT',
        desc: [
            'Full-cycle delivery: Shipped UI fixes and feature improvements to a member-facing portal querying millions of documents, taking changes from coding through QA to production deployment.',
            'Bug resolution: Diagnosed and fixed front-end Angular bugs using TypeScript, Node.js, SASS, and Maven, restoring correct portal behavior for end users.',
            'Requirements & tickets: Wrote and refined Jira stories, bugs, and feature tickets via direct stakeholder elicitation — ensuring work was clearly scoped before implementation.',
            'QA & CI/CD: Independently executed manual QA and reviewed GitHub PRs; deployed to staging and production via Azure DevOps pipelines.']
    },
    {
        period: '02/2021 – 10/2022',
        role: 'CAD Drafter',
        company: 'HLE Inc., Blackfoot ID',
        desc: [
            'Survey & civil drafting: Produced Civil3D plan sets for surveyors and civil engineers across multiple active projects simultaneously.',
            'Regulatory compliance: Coordinated directly with state and local municipalities to ensure drawings met all applicable regulatory requirements before submission.',
            'Cross-discipline collaboration: Worked closely with engineers and field crews, translating field notes and design intent into accurate, construction-ready documents.']
    },
    {
        period: '03/2020 – 02/2021',
        role: 'Construction Estimator',
        company: 'Mickelsen Construction Inc., Blackfoot ID',
        desc: [
            'Civil estimates: Developed detailed cost estimates for civil construction projects, used directly in vendor negotiations and competitive bid submissions.',
            'Excel tools: Built custom Excel-based calculation tools that standardized estimating workflows and improved bid accuracy across the team.',
            'Vendor coordination: Engaged vendors and subcontractors to obtain competitive pricing, ensuring estimates reflected current market rates.']
    },
];

// Shared wrapper for contact icons.
function ContactLinkIcon({children}: { children: ReactNode }) {
    return (
        <div className="contact-link-icon flex items-center bg-bg2 solid-border1 border-radius-4px justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                {children}
            </svg>
        </div>
    );
}

// Project card icons
const StackIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
    </svg>
);

const ExternalLinkIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
);

// Tracks which skill category indices have ever been "visible" — either by
// being scrolled into view (mobile, where all panels stack and show at once)
// or by being the active tab (desktop, where only one panel shows at a time).
// Once a category is marked visible, it stays visible for the session.
function useVisitedSkillCategories(categoryCount: number, activeIndex: number) {
    const [visited, setVisited] = useState<boolean[]>(() => new Array(categoryCount).fill(false));
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Desktop: switching tabs marks that category visited immediately.
    useEffect(() => {
        setVisited(prev => {
            if (prev[activeIndex]) return prev;
            const next = [...prev];
            next[activeIndex] = true;
            return next;
        });
    }, [activeIndex]);

    // Mobile (and anyone scrolling, regardless of layout): an IntersectionObserver
    // per panel marks it visited the first time it enters the viewport. Safe to
    // run on desktop too — the active panel is already visited via the effect
    // above, so this just covers the scroll-stacked mobile case without needing
    // to know the current breakpoint.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                setVisited(prev => {
                    let changed = false;
                    const next = [...prev];
                    for (const entry of entries) {
                        if (entry.isIntersecting) {
                            const index = panelRefs.current.findIndex(el => el === entry.target);
                            if (index !== -1 && !next[index]) {
                                next[index] = true;
                                changed = true;
                            }
                        }
                    }
                    return changed ? next : prev;
                });
            },
            {rootMargin: '200px'} // start loading slightly before it's fully in view
        );

        panelRefs.current.forEach(el => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const setPanelRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
        panelRefs.current[index] = el;
    }, []);

    return {visited, setPanelRef};
}

// Tag pills list, used by the skills section.
function TagList({tags, wrapperClassName, shouldLoadIcons}: {
    tags: SkillTag[];
    wrapperClassName: string;
    shouldLoadIcons: boolean;
}) {
    return (
        <div className={wrapperClassName}>
            {tags.map(({name, iconFile}) => {
                const IconComponent = shouldLoadIcons ? getSkillIconComponent(iconFile) : null;
                return (
                    <span className="tag flex items-center border-radius-10px color-text3 gap-10px padding-4px-10px"
                          key={name}>{IconComponent && (<Suspense
                        fallback={<span className="tag-icon-placeholder"/>}><IconComponent/></Suspense>)}{name}</span>
                )
            })}
        </div>
    );
}

// Tag list, used by the project section.
function ProjectSkillList({tags}: { tags: string[] }) {
    return (
        <>
            <div className="font-dm-mono font-14px weight-500 tracking-002em margin-bottom-3px">Skills:</div>
            <ul className="project-tags font-dm-mono font-12px weight-500 gap-6px tracking-002em">
                {tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                ))}
            </ul>
        </>
    );
}

// Section heading rows with `action` for a trailing control (e.g. the work experience section's download button).
function SectionHeader({title, action}: {
    title: string; action?: ReactNode
}) {
    return (
        <div className="section-header margin-bottom-24px text-center">
            <h2 className="section-title weight-600 uppercase">{title}</h2>
            {action}
        </div>
    );
}

function getSkillIconComponent(fileName: string) {
    const cached = skillIconCache.get(fileName);
    if (cached) return cached;

    const path = `./assets/skillsIcons/${fileName}.svg`;
    const loader = SKILL_ICON_LOADERS[path];
    if (!loader) {
        if (import.meta.env.DEV) console.warn(`Missing skill icon: ${fileName}`);
        return null;
    }

    const Component = lazy(loader as () => Promise<{ default: ComponentType<SVGProps<SVGSVGElement>> }>);
    skillIconCache.set(fileName, Component);
    return Component;
}

function celsiusToFahrenheit(c: number): number {
    return c * 9 / 5 + 32;
}

function mpsToMph(mps: number): number {
    return mps * 2.23694;
}

function getWeatherIconUrl(code: string): string | undefined {
    return WEATHER_ICONS[code];
}

function getWeatherGradient(iconCode: string): WeatherGradient {
    const group = iconCode.slice(0, 2);
    const isNight = iconCode.endsWith('n');

    switch (group) {
        case '01':
        case '02':
            return isNight ? WEATHER_GRADIENTS.clearNight : WEATHER_GRADIENTS.clearDay;
        case '03':
        case '04':
            return WEATHER_GRADIENTS.clouds;
        case '09':
        case '10':
            return WEATHER_GRADIENTS.rain;
        case '11':
            return WEATHER_GRADIENTS.storm;
        case '13':
            return WEATHER_GRADIENTS.snow;
        case '50':
            return WEATHER_GRADIENTS.fog;
        default:
            return WEATHER_GRADIENTS.default;
    }
}

function setWeatherCookie(pref: WeatherPref) {
    const value = encodeURIComponent(JSON.stringify(pref));
    const maxAgeSeconds = WEATHER_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${WEATHER_COOKIE_NAME}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function getWeatherCookie(): WeatherPref | null {
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${WEATHER_COOKIE_NAME}=`));
    if (!match) return null;

    try {
        const raw = match.split('=').slice(1).join('=');
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
            return parsed as WeatherPref;
        }
        return null;
    } catch {
        return null;
    }
}

function loadWeatherPref(): WeatherPref {
    const saved = getWeatherCookie();
    if (saved) {
        // refresh the expiration on every successful read
        setWeatherCookie(saved);
        return saved;
    }
    setWeatherCookie(DEFAULT_WEATHER_PREF);
    return DEFAULT_WEATHER_PREF;
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number; label: string }> {
    const url = `${GEOCODE_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);

    const results = await res.json();
    if (!results.length) throw new Error(`No location found for "${city}"`);

    const {lat, lon, name, state, country} = results[0];
    const countryName = country ? (REGION_DISPLAY_NAMES.of(country) ?? country) : undefined;
    return {lat, lon, label: [name, state, countryName].filter(Boolean).join(', ')};
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
    const url = `${REVERSE_GEOCODE_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Reverse geocoding failed: ${res.status}`);

    const results = await res.json();
    if (!results.length) return 'Current location';

    const {name, state, country} = results[0];
    const countryName = country ? (REGION_DISPLAY_NAMES.of(country) ?? country) : undefined;
    return [name, state, countryName].filter(Boolean).join(', ');
}

async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    const url = `${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || `Weather request failed: ${res.status}`);
    }

    const data = await res.json();
    return {
        temp: data.main.temp,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        windSpeed: data.wind.speed,
        description: data.weather[0]?.description ?? 'Unknown',
        icon: data.weather[0]?.icon ?? '01d',
    };
}

function getBrowserLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({lat: pos.coords.latitude, lon: pos.coords.longitude}),
            (err) => reject(new Error(err.message || 'Location permission denied')),
            {timeout: 10000}
        );
    });
}

type WeatherGradient = { from: string; to: string };

type Units = 'imperial' | 'metric';

type WeatherPref = {
    lat: number;
    lon: number;
    label: string;
    units: Units;
};

type CurrentWeather = {
    temp: number;
    tempMin: number;
    tempMax: number;
    windSpeed: number;
    description: string;
    icon: string;
};

type SkillTag = {
    name: string;
    iconFile: string;
};

type Project = {
    icon: ReactNode;
    name: string;
    desc: string;
    tags: string[];
    link: { type: 'live'; href: string } | { type: 'open'; onOpen: () => void };
};

// Phrases the hero heading cycles through, each split across the two lines.
const ROLES = [
    {line1: 'Software', line2: 'Engineer'},
    {line1: 'Full Stack', line2: 'Developer'},
    {line1: 'Database', line2: 'Engineer'},
    {line1: 'API', line2: 'Engineer'},
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPE_SPEED_MS = 55;
const DELETE_SPEED_MS = 35;
const HOLD_MS = 1800; // pause once a phrase is fully typed, before deleting

// Types out each ROLES phrase across two lines, holds, deletes, then advances to
// the next phrase and repeats forever. Treats line one and line two as one
// continuous string for typing purposes, splitting back into two lines for
// render. Falls back to showing the first phrase statically when the visitor
// has requested reduced motion.
function useTypewriter(roles: { line1: string; line2: string }[]) {
    // Track state so the hook reacts to reduced motion preference changing live.
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== 'undefined'
            && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        )
    ;
    const [roleIndex, setRoleIndex] = useState(0);
    const [charCount, setCharCount] = useState(
        prefersReducedMotion ? roles[0].line1.length + roles[0].line2.length : 0
    );
    const [phase, setPhase] = useState<'typing' | 'deleting'>('typing');

    // Listen for the OS/browser preference changing while the page is already
    // open. When it turns on, use the first phrase fully typed and static.
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
            if (e.matches) {
                setRoleIndex(0);
                setCharCount(roles[0].line1.length + roles[0].line2.length);
                setPhase('typing');
            } else {
                setRoleIndex(0);
                setCharCount(0);
                setPhase('typing');
            }
        };
        query.addEventListener('change', handleChange);
        return () => query.removeEventListener('change', handleChange);
    }, [roles]);

    const full = roles[roleIndex].line1 + roles[roleIndex].line2;
    useEffect(() => {
        if (prefersReducedMotion) return; // static first phrase, no timers at all
        if (phase === 'typing') {
            if (charCount < full.length) {
                const t = setTimeout(() => setCharCount(c => c + 1), TYPE_SPEED_MS);
                return () => clearTimeout(t);
            }
            const t = setTimeout(() => setPhase('deleting'), HOLD_MS);
            return () => clearTimeout(t);
        }
        // deleting
        if (charCount > 0) {
            const t = setTimeout(() => setCharCount(c => c - 1), DELETE_SPEED_MS);
            return () => clearTimeout(t);
        }
        setRoleIndex(i => (i + 1) % roles.length);
        setPhase('typing');
    }, [phase, charCount, full.length, roles.length, prefersReducedMotion]);
    const typed = full.slice(0, charCount);
    const line1 = typed.slice(0, roles[roleIndex].line1.length);
    const line2 = typed.slice(roles[roleIndex].line1.length);
    return {line1, line2};
}

// Loads the saved location/units from a cookie (falling back to preset location),
// fetches current weather for it on mount, and exposes setters that
// geocode/reverse-geocode as needed, persist the new pref, and refetch.
function useWeather() {
    const [pref, setPref] = useState<WeatherPref>(() => loadWeatherPref());
    const [weather, setWeather] = useState<CurrentWeather | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const loadWeatherFor = useCallback(async (nextPref: WeatherPref) => {
        setStatus('loading');
        try {
            const current = await fetchCurrentWeather(nextPref.lat, nextPref.lon);
            setWeather(current);
            setStatus('idle');
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
            setStatus('error');
        }
    }, []);

    // Initial fetch from cookie pref or default.
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setStatus('loading');
            try {
                const current = await fetchCurrentWeather(pref.lat, pref.lon);
                if (!cancelled) {
                    setWeather(current);
                    setStatus('idle');
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
                    setStatus('error');
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const setCity = useCallback(async (city: string) => {
        setStatus('loading');
        try {
            const {lat, lon, label} = await geocodeCity(city);
            const nextPref: WeatherPref = {...pref, lat, lon, label};
            setPref(nextPref);
            setWeatherCookie(nextPref);
            await loadWeatherFor(nextPref);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
            setStatus('error');
        }
    }, [pref, loadWeatherFor]);

    const useBrowserLocation = useCallback(async () => {
        setStatus('loading');
        try {
            const {lat, lon} = await getBrowserLocation();
            const label = await reverseGeocode(lat, lon);
            const nextPref: WeatherPref = {...pref, lat, lon, label};
            setPref(nextPref);
            setWeatherCookie(nextPref);
            await loadWeatherFor(nextPref);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
            setStatus('error');
        }
    }, [pref, loadWeatherFor]);

    const toggleUnits = useCallback(async () => {
        const nextPref: WeatherPref = {...pref, units: pref.units === 'imperial' ? 'metric' : 'imperial'};
        setPref(nextPref);
        setWeatherCookie(nextPref);
    }, [pref]);

    return {pref, weather, status, errorMessage, setCity, useBrowserLocation, toggleUnits};
}

// Nav bar's links. Each closes the mobile menu on click.
const NAV_LINKS = [
    {href: '#about', label: 'About'},
    {href: '#weather', label: 'Weather'},
    {href: '#skills', label: 'Skills'},
    {href: '#projects', label: 'Projects'},
    {href: '#experience', label: 'Experience'},
    {href: '#education', label: 'Education'},
    {href: '#contact', label: 'Contact'},
];

// Hero section label/value pairs.
const HERO_DETAILS = [
    {label: 'Remote', value: 'Rigby, ID'},
    {label: 'Open to', value: 'Full-time / Contract'},
    {label: 'Available', value: 'Immediately'},
];

// Labeled contact-form fields render as <input> or <textarea> via `as`. Message
// field needs extra `form-textarea` class on top of the shared `form-input`
// styling class, so className is built per-instance instead of fixed.
function ContactField({
                          id, label, value, onChange, placeholder, type = 'text', as = 'input',
                      }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder: string;
    type?: string;
    as?: 'input' | 'textarea';
}) {
    const className = as === 'textarea'
        ? 'form-input form-textarea bg-bg2 solid-border2 border-radius-4px color-text1 font-dm-sans font-14px padding-10px-14px'
        : 'form-input bg-bg2 solid-border2 border-radius-4px color-text1 font-dm-sans font-14px padding-10px-14px';

    return (
        <label htmlFor={id} className="contact-form-label font-16px">{label}
            {as === 'textarea' ? (
                <textarea id={id} name={id} className={className} placeholder={placeholder}
                          value={value} onChange={onChange}/>
            ) : (
                <input id={id} name={id} type={type} className={className} placeholder={placeholder}
                       value={value} onChange={onChange}/>
            )}
        </label>
    );
}

function ProjectCard({project}: { project: Project }) {
    const {icon, name, desc, tags, link} = project;
    // Event handlers for user clicking on project cards
    const handleCardClick = () => {
        if (link.type === 'live') {
            window.open(link.href, '_blank');
        } else {
            link.onOpen();
        }
    }
    const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
        }
    };
    return (
        <div onClick={handleCardClick} onKeyDown={handleCardKeyDown} role="button" tabIndex={0}
             className="project-card relative bg-bg2 border-radius-4px cursor-pointer">
            <div className="project-header flex justify-between">
                <div className="project-icon flex items-center bg-bg4 border-radius-4px justify-center">
                    {icon}
                </div>
                <span className="project-link color-text1 font-dm-mono font-12px">
                   {link.type === 'live' ? '↗ Live' : '↗ Open'}
                </span>
            </div>
            <div className="project-name font-15px weight-500 margin-bottom-8px">{name}</div>
            <div className="project-desc font-13px tracking-165em margin-bottom-16px">{desc}</div>
            <ProjectSkillList tags={tags}/>
        </div>
    );
}

// Shows current conditions for cookie saved or default location, with
// controls to change city, use browser's geolocation, or toggle °F/°C.
function WeatherSection() {
    const {pref, weather, status, errorMessage, setCity, useBrowserLocation, toggleUnits} = useWeather();
    const [cityInput, setCityInput] = useState(pref.label);

    // Sync input with weather label
    useEffect(() => {
        setCityInput(pref.label);
    }, [pref.label]);

    const handleCitySubmit = useCallback(async (e: SyntheticEvent) => {
        e.preventDefault();
        const trimmed = cityInput.trim();
        if (!trimmed) return;
        await setCity(trimmed);
    }, [cityInput, setCity]);

    const isImperial = pref.units === 'imperial';
    const unitLabel = pref.units === 'imperial' ? '°F' : '°C';
    const toggleLabel = pref.units === 'imperial' ? '°C' : '°F';
    const windUnit = pref.units === 'imperial' ? 'mph' : 'm/s';
    const conditionIconUrl = weather ? getWeatherIconUrl(weather.icon) : undefined;
    const conditionText = weather
        ? weather.description.replace(/\b\w/g, (c) => c.toUpperCase())
        : '';
    const gradient = weather ? getWeatherGradient(weather.icon) : WEATHER_GRADIENTS.default;

    // Convert from the always-metric stored values at render time.
    const displayTemp = weather ? (isImperial ? celsiusToFahrenheit(weather.temp) : weather.temp) : 0;
    const displayTempMin = weather ? (isImperial ? celsiusToFahrenheit(weather.tempMin) : weather.tempMin) : 0;
    const displayTempMax = weather ? (isImperial ? celsiusToFahrenheit(weather.tempMax) : weather.tempMax) : 0;
    const displayWind = weather ? (isImperial ? mpsToMph(weather.windSpeed) : weather.windSpeed) : 0;

    return (
        <section className="margin-0-auto max-width-960px padding-48px-32px-0" id="weather">
            <SectionHeader title="How's the weather?"/>
            <div className="weather-hero border-radius-16px padding-24px"
                 style={{background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,}}>
                <form onSubmit={handleCitySubmit}
                      className="weather-hero-form flex gap-8px flex-wrap margin-bottom-8px">
                    <div className="flex flex-column">
                        <label htmlFor="weatherInput" className="block">City, state, country</label>
                        <input
                            id="weatherInput"
                            name="weatherInput"
                            type="text"
                            className="weather-hero-input border-radius-8px font-13px padding-8px-12px"
                            placeholder="Enter city, state, country"
                            value={cityInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCityInput(e.target.value)}
                            disabled={status === 'loading'}
                        />
                    </div>
                    <button type="submit" disabled={status === 'loading'}
                            className="weather-hero-btn border-radius-8px font-12px padding-8px-14px cursor-pointer">
                        Set
                    </button>
                    <button type="button" onClick={useBrowserLocation} disabled={status === 'loading'}
                            className="weather-hero-btn border-radius-8px font-12px padding-8px-14px cursor-pointer">
                        📍 Use My Location
                    </button>
                    <button type="button" onClick={toggleUnits} disabled={status === 'loading'}
                            className="weather-hero-btn border-radius-8px font-12px padding-8px-14px cursor-pointer">
                        {toggleLabel}
                    </button>
                </form>

                {status === 'loading' && <p className="weather-hero-status margin-top-24px">Loading...</p>}
                {status === 'error' && <p className="weather-hero-status margin-top-24px">Error: {errorMessage}</p>}

                {status === 'idle' && weather && (
                    <div className="weather-hero-body relative flex flex-column margin-top-20px">
                        <div className="weather-hero-top flex justify-between">
                            <div className="weather-hero-text">
                                <p className="weather-hero-location font-13px margin-bottom-4px">{pref.label}</p>
                                <p className="weather-hero-condition font-13px">{conditionText}</p>
                            </div>
                        </div>
                        <div className="weather-hero-temp-row flex items-baseline gap-16px margin-top-12px">
                            <span className="weather-hero-temp font-56px weight-500">
                                {Math.round(displayTemp)}{unitLabel}
                            </span>
                            <div className="weather-hero-hilo flex gap-6px font-13px">
                                <span>↑ {Math.round(displayTempMax)}{unitLabel}</span>
                                <span>↓ {Math.round(displayTempMin)}{unitLabel}</span>
                            </div>
                        </div>
                        {conditionIconUrl && (
                            <img src={conditionIconUrl} alt={conditionText + ' Icon'}
                                 className="weather-hero-icon absolute"/>
                        )}
                        <div
                            className="weather-hero-wind flex items-center gap-8px font-14px margin-top-12px padding-top-12px">
                            <img src={WindIcon} alt="Wind Icon" className="weather-hero-wind-icon"/>
                            <span>{Math.round(displayWind)} {windUnit}</span>
                        </div>
                        <span className="text-center">API → OpenWeatherMap</span>
                    </div>
                )}
            </div>
        </section>
    );
}

function App() {
    // Hero heading's cycling role text.
    const {line1: heroLine1, line2: heroLine2} = useTypewriter(ROLES);

    // States
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('theme') === 'dark';
    });
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [activeSkillCategory, setActiveSkillCategory] = useState(0);
    const {
        visited: visitedSkillCategories,
        setPanelRef
    } = useVisitedSkillCategories(SKILLS.length, activeSkillCategory);
    const [coverLetterGeneratorIsOpen, setCoverLetterGeneratorIsOpen] = useState(false);
    const [counterIsOpen, setCounterIsOpen] = useState(false);
    const [ticTacToeIsOpen, setTicTacToeIsOpen] = useState(false);
    const openTicTacToe = useCallback(() => setTicTacToeIsOpen(true), []);
    const closeTicTacToe = useCallback(() => setTicTacToeIsOpen(false), []);

    const [formData, setFormData] = useState({
        from_name: '',
        from_email: '',
        subject: '',
        message: '',
    })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    // Remove the no-transition guard after first paint so the dark/light
    // toggle's transition still works for subsequent user-initiated changes.
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            document.documentElement.classList.remove('no-transition');
        });
        return () => cancelAnimationFrame(id);
    }, []);

    // Syncs body data-theme with isDarkTheme and stores preference in local storage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : '');
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    }, [isDarkTheme]);

    // Nav bar — wrapped in useCallback so the function reference is stable across
    // renders, avoiding unnecessary re-binding of the onClick handlers that use them.
    const toggleMenu = useCallback(() => {
        setIsNavOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setIsNavOpen(false);
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDarkTheme(prev => !prev);
    }, []);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!formData.from_name || !formData.from_email || !formData.message || !EMAIL_PATTERN.test(formData.from_email)) {
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
    }, [formData]);

    // Component: multiple entries need the modal-open setters, which only exist once the component runs.
    const projects: Project[] = [
        {
            icon: StackIcon,
            name: 'MobileDash',
            desc: "A cloud-based, full-featured CRM platform built on Oracle APEX for exterior contractors, utilizing Oracle's built-in authentication for secure, role-based access control and custom-developed plugins to extend the framework for domain-specific needs. I was directly involved in implementing and enhancing all major features throughout the development lifecycle.",
            tags: ['Git', 'GitHub', 'Docker', 'Bash Scripting', 'Oracle Apex (OCI)', 'SaaS', 'OAuth & Security', 'HTML', 'CSS', 'Tailwind', 'JavaScript', 'SQL', 'PL/SQL', 'Intuit API (payments/invoicing)', 'IP geolocation APIs', 'RESTful API Design', 'Third-party REST', 'Playwright (E2E Testing)', 'utPLSQL (Unit Testing)', 'Vitest (Unit Testing)'],
            link: {type: 'live', href: 'https://mobiledash.net/'},
        },
        {
            icon: ExternalLinkIcon,
            name: 'Cover Letter Generator',
            desc: 'A full-stack AI tool that generates tailored cover letters from a job description and resume highlights, powered by the Gemini Flash API with tone selection and a clean modal UI.',
            tags: ['Git', 'GitHub', 'Vite', 'React', 'TypeScript', 'SASS', 'SCSS', 'Gemini Flash API', 'RESTful API Design'],
            link: {type: 'open', onOpen: () => setCoverLetterGeneratorIsOpen(true)},
        },
        {
            icon: ExternalLinkIcon,
            name: 'React Counter',
            desc: 'A React counter built with useState and a clean modal UI.',
            tags: ['Git', 'GitHub', 'Vite', 'React', 'TypeScript', 'SCSS'],
            link: {type: 'open', onOpen: () => setCounterIsOpen(true)},
        },
        {
            icon: ExternalLinkIcon,
            name: 'WDD 330 – Web Frontend Development 2',
            desc: "A collection of frontend projects built throughout BYU-Idaho's Web Frontend Development II course, covering ES Modules, the Fetch API, async/await, client-side view routing, Canvas & SVG, animation, and WebSockets, culminating in a multi-page final project: All About SpaceX, a site consuming the public SpaceX API with a lightweight MVC architecture (model, view, and controller layers) to browse rockets, launches, crew, capsules, and more.",
            tags: ['Git', 'GitHub', 'HTML', 'CSS', 'JavaScript', 'ES Modules', 'Fetch API', 'JSON', 'Third-party REST', 'Responsive Design', 'Web Sockets'],
            link: {type: 'live', href: 'https://antonio-saucedo.github.io/wdd-330/'},
        },
        {
            icon: ExternalLinkIcon,
            name: 'WDD 230 – Web Frontend Development',
            desc: "A collection of frontend projects built throughout BYU-Idaho's Web Frontend Development course, covering responsive design, DOM manipulation, JSON & Fetch API integration, live weather data, progressive image loading, and a polished final site, Temple Inn & Suites.",
            tags: ['Git', 'GitHub', 'HTML', 'CSS', 'JavaScript', 'Fetch API', 'JSON', 'Responsive Design'],
            link: {type: 'live', href: 'https://antonio-saucedo.github.io/wdd230/'},
        },
        {
            icon: ExternalLinkIcon,
            name: 'Tic-Tac-Toe',
            desc: 'A console tic-tac-toe game (CSE 210, Programming with Classes) running in the browser via Pyodide, a real Python interpreter compiled to WebAssembly, with the original game logic adapted for async, clickable input instead of the terminal. This web version was created with the help of Claude; the original CLI version was created without AI assistance.',
            tags: ['Claude', 'Git', 'GitHub', 'Vite', 'React', 'TypeScript', 'SCSS', 'Python', 'Pyodide', 'WebAssembly'],
            link: {type: 'open', onOpen: openTicTacToe},
        },
        {
            icon: ExternalLinkIcon,
            name: 'WDD 130 – Web Fundamentals',
            desc: "A collection of foundational web projects built through BYU-Idaho's Web Fundamentals course, covering site planning, semantic HTML structure, CSS layout techniques (including positioning and Flexbox/Grid exercises), form design, and a multi-page final project — Dinner Snack Dates, a fictional date-night business site with a home page, recipes/events page, FAQ, and contact page.",
            tags: ['Git', 'GitHub', 'HTML', 'CSS', 'Responsive Design', 'JavaScript'],
            link: {type: 'live', href: 'https://antonio-saucedo.github.io/wdd130/'},
        },
        {
            icon: ExternalLinkIcon,
            name: 'Subway Counter',
            desc: "A vanilla JavaScript counter app for tracking subway passenger entries. This showcases simple DOM manipulation skills.",
            tags: ['Git', 'GitHub', 'HTML', 'CSS', 'JavaScript'],
            link: {type: 'live', href: 'https://antonio-saucedo.github.io/subway-counter/'},
        },
    ];

    return (
        <>
            <nav className="flex items-center bg-bg1 bottom-border1 justify-between top-0">
                <span
                    className="nav-logo flex items-center color-accent font-dm-mono font-15px weight-500 gap-6px tracking-004em">ANTONIO</span>
                <div className={`nav-links flex items-center font-14px ${isNavOpen ? 'nav-open' : ''}`}>
                    {NAV_LINKS.map(({href, label}) => (
                        <a className="color-text1 padding-10px-15px decoration-none" href={href}
                           onClick={closeMenu} key={href}>{label}</a>
                    ))}
                </div>
                <div className="nav-right flex items-center gap-12px">
                    <button
                        className={`hamburger border-none cursor-pointer justify-center ${isNavOpen ? 'hamburger-open' : ''}`}
                        onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isNavOpen}>
                        <span className="block height-2px"></span>
                        <span className="block height-2px"></span>
                        <span className="block height-2px"></span>
                    </button>
                    <button
                        className="theme-btn flex items-center bg-bg3 solid-border2 border-radius-20px color-text2 cursor-pointer font-dm-sans font-13px gap-6px"
                        onClick={toggleTheme} aria-pressed={isDarkTheme}
                        aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}>
                        <span>{isDarkTheme ? '☀' : '☽'}</span>
                        <span>{isDarkTheme ? 'Light' : 'Dark'}</span>
                    </button>
                </div>
            </nav>

            <main>
                <section className="hero margin-0-auto max-width-960px padding-48px-32px-0" id="about">
                    <div
                        className="hero-eyebrow flex items-center color-text3 font-dm-mono font-12px tracking-014em margin-bottom-16px uppercase">Hi,
                        I am Antonio Saucedo
                    </div>
                    <h1 className="color-text3 weight-600 margin-bottom-24px uppercase">{heroLine1}{heroLine2.length === 0 &&
                        <span className="typewriter-cursor"/>}<br/><em
                        className="color-accent font-normal">{heroLine2}{heroLine2.length > 0 &&
                        <span className="typewriter-cursor"/>}</em></h1>
                    <p className="hero-bio tracking-180em">Full Stack Developer with 3+ years of experience building and
                        maintaining web applications from front-end UI through back-end APIs and database design.
                        Experienced leading small development teams, mentoring developers, and establishing standards
                        that measurably improve delivery speed. Skilled in JavaScript, TypeScript, React, Angular,
                        Node.js (Express/NestJS), Python, SQL, and NoSQL databases. Known for integrating third-party
                        APIs, translating complex technical work into business value, and collaborating across
                        development, design, and stakeholder teams to deliver reliable, scalable software.</p>
                    <div className="hero-cta flex flex-wrap gap-12px">
                        <a href="#projects"
                           className="btn-primary inline-block bg-accent border-none border-radius-4px color-text2 font-12px weight-500 tracking-004em padding-11px-24px decoration-none uppercase">View
                            Projects</a>
                        <a href="#contact"
                           className="btn-secondary inline-block bg-transparent solid-border2 border-radius-4px color-text1 font-12px weight-500 tracking-004em padding-11px-24px decoration-none uppercase">Contact
                            Me</a>
                    </div>
                    <div className="hero-details flex top-border1">
                        {HERO_DETAILS.map(({label, value}) => (
                            <div key={label}>
                                <div className="hero-label font-13px weight-500 margin-bottom-3px">{label}</div>
                                <div className="hero-value font-dm-mono font-12px">{value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <WeatherSection/>

                <section className="margin-0-auto max-width-960px padding-48px-32px-0" id="skills">
                    <SectionHeader title="Skills"/>
                    <div className="skills-wrap bg-bg2 solid-border1 border-radius-4px">
                        <div className="skills-sidebar flex flex-column" role="tablist" aria-label="Skill categories">
                            {SKILLS.map(({title, tags}, i) => (
                                <button key={title} role="tab" aria-selected={i === activeSkillCategory}
                                        className={`skills-tab font-dm-mono font-12px tracking-002em flex justify-between bg-transparent border-none color-text1 cursor-pointer ${i === activeSkillCategory ? 'skills-tab-active' : ''}`}
                                        onClick={() => setActiveSkillCategory(i)}><span>{title}</span><span
                                    className="skills-tab-count">{tags.length}</span></button>
                            ))}
                        </div>
                        <div className="skills-panels relative">
                            {SKILLS.map(({title, tags}, i) => (
                                <div
                                    ref={setPanelRef(i)}
                                    className={`skills-panel ${i === activeSkillCategory ? 'skills-panel-active' : ''}`}
                                    key={title}>
                                    <div
                                        className="skills-panel-title font-15px weight-600 color-text1 margin-bottom-16px">{title}</div>
                                    <TagList tags={tags} shouldLoadIcons={visitedSkillCategories[i]}
                                             wrapperClassName="skills-panel-tags flex flex-wrap font-dm-mono font-12px weight-500 gap-16px tracking-002em"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="margin-0-auto max-width-960px padding-48px-32px-0" id="projects">
                    <SectionHeader title="Projects"/>
                    <div className="projects-grid grid gap-16px">
                        {projects.map((project, i) => (
                            <Fragment key={project.name}>
                                <ProjectCard project={project}/>
                                {/* Each modal renders right after the card whose "Open" button
                                controls it, so DOM position stays tied to its trigger. */}
                                {i === 1 && coverLetterGeneratorIsOpen && (
                                    <Suspense fallback={null}>
                                        <CoverLetterGenerator isOpen={coverLetterGeneratorIsOpen}
                                                              onClose={() => setCoverLetterGeneratorIsOpen(false)}/>
                                    </Suspense>
                                )}
                                {i === 2 && counterIsOpen && (
                                    <Suspense fallback={null}>
                                        <Counter isOpen={counterIsOpen} onClose={() => setCounterIsOpen(false)}/>
                                    </Suspense>
                                )}
                                {i === 3 && ticTacToeIsOpen && (
                                    <Suspense fallback={null}>
                                        <TicTacToe isOpen={ticTacToeIsOpen} onClose={closeTicTacToe}/>
                                    </Suspense>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </section>

                <section className="margin-0-auto max-width-960px padding-48px-32px-0" id="experience">
                    <SectionHeader title="Work Experience" action={
                        <a href="/AntonioResume_2026.pdf" download="AntonioResume_2026.pdf"
                           className="experience-download-btn items-center bg-transparent solid-border2 border-radius-4px color-text1 font-12px weight-500 gap-8px tracking-004em decoration-none uppercase">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download Resume (PDF)
                        </a>
                    }/>
                    <div className="experience-list flex flex-column">
                        {EXPERIENCE_ITEMS.map(({period, role, company, desc}) => (
                            <div className="experience-item grid bottom-border1" key={company}>
                                <div
                                    className="experience-period font-dm-mono font-11px tracking-004em padding-top-3px">{period}</div>
                                <div>
                                    <div className="experience-role font-15px weight-500 margin-bottom-3px">{role}</div>
                                    <div
                                        className="experience-company color-accent font-dm-mono font-12px tracking-004em margin-bottom-10px">{company}</div>
                                    <ul className="experience-desc flex flex-column font-13px tracking-170em"> {desc.map((point, i) => (
                                        <li key={i}>{point}</li>))}</ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="margin-0-auto max-width-960px padding-48px-32px-0" id="education">
                    <SectionHeader title="Education"/>
                    <div className="education-container flex gap-16px justify-center">
                        <img src={ByuIIcon} alt='Brigham Young University - Idaho logo'
                             className="height-130px self-center"></img>
                        <div className="content-center font-16px">
                            <p>Brigham Young University - Idaho</p>
                            <p>Bachelor of Science in Software Engineering</p>
                            <p>Emphasis in Web Development and Software Design</p>
                            <p>Graduated July 2023</p>
                        </div>
                    </div>
                    <div className="height-35px bottom-border1"></div>
                </section>

                <section className="margin-0-auto max-width-960px padding-48px-32px" id="contact">
                    <SectionHeader title="Contact Me"/>
                    <div className="contact-wrap grid">
                        <div className="contact-text">
                            <p className="font-16px tracking-180em margin-bottom-24px">I'm always open to new
                                opportunities,
                                collaborations, or just a conversation about software design. Send me a message.</p>
                            <div className="contact-links flex flex-column font-14px gap-12px margin-top-24px">
                                <a className="contact-link flex items-center color-text1 gap-10px decoration-none"
                                   href="mailto:antonios.softwareengineer@gmail.com">
                                    <ContactLinkIcon>
                                        <path
                                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </ContactLinkIcon>
                                    antonios.softwareengineer@gmail.com
                                </a>
                                <a className="contact-link flex items-center color-text1 gap-10px decoration-none"
                                   href="https://github.com/Antonio-Saucedo"
                                   target="_blank">
                                    <ContactLinkIcon>
                                        <path
                                            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                    </ContactLinkIcon>
                                    github.com/Antonio-Saucedo
                                </a>
                                <a className="contact-link flex items-center color-text1 gap-10px decoration-none"
                                   href="https://www.linkedin.com/in/antoniojsaucedo"
                                   target="_blank">
                                    <ContactLinkIcon>
                                        <path
                                            d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                        <rect x="2" y="9" width="4" height="12"/>
                                        <circle cx="4" cy="4" r="2"/>
                                    </ContactLinkIcon>
                                    linkedin.com/in/antoniojsaucedo
                                </a>
                            </div>
                        </div>
                        <div className="contact-form flex flex-column gap-12px">
                            <div className="form-row grid gap-12px">
                                <ContactField id="from_name" label="Name" type="text" placeholder="Your name"
                                              value={formData.from_name} onChange={handleChange}/>
                                <ContactField id="from_email" label="From" type="email" placeholder="Email"
                                              value={formData.from_email} onChange={handleChange}/>
                            </div>
                            <ContactField id="subject" label="Subject" type="text" placeholder="Subject"
                                          value={formData.subject} onChange={handleChange}/>
                            <ContactField id="message" label="Message" as="textarea" placeholder="Your message..."
                                          value={formData.message} onChange={handleChange}/>
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
            </main>

            <footer
                className="flex items-center top-border1 font-dm-mono font-12px text-center justify-between margin-0-auto max-width-960px padding-32px">
                <p>© 2026 Antonio Saucedo — All rights reserved</p>
                <p>Built with React + passion</p>
            </footer>
        </>
    )
}

export default App
