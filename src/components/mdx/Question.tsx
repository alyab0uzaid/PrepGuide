import { ReactNode } from "react";

export default function Question({
  children,
  choices,
  answer,
}: {
  children: ReactNode;
  choices?: string[];
  answer?: string;
}) {
  return (
    <div className="my-6 border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Question stem */}
      <div className="px-5 py-4 border-b border-gray-100 text-sm leading-relaxed">
        {children}
      </div>

      {/* Multiple choice */}
      {choices && choices.length > 0 && (
        <div className="px-5 py-3 space-y-2">
          {choices.map((choice, i) => {
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            const isAnswer = answer === letter;
            return (
              <div
                key={letter}
                className={`flex items-start gap-3 text-sm px-3 py-2 rounded ${
                  isAnswer ? "bg-green-50 border border-green-200" : "border border-transparent"
                }`}
              >
                <span className="font-semibold w-5 flex-shrink-0">{letter})</span>
                <span>{choice}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Answer (if no choices) */}
      {answer && !choices && (
        <div className="px-5 py-3 bg-green-50 border-t border-green-100 text-sm">
          <span className="font-semibold text-green-800">Answer: </span>
          <span className="text-green-700">{answer}</span>
        </div>
      )}
    </div>
  );
}
