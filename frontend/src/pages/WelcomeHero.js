import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckSquare,
  LogOut,
  Network,
  Radar,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

const WELCOME_HERO_IMAGE = 'https://images.pexels.com/photos/10772747/pexels-photo-10772747.jpeg?auto=compress&cs=tinysrgb&w=2600';
const WELCOME_IMAGE_SOURCE = 'https://www.pexels.com/photo/black-and-white-photo-of-an-office-building-10772747/';

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ');

const getFallbackName = (user) => {
  const googleName = normalizeName(user?.displayName || '').split(' ')[0];
  const emailName = normalizeName(user?.email?.split('@')[0] || '');
  return googleName || emailName || 'Professional';
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still building';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Working late';
};

const pickSessionIndex = (length) => Math.floor(Math.random() * length);

const getViewportMode = () => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width <= 700) return 'mobile';
  if (width <= 1024) return 'tablet';
  if (width <= 1366) return 'laptop';
  return 'desktop';
};

export default function WelcomeHero() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const askNameFromAuth = Boolean(location.state?.askName);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needsName, setNeedsName] = useState(false);
  const [preferredName, setPreferredName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [error, setError] = useState('');
  const [viewportMode, setViewportMode] = useState(() => getViewportMode());
  const [phraseIndex] = useState(() => pickSessionIndex(8));
  const [workspaceStats, setWorkspaceStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    totalExpenses: 0,
    contacts: 0,
  });

  const fallbackName = useMemo(() => getFallbackName(user), [user]);
  const displayName = preferredName || fallbackName;
  const timeGreeting = useMemo(() => getTimeGreeting(), []);

  const phrases = useMemo(() => ([
    `${timeGreeting}, ${displayName}.`,
    `${displayName} returns.`,
    `Welcome back, ${displayName}.`,
    `${displayName}, your day is ready.`,
    `Back in command, ${displayName}.`,
    `WorkAxis is awake, ${displayName}.`,
    `${displayName}, your command center is live.`,
    `Focus mode is ready, ${displayName}.`,
  ]), [displayName, timeGreeting]);

  const dateLabel = useMemo(() => (
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  ), []);

  const commandMetrics = useMemo(() => ([
    { label: 'Pending', value: workspaceStats.pendingTasks },
    { label: 'Completed', value: workspaceStats.completedTasks },
    { label: 'Spent', value: `₹${workspaceStats.totalExpenses.toLocaleString('en-IN')}` },
    { label: 'Contacts', value: workspaceStats.contacts },
  ]), [workspaceStats]);

  const featureStack = useMemo(() => ([
    {
      Icon: Sparkles,
      label: 'AI Briefing',
      value: 'Generate the day in one executive summary.',
      tab: 'dashboard',
    },
    {
      Icon: CheckSquare,
      label: 'Priority Queue',
      value: `${workspaceStats.pendingTasks} open item${workspaceStats.pendingTasks === 1 ? '' : 's'} waiting for focus.`,
      tab: 'tasks',
    },
    {
      Icon: WalletCards,
      label: 'Money Pulse',
      value: `₹${workspaceStats.totalExpenses.toLocaleString('en-IN')} tracked across your workspace.`,
      tab: 'expenses',
    },
    {
      Icon: Network,
      label: 'Relationship Radar',
      value: `${workspaceStats.contacts} professional contact${workspaceStats.contacts === 1 ? '' : 's'} in memory.`,
      tab: 'network',
    },
    {
      Icon: BriefcaseBusiness,
      label: 'Career Track',
      value: 'Goals, certifications, and next moves stay visible.',
      tab: 'career',
    },
    {
      Icon: Radar,
      label: 'Monthly Report',
      value: 'A professional snapshot across work, money, and network.',
      tab: 'reports',
    },
  ]), [workspaceStats]);

  useEffect(() => {
    const handleResize = () => setViewportMode(getViewportMode());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    let alive = true;

    const loadProfile = async () => {
      setLoading(true);
      let savedName = '';
      let loadedStats = {
        pendingTasks: 0,
        completedTasks: 0,
        totalExpenses: 0,
        contacts: 0,
      };

      try {
        const [profileSnap, taskSnap, expenseSnap, contactSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDocs(query(collection(db, 'tasks'), where('uid', '==', user.uid))),
          getDocs(query(collection(db, 'expenses'), where('uid', '==', user.uid))),
          getDocs(query(collection(db, 'contacts'), where('uid', '==', user.uid))),
        ]);
        if (profileSnap.exists()) {
          savedName = normalizeName(profileSnap.data()?.preferredName || '');
        }
        const loadedTasks = taskSnap.docs.map((taskDoc) => taskDoc.data());
        const loadedExpenses = expenseSnap.docs.map((expenseDoc) => expenseDoc.data());
        loadedStats = {
          pendingTasks: loadedTasks.filter((task) => !task.done).length,
          completedTasks: loadedTasks.filter((task) => task.done).length,
          totalExpenses: loadedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
          contacts: contactSnap.size,
        };
      } catch (profileError) {
        console.error(profileError);
      }

      if (!alive) return;

      const resolvedName = savedName || fallbackName;
      setPreferredName(resolvedName);
      setNameDraft(savedName || fallbackName);
      setWorkspaceStats(loadedStats);
      setNeedsName(askNameFromAuth || !savedName);
      setLoading(false);
    };

    loadProfile();

    return () => {
      alive = false;
    };
  }, [askNameFromAuth, fallbackName, navigate, user]);

  const saveName = async (event) => {
    event.preventDefault();

    if (!user) return;

    const cleanName = normalizeName(nameDraft);
    if (!cleanName) {
      setError('Enter the name WorkAxis should use.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await Promise.all([
        updateProfile(user, { displayName: cleanName }),
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || '',
          preferredName: cleanName,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true }),
      ]);

      setPreferredName(cleanName);
      setNeedsName(false);
    } catch (saveError) {
      console.error(saveError);
      setError('Could not save the name yet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const openDashboard = (tab = 'dashboard') => {
    navigate('/dashboard', { state: { tab } });
  };

  const isMobile = viewportMode === 'mobile';
  const isTablet = viewportMode === 'tablet';
  const isLaptop = viewportMode === 'laptop';
  const compactViewport = isMobile || isTablet;
  const midViewport = isTablet || isLaptop;

  if (loading) {
    return (
      <div style={w.root}>
        <div style={w.loadingMark}>WORK<span style={w.logoSoft}>AXIS</span></div>
      </div>
    );
  }

  if (needsName) {
    return (
      <div style={{ ...w.root, ...(compactViewport ? w.rootCompact : {}) }}>
        <img src={WELCOME_HERO_IMAGE} alt="" style={{ ...w.bgImage, ...(compactViewport ? w.bgImageCompact : {}) }} />
        <div style={{ ...w.overlay, ...(compactViewport ? w.overlayCompact : {}) }} />
        <div style={w.noise} />

        <nav style={{ ...w.nav, ...(midViewport ? w.navLaptop : {}), ...(compactViewport ? w.navCompact : {}) }}>
          <div style={{ ...w.brand, ...(isMobile ? w.brandMobile : {}) }}>
            <span style={w.brandDot} />
            <span style={w.brandStrong}>WORK</span>
            <span style={w.logoSoft}>AXIS</span>
          </div>
          <button type="button" onClick={logout} style={{ ...w.quietButton, ...(isMobile ? w.quietButtonMobile : {}) }}>
            <LogOut size={15} strokeWidth={1.8} />
            Sign out
          </button>
        </nav>

        <main style={{ ...w.nameStage, ...(compactViewport ? w.nameStageCompact : {}) }}>
          <form onSubmit={saveName} style={{ ...w.namePanel, ...(isMobile ? w.namePanelMobile : {}), ...(isTablet ? w.namePanelTablet : {}) }}>
            <div style={w.kicker}>PROFILE SETUP</div>
            <h1 style={{ ...w.nameTitle, ...(isMobile ? w.nameTitleMobile : {}), ...(isTablet ? w.nameTitleTablet : {}) }}>What should WorkAxis call you?</h1>
            <input
              autoFocus
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              placeholder="Hyder"
              style={w.nameInput}
            />
            {error && <div style={w.errorText}>{error}</div>}
            <button type="submit" disabled={saving} style={{ ...w.primaryButton, ...(saving ? w.disabledButton : {}) }}>
              {saving ? 'Saving' : 'Continue'}
              <ArrowRight size={16} strokeWidth={1.8} />
            </button>
          </form>
        </main>

        <style>{welcomeCss}</style>
      </div>
    );
  }

  return (
    <div style={{ ...w.root, ...(compactViewport ? w.rootCompact : {}) }}>
      <img src={WELCOME_HERO_IMAGE} alt="" style={{ ...w.bgImage, ...(compactViewport ? w.bgImageCompact : {}) }} />
      <div style={{ ...w.heroOverlay, ...(compactViewport ? w.heroOverlayCompact : {}), ...(isLaptop ? w.heroOverlayLaptop : {}) }} />
      <div style={w.noise} />

      <nav style={{ ...w.nav, ...(midViewport ? w.navLaptop : {}), ...(compactViewport ? w.navCompact : {}) }}>
        <div style={{ ...w.brand, ...(isMobile ? w.brandMobile : {}) }}>
          <span style={w.brandDot} />
          <span style={w.brandStrong}>WORK</span>
          <span style={w.logoSoft}>AXIS</span>
        </div>
        <button type="button" onClick={logout} style={{ ...w.quietButton, ...(isMobile ? w.quietButtonMobile : {}) }}>
          <LogOut size={15} strokeWidth={1.8} />
          Sign out
        </button>
      </nav>

      <main style={{ ...w.hero, ...(isLaptop ? w.heroLaptop : {}), ...(compactViewport ? w.heroCompact : {}), ...(isMobile ? w.heroMobile : {}) }}>
        <div style={{ ...w.heroCopy, ...(isLaptop ? w.heroCopyLaptop : {}), ...(compactViewport ? w.heroCopyCompact : {}) }}>
          <div style={{ ...w.kicker, ...(isMobile ? w.kickerMobile : {}) }}>PRIVATE WORKSPACE · {dateLabel}</div>
          <h1 key={phrases[phraseIndex]} style={{ ...w.heroTitle, ...(isLaptop ? w.heroTitleLaptop : {}), ...(isTablet ? w.heroTitleTablet : {}), ...(isMobile ? w.heroTitleMobile : {}) }}>{phrases[phraseIndex]}</h1>
          <p style={{ ...w.heroText, ...(compactViewport ? w.heroTextCompact : {}) }}>
            WorkAxis has your briefing, tasks, finances, and network waiting in one clean command center.
          </p>

          <div style={{ ...w.heroActions, ...(isMobile ? w.heroActionsMobile : {}) }}>
            <button type="button" onClick={() => openDashboard('dashboard')} style={{ ...w.primaryButton, ...(isMobile ? w.actionButtonMobile : {}) }}>
              Enter dashboard
              <ArrowRight size={17} strokeWidth={1.8} />
            </button>
            <button type="button" onClick={() => setNeedsName(true)} style={{ ...w.secondaryButton, ...(isMobile ? w.actionButtonMobile : {}) }}>
              Change name
            </button>
          </div>
        </div>

        <aside style={{ ...w.briefPanel, ...(isLaptop ? w.briefPanelLaptop : {}), ...(compactViewport ? w.briefPanelCompact : {}) }}>
          <div style={{ ...w.briefHeader, ...(isMobile ? w.briefHeaderMobile : {}) }}>
            <BriefcaseBusiness size={16} strokeWidth={1.7} />
            WorkAxis Cockpit
          </div>

          <div style={{ ...w.metricGrid, ...(compactViewport ? w.metricGridCompact : {}) }}>
            {commandMetrics.map((metric) => (
              <div key={metric.label} style={w.metricCell}>
                <div style={{ ...w.metricValue, ...(isMobile ? w.metricValueMobile : {}) }}>{metric.value}</div>
                <div style={w.metricLabel}>{metric.label}</div>
              </div>
            ))}
          </div>

          <div style={w.stackHeader}>
            <Radar size={15} strokeWidth={1.7} />
            Command stack
          </div>

          {featureStack.map(({ Icon, label, value, tab }) => (
            <button key={label} type="button" onClick={() => openDashboard(tab)} style={{ ...w.briefRow, ...(isMobile ? w.briefRowMobile : {}) }}>
              <span style={w.rowIcon}>
                <Icon size={15} strokeWidth={1.8} />
              </span>
              <span style={w.rowCopy}>
                <span style={w.briefLabel}>{label}</span>
                <span style={w.briefValue}>{value}</span>
              </span>
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>
          ))}

          <a href={WELCOME_IMAGE_SOURCE} target="_blank" rel="noreferrer" style={w.photoCredit}>
            Image: Brett Sayles / Pexels
          </a>
        </aside>
      </main>

      <style>{welcomeCss}</style>
    </div>
  );
}

const welcomeCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; }
  body { cursor: auto; background: #080808; }
  button { cursor: pointer; }
  a { cursor: pointer; }
  input { cursor: text; }

  @keyframes heroIn {
    from { opacity: 0; transform: translateY(22px); filter: blur(8px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }

  @keyframes phraseIn {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const w = {
  root: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#080808',
    color: '#f7f3eb',
    fontFamily: 'Inter, Space Grotesk, sans-serif',
  },
  rootCompact: {
    minHeight: '100svh',
    overflow: 'auto',
  },
  bgImage: {
    position: 'absolute',
    inset: '-7%',
    width: '114%',
    height: '114%',
    objectFit: 'cover',
    objectPosition: 'center',
    filter: 'saturate(0.78) contrast(1.08)',
    opacity: 0.5,
  },
  bgImageCompact: {
    inset: 0,
    width: '100%',
    height: '100%',
    position: 'fixed',
    objectPosition: 'center top',
    opacity: 0.42,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(8,8,8,0.94), rgba(8,8,8,0.76) 48%, rgba(8,8,8,0.94))',
  },
  overlayCompact: {
    position: 'fixed',
    background: 'linear-gradient(180deg, rgba(8,8,8,0.94), rgba(8,8,8,0.84) 42%, rgba(8,8,8,0.97))',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 80% 38%, rgba(247,243,235,0.13), transparent 29%), linear-gradient(90deg, rgba(8,8,8,0.97), rgba(8,8,8,0.76) 50%, rgba(8,8,8,0.66) 100%)',
  },
  heroOverlayLaptop: {
    background: 'radial-gradient(circle at 74% 35%, rgba(247,243,235,0.1), transparent 24%), linear-gradient(90deg, rgba(8,8,8,0.97), rgba(8,8,8,0.82) 54%, rgba(8,8,8,0.72) 100%)',
  },
  heroOverlayCompact: {
    position: 'fixed',
    background: 'linear-gradient(180deg, rgba(8,8,8,0.92), rgba(8,8,8,0.83) 40%, rgba(8,8,8,0.98) 100%)',
  },
  noise: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.035,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
  },
  nav: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '26px 56px',
  },
  navLaptop: {
    padding: '22px 36px',
  },
  navCompact: {
    padding: '18px 20px 8px',
    gap: 14,
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    letterSpacing: 4,
    fontFamily: 'Newsreader, Cormorant Garamond, serif',
  },
  brandMobile: {
    gap: 8,
    letterSpacing: 3,
    minWidth: 0,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#f7f3eb',
    display: 'inline-block',
  },
  brandStrong: {
    fontSize: 17,
    fontWeight: 700,
  },
  logoSoft: {
    color: 'rgba(247,243,235,0.32)',
    fontWeight: 400,
  },
  quietButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(247,243,235,0.03)',
    color: 'rgba(247,243,235,0.64)',
    border: '1px solid rgba(247,243,235,0.12)',
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
  },
  quietButtonMobile: {
    padding: '9px 10px',
    fontSize: 11,
    gap: 6,
    flexShrink: 0,
  },
  nameStage: {
    minHeight: 'calc(100vh - 90px)',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px 80px',
  },
  nameStageCompact: {
    minHeight: 'auto',
    alignItems: 'flex-start',
    padding: '42px 18px 60px',
  },
  namePanel: {
    width: 'min(560px, 100%)',
    border: '1px solid rgba(247,243,235,0.13)',
    background: 'rgba(8,8,8,0.58)',
    backdropFilter: 'blur(18px)',
    borderRadius: 8,
    padding: '44px',
    boxShadow: '0 28px 80px rgba(0,0,0,0.35)',
    animation: 'heroIn 700ms ease both',
  },
  namePanelTablet: {
    padding: '38px',
  },
  namePanelMobile: {
    padding: '26px 22px',
    borderRadius: 6,
  },
  kicker: {
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(247,243,235,0.36)',
    fontFamily: 'Space Mono, monospace',
    marginBottom: 22,
    textTransform: 'uppercase',
  },
  nameTitle: {
    fontSize: 44,
    lineHeight: 1.05,
    letterSpacing: 0,
    fontWeight: 600,
    margin: '0 0 28px',
    fontFamily: 'Newsreader, Cormorant Garamond, serif',
  },
  nameTitleTablet: {
    fontSize: 38,
  },
  nameTitleMobile: {
    fontSize: 31,
    lineHeight: 1.08,
  },
  nameInput: {
    width: '100%',
    background: 'rgba(247,243,235,0.05)',
    border: '1px solid rgba(247,243,235,0.18)',
    color: '#f7f3eb',
    borderRadius: 6,
    padding: '16px 18px',
    fontSize: 20,
    fontFamily: 'Newsreader, Cormorant Garamond, serif',
    marginBottom: 14,
    outline: 'none',
    caretColor: '#f7f3eb',
  },
  errorText: {
    color: '#f3b6a2',
    fontSize: 13,
    marginBottom: 14,
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: '#f7f3eb',
    color: '#090909',
    border: '1px solid #f7f3eb',
    borderRadius: 6,
    padding: '14px 20px',
    minHeight: 48,
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  disabledButton: {
    opacity: 0.58,
    cursor: 'progress',
  },
  hero: {
    minHeight: 'calc(100vh - 90px)',
    position: 'relative',
    zIndex: 2,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.62fr)',
    alignItems: 'center',
    gap: 72,
    padding: '40px 72px 96px',
  },
  heroLaptop: {
    gap: 42,
    padding: '32px 44px 80px',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 0.7fr)',
  },
  heroCompact: {
    minHeight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 32,
    padding: '48px 22px 64px',
  },
  heroMobile: {
    padding: '54px 20px 58px',
    gap: 30,
  },
  heroCopy: {
    maxWidth: 820,
    animation: 'heroIn 800ms ease both',
  },
  heroCopyLaptop: {
    maxWidth: 650,
  },
  heroCopyCompact: {
    maxWidth: '100%',
  },
  heroTitle: {
    fontSize: 'clamp(58px, 9vw, 126px)',
    lineHeight: 0.92,
    letterSpacing: 0,
    margin: '0 0 28px',
    fontWeight: 600,
    fontFamily: 'Newsreader, Cormorant Garamond, serif',
    animation: 'phraseIn 520ms ease both',
  },
  heroTitleLaptop: {
    fontSize: 'clamp(54px, 7.4vw, 96px)',
    lineHeight: 0.96,
  },
  heroTitleTablet: {
    fontSize: 'clamp(48px, 9vw, 76px)',
    lineHeight: 0.98,
    maxWidth: 720,
  },
  heroTitleMobile: {
    fontSize: 'clamp(42px, 14vw, 58px)',
    lineHeight: 1.02,
    marginBottom: 20,
    maxWidth: '100%',
    overflowWrap: 'break-word',
  },
  heroText: {
    maxWidth: 540,
    fontSize: 17,
    lineHeight: 1.8,
    color: 'rgba(247,243,235,0.58)',
    margin: '0 0 34px',
  },
  heroTextCompact: {
    fontSize: 15,
    lineHeight: 1.68,
    maxWidth: 520,
    marginBottom: 26,
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroActionsMobile: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  actionButtonMobile: {
    width: '100%',
  },
  secondaryButton: {
    background: 'transparent',
    color: 'rgba(247,243,235,0.64)',
    border: '1px solid rgba(247,243,235,0.14)',
    borderRadius: 6,
    padding: '14px 18px',
    minHeight: 48,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  briefPanel: {
    borderTop: '1px solid rgba(247,243,235,0.16)',
    borderBottom: '1px solid rgba(247,243,235,0.1)',
    padding: '28px 0',
    animation: 'heroIn 900ms 120ms ease both',
    minWidth: 0,
  },
  briefPanelLaptop: {
    padding: '24px 0',
  },
  briefPanelCompact: {
    width: '100%',
    border: '1px solid rgba(247,243,235,0.12)',
    background: 'rgba(8,8,8,0.48)',
    backdropFilter: 'blur(12px)',
    borderRadius: 8,
    padding: '20px',
  },
  briefHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    color: '#f7f3eb',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 22,
  },
  briefHeaderMobile: {
    fontSize: 12,
    marginBottom: 18,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 26,
  },
  metricGridCompact: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  metricCell: {
    borderTop: '1px solid rgba(247,243,235,0.1)',
    padding: '14px 0 4px',
  },
  metricValue: {
    color: '#f7f3eb',
    fontSize: 26,
    fontWeight: 600,
    fontFamily: 'Newsreader, Cormorant Garamond, serif',
    lineHeight: 1,
    overflowWrap: 'anywhere',
  },
  metricValueMobile: {
    fontSize: 23,
  },
  metricLabel: {
    color: 'rgba(247,243,235,0.32)',
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 8,
    textTransform: 'uppercase',
    fontFamily: 'Space Mono, monospace',
  },
  stackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'rgba(247,243,235,0.46)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.8,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontFamily: 'Space Mono, monospace',
  },
  briefRow: {
    display: 'grid',
    gridTemplateColumns: '34px minmax(0, 1fr) 18px',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid rgba(247,243,235,0.07)',
    color: '#f7f3eb',
    padding: '15px 0',
    textAlign: 'left',
    fontFamily: 'Inter, sans-serif',
  },
  briefRowMobile: {
    gridTemplateColumns: '32px minmax(0, 1fr) 16px',
    gap: 12,
    padding: '14px 0',
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: '1px solid rgba(247,243,235,0.1)',
    color: 'rgba(247,243,235,0.66)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  briefLabel: {
    color: 'rgba(247,243,235,0.36)',
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: 'Space Mono, monospace',
  },
  briefValue: {
    color: 'rgba(247,243,235,0.68)',
    fontSize: 14,
    lineHeight: 1.55,
  },
  photoCredit: {
    display: 'inline-block',
    color: 'rgba(247,243,235,0.26)',
    textDecoration: 'none',
    fontSize: 10,
    letterSpacing: 1.2,
    marginTop: 18,
    fontFamily: 'Space Mono, monospace',
  },
  loadingMark: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 20,
    letterSpacing: 5,
    fontFamily: 'Newsreader, Cormorant Garamond, serif',
  },
};
