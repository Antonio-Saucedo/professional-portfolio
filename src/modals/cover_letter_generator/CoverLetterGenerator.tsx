import {useEffect, useRef, useState} from 'react';
import {GoogleGenAI} from "@google/genai";
import Modal from '../../components/Modal';
import documentIconUrl from './icons/document-icon.svg';
import closeButtonIconUrl from '../global-icons/close-button-icon.svg';
import clockIconUrl from './icons/clock-icon.svg';
import apiErrorIconUrl from './icons/api-error-icon.svg';
import playIconUrl from './icons/play-icon.svg';
import './CoverLetterGenerator.scss';

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
    })
    const [fieldErrors, setFieldErrors] = useState<string[]>([])
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'api_error'>('idle')
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

        if (!formData.job_description) {
            newErrors.push('Job description');
        }
        if (!formData.name_and_role) {
            newErrors.push(newErrors.length === 0 ? 'Your name' : 'your name');
        }
        if (newErrors.length > 0) {
            setFieldErrors(newErrors);
            setStatus('error');
            return;
        }
        setFieldErrors([]);
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
            setStatus('api_error');
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="cover-letter-generator">
            <div className="modal-header">
                <span className="header-left-section">
                    <img src={documentIconUrl} alt="Document icon"/>
                </span>
                <span className="header-center-section">
                    <span className="header-title">Cover Letter Generator</span><br/>
                    <span className="header-subtitle">Powered by Gemini Flash · AI-tailored to every role</span>
                </span>
                <span className="header-right-section">
                    <button onClick={onClose}>
                        <img src={closeButtonIconUrl} alt="Close button icon"/>
                    </button>
                    <span className="badge">
                        <span className="badge-dot"></span>Gemini 2.5 Flash
                    </span>
                </span>
            </div>
            <div className="modal-body">
                <div className="modal-body-left-section">
                    <label className="job-description-label" htmlFor="job-description">Job description<span
                        className="red">*</span></label>
                    <textarea ref={firstInputRef} id="job-description" name="job_description" rows={8} cols={37}
                              value={formData.job_description} onChange={handleChange}
                              placeholder="Paste the full job posting here. Role, responsibilities, requirements..."/>
                    <label className="name-and-role-label" htmlFor="name-and-role">Your name & role<span
                        className="red">*</span></label>
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
                                {status !== 'api_error' ? (
                                    <img src={clockIconUrl} alt="Clock icon"/>
                                ) : (
                                    <img src={apiErrorIconUrl} alt="Error icon"/>
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
                                            <span>Please fill in the fields below</span><br/>
                                            <span><span className="bold">{fieldErrors[0]} </span>
                                                {fieldErrors.length > 1 && (
                                                    <> and <span className="bold"> {fieldErrors[1]}</span></>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {status === 'api_error' && (
                                        <div className="form-status form-status--error">
                                            <span className="bold">API Error.</span><br/>
                                            <span className="bold">Please try again.</span>
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
                    <button id="professional-button" className={formData.tone === 'Professional' ? 'tone-active' : ''}
                            onClick={() => setFormData(prev => ({...prev, tone: 'Professional'}))}>
                        Professional
                    </button>
                    <button id="confident-button" className={formData.tone === 'Confident' ? 'tone-active' : ''}
                            onClick={() => setFormData(prev => ({...prev, tone: 'Confident'}))}>
                        Confident
                    </button>
                    <button id="conversational-button"
                            className={formData.tone === 'Conversational' ? 'tone-active' : ''}
                            onClick={() => setFormData(prev => ({...prev, tone: 'Conversational'}))}>
                        Conversational
                    </button>
                </div>
                <button id="generate-button" onClick={handleSubmit}>
                    <img src={playIconUrl} alt="Submit icon"/>
                    <span>Generate Letter</span>
                </button>
            </div>
        </Modal>
    )
}
