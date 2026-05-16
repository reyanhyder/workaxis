import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebase';
import { getAdditionalUserInfo, signInWithPopup } from 'firebase/auth';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroCity from '../hero-city.jpg';

gsap.registerPlugin(ScrollTrigger);

function CommandFinal({ onClick }) {
  const commandItems = [
    { label: 'Execution', value: '4 open', text: 'Two priority tasks require attention before 3PM.' },
    { label: 'Reminder', value: '11:30', text: 'Complete portfolio review before the next work block.' },
    { label: 'Finance', value: 'On track', text: 'Monthly spend is inside the expected range.' },
    { label: 'Network', value: '1 follow-up', text: 'Reconnect with a saved professional contact today.' },
  ];

  const intelligenceRows = [
    ['Briefing', 'Morning operating picture prepared'],
    ['Tasks', 'Priority queue organized by urgency'],
    ['Career', 'Next professional move kept visible'],
    ['Reports', 'Monthly intelligence ready to compile'],
  ];

  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 58, alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 10, color: 'rgba(245,245,245,0.28)', letterSpacing: '3.5px', fontFamily: 'Space Mono, monospace', marginBottom: 28 }}>{'// COMMAND CENTER'}</p>
        <h2 style={{ fontSize: 'clamp(42px, 6vw, 66px)', color: '#f7f3eb', lineHeight: 1.03, fontWeight: 700, fontFamily: 'Bodoni Moda, Playfair Display, serif', marginBottom: 24 }}>
          One view for the work that matters.
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(247,243,235,0.52)', lineHeight: 1.78, maxWidth: 470, marginBottom: 38, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>
          WorkAxis turns tasks, reminders, finances, network, career progress, and reports into a single professional operating picture.
        </p>
        <button onClick={onClick}
          style={{ background: '#f7f3eb', border: '1px solid #f7f3eb', color: '#090909', fontSize: 12, fontWeight: 800, letterSpacing: '1.6px', padding: '17px 42px', cursor: 'pointer', fontFamily: 'Inter, Space Grotesk, sans-serif', transition: 'all 0.3s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f7f3eb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f7f3eb'; e.currentTarget.style.color = '#090909'; }}>
          INITIALIZE WORKAXIS
        </button>
        <p style={{ fontSize: 10, color: 'rgba(245,245,245,0.14)', letterSpacing: '2px', fontFamily: 'Space Mono, monospace', marginTop: 22 }}>
          Professional intelligence · Built for daily command
        </p>
      </div>

      <div style={{ border: '1px solid rgba(247,243,235,0.12)', background: 'linear-gradient(180deg, rgba(247,243,235,0.045), rgba(247,243,235,0.012))', padding: 30, boxShadow: '0 30px 90px rgba(0,0,0,0.42)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 22, borderBottom: '1px solid rgba(247,243,235,0.08)', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(247,243,235,0.32)', letterSpacing: '2.4px', fontFamily: 'Space Mono, monospace', marginBottom: 10 }}>TODAY'S OPERATING PICTURE</div>
            <div style={{ fontSize: 'clamp(25px, 3.2vw, 31px)', color: '#f7f3eb', fontWeight: 700, lineHeight: 1.08, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>Ready for command.</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, color: '#f7f3eb', fontWeight: 700, fontFamily: 'Bodoni Moda, Playfair Display, serif', lineHeight: 1 }}>82%</div>
            <div style={{ fontSize: 10, color: 'rgba(247,243,235,0.26)', letterSpacing: '1.6px', fontFamily: 'Space Mono, monospace', marginTop: 7 }}>SIGNAL</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))', gap: 12, marginBottom: 24 }}>
          {commandItems.map(item => (
            <div key={item.label} style={{ border: '1px solid rgba(247,243,235,0.08)', background: 'rgba(8,8,8,0.34)', padding: '18px 18px 17px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'baseline', marginBottom: 13 }}>
                <div style={{ fontSize: 10, color: 'rgba(247,243,235,0.34)', letterSpacing: '1.8px', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#f7f3eb', fontWeight: 700, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>{item.value}</div>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(247,243,235,0.58)', lineHeight: 1.55, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>{item.text}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(247,243,235,0.08)', paddingTop: 18 }}>
          {intelligenceRows.map(([label, value]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 18, padding: '10px 0', borderBottom: '1px solid rgba(247,243,235,0.045)' }}>
              <div style={{ fontSize: 10, color: 'rgba(247,243,235,0.3)', letterSpacing: '1.8px', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 13, color: 'rgba(247,243,235,0.62)', fontFamily: 'Inter, Space Grotesk, sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// NETFLIX-STYLE INTRO
function Intro({ onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(ref.current, { opacity: 0, duration: 0.8, onComplete: onDone });
      }
    });
    tl.fromTo('#intro-line', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' })
      .fromTo('#intro-w1', { opacity: 0, y: 60, skewY: 8 }, { opacity: 1, y: 0, skewY: 0, duration: 1.1, ease: 'expo.out' }, '-=0.2')
      .fromTo('#intro-w2', { opacity: 0, y: 60, skewY: 8 }, { opacity: 1, y: 0, skewY: 0, duration: 1.1, ease: 'expo.out' }, '-=0.9')
      .fromTo('#intro-sub', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.4')
      .to({}, { duration: 1.2 })
      .to('#intro-w1', { y: -80, opacity: 0, duration: 0.7, ease: 'expo.in' })
      .to('#intro-w2', { y: -80, opacity: 0, duration: 0.7, ease: 'expo.in' }, '-=0.5')
      .to('#intro-sub', { opacity: 0, duration: 0.5 }, '-=0.6')
      .to('#intro-line', { scaleX: 0, duration: 0.6, ease: 'expo.inOut' }, '-=0.4');
  }, [onDone]);

  return (
    <div ref={ref} style={{ position: 'fixed', inset: 0, background: '#080808', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div id="intro-line" style={{ width: 80, height: 1, background: '#f5f5f5', marginBottom: 40, transformOrigin: 'left', transform: 'scaleX(0)' }} />
      <div style={{ overflow: 'hidden', marginBottom: 8 }}>
        <div id="intro-w1" style={{ fontSize: 72, fontWeight: 800, color: '#f5f5f5', letterSpacing: '8px', fontFamily: 'Bodoni Moda, Playfair Display, serif', opacity: 0 }}>WORK</div>
      </div>
      <div style={{ overflow: 'hidden', marginBottom: 32 }}>
        <div id="intro-w2" style={{ fontSize: 72, fontWeight: 500, color: 'rgba(245,245,245,0.25)', letterSpacing: '8px', fontFamily: 'Bodoni Moda, Playfair Display, serif', opacity: 0 }}>AXIS</div>
      </div>
      <div id="intro-sub" style={{ fontSize: 11, color: 'rgba(245,245,245,0.2)', letterSpacing: '6px', fontFamily: 'Space Mono, monospace', opacity: 0 }}>PROFESSIONAL INTELLIGENCE SYSTEM</div>
    </div>
  );
}

export default function LandingV2() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const heroRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);
  const s2Ref = useRef(null);
  const s3Ref = useRef(null);
  const s4Ref = useRef(null);
  const s5Ref = useRef(null);
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  const login = async () => {
    try {
      const credential = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(credential);
      navigate('/welcome', { state: { askName: Boolean(info?.isNewUser) } });
    }
    catch (e) { console.error(e); }
  };

  const scrollToSection = (ref) => {
    const node = ref.current;
    if (!node) return;

    const navOffset = 82;
    const top = node.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // MOUSE PARALLAX
  useEffect(() => {
    if (!introDone) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(imgRef.current, { x: x * -18, y: y * -10, duration: 1.4, ease: 'power2.out' });
      gsap.to(textRef.current, { x: x * 10, y: y * 6, duration: 1, ease: 'power2.out' });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [introDone]);

  useEffect(() => {
    if (!introDone) return;
    const ctx = gsap.context(() => {
      const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;

      // HERO ENTRANCE
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(imgRef.current, { scale: 1.2, opacity: 0 }, { scale: 1.06, opacity: 1, duration: 2.8, ease: 'power3.out' })
        .fromTo('#hl', { opacity: 0, y: 20, letterSpacing: '20px' }, { opacity: 1, y: 0, letterSpacing: '5px', duration: 1.2, ease: 'expo.out' }, '-=2.2')
        .fromTo('#h1a', { opacity: 0, y: 120, skewY: 8 }, { opacity: 1, y: 0, skewY: 0, duration: 1.6, ease: 'expo.out' }, '-=0.9')
        .fromTo('#h1b', { opacity: 0, y: 120, skewY: 8 }, { opacity: 1, y: 0, skewY: 0, duration: 1.6, ease: 'expo.out' }, '-=1.3')
        .fromTo('#h1c', { opacity: 0, y: 120, skewY: 8 }, { opacity: 1, y: 0, skewY: 0, duration: 1.6, ease: 'expo.out' }, '-=1.3')
        .fromTo('#hsub', { opacity: 0 }, { opacity: 1, duration: 1.2 }, '-=0.8')
        .fromTo('#hcta', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1 }, '-=0.6')
        .fromTo('#hmeta', { opacity: 0 }, { opacity: 1, duration: 0.9 }, '-=0.4');

      // IMAGE PARALLAX ON SCROLL
      gsap.to(imgRef.current, {
        yPercent: 32, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true }
      });

      // TEXT COMET EXIT
      gsap.to(textRef.current, {
        yPercent: -35, opacity: 0, scale: 1.04, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: '40% top', scrub: 2 }
      });

      // OVERLAY DARKENS
      gsap.to('#hov', {
        opacity: 1, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: '55% top', scrub: true }
      });

      // SCENE 2 — PREMIUM APERTURE REVEAL
      gsap.fromTo(s2Ref.current,
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 0.965 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'expo.inOut', scrollTrigger: { trigger: s2Ref.current, start: 'top 98%', end: 'top 4%', scrub: 1.8 } }
      );
      gsap.fromTo('#s2grid',
        { opacity: 0, y: 80, scaleY: 0.82 },
        { opacity: 1, y: 0, scaleY: 1, ease: 'none', scrollTrigger: { trigger: s2Ref.current, start: 'top 86%', end: 'top 12%', scrub: 1.4 } }
      );
      gsap.fromTo(['#s2shutterA', '#s2shutterB'],
        { scaleX: 0 },
        { scaleX: 1, ease: 'expo.inOut', stagger: 0.16, scrollTrigger: { trigger: s2Ref.current, start: 'top 72%', end: 'top 24%', scrub: 1.2 } }
      );
      gsap.fromTo('#s2scan',
        { yPercent: -120, opacity: 0 },
        { yPercent: 120, opacity: 0.52, ease: 'none', scrollTrigger: { trigger: s2Ref.current, start: 'top 85%', end: 'bottom 20%', scrub: 1.6 } }
      );
      const t2 = gsap.timeline({ scrollTrigger: { trigger: s2Ref.current, start: 'top 48%', toggleActions: 'play none none reverse' } });
      t2.fromTo('#s2e', { opacity: 0, y: 26, letterSpacing: '9px' }, { opacity: 1, y: 0, letterSpacing: '5px', duration: 0.95, ease: 'expo.out' })
        .fromTo('#s2lg', { opacity: 0, y: 62, scale: 0.86, filter: 'blur(10px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.45, ease: 'expo.out' }, '-=0.34')
        .fromTo('#s2dv', { scaleX: 0 }, { scaleX: 1, duration: 1.35, ease: 'expo.inOut' }, '-=0.58')
        .fromTo('.s2w', { opacity: 0, y: 95, rotateX: 42, skewY: 7, filter: 'blur(7px)' }, { opacity: 1, y: 0, rotateX: 0, skewY: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.045, ease: 'expo.out' }, '-=0.46')
        .fromTo('#s2sb', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' }, '-=0.22');

      // SCENE 3 SLIDE FROM RIGHT
      gsap.fromTo(s3Ref.current,
        { x: isSmallScreen ? '0%' : '100%', opacity: isSmallScreen ? 1 : 0 },
        { x: '0%', opacity: 1, ease: 'expo.inOut', scrollTrigger: { trigger: s3Ref.current, start: 'top 95%', end: 'top 5%', scrub: 1.5 } }
      );
      const t3 = gsap.timeline({ scrollTrigger: { trigger: s3Ref.current, start: 'top 45%', toggleActions: 'play none none reverse' } });
      t3.fromTo('#s3t', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'expo.out' })
        .fromTo('#s3h', { opacity: 0, y: 70, skewY: 4 }, { opacity: 1, y: 0, skewY: 0, duration: 1.3, ease: 'expo.out' }, '-=0.3')
        .fromTo('#s3p', { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.4')
        .fromTo('.bc', { opacity: 0, x: 100, scale: 0.93 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, stagger: 0.13, ease: 'expo.out' }, '-=0.5');

      // SCENE 4 SCALE REVEAL
      gsap.fromTo(s4Ref.current,
        { scale: 0.9, opacity: 0, filter: 'blur(6px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'expo.out', scrollTrigger: { trigger: s4Ref.current, start: 'top 90%', end: 'top 20%', scrub: 1.2 } }
      );
      document.querySelectorAll('.mr').forEach(row => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 92%', toggleActions: 'play none none reverse' } });
        tl.fromTo(row.querySelector('.mn'), { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' })
          .fromTo(row.querySelector('.mw'), { opacity: 0, y: 140, skewY: 12 }, { opacity: 1, y: 0, skewY: 0, duration: 1.5, ease: 'expo.out' }, '-=0.2')
          .fromTo(row.querySelector('.mi'), { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 1.1, ease: 'expo.out' }, '-=1');
      });

      // SCENE 5
      gsap.fromTo(s5Ref.current,
        { opacity: 0 },
        { opacity: 1, ease: 'none', scrollTrigger: { trigger: s5Ref.current, start: 'top 100%', end: 'top 30%', scrub: true } }
      );
      ScrollTrigger.create({
        trigger: s5Ref.current, start: 'top 48%',
        onEnter: () => {
          gsap.fromTo('#s5l1', { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'expo.inOut', delay: 0.5 });
          gsap.fromTo('#s5l2', { scaleX: 0 }, { scaleX: 1, duration: 2.2, ease: 'expo.inOut', delay: 0.9 });
        }
      });

    }, wrapRef);
    return () => ctx.revert();
  }, [introDone]);

  const mods = [
    { n: '01', w: 'BRIEFING', t: 'Daily AI Briefing', d: 'Every morning, AI synthesizes your tasks, follow-ups, budget and career into one 30-second briefing.' },
    { n: '02', w: 'TASKS', t: 'Smart Task Engine', d: 'Add tasks. AI auto-prioritizes by deadline and energy. Your entire workday organized instantly.' },
    { n: '03', w: 'CAREER', t: 'Career Intelligence', d: 'Track certifications, skills, applications. AI maps your next move based on your exact target role.' },
    { n: '04', w: 'NETWORK', t: 'Network CRM', d: 'Log contacts, set follow-up reminders, AI drafts your outreach. Never lose a professional relationship.' },
    { n: '05', w: 'FINANCES', t: 'Expense Tracker', d: 'Log expenses in seconds. Auto-categorized. Monthly AI financial intelligence report generated.' },
    { n: '06', w: 'REPORTS', t: 'Monthly Intelligence', d: 'End of month — AI delivers your complete professional report. All in one.' },
  ];

  const cards = [
    { c: '#e0e0e0', l: 'TODAY', t: '4 tasks due — 2 high priority. Sprint review at 3PM.' },
    { c: '#9ab0c4', l: 'NETWORK', t: 'Follow up with Ankit. Last contact: 8 days ago.' },
    { c: '#9ac4aa', l: 'FINANCES', t: '₹1,600 left this month. On track vs last month.' },
    { c: '#b49ac4', l: 'CAREER', t: '3 lessons from AWS cert. Apply to 2 saved roles.' },
  ];

  return (
    <div ref={wrapRef} className="landing-shell" style={{ background: '#0e0e0e', fontFamily: 'Inter, Space Grotesk, sans-serif', overflowX: 'hidden', color: '#f5f5f5' }}>

      {!introDone && <Intro onDone={handleIntroDone} />}

      {/* NAV */}
      <nav className="landing-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24, padding: '18px 64px', background: 'rgba(8,8,8,0.94)', borderBottom: '1px solid rgba(245,245,245,0.04)', backdropFilter: 'blur(14px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f5f5f5' }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: '#f5f5f5', letterSpacing: '4px', fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>WORK</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(245,245,245,0.24)', letterSpacing: '4px', fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>AXIS</span>
        </div>
        <div style={{ display: 'flex', gap: 30, justifyContent: 'center', padding: '10px 18px', border: '1px solid rgba(245,245,245,0.08)', background: 'rgba(8,8,8,0.34)' }}>
          {[
            ['FEATURES', s2Ref],
            ['MODULES', s4Ref],
            ['INTELLIGENCE', s3Ref],
          ].map(([l, ref]) => (
            <span key={l} onClick={() => scrollToSection(ref)} style={{ fontSize: 11, color: 'rgba(245,245,245,0.25)', letterSpacing: '2.5px', cursor: 'pointer', transition: 'color 0.25s', fontFamily: 'Inter, Space Grotesk, sans-serif' }}
              onMouseEnter={e => e.target.style.color = '#f5f5f5'}
              onMouseLeave={e => e.target.style.color = 'rgba(245,245,245,0.25)'}>{l}</span>
          ))}
        </div>
        <button onClick={login}
          style={{ justifySelf: 'end', background: 'transparent', color: '#f5f5f5', border: '1px solid rgba(245,245,245,0.28)', padding: '10px 28px', fontSize: 11, letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'Inter, Space Grotesk, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0e0e0e'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5f5f5'; }}>
          SIGN IN →
        </button>
      </nav>

      {/* SCENE 1 — HERO */}
      <section ref={heroRef} className="hero-scene" style={{ height: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img ref={imgRef} src={heroCity} alt=""
          style={{ position: 'absolute', inset: '-10%', width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center', opacity: 0, willChange: 'transform' }} />
        <div id="hov" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,14,14,0.55) 0%, rgba(14,14,14,0.2) 45%, rgba(14,14,14,0.92) 100%)', opacity: 0.55, zIndex: 1 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", zIndex: 2, pointerEvents: 'none' }} />

        <div ref={textRef} className="hero-copy" style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '180px 40px 0', maxWidth: 1060, willChange: 'transform' }}>
          <div id="hl" style={{ fontSize: 10, color: 'rgba(245,245,245,0.42)', letterSpacing: '4px', marginBottom: 42, fontFamily: 'Space Mono, monospace', opacity: 0 }}>
            PROFESSIONAL INTELLIGENCE SYSTEM
          </div>
          <div style={{ marginBottom: 0, lineHeight: 0.95 }}>
            <div style={{ overflow: 'hidden', paddingBottom: '0.12em' }}>
              <div id="h1a" style={{ fontSize: 94, fontWeight: 800, color: '#ffffff', letterSpacing: 0, lineHeight: 1.04, display: 'block', opacity: 0, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>
                YOUR ENTIRE
              </div>
            </div>
            <div style={{ overflow: 'hidden', paddingBottom: '0.12em' }}>
              <div id="h1b" style={{ fontSize: 98, fontWeight: 500, color: 'rgba(245,245,245,0.76)', letterSpacing: 0, lineHeight: 1.04, display: 'block', opacity: 0, fontFamily: 'Bodoni Moda, Playfair Display, serif', fontStyle: 'italic' }}>
                Professional
              </div>
            </div>
            <div style={{ overflow: 'hidden', paddingBottom: '0.18em' }}>
              <div id="h1c" style={{ fontSize: 108, fontWeight: 800, WebkitTextStroke: '0.7px rgba(245,245,245,0.42)', color: '#f8f3ea', letterSpacing: 0, lineHeight: 1.1, display: 'block', opacity: 0, fontFamily: 'Bodoni Moda, Playfair Display, serif', textShadow: '0 18px 44px rgba(245,245,245,0.18)' }}>
                LIFE.
              </div>
            </div>
          </div>
          <p id="hsub" style={{ fontSize: 16, color: 'rgba(245,245,245,0.46)', lineHeight: 1.72, marginBottom: 32, maxWidth: 480, margin: '26px auto 32px', opacity: 0, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>
            One AI-powered workspace.<br />Tasks, career, network, finances.<br />Open it every morning.
          </p>
          <div id="hcta" style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 26, opacity: 0 }}>
            <button onClick={login}
              style={{ background: 'transparent', color: '#f5f5f5', border: '1px solid rgba(245,245,245,0.55)', padding: '17px 52px', fontSize: 12, letterSpacing: '3px', cursor: 'pointer', transition: 'all 0.4s ease', fontFamily: 'Inter, Space Grotesk, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#0e0e0e'; e.currentTarget.style.letterSpacing = '5px'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5f5f5'; e.currentTarget.style.letterSpacing = '3px'; }}>
              INITIALIZE WORKAXIS
            </button>
            <button onClick={() => scrollToSection(s3Ref)}
              style={{ background: 'transparent', color: 'rgba(245,245,245,0.35)', border: '1px solid rgba(245,245,245,0.1)', padding: '17px 52px', fontSize: 12, letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.4s ease', fontFamily: 'Inter, Space Grotesk, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f5f5f5'; e.currentTarget.style.borderColor = 'rgba(245,245,245,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,245,245,0.35)'; e.currentTarget.style.borderColor = 'rgba(245,245,245,0.1)'; }}>
              SEE HOW IT WORKS ↗
            </button>
          </div>
          <div id="hmeta" style={{ display: 'flex', gap: 44, justifyContent: 'center', flexWrap: 'wrap', opacity: 0 }}>
            {['NO CREDIT CARD', 'FREE FOREVER', '30 SECONDS SETUP'].map(m => (
              <span key={m} style={{ fontSize: 10, color: 'rgba(245,245,245,0.16)', letterSpacing: '2px', fontFamily: 'Space Mono, monospace' }}>✦ {m}</span>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 34, left: 64, display: 'flex', alignItems: 'center', gap: 14, zIndex: 3 }}>
          <div style={{ width: 54, height: 1, background: 'linear-gradient(to right, rgba(245,245,245,0.46), transparent)', animation: 'sp 2.5s ease-in-out infinite', transformOrigin: 'left' }} />
          <span style={{ fontSize: 9, color: 'rgba(245,245,245,0.18)', letterSpacing: '4px', fontFamily: 'Space Mono, monospace' }}>SCROLL</span>
        </div>
        <div style={{ position: 'absolute', bottom: 44, right: 64, zIndex: 3 }}>
          <span style={{ fontSize: 10, color: 'rgba(245,245,245,0.12)', letterSpacing: '2px', fontFamily: 'Space Mono, monospace' }}>BUILT BY MD ABDULLAH HYDER</span>
        </div>
      </section>

      {/* SCENE 2 — AWAKENING */}
      <section ref={s2Ref} className="scene-2" style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'inset(100% 0% 0% 0%)', position: 'relative', zIndex: 2, overflow: 'hidden', transformOrigin: 'center bottom' }}>
        <div id="s2grid" style={{ position: 'absolute', inset: '8% 7%', border: '1px solid rgba(247,243,235,0.045)', backgroundImage: 'linear-gradient(rgba(247,243,235,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(247,243,235,0.035) 1px, transparent 1px)', backgroundSize: '72px 72px', opacity: 0, transformOrigin: 'center', pointerEvents: 'none' }} />
        <div id="s2scan" style={{ position: 'absolute', left: 0, right: 0, top: '42%', height: 120, background: 'linear-gradient(180deg, transparent, rgba(247,243,235,0.055), transparent)', opacity: 0, pointerEvents: 'none' }} />
        <div id="s2shutterA" style={{ position: 'absolute', top: '19%', left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(247,243,235,0.18), transparent)', transformOrigin: 'left', transform: 'scaleX(0)' }} />
        <div id="s2shutterB" style={{ position: 'absolute', bottom: '19%', left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(247,243,235,0.12), transparent)', transformOrigin: 'right', transform: 'scaleX(0)' }} />
        <div className="scene-2-copy" style={{ textAlign: 'center', maxWidth: 880, padding: '0 40px', position: 'relative', zIndex: 2, perspective: 900 }}>
          <div id="s2e" style={{ fontSize: 10, color: 'rgba(245,245,245,0.16)', letterSpacing: '5px', marginBottom: 56, fontFamily: 'Space Mono, monospace', opacity: 0 }}>{'// INTRODUCING'}</div>
          <div id="s2lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 60, opacity: 0 }}>
            <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid rgba(245,245,245,0.6)' }} />
            <span style={{ fontSize: 52, fontWeight: 800, color: '#f5f5f5', letterSpacing: '8px', fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>WORK</span>
            <span style={{ fontSize: 52, fontWeight: 500, color: 'rgba(245,245,245,0.2)', letterSpacing: '8px', fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>AXIS</span>
          </div>
          <div id="s2dv" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,245,245,0.08), transparent)', marginBottom: 60, transformOrigin: 'left', transform: 'scaleX(0)' }} />
          <h2 className="scene-2-title" style={{ fontSize: 52, fontWeight: 700, color: '#f7f3eb', lineHeight: 1.28, letterSpacing: 0, marginBottom: 40, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>
            {'What if one system'.split(' ').map((w, i) => (
              <span key={i} className="s2w" style={{ display: 'inline-block', marginRight: '0.28em', opacity: 0 }}>{w}</span>
            ))}
            <br />
            {'knew everything about'.split(' ').map((w, i) => (
              <span key={i + 10} className="s2w" style={{ display: 'inline-block', marginRight: '0.28em', opacity: 0 }}>{w}</span>
            ))}
            <br />
            <span className="s2w" style={{ display: 'inline-block', marginRight: '0.28em', opacity: 0, fontStyle: 'italic', fontWeight: 400 }}>your</span>
            <span className="s2w" style={{ display: 'inline-block', marginRight: '0.28em', opacity: 0, fontStyle: 'italic', fontWeight: 400 }}>professional</span>
            <span className="s2w" style={{ display: 'inline-block', marginRight: '0.28em', opacity: 0, color: '#f7f3eb', fontWeight: 650 }}>life?</span>
          </h2>
          <p id="s2sb" style={{ fontSize: 11, color: 'rgba(245,245,245,0.16)', letterSpacing: '5px', fontFamily: 'Space Mono, monospace', opacity: 0 }}>
            TASKS · CAREER · NETWORK · FINANCES · AI
          </p>
        </div>
      </section>

      {/* SCENE 3 — THE BRIEFING */}
      <section ref={s3Ref} className="scene-3" style={{ minHeight: '100vh', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 64px', borderTop: '1px solid rgba(245,245,245,0.04)', position: 'relative', zIndex: 3 }}>
        <div className="scene-3-inner" style={{ display: 'flex', gap: 110, alignItems: 'center', maxWidth: 1140, width: '100%' }}>
          <div className="scene-3-copy" style={{ flex: 1 }}>
            <div id="s3t" style={{ fontSize: 10, color: 'rgba(245,245,245,0.18)', letterSpacing: '5px', marginBottom: 36, fontFamily: 'Space Mono, monospace', opacity: 0 }}>{'// GOOD MORNING'}</div>
            <h2 id="s3h" style={{ fontSize: 54, fontWeight: 700, color: '#f7f3eb', lineHeight: 1.22, letterSpacing: 0, marginBottom: 32, opacity: 0, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>
              Your entire<br />professional life,<br />
              <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'rgba(247,243,235,0.62)' }}>briefed in 30 seconds.</span>
            </h2>
            <p id="s3p" style={{ fontSize: 16, color: 'rgba(247,243,235,0.52)', lineHeight: 1.9, opacity: 0, maxWidth: 380, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>
              Every morning, WorkAxis AI synthesizes everything that matters — tasks, follow-ups, money, and your next career move.
            </p>
          </div>
          <div className="scene-3-cards" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cards.map((c, i) => (
              <div key={i} className="bc" style={{ background: 'rgba(245,245,245,0.02)', border: '1px solid rgba(245,245,245,0.05)', borderLeft: `2px solid ${c.c}`, padding: '22px 28px', opacity: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: c.c, letterSpacing: '3px', marginBottom: 10, fontFamily: 'Space Mono, monospace' }}>{c.l}</div>
                <div style={{ fontSize: 15, color: 'rgba(245,245,245,0.62)', lineHeight: 1.6, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>{c.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCENE 4 — MODULES */}
      <section ref={s4Ref} className="scene-4" style={{ background: '#0e0e0e', padding: '130px 64px', borderTop: '1px solid rgba(245,245,245,0.04)', position: 'relative', zIndex: 4 }}>
        <div className="scene-4-head" style={{ maxWidth: 660, marginBottom: 100 }}>
          <p style={{ fontSize: 10, color: 'rgba(245,245,245,0.16)', letterSpacing: '4px', marginBottom: 28, fontFamily: 'Space Mono, monospace' }}>{'// SIX MODULES · ONE SYSTEM'}</p>
          <h2 style={{ fontSize: 64, fontWeight: 700, color: '#f7f3eb', letterSpacing: 0, lineHeight: 1.16, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>
            Everything a serious<br />
            <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'rgba(247,243,235,0.58)' }}>professional needs.</span>
          </h2>
        </div>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          {mods.map((m, i) => (
            <div key={i} className="mr" style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(245,245,245,0.05)', padding: '56px 0', gap: 60 }}>
              <div className="mn" style={{ fontSize: 10, color: 'rgba(245,245,245,0.12)', letterSpacing: '2px', width: 36, flexShrink: 0, fontFamily: 'Space Mono, monospace', opacity: 0 }}>{m.n}</div>
              <div style={{ width: 430, overflow: 'visible', flexShrink: 0 }}>
                <div className="mw" style={{ fontSize: 66, fontWeight: 800, color: '#f7f3eb', letterSpacing: 0, lineHeight: 1.18, opacity: 0, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>{m.w}</div>
              </div>
              <div className="mi" style={{ flex: 1, opacity: 0 }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f5', marginBottom: 12, fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>{m.t}</h3>
                <p style={{ fontSize: 15, color: 'rgba(247,243,235,0.46)', lineHeight: 1.82, fontFamily: 'Inter, Space Grotesk, sans-serif' }}>{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCENE 5 — THE COMMAND */}
      <section ref={s5Ref} className="scene-5" style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(245,245,245,0.03)', opacity: 0, zIndex: 5, padding: '120px 0 100px' }}>
        <div id="s5l1" style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,245,245,0.04), transparent)', transformOrigin: 'left', transform: 'scaleX(0)' }} />
        <div id="s5l2" style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(245,245,245,0.03), transparent)', transformOrigin: 'left', transform: 'scaleX(0)' }} />
        <div className="command-wrap" style={{ position: 'relative', zIndex: 2, textAlign: 'left', width: 'min(960px, calc(100% - 96px))', marginTop: 72 }}>
          <CommandFinal onClick={login} />
        </div>
        <footer style={{ position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 64px' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(245,245,245,0.12)', letterSpacing: '4px', fontFamily: 'Bodoni Moda, Playfair Display, serif' }}>WORK<span style={{ fontWeight: 500 }}>AXIS</span></span>
          <span style={{ fontSize: 10, color: 'rgba(245,245,245,0.1)', fontFamily: 'Space Mono, monospace', letterSpacing: '1px' }}>BUILT BY MD ABDULLAH HYDER</span>
          <span style={{ fontSize: 10, color: 'rgba(245,245,245,0.1)', fontFamily: 'Space Mono, monospace' }}>ALL SYSTEMS OPERATIONAL</span>
        </footer>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;0,6..96,800;1,6..96,400;1,6..96,500;1,6..96,600;1,6..96,700&family=Inter:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: auto; }
        body { background: #0e0e0e; font-family: Inter, sans-serif; overflow-x: hidden; }
        .landing-shell {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #0e0e0e; }
        ::-webkit-scrollbar-thumb { background: rgba(245,245,245,0.12); }
        ::selection { background: #f5f5f5; color: #0e0e0e; }
        @keyframes sp {
          0%, 100% { opacity: 0.15; transform: scaleY(1); }
          50% { opacity: 0.6; transform: scaleY(1.6); }
        }

        @media (max-width: 1366px) {
          nav { padding: 16px 36px !important; }
          #h1a { font-size: 78px !important; }
          #h1b { font-size: 82px !important; }
          #h1c { font-size: 92px !important; }
          .mw { font-size: 56px !important; }
          .scene-3 { padding: 72px 44px !important; }
          .scene-3-inner { gap: 64px !important; }
          .scene-4 { padding: 110px 44px !important; }
        }

        @media (max-width: 1024px) {
          nav { grid-template-columns: 1fr !important; justify-items: center !important; gap: 12px !important; padding: 14px 22px !important; }
          nav > div:first-child { justify-content: center !important; }
          nav > div:nth-child(2) { max-width: 100% !important; overflow-x: auto !important; gap: 20px !important; }
          nav button { display: none !important; }
          .hero-scene { min-height: 760px !important; height: auto !important; }
          .hero-copy { padding: 170px 26px 88px !important; width: min(760px, 100%) !important; }
          #h1a { font-size: 64px !important; }
          #h1b { font-size: 68px !important; }
          #h1c { font-size: 78px !important; }
          #hcta { flex-direction: column !important; align-items: stretch !important; max-width: 420px !important; margin-left: auto !important; margin-right: auto !important; }
          #hcta button { width: 100% !important; }
          .scene-2 { min-height: auto !important; padding: 130px 0 120px !important; }
          .scene-2-copy { padding: 0 30px !important; width: 100% !important; }
          .scene-2-title { font-size: clamp(38px, 7vw, 56px) !important; line-height: 1.18 !important; }
          .scene-3 { min-height: auto !important; padding: 110px 32px !important; transform: none !important; }
          .scene-3-inner { flex-direction: column !important; align-items: stretch !important; gap: 46px !important; }
          .scene-3-copy,
          .scene-3-cards { width: 100% !important; }
          #s3h { font-size: clamp(42px, 7vw, 60px) !important; }
          #s3p { max-width: 620px !important; }
          .bc { width: 100% !important; }
          .scene-4 { padding: 110px 32px !important; }
          .scene-4-head { margin-bottom: 70px !important; }
          .scene-4-head h2 { font-size: clamp(42px, 7vw, 62px) !important; }
          .mr { gap: 28px !important; padding: 42px 0 !important; }
          .mr > div:nth-child(2) { width: 330px !important; }
          .mw { font-size: 46px !important; }
          .scene-5 { min-height: auto !important; padding: 110px 0 32px !important; opacity: 1 !important; }
          .command-wrap { width: calc(100% - 56px) !important; margin-top: 34px !important; }
        }

        @media (max-width: 760px) {
          nav { position: absolute !important; grid-template-columns: 1fr !important; padding: 18px 18px !important; background: rgba(8,8,8,0.86) !important; }
          nav > div:first-child span { font-size: 15px !important; letter-spacing: 3px !important; }
          nav > div:nth-child(2) { display: none !important; }
          .hero-scene { min-height: 100svh !important; height: auto !important; align-items: center !important; }
          .hero-scene img { inset: 0 !important; width: 100% !important; height: 100% !important; transform: none !important; }
          .hero-copy { padding: 132px 18px 76px !important; max-width: 100% !important; }
          #hl { font-size: 9px !important; letter-spacing: 2.8px !important; margin-bottom: 28px !important; }
          #h1a { font-size: clamp(38px, 14vw, 54px) !important; line-height: 1.04 !important; }
          #h1b { font-size: clamp(38px, 14vw, 54px) !important; line-height: 1.04 !important; }
          #h1c { font-size: clamp(46px, 16vw, 62px) !important; line-height: 1.08 !important; }
          #hsub { font-size: 14px !important; max-width: 320px !important; }
          #hcta { gap: 12px !important; max-width: 100% !important; }
          #hcta button { padding: 15px 18px !important; font-size: 10px !important; letter-spacing: 2px !important; }
          #hmeta { gap: 14px !important; }
          #hmeta span { font-size: 8px !important; letter-spacing: 1.4px !important; }
          .hero-scene > div[style*="bottom: 34px"],
          .hero-scene > div[style*="bottom: 44px"] { display: none !important; }
          section { overflow-x: hidden !important; }
          section[style*="min-height: 100vh"] { min-height: auto !important; }
          .scene-2 { min-height: auto !important; padding: 112px 0 96px !important; clip-path: none !important; transform: none !important; }
          #s2grid { inset: 0 !important; background-size: 44px 44px !important; }
          .scene-2-copy { padding: 0 20px !important; perspective: none !important; }
          #s2e { margin-bottom: 34px !important; }
          #s2lg { gap: 10px !important; margin-bottom: 38px !important; }
          #s2lg span { font-size: 27px !important; letter-spacing: 4px !important; }
          #s2lg > div { width: 10px !important; height: 10px !important; }
          #s2dv { margin-bottom: 38px !important; }
          .scene-2-title { font-size: clamp(31px, 10vw, 44px) !important; line-height: 1.18 !important; text-wrap: balance !important; margin-bottom: 28px !important; }
          .s2w { display: inline !important; white-space: normal !important; margin-right: 0.18em !important; }
          #s2sb { font-size: 9px !important; letter-spacing: 2.4px !important; line-height: 1.8 !important; }
          .scene-3 { padding: 92px 20px !important; background: #141414 !important; transform: none !important; opacity: 1 !important; }
          .scene-3-inner { gap: 34px !important; }
          #s3t { font-size: 9px !important; letter-spacing: 3px !important; margin-bottom: 24px !important; }
          #s3h { font-size: clamp(34px, 11vw, 46px) !important; line-height: 1.18 !important; margin-bottom: 22px !important; }
          #s3p { font-size: 14px !important; line-height: 1.72 !important; max-width: 100% !important; }
          .bc { padding: 18px !important; }
          .bc div:last-child { font-size: 14px !important; }
          .scene-4 { padding: 92px 20px !important; transform: none !important; }
          .scene-4-head { max-width: 100% !important; margin-bottom: 52px !important; }
          .scene-4-head h2 { font-size: clamp(34px, 11vw, 48px) !important; line-height: 1.16 !important; }
          .mr { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; padding: 32px 0 !important; }
          .mn { width: auto !important; }
          .mr > div:nth-child(2) { width: 100% !important; }
          .mw { font-size: clamp(36px, 13vw, 50px) !important; line-height: 1.08 !important; max-width: 100% !important; overflow-wrap: anywhere !important; }
          .mi h3 { font-size: 20px !important; }
          .mi p { font-size: 14px !important; line-height: 1.7 !important; }
          .scene-5 { min-height: auto !important; padding: 92px 0 0 !important; }
          .command-wrap { width: calc(100% - 36px) !important; margin-top: 0 !important; }
          .command-wrap > div { gap: 28px !important; }
          .command-wrap h2 { font-size: clamp(34px, 11vw, 46px) !important; }
          .command-wrap button { width: 100% !important; padding: 15px 18px !important; }
          footer { position: relative !important; bottom: auto !important; flex-direction: column !important; gap: 12px !important; padding: 36px 20px 0 !important; text-align: center !important; }
        }

        @media (max-width: 420px) {
          nav > div:first-child span { font-size: 14px !important; letter-spacing: 2.4px !important; }
          .hero-copy { padding-left: 16px !important; padding-right: 16px !important; }
          #h1a { font-size: clamp(36px, 13vw, 49px) !important; }
          #h1b { font-size: clamp(36px, 13vw, 49px) !important; }
          #h1c { font-size: clamp(44px, 15vw, 58px) !important; }
          #hsub { font-size: 13px !important; }
          .scene-2-title,
          #s3h,
          .scene-4-head h2 { text-align: left !important; }
          .scene-2-copy { text-align: left !important; }
          #s2lg { justify-content: flex-start !important; }
          #s2dv { margin-left: 0 !important; margin-right: 0 !important; }
          .mw { font-size: clamp(34px, 12vw, 46px) !important; }
        }
      `}</style>
    </div>
  );
}
