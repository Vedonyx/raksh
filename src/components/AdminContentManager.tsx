"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type {
  ContentKind,
  ContentSnapshot,
  CreatorLink,
  CreatorPage,
  CreatorVideo,
} from "../lib/creator-types";
type Item = CreatorVideo | CreatorPage | CreatorLink;
type Editor = { kind: ContentKind; item?: Item; parent?: string };
type Props = {
  mode: "videos" | "pages";
  content: ContentSnapshot;
  clicks: (kind: string, id: string) => number;
  busy: boolean;
  message: string;
  act: (method: string, body: unknown) => Promise<boolean>;
};
function EditorDialog({
  editor,
  close,
  submit,
  busy,
  message,
}: {
  editor: Editor;
  close: () => void;
  submit: (method: string, body: unknown) => Promise<boolean>;
  busy: boolean;
  message: string;
}) {
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const { kind, item, parent } = editor;
  const video = kind === "video";
  const page = kind === "page";
  const link = !video && !page;
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const data: Record<string, unknown> = {
      published: fields.get("published") === "on",
      description: String(fields.get("description") || ""),
    };
    if (link) {
      data.label = String(fields.get("label"));
      data.url = String(fields.get("url"));
      data.parent_id = parent || (item as CreatorLink)?.parent_id;
    } else {
      data.title = String(fields.get("title"));
      if (page) data.slug = String(fields.get("slug"));
      else {
        data.youtube_id = String(fields.get("youtube_id"));
        data.format = String(fields.get("format"));
      }
    }
    setFailed(false);
    if (await submit(item ? "PATCH" : "POST", { kind, id: item?.id, data }))
      close();
    else setFailed(true);
  }
  return (
    <dialog className="workspace-dialog" ref={dialog} onCancel={close}>
      <div className="workspace-dialog__top">
        <div>
          <span className="workspace-eyebrow">
            {item ? "EDIT" : "CREATE"} /{" "}
            {video ? "VIDEO" : page ? "LINK PAGE" : "LINK"}
          </span>
          <h2>
            {video
              ? "A video, with its links."
              : page
                ? "Your own corner of the web."
                : "Give the link a clear name."}
          </h2>
        </div>
        <button
          type="button"
          className="workspace-icon-button"
          onClick={close}
          aria-label="Close editor"
        >
          ×
        </button>
      </div>
      <form onSubmit={save}>
        {link ? (
          <>
            <label>
              Link label
              <input
                name="label"
                defaultValue={(item as CreatorLink)?.label || ""}
                placeholder="e.g. My camera setup"
                required
                maxLength={160}
              />
            </label>
            <label>
              Destination URL
              <input
                name="url"
                defaultValue={(item as CreatorLink)?.url || ""}
                placeholder="https://… or /consultations"
                required
                maxLength={2048}
              />
              <small>
                Paste the complete referral link, including its tracking code.
              </small>
            </label>
          </>
        ) : (
          <label>
            Title
            <input
              name="title"
              defaultValue={(item as CreatorVideo | CreatorPage)?.title || ""}
              required
              maxLength={160}
              placeholder={
                video
                  ? "What is this video about?"
                  : "e.g. My setup & favourites"
              }
            />
          </label>
        )}
        {video && (
          <>
            <label>
              YouTube video URL
              <input
                name="youtube_id"
                defaultValue={
                  (item as CreatorVideo)?.youtube_id
                    ? `https://www.youtube.com/watch?v=${(item as CreatorVideo).youtube_id}`
                    : ""
                }
                placeholder="https://www.youtube.com/shorts/…"
                required
              />
              <small>
                Watch links, Shorts links and youtu.be share links are
                supported.
              </small>
            </label>
            <label>
              Format
              <select
                name="format"
                defaultValue={(item as CreatorVideo)?.format || "short"}
              >
                <option value="short">Short</option>
                <option value="long">Long-form video</option>
              </select>
            </label>
          </>
        )}
        {page && (
          <label>
            Page shortcut
            <div className="workspace-prefix-input">
              <span>/</span>
              <input
                name="slug"
                defaultValue={(item as CreatorPage)?.slug || ""}
                placeholder="srts"
                required
                maxLength={48}
                readOnly={(item as CreatorPage)?.slug === "links"}
              />
            </div>
            <small>
              This becomes your website URL, e.g. /srts. Letters, numbers and
              hyphens.
            </small>
          </label>
        )}
        <label>
          {link ? "Small note (optional)" : "Description (optional)"}
          <textarea
            name="description"
            rows={3}
            maxLength={link ? 300 : 1200}
            defaultValue={item?.description || ""}
            placeholder={
              link
                ? "e.g. The exact model used in this video"
                : "A short introduction for your visitors."
            }
          />
        </label>
        <label className="workspace-switch">
          <input
            type="checkbox"
            name="published"
            defaultChecked={item?.published || false}
          />
          <span>
            <strong>Publish on the website</strong>
            <small>
              Keep this off to save a draft. Parent pages/videos must also be
              published.
            </small>
          </span>
        </label>
        {failed && (
          <p className="workspace-inline-status" role="alert">
            {message}
          </p>
        )}
        <div className="workspace-dialog__actions">
          <button type="button" onClick={close} disabled={busy}>
            Cancel
          </button>
          <button className="workspace-primary" disabled={busy} type="submit">
            {busy ? "Saving…" : "Save changes"} ↗
          </button>
        </div>
      </form>
    </dialog>
  );
}
export default function AdminContentManager({
  mode,
  content,
  clicks,
  busy,
  act,
  message,
}: Props) {
  const [selected, setSelected] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [archived, setArchived] = useState(false);
  const [notice, setNotice] = useState("");
  const isVideo = mode === "videos";
  const kind: ContentKind = isVideo ? "video" : "page";
  const childKind: ContentKind = isVideo ? "videoLink" : "pageLink";
  const items: Item[] = (isVideo ? content.videos : content.pages).filter(
    (x) => x.archived === archived,
  );
  const current = items.find((x) => x.id === selected) || items[0];
  const childLinks = (isVideo ? content.videoLinks : content.pageLinks).filter(
    (x) => x.parent_id === current?.id,
  );
  const links = childLinks.filter((x) => !x.archived);
  async function move(
    resource: ContentKind,
    list: Item[],
    id: string,
    direction: number,
    parent?: string,
  ) {
    const ids = list.map((x) => x.id);
    const index = ids.indexOf(id);
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    await act("POST", {
      kind: resource,
      action: "reorder",
      parent_id: parent,
      ids,
    });
  }
  async function copy(slug: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
      setNotice("Page URL copied.");
    } catch {
      setNotice(`Page URL: ${window.location.origin}/${slug}`);
    }
  }
  return (
    <>
      <div className="workspace-section-heading">
        <div>
          <h2>{isVideo ? "Videos & referral links" : "Your link pages"}</h2>
          <p>
            {isVideo
              ? "Add an upload, then attach the products or resources mentioned in it."
              : "Create shareable pages. The first link in a page is the highest priority."}
          </p>
        </div>
        <button
          className="workspace-primary"
          type="button"
          disabled={busy}
          onClick={() => setEditor({ kind })}
        >
          + {isVideo ? "Add video" : "Create page"}
        </button>
      </div>
      <div className="workspace-content-toolbar">
        <div className="workspace-tabs">
          <button
            type="button"
            aria-pressed={!archived}
            onClick={() => {
              setArchived(false);
              setSelected("");
            }}
          >
            Active{" "}
            <span>
              {
                (isVideo ? content.videos : content.pages).filter(
                  (x) => !x.archived,
                ).length
              }
            </span>
          </button>
          <button
            type="button"
            aria-pressed={archived}
            onClick={() => {
              setArchived(true);
              setSelected("");
            }}
          >
            Archived
          </button>
        </div>
        <a
          href={isVideo ? "/videos" : "/links"}
          target="_blank"
          rel="noreferrer"
        >
          View public {isVideo ? "videos" : "links"} ↗
        </a>
      </div>
      {notice && (
        <p role="status" className="workspace-inline-status">
          {notice}
        </p>
      )}
      <div className="workspace-content-grid">
        <section
          className="workspace-panel workspace-content-list"
          aria-label={isVideo ? "Videos" : "Link pages"}
        >
          <div className="workspace-panel-title">
            <h3>{isVideo ? "Your uploads" : "Pages"}</h3>
            <span>{items.length} total</span>
          </div>
          {!items.length && (
            <div className="workspace-empty">
              <span>{isVideo ? "▶" : "↗"}</span>
              <h3>
                {archived
                  ? "Nothing archived."
                  : isVideo
                    ? "Start with your first video."
                    : "Create a shortcut."}
              </h3>
              <p>
                {archived
                  ? "Archived items can be restored here."
                  : "Use the button above to add one."}
              </p>
            </div>
          )}
          {items.map((item, i) => (
            <article
              className={`workspace-content-row${current?.id === item.id ? " is-selected" : ""}`}
              key={item.id}
            >
              <button
                className="workspace-select-row"
                type="button"
                onClick={() => setSelected(item.id)}
              >
                {isVideo ? (
                  <Image
                    src={`https://i.ytimg.com/vi/${(item as CreatorVideo).youtube_id}/hqdefault.jpg`}
                    alt=""
                    width={88}
                    height={56}
                  />
                ) : (
                  <span className="workspace-page-icon">
                    /{(item as CreatorPage).slug.slice(0, 3)}
                  </span>
                )}
                <span>
                  <strong>{(item as CreatorVideo | CreatorPage).title}</strong>
                  <small>
                    {isVideo
                      ? (item as CreatorVideo).format === "short"
                        ? "Short"
                        : "Long-form"
                      : `/${(item as CreatorPage).slug}`}
                  </small>
                  <span
                    className={`workspace-tag ${item.published ? "workspace-tag--live" : ""}`}
                  >
                    {item.archived
                      ? "Archived"
                      : item.published
                        ? "Published"
                        : "Draft"}
                  </span>
                </span>
              </button>
              <div className="workspace-row-tools">
                {isVideo && !archived && (
                  <>
                    <button
                      aria-label={`Move ${(item as CreatorVideo).title} up`}
                      title="Move up"
                      type="button"
                      disabled={busy || i === 0}
                      onClick={() => move(kind, items, item.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Move ${(item as CreatorVideo).title} down`}
                      title="Move down"
                      type="button"
                      disabled={busy || i === items.length - 1}
                      onClick={() => move(kind, items, item.id, 1)}
                    >
                      ↓
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setEditor({ kind, item })}
                >
                  Edit
                </button>
              </div>
            </article>
          ))}
        </section>
        <section
          className="workspace-panel workspace-selected-content"
          aria-label="Selected content links"
        >
          {current ? (
            <>
              <div className="workspace-panel-title">
                <div>
                  <span className="workspace-eyebrow">
                    {isVideo ? "SELECTED VIDEO" : "SELECTED PAGE"}
                  </span>
                  <h3>{(current as CreatorVideo | CreatorPage).title}</h3>
                </div>
                <span
                  className={`workspace-tag ${current.published ? "workspace-tag--live" : ""}`}
                >
                  {current.published && !current.archived
                    ? "Published"
                    : "Hidden"}
                </span>
              </div>
              <p className="workspace-selected-description">
                {current.description ||
                  (isVideo
                    ? "Add links to products, tools and resources from this video."
                    : "Add your most useful links. Reorder them to put the most important first.")}
              </p>
              {!isVideo && (
                <div className="workspace-share-url">
                  <code>/{(current as CreatorPage).slug}</code>
                  <button
                    type="button"
                    onClick={() => copy((current as CreatorPage).slug)}
                  >
                    Copy URL
                  </button>
                  <a
                    href={`/${(current as CreatorPage).slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview ↗
                  </a>
                </div>
              )}
              <div className="workspace-parent-stats">
                <span>
                  <b>{links.length}</b>{" "}
                  {isVideo ? "referral links" : "active links"}
                </span>
                <span>
                  <b>
                    {isVideo
                      ? clicks("video", current.id)
                      : links.reduce(
                          (sum, x) => sum + clicks("pageLink", x.id),
                          0,
                        )}
                  </b>{" "}
                  {isVideo ? "YouTube opens" : "link clicks"} in selected period
                </span>
              </div>
              <div className="workspace-link-heading">
                <h4>{isVideo ? "Referral links" : "Page links"}</h4>
                <button
                  className="workspace-primary workspace-small"
                  type="button"
                  disabled={busy || current.archived}
                  onClick={() =>
                    setEditor({ kind: childKind, parent: current.id })
                  }
                >
                  + Add link
                </button>
              </div>
              {!links.length && (
                <p className="workspace-soft-empty">
                  No links yet. Add one to give visitors their next step.
                </p>
              )}
              <div className="workspace-managed-links">
                {links.map((link, i) => (
                  <article key={link.id}>
                    <div className="workspace-link-number">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="workspace-managed-link-copy">
                      <strong>{link.label}</strong>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.url}
                      </a>
                      <small>
                        {clicks(childKind, link.id)} clicks ·{" "}
                        {link.published ? "Published" : "Draft"}
                      </small>
                    </div>
                    <div className="workspace-row-tools">
                      <button
                        type="button"
                        aria-label={`Move ${link.label} up`}
                        title="Move up"
                        disabled={busy || i === 0}
                        onClick={() =>
                          move(childKind, links, link.id, -1, current.id)
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${link.label} down`}
                        title="Move down"
                        disabled={busy || i === links.length - 1}
                        onClick={() =>
                          move(childKind, links, link.id, 1, current.id)
                        }
                      >
                        ↓
                      </button>
                      <button
                        disabled={busy}
                        type="button"
                        onClick={() =>
                          setEditor({
                            kind: childKind,
                            item: link,
                            parent: current.id,
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        disabled={busy}
                        type="button"
                        aria-label={`Archive ${link.label}`}
                        title="Archive link"
                        onClick={() =>
                          act("DELETE", { kind: childKind, id: link.id })
                        }
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {childLinks.some((x) => x.archived) && (
                <details className="workspace-archived-links">
                  <summary>
                    Archived links (
                    {childLinks.filter((x) => x.archived).length})
                  </summary>
                  {childLinks
                    .filter((x) => x.archived)
                    .map((link) => (
                      <div key={link.id}>
                        <span>{link.label}</span>
                        <button
                          disabled={busy || current.archived}
                          type="button"
                          onClick={() =>
                            act("PATCH", {
                              kind: childKind,
                              id: link.id,
                              data: { archived: false },
                            })
                          }
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                </details>
              )}
              <div className="workspace-selected-footer">
                <button
                  disabled={busy}
                  type="button"
                  onClick={() => setEditor({ kind, item: current })}
                >
                  Edit {isVideo ? "video" : "page"}
                </button>
                {current.archived ? (
                  <button
                    disabled={busy}
                    type="button"
                    onClick={() =>
                      act("PATCH", {
                        kind,
                        id: current.id,
                        data: { archived: false },
                      })
                    }
                  >
                    Restore {isVideo ? "video" : "page"}
                  </button>
                ) : (
                  (isVideo || (current as CreatorPage).slug !== "links") && (
                    <button
                      className="workspace-quiet"
                      disabled={busy}
                      type="button"
                      onClick={() => act("DELETE", { kind, id: current.id })}
                    >
                      Archive {isVideo ? "video" : "page"}
                    </button>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="workspace-empty">
              <h3>{isVideo ? "Choose a video." : "Choose a page."}</h3>
              <p>Its links and sharing controls will appear here.</p>
            </div>
          )}
        </section>
      </div>
      {editor && (
        <EditorDialog
          editor={editor}
          close={() => setEditor(null)}
          submit={act}
          busy={busy}
          message={message}
        />
      )}
    </>
  );
}
