import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, ArrowRight, Printer, Shield, Eye, Smartphone, Trees, Sparkles, CheckSquare, Download } from 'lucide-react';
import { LeafDecoration } from '@/components/ui/LeafDecoration';
import { CompassMark } from '@/components/ui/CompassMark';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { OfflineNotice } from '@/components/ui/OfflineNotice';
import { getSeason } from '@/lib/season';

export default function HomePage() {
  const currentSeason = getSeason(new Date());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-y)', paddingBottom: 'var(--section-y)' }}>
      {/* HERO SECTION */}
      <section
        style={{
          borderBottom: '2px solid var(--paper-border-dark)',
          paddingTop: 'var(--space-7)',
          paddingBottom: 'var(--space-8)',
          backgroundColor: 'var(--paper-bg)',
          position: 'relative',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-6)',
              alignItems: 'center',
            }}
          >
            {/* HERO LEFT: Editorial Manifesto */}
            <div style={{ maxWidth: '620px' }}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span className="field-stamp green">
                  <LeafDecoration size={13} color="#3A6704" variant="maple" />
                  FIELD NOTE 01 // TOUCH GRASS
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)',
                  lineHeight: 1.08,
                  fontWeight: 600,
                  color: 'var(--ink-primary)',
                  marginBottom: '1.5rem',
                  letterSpacing: '-0.025em',
                }}
              >
                Make a plan. <br />
                <span style={{ fontStyle: 'italic', color: 'var(--green-leaf)' }}>Then leave it behind.</span>
              </h1>

              <p
                style={{
                  fontSize: '1.15rem',
                  lineHeight: 1.65,
                  color: 'var(--ink-soft)',
                  marginBottom: '2rem',
                }}
              >
                Trailnote prepares a practical outdoor trail guide, route, and observation card — so your phone stays in your pocket once your boots hit the dirt. The AI runs on your machine. Place search, routes and weather come from open public services (Nominatim, OSRM, Open-Meteo).
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link href="/plan" className="btn-primary" style={{ padding: '0.95rem 1.85rem', fontSize: '1rem' }}>
                  <Compass size={18} />
                  <span>Plan a Walk</span>
                  <ArrowRight size={16} />
                </Link>

                <a href="#how-it-works" className="btn-secondary" style={{ padding: '0.95rem 1.6rem' }}>
                  <span>How It Works</span>
                </a>
              </div>

              {/* Single Line of Honest Metadata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px dashed var(--paper-border-dark)',
                  flexWrap: 'wrap',
                }}
              >
                <span className="neon-dot" />
                <span className="field-label" style={{ color: 'var(--ink-muted)', letterSpacing: '0.06em' }}>
                  LOCAL FIELD COMPANION // BUILT-IN RULES &amp; GEMMA 2 · PUBLIC GEOGRAPHY
                </span>
              </div>
            </div>

            {/* HERO RIGHT: Autumn Trail Frame with Field Annotations */}
            <div style={{ position: 'relative' }}>
              <div
                className="paper-card"
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--paper-card)',
                  border: '1px solid var(--paper-border-dark)',
                  boxShadow: 'var(--shadow-lifted)',
                  transform: 'rotate(-0.8deg)',
                }}
              >
                {/* Photo Header Annotation */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.65rem',
                    marginBottom: '0.65rem',
                    borderBottom: '1px solid var(--paper-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="field-label">SAMPLE CARD // {currentSeason.label.toUpperCase()}</span>
                    <span className="field-stamp green">ILLUSTRATION</span>
                  </div>
                  <span className="field-label" style={{ color: 'var(--ink-muted)' }}>
                    44°12'N 71°18'W · WHITE MOUNTAINS, NH
                  </span>
                </div>

                {/* Hero Image */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4/3',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    border: '1px solid var(--paper-border)',
                  }}
                >
                  <Image
                    src="/images/autumn_trail_hero.jpg"
                    alt="A quiet misty mountain trail with fallen leaves and rustic wooden marker"
                    fill
                    sizes="(max-width: 768px) 100vw, 550px"
                    style={{ objectFit: 'cover' }}
                    priority
                  />

                  {/* Tactile Map Pin Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: 'rgba(244, 240, 228, 0.94)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid var(--paper-border-dark)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: 'var(--shadow-tactile)',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--neon-accent)' }} />
                    <span className="field-mono" style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-primary)' }}>
                      ELEV: 320M · CRISP AIR
                    </span>
                  </div>
                </div>

                {/* Card Caption / Field Note */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    fontSize: '0.82rem',
                    color: 'var(--ink-soft)',
                  }}
                >
                  <span>White Mountains Trailway · Birch &amp; Hemlock (Sample Illustration)</span>
                  <span className="field-label">SAMPLE NOTE</span>
                </div>
              </div>

              {/* Floating Small Compass Stamp Accent */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-1.5rem',
                  left: '-1.5rem',
                  backgroundColor: 'var(--paper-warm)',
                  border: '1px solid var(--paper-border-dark)',
                  padding: '0.6rem',
                  borderRadius: '2px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'none',
                }}
                className="desktop-accent"
              >
                <CompassMark size={40} bearing={45} />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* THE TOUCH GRASS MANIFESTO & CADENCE */}
      <section id="how-it-works" className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <LeafDecoration size={16} color="#709F2D" variant="maple" />
            <span className="field-label">THE OUTDOOR-FIRST CADENCE</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginBottom: '0.75rem' }}>
            The screen should be the shortest part of the walk.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--ink-soft)' }}>
            Most modern apps want you glued to your phone while outside. Trailnote is engineered backwards: prepare your trail in 2 minutes, save a physical field note, and put the device away.
          </p>
        </div>

        {/* 7-Step Sequence Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { step: '01', title: 'Plan', desc: 'Tell Trailnote your time, pace, and nature curiosities.', href: '/plan' },
            { step: '02', title: 'Prepare', desc: 'Get practical gear checklists and local weather warnings.', href: '/plan' },
            { step: '03', title: 'Save', desc: 'Generate a physical Trail Card or store it locally on device.', href: '/trail-card' },
            { step: '04', title: 'Leave', desc: 'Slip your phone into your backpack. Step through the front door.', href: '/walk' },
            { step: '05', title: 'Explore', desc: 'Walk with your senses open. Notice bark, leaves, and wind.', href: '/trail' },
            { step: '06', title: 'Return', desc: 'Arrive home refreshed with quiet clarity and mud on your shoes.', href: '/field-notes' },
            { step: '07', title: 'Reflect', desc: 'Jot down 2 lines of observations in your personal field journal.', href: '/journal' },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="paper-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                padding: '1.25rem 1rem',
                border: '1px solid var(--paper-border)',
                backgroundColor: idx === 3 ? 'rgba(58, 103, 4, 0.06)' : 'var(--paper-card)',
                borderColor: idx === 3 ? 'var(--green-leaf)' : 'var(--paper-border-dark)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: idx === 3 ? 'var(--green-leaf)' : 'var(--autumn-rust)',
                  marginBottom: '0.5rem',
                }}
              >
                {item.step} {'//'}
              </div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--ink-primary)' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.45, margin: 0 }}>
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SIGNATURE FEATURE: THE TRAIL CARD PREVIEW */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--paper-warm)',
            border: '2px solid var(--paper-border-dark)',
            borderRadius: '4px',
            padding: 'clamp(1.5rem, 4vw, 3rem)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Explanation */}
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span className="field-stamp green">
                  <LeafDecoration size={13} color="#3A6704" variant="maple" />
                  SIGNATURE ARTIFACT // SPECIMEN CARD
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '1rem' }}>
                The Trail Card
              </h2>

              <p style={{ fontSize: '1rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Instead of a noisy chat feed or endless notifications, Trailnote condenses everything you need into a single, printable naturalist card.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckSquare size={18} color="#3A6704" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Exact Route & Effort:</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Distance, duration, elevation, and terrain grade verified by code.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Eye size={18} color="#A64B2A" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Things to Notice:</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Gemma generates 3 observational prompts to engage your senses outdoors.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Printer size={18} color="#6F7A0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>Print or Cache Offline:</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Fold it in half and slip it into your pocket. Zero battery drain.</div>
                  </div>
                </div>
              </div>

              <Link href="/plan" className="btn-primary">
                <span>Create Your Trail Card</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right: The Physical Field Card Demonstration */}
            <div
              className="paper-card"
              style={{
                backgroundColor: 'var(--paper-card)',
                border: '2px solid var(--paper-border-dark)',
                padding: '2rem',
                boxShadow: 'var(--shadow-lifted)',
                fontFamily: 'var(--font-sans)',
                position: 'relative',
              }}
            >
              {/* Header */}
              <div
                style={{
                  borderBottom: '2px solid var(--ink-primary)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div className="field-stamp green" style={{ marginBottom: '0.4rem' }}>
                    TRAILNOTE SPECIMEN
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', margin: 0 }}>
                    AUTUMN LOOP
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>
                    Seminary Hills & Botanical Reserve
                  </div>
                </div>
                <DifficultyBadge difficulty="moderate" size="sm" />
              </div>

              {/* Stats Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px dashed var(--paper-border-dark)',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div className="field-label" style={{ fontSize: '0.62rem' }}>DISTANCE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>4.8 km</div>
                </div>
                <div>
                  <div className="field-label" style={{ fontSize: '0.62rem' }}>EST. TIME</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>1h 25m</div>
                </div>
                <div>
                  <div className="field-label" style={{ fontSize: '0.62rem' }}>CONDITIONS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>24°C Clear</div>
                </div>
              </div>

              {/* Packing list */}
              <div style={{ marginBottom: '1rem' }}>
                <div className="field-label" style={{ marginBottom: '0.35rem' }}>BRING</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  1L Water · Comfortable trail boots · Light wind layer · Field notebook
                </div>
              </div>

              {/* Notice Prompts */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="field-label" style={{ marginBottom: '0.5rem' }}>THINGS TO NOTICE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', padding: '0.35rem 0.5rem', backgroundColor: 'var(--paper-warm)', borderRadius: '2px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--autumn-rust)', marginRight: '6px' }}>01</strong>
                    Look for three distinct oak & teak leaf shapes on the dirt path.
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', padding: '0.35rem 0.5rem', backgroundColor: 'var(--paper-warm)', borderRadius: '2px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--autumn-rust)', marginRight: '6px' }}>02</strong>
                    Listen for two different bird calls near the stream crossing.
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--ink-primary)', padding: '0.35rem 0.5rem', backgroundColor: 'var(--paper-warm)', borderRadius: '2px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--autumn-rust)', marginRight: '6px' }}>03</strong>
                    Notice how the terrain shifts from sandy soil to basalt outcrop.
                  </div>
                </div>
              </div>

              {/* Trail Briefing Note */}
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(58, 103, 4, 0.08)',
                  borderLeft: '3px solid var(--green-leaf)',
                  fontSize: '0.82rem',
                  color: 'var(--green-deep)',
                  fontStyle: 'italic',
                  marginBottom: '1.25rem',
                }}
              >
                "Take the quieter eastern ridgeway after the second boundary stone for expansive canopy views."
              </div>

              {/* Action */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--green-deep)',
                    color: '#FAF7F0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    borderRadius: '2px',
                  }}
                >
                  [ TAKE THIS OUTSIDE ]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE ARCHITECTURE: ETHICAL LOCAL AI */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem auto' }}>
          <span className="field-label">ARCHITECTURE & PHILOSOPHY</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
            Open weights. Local privacy. No chatbot bloat.
          </h2>
          <p style={{ color: 'var(--ink-soft)' }}>
            We believe AI is most helpful when it gets out of the way. Gemma 2 processes your trail preferences entirely on your machine.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="field-stamp green">GEMMA 2</span>
              <span className="field-label">NATURALIST INTELLIGENCE</span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Creative Observation & Adaptation
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Gemma interprets terrain nuances, crafts evocative sensory prompts, and adapts the briefing to your fitness level and curiosities.
            </p>
          </div>

          <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="field-stamp">TYPESCRIPT + ZOD</span>
              <span className="field-label">RELIABLE COMPUTATION</span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              Mathematical Accuracy
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              We never ask an LLM to calculate kilometers or elevations. Distances, durations, and coordinates are strictly handled by deterministic code.
            </p>
          </div>

          <div className="paper-card" style={{ padding: '1.75rem', border: '1px solid var(--paper-border-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="field-stamp accent">OFFLINE-FIRST</span>
              <span className="field-label">DEVICE STORAGE</span>
            </div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              No Cellular Needed
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              Deep woods and valley trails rarely have 5G signals. Your generated trail card is stored directly in your local browser disk.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL INVITATION CTA */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--green-deep)',
            color: '#FAF7F0',
            borderRadius: '4px',
            padding: 'clamp(2rem, 5vw, 4rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle leaf watermark */}
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
            <LeafDecoration size={180} color="#FAF7F0" variant="maple" />
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--neon-accent)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            HACKTOBERFEST 2026 // TOUCH GRASS
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#FAF7F0',
              maxWidth: '680px',
              marginBottom: '1rem',
            }}
          >
            Your boots are waiting by the door.
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#D8CFBA',
              maxWidth: '540px',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            Take 2 minutes to fill out your trail permit. We'll generate your Trail Card so you can step outside into the fresh air.
          </p>

          <Link
            href="/plan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--paper-bg)',
              color: 'var(--ink-primary)',
              padding: '1rem 2.25rem',
              borderRadius: '3px',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-card)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Compass size={18} color="#3A6704" />
            <span>Open Trail Permit Form</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
