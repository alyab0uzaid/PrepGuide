import { ReactNode } from "react";
import Image from "next/image";

export default function Figure({
  children,
  src,
  alt,
  caption,
}: {
  children?: ReactNode;
  src?: string;
  alt?: string;
  caption?: string;
}) {
  return (
    <figure className="my-6 flex flex-col items-center">
      {src ? (
        <div className="w-full max-w-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt ?? caption ?? "Diagram"} className="w-full h-auto" />
        </div>
      ) : (
        <div className="w-full max-w-lg">{children}</div>
      )}
      {caption && (
        <figcaption className="mt-2 text-xs text-gray-400 text-center">{caption}</figcaption>
      )}
    </figure>
  );
}
