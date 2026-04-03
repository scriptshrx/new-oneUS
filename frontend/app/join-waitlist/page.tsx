'use client'
import { Axis3DIcon } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import axios from 'axios'

export default function JoinWaitlistPage() {

    const cardRef=useRef(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const[submitting,setSubmitting]=useState(false)
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    // Simulate API call

    try{
      setSubmitting(true)
      const response = await axios.post('https://scriptishrxnewmark.onrender.com/v1/waitlist', { email });
      setSubmitted(true);
      setEmail('');
      setSubmitting(false)
    }
    catch(err){
      setSubmitting(false)
      setError(err instanceof Error ? err.message : 'Failed to join waitlist. Please try again.');
      console.log('Error joining waitlist:', err);
    }
    
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand/10 via-background to-accent/10 px-4">
      <Link href="/" className="text-xl moveBg absolute top-4 left-4 sm:text-2xl font-bold bg-gradient-to-r from-primary/10 via-primary/80 to-primary/10 text-transparent bg-clip-text ">
              Scriptish
            </Link>
      <div 
      ref={cardRef} 
      className="max-w-md w-full bg-card/80 rounded-2xl shadow-lg p-8 border border-brand/20">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-brand mb-4">Join the Waitlist</h1>
        <p className="text-center text-foreground/70 mb-8">Be the first to know when Scriptish launches for all <span className='font-semibold'>clinics</span> and <span className='font-semibold'>hospitals</span> across the United States. Enter your email below to join our exclusive waitlist!</p>
        {submitted ? (
          <div className="text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground/50 via-foreground to-foreground/50 moveBg font-semibold text-lg py-8">Thank you for joining the waitlist! 🎉</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              className="border border-border/90 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-brand transition-colors bg-background/80"
              placeholder="Enter your email"
              value={email}
              onChange={e => {setEmail(e.target.value);
                    // console.log('Typing event:',e.target)
                    if(cardRef.current)
                      {cardRef.current.classList.add('pushShadow');
                        setTimeout(()=>
                        cardRef.current.classList.remove('pushShadow'),400)
                    }
                    
                  }}
              required
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
            disabled={submitting}
              type="submit"
              className="bg-primary cursor-pointer text-white font-semibold rounded-lg py-3 mt-2 hover:bg-brand/90 transition-colors text-lg"
            >
              Join Waitlist
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
