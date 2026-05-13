import FeedbackForm from "@/components/feedback-form";

export const metadata = {
  title: "Feedback | TrierTounge",
  description: "Give us your feedback, request features, or report bugs.",
};

export default function FeedbackPage() {
  return (
    <main className="feedback-bg">
      <div className="text-center mb-8">
        <h1 className="feedback-title">Feedback & Reviews</h1>
        <p className="mt-4 font-bold text-xl uppercase tracking-tighter">
          Help us build the future of <span className="bg-black text-white px-2">TrierTounge</span>
        </p>
      </div>
      
      <FeedbackForm />
      
      <footer className="mt-12 text-sm font-bold uppercase opacity-60">
        © 2026 TrierTounge - Built for the community
      </footer>
    </main>
  );
}
