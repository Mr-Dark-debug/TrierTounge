import FeedbackForm from "@/components/feedback-form";
import Image from "next/image";
import logoImg from "@/assets/logo.png";

export const metadata = {
  title: "Feedback | TrierTongue",
  description: "Give us your feedback, request features, or report bugs.",
};

export default function FeedbackPage() {
  return (
    <main className="feedback-bg">
      <div className="text-center mb-8 flex flex-col items-center">
        <h1 className="feedback-title">Feedback & Reviews</h1>
        <div className="mt-4 flex items-center justify-center gap-2">
          <p className="font-bold text-xl uppercase tracking-tighter">
            Help us build the future of
          </p>
          <Image 
            src={logoImg} 
            alt="TrierTongue" 
            height={24} 
            className="h-6 w-auto"
          />
        </div>
      </div>
      
      <FeedbackForm />
      
      <footer className="mt-12 flex flex-col items-center gap-2 text-sm font-bold uppercase opacity-60">
        <div className="flex items-center gap-2">
          <span>© 2026</span>
          <Image 
            src={logoImg} 
            alt="TrierTongue" 
            height={16} 
            className="h-4 w-auto grayscale opacity-70"
          />
        </div>
        <span>Built for the community</span>
      </footer>
    </main>
  );
}
