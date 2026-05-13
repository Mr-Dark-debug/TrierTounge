'use client';

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { Github, MessageSquare, Lightbulb, Star, Send } from 'lucide-react';
import './ui/feedback-background.css';

export default function FeedbackForm() {
  const [state, handleSubmit] = useForm('mwvyznvj');

  if (state.succeeded) {
    return (
      <div className="success-message">
        <h2 className="text-3xl font-black mb-4 uppercase">Submission Received!</h2>
        <p className="font-bold text-xl mb-6">Thanks for helping us make TrierTounge better!</p>
        <button 
          onClick={() => window.location.reload()}
          className="neo-button"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <form onSubmit={handleSubmit}>
        <div className="feedback-section">
          <label className="feedback-label" htmlFor="type">
            What's on your mind?
          </label>
          <select 
            id="type" 
            name="type" 
            className="feedback-select"
            required
          >
            <option value="feedback">General Feedback</option>
            <option value="feature">Feature Request</option>
            <option value="review">Review</option>
            <option value="bug">Bug Report</option>
          </select>
        </div>

        <div className="feedback-section">
          <label className="feedback-label" htmlFor="email">
            Your Email
          </label>
          <input
            id="email"
            type="email" 
            name="email"
            className="feedback-input"
            placeholder="you@example.com"
            required
            suppressHydrationWarning
          />
          <ValidationError 
            prefix="Email" 
            field="email"
            errors={state.errors}
            className="text-destructive font-bold mb-2 block"
          />
        </div>

        <div className="feedback-section">
          <label className="feedback-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            className="feedback-input feedback-textarea"
            placeholder="Tell us everything..."
            required
          />
          <ValidationError 
            prefix="Message" 
            field="message"
            errors={state.errors}
            className="text-destructive font-bold mb-2 block"
          />
        </div>

        {state.errors && (
          <div className="error-message">
            <p className="font-bold uppercase">Oops! Something went wrong. Please try again.</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={state.submitting}
          className="neo-button w-full flex items-center justify-center gap-2 text-xl py-4"
        >
          <Send className="w-6 h-6" />
          {state.submitting ? 'SENDING...' : 'SEND FEEDBACK'}
        </button>
      </form>

      <div className="mt-12 border-t-4 border-black pt-8">
        <h3 className="feedback-label text-center mb-6">Or Contribute Directly</h3>
        <div className="github-links">
          <a 
            href="https://github.com/Mr-Dark-debug/TrierTounge/issues/new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-button"
          >
            <MessageSquare className="w-5 h-5" />
            Raise Issue
          </a>
          <a 
            href="https://github.com/Mr-Dark-debug/TrierTounge/pulls" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-button"
          >
            <Github className="w-5 h-5" />
            Open PR
          </a>
        </div>
      </div>
    </div>
  );
}
