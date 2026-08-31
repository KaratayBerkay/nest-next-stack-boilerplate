// The gallery list, shared by the index route and the modal-over-list view.
import { Link } from "@tanstack/react-router";

export const PHOTOS = ["1", "2", "3"];

export function GalleryList() {
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
            <Link
              className="text-brand underline"
              to="/gallery/$id"
              params={{ id }}
              state={(prev) => ({ ...prev, galleryModal: true })}
            >
              photo {id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
