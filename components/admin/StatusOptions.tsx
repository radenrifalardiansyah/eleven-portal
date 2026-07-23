export default function StatusOptions({ canPublish }: { canPublish: boolean }) {
  return (
    <>
      <option value="draft">Draft</option>
      <option value="pending">Ajukan Review</option>
      {canPublish && <option value="published">Published</option>}
    </>
  );
}
