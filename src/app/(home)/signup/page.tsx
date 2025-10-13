"use client";
import SignUpForm from "@/components/SignupForm";
import { useTimer } from "@/context/CountdownContext";

export default function SignUpPage() {

  const {contestStatus} = useTimer()
  console.log("Contest status:", contestStatus)
  // if(contestStatus != "register"){
  //   return (
  //     <div className="min-h-screen bg-gray-50 pt-20">
  //       <div className="container mx-auto py-12">
  //         <div className="max-w-2xl mx-auto text-center">
  //           <h1 className="text-3xl font-bold mb-4">Registration Closed</h1>
  //           <p className="text-lg text-gray-700">
  //             We're sorry, but the registration period for the contest has ended. Please check back later for future contests and opportunities.

  //           </p>
  //           <p>
  //             Thank you for your interest and support!
  //           </p>
  //           <p>
  //             Please Submit your Designs if you have signuped already.
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
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
