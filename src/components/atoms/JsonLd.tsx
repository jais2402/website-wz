export interface JsonLdProps {
  /** One schema object, or several to emit as separate script tags. */
  schema: object | object[];
}

/**
 * Atom. Emits JSON-LD.
 *
 * dangerouslySetInnerHTML is unavoidable for a ld+json script tag. The input is
 * not user content — it is built from content/site.json at build time — and it
 * is serialised with JSON.stringify, then `<` escaped so a string in the content
 * file can never close the script tag early.
 */
export function JsonLd({ schema }: JsonLdProps) {
  const items = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
