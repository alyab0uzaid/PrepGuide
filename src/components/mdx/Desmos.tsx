export default function Desmos({ id }: { id: string }) {
  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={`https://www.desmos.com/calculator/${id}`}
        width="100%"
        height="400"
        style={{ border: "none", display: "block" }}
        title={`Desmos calculator ${id}`}
        allowFullScreen
      />
    </div>
  );
}
