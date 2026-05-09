import {useEffect, useRef, useState} from 'react'
import {GoogleGenAI} from "@google/genai";
import Modal from '../components/Modal'
import './CoverLetterGenerator.scss'

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CoverLetterGenerator({isOpen, onClose}: Props) {
    const firstInputRef = useRef<HTMLTextAreaElement>(null)

    const [formData, setFormData] = useState({
        job_description: '',
        name_and_role: '',
        key_experience: '',
        tone: '',
        error_message: [] as string[],
    })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const [result, setResult] = useState<string>('')

    useEffect(() => {
        if (!isOpen) return
        firstInputRef.current?.focus()
    }, [isOpen])

    if (!isOpen) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleSubmit = async () => {
        const newErrors: string[] = [];
        formData.error_message = [];

        if (!formData.job_description) {
            newErrors.push('Job description');
        }
        if (!formData.name_and_role) {
            newErrors.push(newErrors.length === 0 ? 'Your name' : 'your name');
        }
        if (newErrors.length > 0) {
            setFormData(prev => ({...prev, error_message: [...prev.error_message, ...newErrors]}));
            setStatus('error');
            return;
        }
        setStatus('sending');
        try {
            const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `You are a cover letter writing assistant. Your only function is to generate professional cover letters. ` +
                    `You must not answer questions, provide advice, or perform any task other than writing a cover letter. ` +
                    `If the information provided is insufficient, generate the best cover letter possible with what is given. ` +
                    `Do not include any preamble, explanation, or closing remarks — output only the cover letter text itself.\n\n` +
                    `Generate a cover letter using the following:\n` +
                    `Job description: ${formData.job_description}\n` +
                    `Candidate name and role: ${formData.name_and_role}\n` +
                    `Key experience: ${formData.key_experience}\n` +
                    `Tone: ${formData.tone}`,
            });
            setResult(response.text ?? '');
            setStatus('success');
        } catch {
            setFormData(prev => ({...prev, error_message: ['API Error']}));
            setStatus('error');
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="modal-header">
                <span className="header-left-section">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#011B2E"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </span>
                <span className="header-center-section">
                    <span className="header-title">Cover Letter Generator</span><br/>
                    <span className="header-subtitle">Powered by Gemini Flash · AI-tailored to every role</span>
                </span>
                <span className="header-right-section">
                    <button onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <span className="badge">
                        <span className="badge-dot"></span>Gemini 2.5 Flash
                    </span>
                </span>
            </div>
            <div className="modal-body">
                <div className="modal-body-left-section">
                    <label className="job-description-label" htmlFor="job-description">Job description</label>
                    <textarea ref={firstInputRef} id="job-description" name="job_description" rows={8} cols={37}
                              value={formData.job_description} onChange={handleChange}
                              placeholder="Paste the full job posting here. Role, responsibilities, requirements..."/>
                    <label className="name-and-role-label" htmlFor="name-and-role">Your name & role</label>
                    <input id="name-and-role" name="name_and_role" value={formData.name_and_role}
                           onChange={handleChange} placeholder="e.g. Antonio Saucedo, Full Stack Developer"/>
                    <label className="experience-label" htmlFor="experience">Key experience highlights</label>
                    <textarea id="experience" name="key_experience" rows={6} cols={37}
                              value={formData.key_experience} onChange={handleChange}
                              placeholder="Paste 2–3 bullet points from your resume that are most relevant to this role..."/>
                </div>
                <div className="modal-body-right-section">
                    <div className="cover-letter-container-label">Generated cover letter</div>
                    <div id="generated-cover-letter-container">
                        {status !== 'success' && (
                            <div className="ai-response-placeholder-container">
                                {formData.error_message[0] !== 'API Error' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                         stroke="#046B93" strokeWidth="1.5" strokeLinecap="round"
                                         strokeLinejoin="round" width="32" height="32">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 8v4l3 3"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="32" height="32">
                                        <circle cx="20" cy="20" r="19" fill="#FEE2E2" stroke="#FECACA"
                                                strokeWidth="1"/>
                                        <line x1="20" y1="11" x2="20" y2="23" stroke="#DC2626" strokeWidth="2.5"
                                              strokeLinecap="round"/>
                                        <circle cx="20" cy="29" r="2" fill="#DC2626"/>
                                    </svg>
                                )}
                                <div className="message">
                                    {status === 'idle' && (
                                        <div className="form-status form-status--idle">
                                            <span>Fill in the fields and click</span><br/>
                                            <span><span className="bold">Generate</span> to create your letter</span>
                                        </div>
                                    )}
                                    {status === 'sending' && (
                                        <div className="form-status form-status--sending">
                                            <span className="bold">Generating.</span><br/>
                                            <span className="bold">Please wait.</span>
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="form-status form-status--error">
                                            {formData.error_message[0] !== 'API Error' ? (
                                                <>
                                                    <span>Please fill in the fields below</span><br/>
                                                    <span>
                                                        <span className="bold">{formData.error_message[0]} </span>
                                                        {formData.error_message.length > 1 && (
                                                            <> and <span
                                                                className="bold"> {formData.error_message[1]}</span></>
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="bold">API Error.</span><br/>
                                                    <span className="bold">Please try again.</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {status === 'success' && (
                            <div className="form-status form-status--success">{result}</div>
                        )}
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <div className="tone-section">
                    <div className="footer-header">Tone</div>
                    <button id="professional-button"
                            onClick={() => setFormData(prev => ({...prev, tone: 'Professional'}))}
                            style={{backgroundColor: formData.tone === 'Professional' ? "#3390B5" : "transparent"}}>
                        Professional
                    </button>
                    <button id="confident-button"
                            onClick={() => setFormData(prev => ({...prev, tone: 'Confident'}))}
                            style={{backgroundColor: formData.tone === 'Confident' ? "#3390B5" : "transparent"}}>
                        Confident
                    </button>
                    <button id="conversational-button"
                            onClick={() => setFormData(prev => ({...prev, tone: 'Conversational'}))}
                            style={{backgroundColor: formData.tone === 'Conversational' ? "#3390B5" : "transparent"}}>
                        Conversational
                    </button>
                </div>
                <button id="generate-button" onClick={handleSubmit}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFF"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Generate Letter</span>
                </button>
            </div>
        </Modal>
    )
}
