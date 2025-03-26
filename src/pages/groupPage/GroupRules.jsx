import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../components/NavBar";

const GroupRules = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const handleAcceptRules = () => {
    navigate(`/group-chat/${groupId}`);
  };

  const rules = [
    {
      id: 1,
      title: "Safety First",
      description:
        "Always wear a helmet and follow traffic rules. Ensure your bike is in good condition before rides.",
      icon: "🚴‍♂️",
    },
    {
      id: 2,
      title: "Be Punctual",
      description:
        "Arrive 15 minutes before the scheduled ride time. The group will not wait for latecomers.",
      icon: "⏰",
    },
    {
      id: 3,
      title: "Communication",
      description:
        "Use hand signals while riding and inform the group about any issues or if you need to leave early.",
      icon: "👋",
    },
    {
      id: 4,
      title: "Group Etiquette",
      description:
        "Maintain appropriate distance between riders. Don't overlap wheels. Ride predictably.",
      icon: "🤝",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Group Rules</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            To ensure everyone's safety and enjoyment, please familiarize
            yourself with our group rules. Following these guidelines helps
            create a positive experience for all members.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{rule.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {rule.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement Section */}
        <div className="mt-12 text-center">
          <button
            onClick={handleAcceptRules}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300"
          >
            I Agree to Follow These Rules
          </button>
          <p className="mt-4 text-sm text-gray-500">
            By clicking "I Agree", you confirm that you have read and will
            follow these rules
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupRules;
