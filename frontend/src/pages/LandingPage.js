import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, animate } from 'framer-motion';
import { auth, provider } from '../firebase';
import { getAdditionalUserInfo, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Counter({ from, to, duration = 2 }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      onUpdate: (v) => setCount(Math.round(v)),
    });
    return controls.stop;
  }, [from, to, duration]);
  return <span>{count}</span>;
}

function TypeWriter({ text, speed = 40, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);
  return <span>{displayed}<span style={{ opacity: started && displayed.length < text.length ? 1 : 0, color: '#00D4FF' }}>|</span></span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(new Date());
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -80]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    const onMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    const ticker = setInterval(() => setTime(new Date()), 1000);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse); clearInterval(ticker); };
  }, []);

  const handleLogin = async () => {
    try {
      const credential = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(credential);
      navigate('/welcome', { state: { askName: Boolean(info?.isNewUser) } });
    }
    catch (e) { console.error(e); }
  };

  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <div style={s.root}>

      {/* SCANLINE OVERLAY */}
      <div style={s.scanline} />

      {/* NAV */}
      <motion.nav style={{ ...s.nav, ...(scrolled ? s.navSolid : {}) }}
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div style={s.navLeft}>
          <div style={s.navLogo}>
            <div style={s.logoRing} />
            <span style={s.logoText}>WORK<span style={s.logoCyan}>AXIS</span></span>
          </div>
          <div style={s.navStatus}>
            <div style={s.statusDot} />
            <span style={s.statusText}>SYSTEM ONLINE</span>
          </div>
        </div>
        <div style={s.navCenter}>
          {['FEATURES', 'MODULES', 'INTELLIGENCE', 'DEPLOY'].map(l => (
            <motion.span key={l} style={s.navLink} whileHover={{ color: '#00D4FF' }}>{l}</motion.span>
          ))}
        </div>
        <div style={s.navRight}>
          <span style={s.navTime}>{timeStr}</span>
          <motion.button onClick={handleLogin} style={s.navBtn}
            whileHover={{ boxShadow: '0 0 20px rgba(0,212,255,0.4)', borderColor: '#00D4FF' }}
            whileTap={{ scale: 0.96 }}>
            INITIALIZE →
          </motion.button>
        </div>
      </motion.nav>

      {/* HERO */}
      <motion.section style={{ ...s.hero, y: heroY }}>
        {/* Background grid */}
        <div style={s.grid} />

        {/* Orbs */}
        <div style={{
          ...s.orb1,
          transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 20}px)`
        }} />
        <div style={{
          ...s.orb2,
          transform: `translate(${-mousePos.x * 20}px, ${mousePos.y * 30}px)`
        }} />

        {/* Radar rings */}
        <div style={s.radarWrap}>
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i} style={{ ...s.radarRing, width: i * 120, height: i * 120 }}
              animate={{ opacity: [0.15, 0.05, 0.15] }}
              transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }} />
          ))}
          <motion.div style={s.radarDot}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }} />
        </div>

        <div style={s.heroInner}>
          {/* Top status bar */}
          <motion.div style={s.heroStatusBar}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <span style={s.heroStatusItem}>◈ AI CORE ACTIVE</span>
            <span style={s.heroStatusDivider}>|</span>
            <span style={s.heroStatusItem}>◈ GROQ LLM CONNECTED</span>
            <span style={s.heroStatusDivider}>|</span>
            <span style={s.heroStatusItem}>◈ ALL SYSTEMS GO</span>
          </motion.div>

          {/* Main heading */}
          <motion.div style={s.heroHeadWrap}
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <div style={s.heroLabel}>PROFESSIONAL INTELLIGENCE SYSTEM v2.0</div>
            <h1 style={s.h1}>
              <span style={s.h1White}>MEET YOUR</span><br />
              <span style={s.h1Cyan}>AI COMMAND</span><br />
              <span style={s.h1Outline}>CENTER.</span>
            </h1>
          </motion.div>

          {/* Typewriter sub */}
          <motion.div style={s.heroTypewrap}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <span style={s.heroTypeLabel}>// SYSTEM MESSAGE: </span>
            <span style={s.heroTypeText}>
              <TypeWriter
                text="WorkAxis unifies your tasks, career, network, and finances into one AI-powered workspace. The JARVIS for your professional life."
                speed={28}
                delay={1200}
              />
            </span>
          </motion.div>

          {/* CTA */}
          <motion.div style={s.heroCta}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}>
            <motion.button onClick={handleLogin} style={s.ctaPrimary}
              whileHover={{ boxShadow: '0 0 40px rgba(0,212,255,0.5)', scale: 1.02 }}
              whileTap={{ scale: 0.97 }}>
              <span style={s.ctaPrimaryInner}>⬡ ACTIVATE WORKAXIS</span>
            </motion.button>
            <motion.button style={s.ctaSecondary}
              whileHover={{ borderColor: '#00D4FF', color: '#00D4FF' }}
              whileTap={{ scale: 0.97 }}>
              VIEW DEMONSTRATION ↗
            </motion.button>
          </motion.div>

          <motion.div style={s.heroMeta}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <span style={s.heroMetaItem}>✓ NO CREDIT CARD</span>
            <span style={s.heroMetaItem}>✓ FREE FOREVER</span>
            <span style={s.heroMetaItem}>✓ 30 SECOND SETUP</span>
          </motion.div>
        </div>

        {/* JARVIS MOCKUP */}
        <motion.div style={s.mockupOuter}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>
          {/* Corner brackets */}
          <div style={{ ...s.corner, top: -2, left: -2, borderTop: '2px solid #00D4FF', borderLeft: '2px solid #00D4FF' }} />
          <div style={{ ...s.corner, top: -2, right: -2, borderTop: '2px solid #00D4FF', borderRight: '2px solid #00D4FF' }} />
          <div style={{ ...s.corner, bottom: -2, left: -2, borderBottom: '2px solid #00D4FF', borderLeft: '2px solid #00D4FF' }} />
          <div style={{ ...s.corner, bottom: -2, right: -2, borderBottom: '2px solid #00D4FF', borderRight: '2px solid #00D4FF' }} />

          <div style={s.mockup}>
            {/* Mockup topbar */}
            <div style={s.mockupTopBar}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57', '#FFBD2E', '#28CA42'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={s.mockupUrl}>
                <span style={{ color: '#00D4FF', marginRight: 6 }}>◈</span>
                workaxis.vercel.app/dashboard
              </div>
              <span style={s.mockupStatus}>LIVE</span>
            </div>

            {/* Mockup body */}
            <div style={s.mockupBody}>
              {/* Sidebar */}
              <div style={s.sidebar}>
                <div style={s.sidebarLogo}>WA</div>
                <div style={s.sidebarDivider} />
                {[
                  { icon: '⚡', label: 'Dashboard', active: true },
                  { icon: '✅', label: 'Tasks', active: false },
                  { icon: '📈', label: 'Career', active: false },
                  { icon: '🤝', label: 'Network', active: false },
                  { icon: '💰', label: 'Expenses', active: false },
                ].map((item, i) => (
                  <div key={i} style={{ ...s.sidebarItem, ...(item.active ? s.sidebarActive : {}) }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main */}
              <div style={s.mockupMain}>
                <div style={s.mockupTopRow}>
                  <div>
                    <div style={s.mockupGreeting}>Good morning, Hyder</div>
                    <div style={s.mockupSub}>AI Briefing ready · {new Date().toDateString()}</div>
                  </div>
                  <div style={s.mockupAvatar}>H</div>
                </div>

                {/* Briefing */}
                <div style={s.briefingBox}>
                  <div style={s.briefingBoxTop}>
                    <span style={s.briefingBoxLabel}>⚡ AI BRIEFING</span>
                    <span style={s.briefingBoxTime}>Generated just now</span>
                  </div>
                  {[
                    '4 tasks due today — 2 are high priority',
                    'Follow up with Ankit from last week',
                    '₹1,600 left in your monthly budget',
                    '3 lessons away from AWS Cloud cert',
                  ].map((line, i) => (
                    <div key={i} style={s.briefingLine}>
                      <div style={s.briefingBullet} />
                      {line}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div style={s.mockupStats}>
                  {[
                    { v: '12', l: 'Tasks Done', c: '#00D4FF' },
                    { v: '34', l: 'Contacts', c: '#7C3AED' },
                    { v: '₹1.6k', l: 'Budget Left', c: '#F97316' },
                    { v: '86%', l: 'Career Score', c: '#22C55E' },
                  ].map((st, i) => (
                    <div key={i} style={{ ...s.statBox, borderColor: st.c + '33' }}>
                      <div style={{ ...s.statVal, color: st.c }}>{st.v}</div>
                      <div style={s.statLabel}>{st.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* STATS TICKER */}
      <div style={s.statsTicker}>
        {[
          { label: 'APPS REPLACED', val: 5, suffix: '' },
          { label: 'MORNING BRIEFING', val: 30, suffix: 'S' },
          { label: 'AI MODELS', val: 1, suffix: '' },
          { label: 'COST TO START', val: 0, suffix: '₹' },
        ].map((st, i) => (
          <motion.div key={i} style={s.tickerItem}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}>
            <div style={s.tickerVal}>
              {st.suffix === '₹' ? '₹' : ''}
              <Counter from={0} to={st.val} duration={2} />
              {st.suffix !== '₹' ? st.suffix : ''}
            </div>
            <div style={s.tickerLabel}>{st.label}</div>
          </motion.div>
        ))}
      </div>

      {/* MODULES SECTION */}
      <section style={s.modulesSection}>
        <motion.div style={s.sectionHead}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>
          <div style={s.sectionEyebrow}>// SYSTEM MODULES</div>
          <h2 style={s.sectionH2}>
            Six intelligent modules.<br />
            <span style={s.sectionH2Cyan}>One unified system.</span>
          </h2>
          <p style={s.sectionSub}>
            Every tool a professional needs — engineered, connected, and powered by AI.
          </p>
        </motion.div>

        <div style={s.modulesGrid}>
          {[
            { id: '01', icon: '⚡', title: 'Daily AI Briefing', desc: 'Every morning, your AI generates a personalized briefing — tasks, follow-ups, budget, career tip. Your day in 30 seconds.', color: '#00D4FF', glow: 'rgba(0,212,255,0.15)' },
            { id: '02', icon: '✅', title: 'Smart Task Engine', desc: 'Add tasks. AI auto-prioritizes by deadline and importance. Your entire day organized before you even think.', color: '#7C3AED', glow: 'rgba(124,58,237,0.15)' },
            { id: '03', icon: '📈', title: 'Career Intelligence', desc: 'Track certifications, skills, applications. AI maps your next move based on your exact target role and timeline.', color: '#F97316', glow: 'rgba(249,115,22,0.15)' },
            { id: '04', icon: '🤝', title: 'Network CRM', desc: 'Log contacts, set follow-up reminders, AI drafts your messages. Never lose a professional relationship.', color: '#22C55E', glow: 'rgba(34,197,94,0.15)' },
            { id: '05', icon: '💰', title: 'Expense Tracker', desc: 'Quick-log expenses in seconds. Auto-categorized. AI generates your monthly financial intelligence report.', color: '#EAB308', glow: 'rgba(234,179,8,0.15)' },
            { id: '06', icon: '📊', title: 'Monthly Reports', desc: 'End of month — AI delivers full professional intelligence. Tasks, career, network, finances. All in one report.', color: '#EC4899', glow: 'rgba(236,72,153,0.15)' },
          ].map((mod, i) => (
            <motion.div key={i} style={{ ...s.moduleCard, '--glow': mod.glow }}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              whileHover={{ y: -8, boxShadow: `0 24px 60px ${mod.glow}, 0 0 0 1px ${mod.color}33` }}>
              <div style={s.moduleTop}>
                <span style={{ ...s.moduleId, color: mod.color }}>{mod.id}</span>
                <div style={{ ...s.moduleIconBox, background: mod.glow, border: `1px solid ${mod.color}33` }}>
                  {mod.icon}
                </div>
              </div>
              <h3 style={{ ...s.moduleTitle, color: '#E8F4F8' }}>{mod.title}</h3>
              <p style={s.moduleDesc}>{mod.desc}</p>
              <div style={{ ...s.moduleBar, background: mod.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* DARK MANIFESTO */}
      <section style={s.manifesto}>
        <motion.div style={s.manifestoInner}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}>
          <div style={s.manifestoEyebrow}>// CORE DIRECTIVE</div>
          <h2 style={s.manifestoH2}>
            "Stop managing five apps.<br />
            <em style={s.manifestoEm}>Start commanding one."</em>
          </h2>
          <p style={s.manifestoBody}>
            WorkAxis was built on a simple idea — professionals shouldn't spend their energy
            managing tools. They should spend it on work that matters.
            We built the JARVIS for your career. Intelligent. Always on. Completely personal.
          </p>
          <div style={s.manifestoLine} />
          <div style={s.manifestoQuote}>
            <span style={s.manifestoQuoteText}>Inspired by JARVIS — Tony Stark's AI assistant.</span>
            <span style={s.manifestoQuoteText}>Built for the real world professional.</span>
          </div>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section style={s.finalCta}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}>
          {/* Corner decorations */}
          <div style={s.ctaDecorTL} />
          <div style={s.ctaDecorBR} />

          <div style={s.finalCtaEyebrow}>// READY TO ACTIVATE</div>
          <h2 style={s.finalCtaH2}>
            Your professional life,<br />
            <span style={s.finalCtaCyan}>intelligently organized.</span>
          </h2>
          <p style={s.finalCtaSub}>
            Join professionals who replaced five apps with one AI-powered command center.
          </p>
          <motion.button onClick={handleLogin} style={s.finalCtaBtn}
            whileHover={{ boxShadow: '0 0 60px rgba(0,212,255,0.5)', scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            ⬡ ACTIVATE WORKAXIS — FREE
          </motion.button>
          <p style={s.finalCtaNote}>No credit card · Free forever · 30 seconds to set up</p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>
          <div style={s.logoRing} />
          <span style={s.logoText}>WORK<span style={s.logoCyan}>AXIS</span></span>
        </div>
        <p style={s.footerTagline}>The AI command center for serious professionals.</p>
        <p style={s.footerCopy}>© 2025 WorkAxis · All systems operational</p>
      </footer>
    </div>
  );
}

const s = {
  root: { minHeight: '100vh', background: '#080C14', fontFamily: "'Inter', -apple-system, sans-serif", overflowX: 'hidden', color: '#E8F4F8' },
  scanline: { position: 'fixed', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)', pointerEvents: 'none', zIndex: 9999 },

  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 60px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, transition: 'all 0.4s ease' },
  navSolid: { background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,212,255,0.1)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 20 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoRing: { width: 10, height: 10, borderRadius: '50%', border: '2px solid #00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.6)' },
  logoText: { fontSize: 16, fontWeight: 800, letterSpacing: '3px', color: '#fff' },
  logoCyan: { color: '#00D4FF' },
  navStatus: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', padding: '4px 12px', borderRadius: 4 },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' },
  statusText: { fontSize: 10, fontWeight: 700, color: '#22C55E', letterSpacing: '1.5px' },
  navCenter: { display: 'flex', gap: 40 },
  navLink: { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '2px', cursor: 'pointer', transition: 'color 0.2s' },
  navRight: { display: 'flex', alignItems: 'center', gap: 20 },
  navTime: { fontSize: 13, fontWeight: 600, color: '#00D4FF', letterSpacing: '2px', fontVariantNumeric: 'tabular-nums' },
  navBtn: { background: 'transparent', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.4)', padding: '9px 22px', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.2s' },

  hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 130, position: 'relative', overflow: 'hidden' },
  grid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)', backgroundSize: '50px 50px', zIndex: 0 },
  orb1: { position: 'absolute', top: '-10%', left: '20%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', transition: 'transform 0.15s ease', zIndex: 0 },
  orb2: { position: 'absolute', bottom: '5%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', pointerEvents: 'none', transition: 'transform 0.15s ease', zIndex: 0 },
  radarWrap: { position: 'absolute', top: '15%', right: '8%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 },
  radarRing: { position: 'absolute', borderRadius: '50%', border: '1px solid rgba(0,212,255,0.2)' },
  radarDot: { width: 8, height: 8, borderRadius: '50%', background: '#00D4FF', boxShadow: '0 0 12px rgba(0,212,255,0.8)', position: 'absolute' },

  heroInner: { position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 40px', maxWidth: 900, margin: '0 auto' },
  heroStatusBar: { display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 32, flexWrap: 'wrap' },
  heroStatusItem: { fontSize: 11, fontWeight: 600, color: 'rgba(0,212,255,0.6)', letterSpacing: '1.5px' },
  heroStatusDivider: { color: 'rgba(0,212,255,0.2)', fontSize: 11 },

  heroHeadWrap: { marginBottom: 28 },
  heroLabel: { fontSize: 11, fontWeight: 700, color: 'rgba(0,212,255,0.4)', letterSpacing: '3px', marginBottom: 20 },
  h1: { fontSize: 84, fontWeight: 900, lineHeight: 1.02, letterSpacing: '-2px', margin: 0 },
  h1White: { color: '#fff' },
  h1Cyan: { color: '#00D4FF', textShadow: '0 0 40px rgba(0,212,255,0.4)' },
  h1Outline: { WebkitTextStroke: '2px rgba(255,255,255,0.25)', color: 'transparent' },

  heroTypewrap: { marginBottom: 40, maxWidth: 680, margin: '0 auto 40px', textAlign: 'left', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 6, padding: '16px 20px' },
  heroTypeLabel: { fontSize: 12, color: 'rgba(0,212,255,0.5)', fontFamily: 'monospace', marginRight: 8 },
  heroTypeText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontFamily: 'monospace' },

  heroCta: { display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 },
  ctaPrimary: { background: 'linear-gradient(135deg, #00D4FF, #0094FF)', color: '#000', border: 'none', padding: '16px 36px', borderRadius: 6, fontSize: 13, fontWeight: 800, cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.2s' },
  ctaPrimaryInner: { display: 'flex', alignItems: 'center', gap: 8 },
  ctaSecondary: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', padding: '16px 36px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.2s' },

  heroMeta: { display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' },
  heroMetaItem: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '1px' },

  mockupOuter: { position: 'relative', width: '88%', maxWidth: 920, margin: '60px auto 0', zIndex: 2 },
  corner: { position: 'absolute', width: 20, height: 20, zIndex: 3 },
  mockup: { background: '#0D1220', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(0,212,255,0.05)' },
  mockupTopBar: { background: '#080C14', borderBottom: '1px solid rgba(0,212,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mockupUrl: { flex: 1, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' },
  mockupStatus: { fontSize: 10, fontWeight: 700, color: '#22C55E', letterSpacing: '2px', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: 3 },
  mockupBody: { display: 'flex', height: 320 },
  sidebar: { width: 180, borderRight: '1px solid rgba(0,212,255,0.08)', padding: '20px 12px', background: '#080C14', display: 'flex', flexDirection: 'column', gap: 2 },
  sidebarLogo: { fontSize: 16, fontWeight: 900, color: '#00D4FF', letterSpacing: '2px', padding: '0 8px 14px', textShadow: '0 0 20px rgba(0,212,255,0.5)' },
  sidebarDivider: { height: 1, background: 'rgba(0,212,255,0.08)', margin: '0 8px 12px' },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500, cursor: 'pointer' },
  sidebarActive: { background: 'rgba(0,212,255,0.08)', color: '#00D4FF', fontWeight: 700, border: '1px solid rgba(0,212,255,0.1)' },
  mockupMain: { flex: 1, padding: '22px 26px', background: '#0D1220' },
  mockupTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  mockupGreeting: { fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' },
  mockupSub: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 },
  mockupAvatar: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #00D4FF, #0094FF)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 },
  briefingBox: { background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 8, padding: '14px 18px', marginBottom: 14 },
  briefingBoxTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  briefingBoxLabel: { fontSize: 10, fontWeight: 700, color: '#00D4FF', letterSpacing: '1.5px' },
  briefingBoxTime: { fontSize: 10, color: 'rgba(255,255,255,0.2)' },
  briefingLine: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 6, lineHeight: 1.4 },
  briefingBullet: { width: 4, height: 4, borderRadius: '50%', background: '#00D4FF', flexShrink: 0 },
  mockupStats: { display: 'flex', gap: 10 },
  statBox: { flex: 1, borderRadius: 8, padding: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid transparent', transition: 'all 0.2s' },
  statVal: { fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontWeight: 600, letterSpacing: '0.5px' },

  statsTicker: { display: 'flex', justifyContent: 'center', gap: 0, background: 'rgba(0,212,255,0.04)', borderTop: '1px solid rgba(0,212,255,0.08)', borderBottom: '1px solid rgba(0,212,255,0.08)', padding: '48px 60px' },
  tickerItem: { flex: 1, textAlign: 'center', borderRight: '1px solid rgba(0,212,255,0.08)', padding: '0 40px' },
  tickerVal: { fontSize: 52, fontWeight: 900, color: '#00D4FF', letterSpacing: '-2px', textShadow: '0 0 30px rgba(0,212,255,0.3)' },
  tickerLabel: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginTop: 8 },

  modulesSection: { padding: '120px 60px', background: '#080C14' },
  sectionHead: { textAlign: 'center', marginBottom: 72 },
  sectionEyebrow: { fontSize: 12, fontWeight: 700, color: 'rgba(0,212,255,0.5)', letterSpacing: '2px', marginBottom: 20, fontFamily: 'monospace' },
  sectionH2: { fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 },
  sectionH2Cyan: { color: '#00D4FF', textShadow: '0 0 30px rgba(0,212,255,0.3)' },
  sectionSub: { fontSize: 17, color: 'rgba(255,255,255,0.4)', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 },
  modulesGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1060, margin: '0 auto' },
  moduleCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '32px', transition: 'all 0.3s', cursor: 'default', position: 'relative', overflow: 'hidden' },
  moduleTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  moduleId: { fontSize: 11, fontWeight: 800, letterSpacing: '2px' },
  moduleIconBox: { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  moduleTitle: { fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px' },
  moduleDesc: { fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 },
  moduleBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.5 },

  manifesto: { padding: '120px 60px', background: 'linear-gradient(180deg, #080C14 0%, #0D1525 50%, #080C14 100%)', textAlign: 'center', borderTop: '1px solid rgba(0,212,255,0.06)', borderBottom: '1px solid rgba(0,212,255,0.06)' },
  manifestoInner: { maxWidth: 720, margin: '0 auto' },
  manifestoEyebrow: { fontSize: 12, fontWeight: 700, color: 'rgba(0,212,255,0.4)', letterSpacing: '2px', marginBottom: 28, fontFamily: 'monospace' },
  manifestoH2: { fontSize: 46, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.2, marginBottom: 28 },
  manifestoEm: { fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#00D4FF', textShadow: '0 0 20px rgba(0,212,255,0.3)' },
  manifestoBody: { fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 48 },
  manifestoLine: { height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)', marginBottom: 32 },
  manifestoQuote: { display: 'flex', flexDirection: 'column', gap: 8 },
  manifestoQuoteText: { fontSize: 14, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' },

  finalCta: { padding: '120px 60px', textAlign: 'center', background: '#080C14', position: 'relative' },
  ctaDecorTL: { position: 'absolute', top: 40, left: 60, width: 60, height: 60, borderTop: '1px solid rgba(0,212,255,0.2)', borderLeft: '1px solid rgba(0,212,255,0.2)' },
  ctaDecorBR: { position: 'absolute', bottom: 40, right: 60, width: 60, height: 60, borderBottom: '1px solid rgba(0,212,255,0.2)', borderRight: '1px solid rgba(0,212,255,0.2)' },
  finalCtaEyebrow: { fontSize: 12, fontWeight: 700, color: 'rgba(0,212,255,0.4)', letterSpacing: '3px', marginBottom: 24, fontFamily: 'monospace' },
  finalCtaH2: { fontSize: 60, fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 20 },
  finalCtaCyan: { color: '#00D4FF', textShadow: '0 0 40px rgba(0,212,255,0.4)' },
  finalCtaSub: { fontSize: 17, color: 'rgba(255,255,255,0.4)', marginBottom: 48, lineHeight: 1.7 },
  finalCtaBtn: { background: 'linear-gradient(135deg, #00D4FF, #0094FF)', color: '#000', border: 'none', padding: '18px 48px', borderRadius: 6, fontSize: 14, fontWeight: 900, cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.2s', display: 'inline-block' },
  finalCtaNote: { fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 20, letterSpacing: '0.5px' },

  footer: { borderTop: '1px solid rgba(0,212,255,0.08)', padding: '28px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#080C14' },
  footerLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  footerTagline: { fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0 },
  footerCopy: { fontSize: 13, color: 'rgba(255,255,255,0.15)', margin: 0 },
};
