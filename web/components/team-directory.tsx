"use client";

import { useEffect, useMemo, useState } from "react";

import { PortableTextBlock, portableTextToParagraphs } from "@/lib/portableText";

export type TeamMember = {
  _id: string;
  name?: string;
  role?: string;
  photoUrl?: string;
  linkedin?: string;
  email?: string;
  bio?: PortableTextBlock[];
};

export function TeamDirectory({ team }: { team: TeamMember[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeMember = useMemo(
    () => team.find((member) => member._id === activeId) || null,
    [activeId, team],
  );

  useEffect(() => {
    if (!activeMember) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveId(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeMember]);

  return (
    <>
      <section className="team-card-grid team-card-grid-compact">
        {team.map((member) => (
          <button key={member._id} type="button" className="team-card-button" onClick={() => setActiveId(member._id)}>
            <article className="team-card team-card-surface">
              <div className="team-card-media">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name || "Team member"} />
                ) : (
                  <div className="avatar-fallback">{(member.name || "AVP").slice(0, 2).toUpperCase()}</div>
                )}
              </div>
              <div className="team-card-caption">
                <p>{member.name || "Unnamed"}</p>
              </div>
            </article>
          </button>
        ))}
      </section>

      {activeMember ? (
        <div className="team-modal-backdrop" role="dialog" aria-modal="true" onClick={() => setActiveId(null)}>
          <div className="team-modal" onClick={(event) => event.stopPropagation()}>
            <header className="team-modal-header">
              <h2>
                {activeMember.name || "Unnamed"}
                {activeMember.role ? <span> - {activeMember.role}</span> : null}
              </h2>
              <button type="button" className="team-modal-close" onClick={() => setActiveId(null)} aria-label="Close">
                Close
              </button>
            </header>

            <div className="team-modal-body">
              <aside className="team-modal-side">
                {activeMember.photoUrl ? (
                  <img src={activeMember.photoUrl} alt={activeMember.name || "Team member"} />
                ) : (
                  <div className="avatar-fallback large">
                    {(activeMember.name || "AVP").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="team-contact-links">
                  {activeMember.linkedin ? (
                    <a href={activeMember.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  ) : null}
                  {activeMember.email ? <a href={`mailto:${activeMember.email}`}>Email</a> : null}
                </div>
              </aside>

              <div className="team-modal-main">
                {portableTextToParagraphs(activeMember.bio).map((paragraph, index) => (
                  <p key={`${activeMember._id}-bio-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
