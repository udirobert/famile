// Server component that emits a JSON-LD <script> block. Place anywhere in a
// server-rendered tree; Google and AI agents parse JSON-LD in <body> too.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
