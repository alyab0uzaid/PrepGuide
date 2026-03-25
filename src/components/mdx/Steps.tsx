import { ReactNode, Children } from "react";

export default function Steps({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <ol className="my-4 space-y-3">
      {items.map((child, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold mt-0.5">
            {i + 1}
          </span>
          <div className="flex-1 text-sm leading-relaxed pt-0.5">{child}</div>
        </li>
      ))}
    </ol>
  );
}
