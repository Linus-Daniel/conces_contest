import SubmitProjectForm from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <SubmitProjectForm />
        </div>
      </div>
    </div>
  );
}
