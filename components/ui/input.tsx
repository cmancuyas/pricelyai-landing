export function Input({ placeholder, className }: { placeholder: string; className?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`border px-4 py-2 rounded ${className}`}
    />
  );
}
