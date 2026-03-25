import { ReactNode } from "react";

const styles = {
  tip: "bg-blue-50 border-blue-300 text-blue-900",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-900",
  note: "bg-gray-50 border-gray-300 text-gray-800",
  important: "bg-purple-50 border-purple-300 text-purple-900",
};

const labels = {
  tip: "Tip",
  warning: "Warning",
  note: "Note",
  important: "Important",
};

export default function Callout({
  children,
  type = "note",
}: {
  children: ReactNode;
  type?: keyof typeof styles;
}) {
  return (
    <div className={`my-4 border-l-4 rounded-r-lg px-4 py-3 ${styles[type]}`}>
      <div className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">
        {labels[type]}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
