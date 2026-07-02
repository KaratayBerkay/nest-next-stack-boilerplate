import Link from "next/link";

const PHOTOS = ["1", "2", "3"];

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
      <p className="text-muted text-sm">
        Click a photo: a soft navigation opens it in an intercepted modal; a
        hard refresh of the same URL shows the full page.
      </p>
      <ul className="flex gap-3" data-testid="photo-links">
        {PHOTOS.map((id) => (
          <li key={id}>
            <Link className="text-brand underline" href={`/gallery/${id}`}>
              photo {id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
