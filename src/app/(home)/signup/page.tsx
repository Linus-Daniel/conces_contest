import SignUpForm from "@/components/SignupForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
