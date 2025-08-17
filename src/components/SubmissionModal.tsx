import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  TrophyIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";

interface SubmissionStatusModalProps {
  project: {
    _id: string;
    projectTitle: string;
    status: "draft" | "submitted" | "reviewed" | "selected" | "rejected";
    submittedAt: string;
    vote?: number;
    feedback?: string;
  };
  onClose: () => void;
}

export default function SubmissionStatusModal({
  project,
  onClose,
}: SubmissionStatusModalProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          icon: ClockIcon,
          title: "Project Submitted",
          subtitle: "Your design is under review",
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "reviewed":
        return {
          icon: EyeIcon,
          title: "Project Reviewed",
          subtitle: "Your design has been evaluated",
          color: "text-purple-500",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
        };
      case "selected":
        return {
          icon: TrophyIcon,
          title: "Congratulations! 🎉",
          subtitle: "Your design has been selected as a winner!",
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "rejected":
        return {
          icon: XCircleIcon,
          title: "Project Not Selected",
          subtitle: "Thank you for your participation",
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      case "draft":
        return {
          icon: ClockIcon,
          title: "Draft Saved",
          subtitle: "Your project is saved as draft",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
      default:
        return {
          icon: CheckCircleIcon,
          title: "Project Status",
          subtitle: "Check your project status",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);
  const IconComponent = statusConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`mx-auto w-20 h-20 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 flex items-center justify-center mb-4`}
          >
            <IconComponent className={`h-10 w-10 ${statusConfig.color}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {statusConfig.title}
          </h1>
          <p className={`text-lg ${statusConfig.color} font-medium`}>
            {statusConfig.subtitle}
          </p>
        </div>

        {/* Project Details */}
        <div className="space-y-6">
          <div
            className={`${statusConfig.bgColor} rounded-lg p-6 ${statusConfig.borderColor} border`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">
                  Project Title
                </h3>
                <p className="text-gray-600">{project.projectTitle}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Submitted</h3>
                <p className="text-gray-600">
                  {formatDate(project.submittedAt)}
                </p>
              </div>
              {project.vote !== undefined && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Votes</h3>
                  <p className="text-gray-600">{project.vote} votes</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          {project.feedback && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Feedback</h3>
              <p className="text-gray-600 leading-relaxed">
                {project.feedback}
              </p>
            </div>
          )}

          {/* Status-specific Messages */}
          {project.status === "submitted" && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    What happens next?
                  </h4>
                  <p className="text-blue-600 text-sm mt-1">
                    Our judges are carefully reviewing all submissions. Results
                    will be announced soon. Thank you for your patience!
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.status === "selected" && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start space-x-3">
                <TrophyIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800">
                    You're a Winner! 🎉
                  </h4>
                  <p className="text-green-600 text-sm mt-1">
                    Congratulations! Your design has been selected. We'll be in
                    touch with you soon regarding the next steps and prize
                    collection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.status === "rejected" && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800">
                    Thank You for Participating
                  </h4>
                  <p className="text-orange-600 text-sm mt-1">
                    While your design wasn't selected this time, we appreciate
                    your creative contribution to the CONCES rebranding
                    challenge. Keep designing!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚠️
              </motion.div>
              <div>
                <h4 className="font-medium text-yellow-800">
                  Important Notice
                </h4>
                <p className="text-yellow-700 text-sm mt-1">
                  You have already submitted a project for this contest. Each
                  participant is allowed only one submission per contest.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Close
          </Button>

          {/* Only show view submission button if not draft */}
          {project.status !== "draft" && (
            <Button
              variant="outline"
              onClick={() => {
                // You can implement view submission logic here
                window.open(`/projects/${project._id}`, "_blank");
              }}
              className="flex-1"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View Submission
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
