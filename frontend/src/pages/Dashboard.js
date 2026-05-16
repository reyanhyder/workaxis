import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { auth } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDoc, getDocs, query, where, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Check,
  CheckSquare,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCcw,
  Settings,
  Target,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ');

const getFallbackName = (user) => {
  const googleName = normalizeName(user?.displayName || '').split(' ')[0];
  const emailName = normalizeName(user?.email?.split('@')[0] || '');
  return googleName || emailName || 'Professional';
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Still building';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Working Late';
};

const pickSessionIndex = (length) => Math.floor(Math.random() * length);

const formatTaskReminder = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getReminderTone = (value, done) => {
  if (!value || done) return null;
  const diff = new Date(value).getTime() - Date.now();
  if (diff < 0) return { label: 'Needs attention', color: '#f0b7a4' };
  if (diff < 1000 * 60 * 60 * 24) return { label: 'Due today', color: '#e8d08d' };
  return { label: 'Scheduled', color: '#9fb7d7' };
};

const PRIORITIES = {
  low: { label: 'Low', color: '#9fb7d7', weight: 1 },
  medium: { label: 'Medium', color: '#d7c09f', weight: 2 },
  high: { label: 'High', color: '#e8d08d', weight: 3 },
  urgent: { label: 'Urgent', color: '#f0b7a4', weight: 4 },
};

const WORKSPACE_THEMES = {
  obsidian: { label: 'Obsidian', root: '#0e0e0e', sidebar: '#111' },
  graphite: { label: 'Graphite', root: '#121211', sidebar: '#151513' },
  ink: { label: 'Ink', root: '#090a0b', sidebar: '#0d0f11' },
};

const formatDateOnly = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const getDashboardViewport = () => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width <= 720) return 'mobile';
  if (width <= 1024) return 'tablet';
  if (width <= 1366) return 'laptop';
  return 'desktop';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const requestedTab = ['dashboard', 'tasks', 'expenses', 'network', 'career', 'reports', 'settings'].includes(location.state?.tab) ? location.state.tab : 'dashboard';
  const [activeTab, setActiveTab] = useState(requestedTab);
  const [profileName, setProfileName] = useState('');
  const [settingsDraft, setSettingsDraft] = useState({ preferredName: '', dailyBriefing: true, browserAlerts: false, compactMode: false, workspaceTheme: 'obsidian' });
  const [settingsSaved, setSettingsSaved] = useState('');
  const [headlineIndex] = useState(() => pickSessionIndex(8));
  const [briefing, setBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskReminder, setTaskReminder] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', role: '', company: '' });
  const [careerGoals, setCareerGoals] = useState([]);
  const [newCareerGoal, setNewCareerGoal] = useState({ title: '', target: '' });
  const [reminderNotice, setReminderNotice] = useState(null);
  const [viewportMode, setViewportMode] = useState(() => getDashboardViewport());

  // Ref to track if data is loaded before generating briefing
  const dataLoadedRef = useRef(false);
  const alertedReminderIdsRef = useRef(new Set());

  const displayName = useMemo(() => profileName || getFallbackName(user), [profileName, user]);
  const greeting = useMemo(() => getTimeGreeting(), []);
  const headlineFrames = useMemo(() => ([
    { label: `${greeting}.`, name: `${displayName}.` },
    { label: `${displayName} returns.`, name: 'WorkAxis is ready.' },
    { label: 'Back in command.', name: `${displayName}.` },
    { label: `${displayName},`, name: 'your day is ready.' },
    { label: 'Control center online.', name: `${displayName}.` },
    { label: 'Your next move is queued.', name: `${displayName}.` },
    { label: 'Focus mode ready.', name: `${displayName}.` },
    { label: 'The system is awake.', name: `${displayName}.` },
  ]), [displayName, greeting]);

  // Memoized computed values — no recalculation on every render
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0), [expenses]);
  const pendingTasks = useMemo(() => tasks.filter(t => !t.done).length, [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.done).length, [tasks]);
  const sortedTasks = useMemo(() => (
    [...tasks].sort((a, b) => {
      const priorityDelta = (PRIORITIES[b.priority || 'medium']?.weight || 2) - (PRIORITIES[a.priority || 'medium']?.weight || 2);
      if (priorityDelta !== 0) return priorityDelta;
      const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aDue - bDue;
    })
  ), [tasks]);
  const recentTasks = useMemo(() => sortedTasks.slice(0, 3), [sortedTasks]);
  const highPriorityTasks = useMemo(() => tasks.filter(t => !t.done && ['high', 'urgent'].includes(t.priority)).length, [tasks]);
  const dueTodayTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks.filter(t => !t.done && t.dueAt && new Date(t.dueAt).toDateString() === today).length;
  }, [tasks]);
  const reminderTasks = useMemo(() => (
    tasks
      .filter(t => !t.done && t.reminderAt)
      .sort((a, b) => new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime())
      .slice(0, 3)
  ), [tasks]);
  const completedCareerGoals = useMemo(() => careerGoals.filter(goal => goal.done).length, [careerGoals]);
  const reportScore = useMemo(() => {
    const signals = [
      pendingTasks > 0,
      completedTasks > 0,
      expenses.length > 0,
      contacts.length > 0,
      careerGoals.length > 0,
    ].filter(Boolean).length;
    return Math.round((signals / 5) * 100);
  }, [careerGoals.length, completedTasks, contacts.length, expenses.length, pendingTasks]);

  const generateBriefing = useCallback(async (currentTasks = [], currentExpenses = [], currentContacts = [], personName = getFallbackName(user)) => {
    setBriefingLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personName || getFallbackName(user),
          tasks: currentTasks.map(t => t.text),
          expenses: currentExpenses.map(e => `${e.name}: ₹${e.amount}`),
          contacts: currentContacts.map(c => c.name),
        })
      });
      const data = await res.json();
      setBriefing(data.briefing);
    } catch (e) {
      setBriefing('• Stay focused on your priorities today.\n• Follow up with your key contacts.\n• Review your budget and keep it on track.');
    }
    setBriefingLoading(false);
  }, [user]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const uid = user.uid;
      const [tSnap, eSnap, cSnap, careerSnap, profileSnap] = await Promise.all([
        getDocs(query(collection(db, 'tasks'), where('uid', '==', uid))),
        getDocs(query(collection(db, 'expenses'), where('uid', '==', uid))),
        getDocs(query(collection(db, 'contacts'), where('uid', '==', uid))),
        getDocs(query(collection(db, 'careerGoals'), where('uid', '==', uid))),
        getDoc(doc(db, 'users', uid)),
      ]);
      const loadedTasks = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const loadedExpenses = eSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const loadedContacts = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const loadedCareerGoals = careerSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const profileData = profileSnap.exists() ? profileSnap.data() : {};
      const savedName = normalizeName(profileData?.preferredName || '');
      const loadedName = savedName || getFallbackName(user);
      const savedSettings = {
        preferredName: loadedName,
        dailyBriefing: profileData?.dailyBriefing !== false,
        browserAlerts: Boolean(profileData?.browserAlerts),
        compactMode: Boolean(profileData?.compactMode),
        workspaceTheme: profileData?.workspaceTheme || 'obsidian',
      };

      setTasks(loadedTasks);
      setExpenses(loadedExpenses);
      setContacts(loadedContacts);
      setCareerGoals(loadedCareerGoals);
      setProfileName(loadedName);
      setSettingsDraft(savedSettings);

      // Generate briefing only AFTER data is loaded, passing data directly
      if (!dataLoadedRef.current) {
        dataLoadedRef.current = true;
        generateBriefing(loadedTasks, loadedExpenses, loadedContacts, loadedName);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user, generateBriefing]);

  useEffect(() => {
    const handleResize = () => setViewportMode(getDashboardViewport());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    loadData();
  }, [loadData, navigate, user]);

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  useEffect(() => {
    const checkDueReminders = () => {
      const dueTask = tasks.find(t => {
        if (!t.id || t.done || !t.reminderAt || alertedReminderIdsRef.current.has(t.id)) return false;
        const reminderTime = new Date(t.reminderAt).getTime();
        return !Number.isNaN(reminderTime) && reminderTime <= Date.now();
      });

      if (!dueTask) return;
      alertedReminderIdsRef.current.add(dueTask.id);
      setReminderNotice(dueTask);

      if (settingsDraft.browserAlerts && typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
        new window.Notification('WorkAxis reminder', {
          body: `Complete: ${dueTask.text}`,
          tag: dueTask.id,
        });
      }
    };

    checkDueReminders();
    const timer = window.setInterval(checkDueReminders, 10000);
    return () => window.clearInterval(timer);
  }, [settingsDraft.browserAlerts, tasks]);

  const enableBrowserReminders = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (window.Notification.permission === 'granted') {
      setSettingsDraft(prev => ({ ...prev, browserAlerts: true }));
      return true;
    }
    if (window.Notification.permission === 'default') {
      const permission = await window.Notification.requestPermission();
      if (permission === 'granted') {
        setSettingsDraft(prev => ({ ...prev, browserAlerts: true }));
        return true;
      }
    }
    setSettingsDraft(prev => ({ ...prev, browserAlerts: false }));
    return false;
  }, []);

  const addTask = useCallback(async () => {
    if (!newTask.trim()) return;
    const task = {
      text: newTask,
      uid: user.uid,
      done: false,
      priority: taskPriority,
      dueAt: taskDueDate ? new Date(`${taskDueDate}T23:59:00`).toISOString() : '',
      reminderAt: taskReminder ? new Date(taskReminder).toISOString() : '',
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'tasks'), task);
    setTasks(prev => [...prev, { id: ref.id, ...task }]);
    setNewTask('');
    setTaskReminder('');
    setTaskDueDate('');
    setTaskPriority('medium');
  }, [newTask, taskDueDate, taskPriority, taskReminder, user]);

  const toggleTask = useCallback(async (id, done) => {
    await updateDoc(doc(db, 'tasks', id), { done: !done });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t));
  }, []);

  const deleteTask = useCallback(async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addExpense = useCallback(async () => {
    if (!newExpense.name.trim() || !newExpense.amount) return;
    const exp = { ...newExpense, uid: user.uid, createdAt: new Date().toISOString() };
    const ref = await addDoc(collection(db, 'expenses'), exp);
    setExpenses(prev => [...prev, { id: ref.id, ...exp }]);
    setNewExpense({ name: '', amount: '' });
  }, [newExpense, user]);

  const addContact = useCallback(async () => {
    if (!newContact.name.trim()) return;
    const contact = { ...newContact, uid: user.uid, createdAt: new Date().toISOString() };
    const ref = await addDoc(collection(db, 'contacts'), contact);
    setContacts(prev => [...prev, { id: ref.id, ...contact }]);
    setNewContact({ name: '', role: '', company: '' });
  }, [newContact, user]);

  const addCareerGoal = useCallback(async () => {
    if (!newCareerGoal.title.trim()) return;
    const goal = {
      ...newCareerGoal,
      uid: user.uid,
      done: false,
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'careerGoals'), goal);
    setCareerGoals(prev => [...prev, { id: ref.id, ...goal }]);
    setNewCareerGoal({ title: '', target: '' });
  }, [newCareerGoal, user]);

  const toggleCareerGoal = useCallback(async (id, done) => {
    await updateDoc(doc(db, 'careerGoals', id), { done: !done });
    setCareerGoals(prev => prev.map(goal => goal.id === id ? { ...goal, done: !done } : goal));
  }, []);

  const deleteCareerGoal = useCallback(async (id) => {
    await deleteDoc(doc(db, 'careerGoals', id));
    setCareerGoals(prev => prev.filter(goal => goal.id !== id));
  }, []);

  const saveSettings = useCallback(async () => {
    if (!user) return;
    const nextName = normalizeName(settingsDraft.preferredName) || getFallbackName(user);
    await setDoc(doc(db, 'users', user.uid), {
      preferredName: nextName,
      dailyBriefing: Boolean(settingsDraft.dailyBriefing),
      browserAlerts: Boolean(settingsDraft.browserAlerts),
      compactMode: Boolean(settingsDraft.compactMode),
      workspaceTheme: settingsDraft.workspaceTheme || 'obsidian',
      updatedAt: serverTimestamp(),
    }, { merge: true });
    if (user.displayName !== nextName) {
      await updateProfile(user, { displayName: nextName });
    }
    setProfileName(nextName);
    setSettingsDraft(prev => ({ ...prev, preferredName: nextName }));
    setSettingsSaved('Settings saved.');
    window.setTimeout(() => setSettingsSaved(''), 2200);
  }, [settingsDraft, user]);

  const logout = useCallback(async () => { await signOut(auth); navigate('/'); }, [navigate]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', Icon: CheckSquare },
    { id: 'expenses', label: 'Finances', Icon: WalletCards },
    { id: 'network', label: 'Network', Icon: Users },
    { id: 'career', label: 'Career', Icon: BriefcaseBusiness },
    { id: 'reports', label: 'Reports', Icon: FileText },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];
  const theme = WORKSPACE_THEMES[settingsDraft.workspaceTheme] || WORKSPACE_THEMES.obsidian;
  const isMobile = viewportMode === 'mobile';
  const isTablet = viewportMode === 'tablet';
  const isLaptop = viewportMode === 'laptop';
  const compactViewport = isMobile || isTablet;
  const contentStyle = {
    ...d.tabContent,
    ...(settingsDraft.compactMode ? d.tabContentCompact : {}),
    ...(isLaptop ? d.tabContentLaptop : {}),
    ...(isTablet ? d.tabContentTablet : {}),
    ...(isMobile ? d.tabContentMobile : {}),
  };

  return (
    <div style={{ ...d.root, ...(compactViewport ? d.rootCompact : {}), background: theme.root }}>
      {/* SIDEBAR */}
      <div style={{ ...d.sidebar, ...(compactViewport ? d.sidebarCompact : {}), ...(isMobile ? d.sidebarMobile : {}), background: theme.sidebar }}>
        <div style={{ ...d.sidebarLogo, ...(compactViewport ? d.sidebarLogoCompact : {}) }}>
          <div style={d.logoDot} />
          <span style={d.logoWork}>WORK</span>
          <span style={d.logoAxis}>AXIS</span>
        </div>
        {!compactViewport && <div style={d.sidebarDivider} />}
        {tabs.map(tab => {
          const Icon = tab.Icon;
          return (
          <div key={tab.id} style={{ ...d.sidebarItem, ...(compactViewport ? d.sidebarItemCompact : {}), ...(isMobile ? d.sidebarItemMobile : {}), ...(activeTab === tab.id ? d.sidebarActive : {}) }}
            onClick={() => setActiveTab(tab.id)}>
            <Icon size={15} strokeWidth={1.8} />
            <span>{tab.label}</span>
          </div>
        )})}
        <div style={{ ...d.sidebarBottom, ...(compactViewport ? d.sidebarBottomCompact : {}) }}>
          <div style={d.userInfo}>
            {user?.photoURL && <img src={user.photoURL} alt="" style={d.avatar} />}
            <div style={{ minWidth: 0 }}>
              <div style={d.userName}>{displayName}</div>
              <div style={d.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ ...d.logoutBtn, ...(compactViewport ? d.logoutBtnCompact : {}) }}>
            <LogOut size={14} strokeWidth={1.8} />
            SIGN OUT
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ ...d.main, ...(compactViewport ? d.mainCompact : {}), background: theme.root }}>
        {reminderNotice && (
          <div style={{ ...d.reminderToast, ...(isMobile ? d.reminderToastMobile : {}) }}>
            <div style={d.reminderToastIcon}>
              <BellRing size={18} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={d.reminderToastTitle}>Complete task reminder</div>
              <div style={d.reminderToastText}>{reminderNotice.text}</div>
              <div style={d.reminderToastTime}>{formatTaskReminder(reminderNotice.reminderAt)}</div>
            </div>
            <button
              onClick={() => {
                setActiveTab('tasks');
                setReminderNotice(null);
              }}
              style={d.toastAction}
            >
              OPEN
            </button>
            <button onClick={() => setReminderNotice(null)} style={d.toastClose}>
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div>
                <div key={`label-${headlineIndex}`} style={{ ...d.greetingLabel, ...(isLaptop ? d.greetingLabelLaptop : {}), ...(compactViewport ? d.greetingLabelCompact : {}) }}>{headlineFrames[headlineIndex].label}</div>
                <div key={`name-${headlineIndex}`} style={{ ...d.greetingName, ...(isLaptop ? d.greetingNameLaptop : {}), ...(compactViewport ? d.greetingNameCompact : {}) }}>{headlineFrames[headlineIndex].name}</div>
              </div>
              <button onClick={() => generateBriefing(tasks, expenses, contacts, displayName)} style={d.refreshBtn}>
                <RefreshCcw size={14} strokeWidth={1.8} />
                Refresh Briefing
              </button>
            </div>

            {/* AI BRIEFING */}
            <div style={d.briefingCard}>
              <div style={d.briefingHeader}>
                <span style={d.briefingTag}>AI BRIEFING</span>
                <span style={d.briefingTime}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              {briefingLoading ? (
                <div style={d.briefingLoading}>Generating your briefing...</div>
              ) : (
                <div style={d.briefingText}>
                  {briefing.split('\n').map((line, i) => line.trim() && (
                    <div key={i} style={d.briefingLine}>{line}</div>
                  ))}
                </div>
              )}
            </div>

            {/* STATS */}
            <div style={{ ...d.statsRow, ...(isMobile ? d.statsRowMobile : {}) }}>
              {[
                { val: pendingTasks, label: 'Pending Tasks' },
                { val: completedTasks, label: 'Completed' },
                { val: highPriorityTasks, label: 'High Priority' },
                { val: dueTodayTasks, label: 'Due Today' },
                { val: `₹${totalExpenses.toLocaleString('en-IN')}`, label: 'Total Spent' },
                { val: contacts.length, label: 'Contacts' },
                { val: `${completedCareerGoals}/${careerGoals.length}`, label: 'Career Goals' },
                { val: `${reportScore}%`, label: 'Report Score' },
              ].map((st, i) => (
                <div key={i} style={d.statCard}>
                  <div style={d.statVal}>{st.val}</div>
                  <div style={d.statLabel}>{st.label}</div>
                </div>
              ))}
            </div>

            {/* RECENT TASKS */}
            <div style={d.section}>
              <div style={d.sectionTitle}>Recent Tasks</div>
              {recentTasks.map(t => (
                <div key={t.id} style={d.taskRow}>
                  <div style={{ ...d.taskDot, background: t.done ? '#4ade80' : PRIORITIES[t.priority || 'medium']?.color || 'rgba(245,245,245,0.2)' }} />
                  <span style={{ ...d.taskText, textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.4 : 1 }}>{t.text}</span>
                  {t.dueAt && <span style={d.inlineMeta}>Due {formatDateOnly(t.dueAt)}</span>}
                </div>
              ))}
              {tasks.length === 0 && <div style={d.emptyText}>No tasks yet. Add some in Tasks tab.</div>}
            </div>

            <div style={d.section}>
              <div style={d.sectionTitle}>Complete Task Reminder</div>
              <div style={d.reminderPanel}>
                <BellRing size={17} strokeWidth={1.7} />
                <div style={{ flex: 1 }}>
                  <div style={d.reminderPanelTitle}>
                    {reminderTasks.length > 0
                      ? `${reminderTasks.length} task${reminderTasks.length === 1 ? '' : 's'} waiting on reminder`
                      : 'No active reminders'}
                  </div>
                  <div style={d.reminderPanelText}>
                    {reminderTasks.length > 0
                      ? `${reminderTasks[0].text} · ${formatTaskReminder(reminderTasks[0].reminderAt)}`
                      : 'Add a reminder inside Tasks when something needs to be completed at a specific time.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div style={{ ...d.greetingLabel, ...(compactViewport ? d.greetingLabelCompact : {}) }}>Tasks</div>
            </div>
            <div style={d.inputRow}>
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                style={{ ...d.input, flex: 2 }}
              />
              <input
                value={taskReminder}
                onChange={e => setTaskReminder(e.target.value)}
                type="datetime-local"
                aria-label="Task reminder time"
                style={d.input}
              />
              <input
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
                type="date"
                aria-label="Task due date"
                style={{ ...d.input, flex: '0 1 190px' }}
              />
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value)}
                style={d.selectInput}
                aria-label="Task priority"
              >
                {Object.entries(PRIORITIES).map(([id, priority]) => (
                  <option key={id} value={id}>{priority.label}</option>
                ))}
              </select>
              <button onClick={addTask} style={{ ...d.addBtn, ...(isMobile ? d.fullWidthButton : {}) }}>
                <Plus size={15} strokeWidth={2} />
                ADD
              </button>
              {typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission !== 'granted' && (
                <button onClick={enableBrowserReminders} style={{ ...d.secondaryBtn, ...(isMobile ? d.fullWidthButton : {}) }}>
                  <BellRing size={14} strokeWidth={1.8} />
                  ENABLE ALERTS
                </button>
              )}
            </div>
            <div style={d.taskList}>
              {sortedTasks.map(t => (
                <div key={t.id} style={d.taskCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <div onClick={() => toggleTask(t.id, t.done)}
                      style={{ ...d.checkbox, background: t.done ? '#f5f5f5' : 'transparent', cursor: 'pointer' }}>
                      {t.done && <Check size={12} strokeWidth={2.4} color="#0e0e0e" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, color: t.done ? 'rgba(245,245,245,0.3)' : 'rgba(245,245,245,0.8)', textDecoration: t.done ? 'line-through' : 'none', fontFamily: 'Inter, Space Grotesk, sans-serif' }}>
                        {t.text}
                      </div>
                      <div style={d.taskMetaRow}>
                        <span style={{ ...d.priorityPill, color: PRIORITIES[t.priority || 'medium']?.color }}>
                          {PRIORITIES[t.priority || 'medium']?.label || 'Medium'}
                        </span>
                        {t.dueAt && <span>Due {formatDateOnly(t.dueAt)}</span>}
                      </div>
                      {t.reminderAt && (
                        <div style={d.reminderMeta}>
                          <Clock3 size={12} strokeWidth={1.8} />
                          <span>{formatTaskReminder(t.reminderAt)}</span>
                          {getReminderTone(t.reminderAt, t.done) && (
                            <span style={{ ...d.reminderStatus, color: getReminderTone(t.reminderAt, t.done).color }}>
                              {getReminderTone(t.reminderAt, t.done).label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(t.id)} style={d.deleteBtn}>
                    <X size={17} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && <div style={d.emptyText}>No tasks yet. Add your first task above.</div>}
            </div>
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div style={{ ...d.greetingLabel, ...(compactViewport ? d.greetingLabelCompact : {}) }}>Finances</div>
              <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#f5f5f5', fontFamily: 'Newsreader, Cormorant Garamond, serif' }}>
                ₹{totalExpenses.toLocaleString('en-IN')} total
              </div>
            </div>
            <div style={d.inputRow}>
              <input value={newExpense.name} onChange={e => setNewExpense(p => ({ ...p, name: e.target.value }))} placeholder="Expense name..." style={{ ...d.input, flex: 2 }} />
              <input value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} placeholder="Amount ₹" type="number" style={{ ...d.input, flex: 1 }} />
              <button onClick={addExpense} style={d.addBtn}>
                <Plus size={15} strokeWidth={2} />
                ADD
              </button>
            </div>
            <div style={d.taskList}>
              {expenses.map(e => (
                <div key={e.id} style={d.taskCard}>
                  <span style={{ fontSize: 15, color: 'rgba(245,245,245,0.8)', fontFamily: 'Inter, Space Grotesk, sans-serif', flex: 1 }}>{e.name}</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#f5f5f5', fontFamily: 'Newsreader, Cormorant Garamond, serif' }}>₹{Number(e.amount).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {expenses.length === 0 && <div style={d.emptyText}>No expenses logged yet.</div>}
            </div>
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div style={{ ...d.greetingLabel, ...(compactViewport ? d.greetingLabelCompact : {}) }}>Network</div>
            </div>
            <div style={d.inputRow}>
              <input value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} placeholder="Name..." style={d.input} />
              <input value={newContact.role} onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))} placeholder="Role..." style={d.input} />
              <input value={newContact.company} onChange={e => setNewContact(p => ({ ...p, company: e.target.value }))} placeholder="Company..." style={d.input} />
              <button onClick={addContact} style={d.addBtn}>
                <Plus size={15} strokeWidth={2} />
                ADD
              </button>
            </div>
            <div style={d.contactGrid}>
              {contacts.map(c => (
                <div key={c.id} style={d.contactCard}>
                  <div style={d.contactAvatar}>{c.name[0].toUpperCase()}</div>
                  <div style={d.contactName}>{c.name}</div>
                  <div style={d.contactRole}>{c.role}</div>
                  <div style={d.contactCompany}>{c.company}</div>
                </div>
              ))}
              {contacts.length === 0 && <div style={d.emptyText}>No contacts yet. Add your professional network.</div>}
            </div>
          </div>
        )}

        {/* CAREER TAB */}
        {activeTab === 'career' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div>
                <div style={{ ...d.greetingLabel, ...(compactViewport ? d.greetingLabelCompact : {}) }}>Career</div>
                <div style={d.pageSub}>Track goals, certifications, applications, and next professional moves.</div>
              </div>
              <div style={{ ...d.headerMetric, ...(compactViewport ? d.headerMetricCompact : {}) }}>
                {completedCareerGoals}/{careerGoals.length} complete
              </div>
            </div>
            <div style={d.inputRow}>
              <input
                value={newCareerGoal.title}
                onChange={e => setNewCareerGoal(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCareerGoal()}
                placeholder="Career goal, certification, or application..."
                style={{ ...d.input, flex: 2 }}
              />
              <input
                value={newCareerGoal.target}
                onChange={e => setNewCareerGoal(p => ({ ...p, target: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addCareerGoal()}
                placeholder="Target or deadline..."
                style={d.input}
              />
              <button onClick={addCareerGoal} style={d.addBtn}>
                <Plus size={15} strokeWidth={2} />
                ADD
              </button>
            </div>
            <div style={d.taskList}>
              {careerGoals.map(goal => (
                <div key={goal.id} style={d.taskCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                    <div onClick={() => toggleCareerGoal(goal.id, goal.done)}
                      style={{ ...d.checkbox, background: goal.done ? '#f5f5f5' : 'transparent', cursor: 'pointer' }}>
                      {goal.done && <Check size={12} strokeWidth={2.4} color="#0e0e0e" />}
                    </div>
                    <div>
                      <div style={{ ...d.taskText, textDecoration: goal.done ? 'line-through' : 'none', opacity: goal.done ? 0.4 : 1 }}>
                        {goal.title}
                      </div>
                      {goal.target && <div style={d.taskMeta}>{goal.target}</div>}
                    </div>
                  </div>
                  <button onClick={() => deleteCareerGoal(goal.id)} style={d.deleteBtn}>
                    <X size={17} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
              {careerGoals.length === 0 && <div style={d.emptyText}>No career goals yet. Add your next move above.</div>}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div>
                <div style={{ ...d.greetingLabel, ...(compactViewport ? d.greetingLabelCompact : {}) }}>Reports</div>
                <div style={d.pageSub}>A monthly intelligence snapshot across work, money, network, and career.</div>
              </div>
              <div style={{ ...d.headerMetric, ...(compactViewport ? d.headerMetricCompact : {}) }}>{reportScore}% signal</div>
            </div>

            <div style={{ ...d.reportHero, ...(isMobile ? d.reportHeroMobile : {}) }}>
              <div>
                <div style={d.briefingTag}>MONTHLY INTELLIGENCE</div>
                <div style={d.reportTitle}>Professional operating picture</div>
              </div>
              <BarChart3 size={30} strokeWidth={1.5} color="rgba(247,243,235,0.46)" />
            </div>

            <div style={d.reportGrid}>
              {[
                { label: 'Execution', value: `${completedTasks} done`, text: `${pendingTasks} active task${pendingTasks === 1 ? '' : 's'} still need attention.` },
                { label: 'Priority', value: highPriorityTasks, text: `${highPriorityTasks} high-priority task${highPriorityTasks === 1 ? '' : 's'} currently active.` },
                { label: 'Deadlines', value: dueTodayTasks, text: `${dueTodayTasks} task${dueTodayTasks === 1 ? '' : 's'} due today.` },
                { label: 'Reminders', value: reminderTasks.length, text: `${reminderTasks.length} completion reminder${reminderTasks.length === 1 ? '' : 's'} currently active.` },
                { label: 'Finances', value: `₹${totalExpenses.toLocaleString('en-IN')}`, text: `${expenses.length} expense entr${expenses.length === 1 ? 'y' : 'ies'} logged this cycle.` },
                { label: 'Network', value: contacts.length, text: `${contacts.length} relationship${contacts.length === 1 ? '' : 's'} visible in your workspace.` },
                { label: 'Career', value: `${completedCareerGoals}/${careerGoals.length}`, text: `${careerGoals.length} professional goal${careerGoals.length === 1 ? '' : 's'} currently tracked.` },
              ].map(item => (
                <div key={item.label} style={d.reportCard}>
                  <div style={d.reportLabel}>{item.label}</div>
                  <div style={d.reportValue}>{item.value}</div>
                  <div style={d.reportText}>{item.text}</div>
                </div>
              ))}
            </div>

            <div style={d.section}>
              <div style={d.sectionTitle}>Recommended Next Move</div>
              <div style={d.recommendationRow}>
                <Target size={18} strokeWidth={1.7} />
                <span>
                  {pendingTasks > 0
                    ? reminderTasks.length > 0
                      ? `Complete "${reminderTasks[0].text}" before ${formatTaskReminder(reminderTasks[0].reminderAt)}.`
                      : highPriorityTasks > 0
                        ? 'Clear one high-priority task before lower-value work.'
                        : dueTodayTasks > 0
                          ? 'Finish one due-today task before the day closes.'
                      : 'Clear one pending task before adding new work.'
                    : careerGoals.length === 0
                      ? 'Add one career goal so WorkAxis can track professional direction.'
                      : contacts.length === 0
                        ? 'Add one professional contact to activate the network layer.'
                        : 'Refresh your AI briefing and decide the next priority.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={contentStyle}>
            <div style={{ ...d.pageHeader, ...(compactViewport ? d.pageHeaderCompact : {}) }}>
              <div>
                <div style={{ ...d.greetingLabel, ...(compactViewport ? d.greetingLabelCompact : {}) }}>Settings</div>
                <div style={d.pageSub}>Control identity, notification behavior, and the way WorkAxis presents your workspace.</div>
              </div>
              {settingsSaved && <div style={{ ...d.headerMetric, ...(compactViewport ? d.headerMetricCompact : {}) }}>{settingsSaved}</div>}
            </div>

            <div style={d.settingsGrid}>
              <div style={d.settingsPanel}>
                <div style={d.sectionTitle}>Profile</div>
                <label style={d.fieldLabel}>What should WorkAxis call you?</label>
                <input
                  value={settingsDraft.preferredName}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, preferredName: e.target.value }))}
                  placeholder="Preferred name"
                  style={{ ...d.input, width: '100%', marginTop: 10 }}
                />
                <div style={d.settingsNote}>This updates greetings across the welcome page and dashboard.</div>
              </div>

              <div style={d.settingsPanel}>
                <div style={d.sectionTitle}>Notifications</div>
                <label style={d.toggleRow}>
                  <input
                    type="checkbox"
                    checked={settingsDraft.browserAlerts}
                    onChange={async e => {
                      const enabled = e.target.checked;
                      if (enabled) {
                        const granted = await enableBrowserReminders();
                        setSettingsDraft(prev => ({ ...prev, browserAlerts: granted }));
                      } else {
                        setSettingsDraft(prev => ({ ...prev, browserAlerts: false }));
                      }
                    }}
                  />
                  <span>Browser reminder alerts</span>
                </label>
                <label style={d.toggleRow}>
                  <input
                    type="checkbox"
                    checked={settingsDraft.dailyBriefing}
                    onChange={e => setSettingsDraft(prev => ({ ...prev, dailyBriefing: e.target.checked }))}
                  />
                  <span>Daily briefing enabled</span>
                </label>
                <div style={d.settingsNote}>Closed-app push reminders require the Railway reminder worker after deployment.</div>
              </div>

              <div style={d.settingsPanel}>
                <div style={d.sectionTitle}>Workspace</div>
                <label style={d.fieldLabel}>Theme</label>
                <select
                  value={settingsDraft.workspaceTheme}
                  onChange={e => setSettingsDraft(prev => ({ ...prev, workspaceTheme: e.target.value }))}
                  style={{ ...d.selectInput, width: '100%', marginTop: 10, marginBottom: 18 }}
                >
                  {Object.entries(WORKSPACE_THEMES).map(([id, item]) => (
                    <option key={id} value={id}>{item.label}</option>
                  ))}
                </select>
                <label style={d.toggleRow}>
                  <input
                    type="checkbox"
                    checked={settingsDraft.compactMode}
                    onChange={e => setSettingsDraft(prev => ({ ...prev, compactMode: e.target.checked }))}
                  />
                  <span>Compact dashboard density</span>
                </label>
                <div style={d.settingsNote}>Saved now as an account preference, ready for a denser dashboard pass.</div>
              </div>
            </div>

            <button onClick={saveSettings} style={{ ...d.addBtn, marginTop: 28 }}>
              SAVE SETTINGS
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { cursor: auto; }
        input, textarea { cursor: text !important; caret-color: #f5f5f5 !important; }
        button, [role="button"], [onClick], div[style*="cursor: pointer"] { cursor: pointer !important; }
        input::placeholder { color: rgba(245,245,245,0.2); }
        input:focus { outline: none; border-color: rgba(245,245,245,0.3) !important; }
        @keyframes dashPhrase {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #0e0e0e; }
        ::-webkit-scrollbar-thumb { background: rgba(245,245,245,0.1); }
      `}</style>
    </div>
  );
}

const d = {
  root: { display: 'flex', height: '100vh', background: '#0e0e0e', fontFamily: 'Inter, Space Grotesk, sans-serif', color: '#f7f3eb', overflow: 'hidden' },
  rootCompact: { flexDirection: 'column', height: '100svh', overflow: 'hidden' },
  sidebar: { width: 246, background: '#111', borderRight: '1px solid rgba(247,243,235,0.07)', display: 'flex', flexDirection: 'column', padding: '28px 16px', flexShrink: 0 },
  sidebarCompact: { width: '100%', maxHeight: 164, borderRight: 'none', borderBottom: '1px solid rgba(247,243,235,0.07)', padding: '14px 14px 10px', overflowX: 'auto', overflowY: 'hidden', display: 'grid', gridTemplateColumns: 'auto', gridAutoFlow: 'column', gridAutoColumns: 'max-content', alignItems: 'center', gap: 8 },
  sidebarMobile: { maxHeight: 148, padding: '12px 12px 9px' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 24px', marginBottom: 4 },
  sidebarLogoCompact: { padding: '0 10px', marginBottom: 0, height: 42 },
  logoDot: { width: 7, height: 7, borderRadius: '50%', background: '#f7f3eb' },
  logoWork: { fontSize: 17, fontWeight: 700, color: '#f7f3eb', letterSpacing: '3px', fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  logoAxis: { fontSize: 17, fontWeight: 400, color: 'rgba(247,243,235,0.28)', letterSpacing: '3px', fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  sidebarDivider: { height: 1, background: 'rgba(247,243,235,0.05)', marginBottom: 16 },
  sidebarItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 6, fontSize: 13, color: 'rgba(247,243,235,0.44)', cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s', letterSpacing: '0.1px', fontWeight: 600 },
  sidebarItemCompact: { marginBottom: 0, height: 42, whiteSpace: 'nowrap', flexShrink: 0 },
  sidebarItemMobile: { padding: '10px 12px', fontSize: 12 },
  sidebarActive: { background: 'rgba(247,243,235,0.07)', color: '#f7f3eb' },
  sidebarBottom: { marginTop: 'auto' },
  sidebarBottomCompact: { display: 'none' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px', marginBottom: 12 },
  avatar: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' },
  userName: { fontSize: 13, fontWeight: 700, color: '#f7f3eb' },
  userEmail: { fontSize: 10, color: 'rgba(247,243,235,0.32)', marginTop: 2 },
  logoutBtn: { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', border: '1px solid rgba(247,243,235,0.12)', color: 'rgba(247,243,235,0.38)', padding: '10px', fontSize: 10, letterSpacing: '1.6px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, Space Grotesk, sans-serif' },
  logoutBtnCompact: { width: 'auto', height: 42, padding: '10px 14px' },
  main: { flex: 1, overflow: 'auto', background: '#0e0e0e' },
  mainCompact: { width: '100%', minHeight: 0 },
  tabContent: { padding: '48px 56px', maxWidth: 1000 },
  tabContentCompact: { padding: '32px 42px', maxWidth: 1120 },
  tabContentLaptop: { padding: '40px 44px', maxWidth: 1040 },
  tabContentTablet: { padding: '30px 28px', maxWidth: '100%' },
  tabContentMobile: { padding: '26px 18px 44px', maxWidth: '100%' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 },
  pageHeaderCompact: { alignItems: 'flex-start', flexDirection: 'column', gap: 18, marginBottom: 28 },
  greetingLabel: { fontSize: 42, fontWeight: 600, color: '#f7f3eb', fontFamily: 'Newsreader, Cormorant Garamond, serif', letterSpacing: 0, animation: 'dashPhrase 420ms ease both' },
  greetingLabelLaptop: { fontSize: 38 },
  greetingLabelCompact: { fontSize: 32, lineHeight: 1.05 },
  greetingName: { fontSize: 58, fontWeight: 400, fontStyle: 'italic', color: 'rgba(247,243,235,0.38)', fontFamily: 'Newsreader, Cormorant Garamond, serif', letterSpacing: 0, lineHeight: 1, animation: 'dashPhrase 500ms ease both' },
  greetingNameLaptop: { fontSize: 50 },
  greetingNameCompact: { fontSize: 38, lineHeight: 1.04 },
  pageSub: { fontSize: 14, color: 'rgba(247,243,235,0.42)', marginTop: 10, lineHeight: 1.6, maxWidth: 460 },
  headerMetric: { fontSize: 28, fontWeight: 600, color: '#f7f3eb', fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  headerMetricCompact: { fontSize: 24 },
  refreshBtn: { display: 'inline-flex', alignItems: 'center', gap: 9, background: 'transparent', border: '1px solid rgba(247,243,235,0.12)', color: 'rgba(247,243,235,0.45)', padding: '10px 18px', fontSize: 11, letterSpacing: '0.8px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, Space Grotesk, sans-serif', fontWeight: 700 },
  reminderToast: { position: 'fixed', right: 28, bottom: 28, width: 390, maxWidth: 'calc(100vw - 56px)', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(18,18,18,0.96)', border: '1px solid rgba(247,243,235,0.15)', boxShadow: '0 26px 70px rgba(0,0,0,0.42)', padding: '18px 18px', zIndex: 50, borderRadius: 6, backdropFilter: 'blur(18px)' },
  reminderToastMobile: { left: 14, right: 14, bottom: 14, width: 'auto', maxWidth: 'none', alignItems: 'flex-start' },
  reminderToastIcon: { width: 36, height: 36, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(247,243,235,0.06)', color: '#f7f3eb', flexShrink: 0 },
  reminderToastTitle: { fontSize: 10, color: 'rgba(247,243,235,0.44)', letterSpacing: 1.8, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', marginBottom: 5 },
  reminderToastText: { fontSize: 14, color: '#f7f3eb', fontWeight: 700, lineHeight: 1.35 },
  reminderToastTime: { fontSize: 11, color: 'rgba(247,243,235,0.34)', marginTop: 5, fontFamily: 'Space Mono, monospace' },
  toastAction: { background: '#f7f3eb', border: '1px solid #f7f3eb', color: '#0e0e0e', fontSize: 10, fontWeight: 800, letterSpacing: 1.3, padding: '9px 12px', cursor: 'pointer', fontFamily: 'Inter, Space Grotesk, sans-serif' },
  toastClose: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(247,243,235,0.32)', cursor: 'pointer', padding: 4 },
  briefingCard: { background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '28px 32px', marginBottom: 32 },
  briefingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  briefingTag: { fontSize: 10, fontWeight: 700, color: 'rgba(247,243,235,0.34)', letterSpacing: '2.6px', fontFamily: 'Space Mono, monospace' },
  briefingTime: { fontSize: 11, color: 'rgba(247,243,235,0.24)', fontFamily: 'Space Mono, monospace' },
  briefingLoading: { fontSize: 14, color: 'rgba(247,243,235,0.34)', fontStyle: 'italic', fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  briefingText: { display: 'flex', flexDirection: 'column', gap: 10 },
  briefingLine: { fontSize: 15, color: 'rgba(247,243,235,0.72)', lineHeight: 1.65, fontFamily: 'Inter, Space Grotesk, sans-serif' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 },
  statsRowMobile: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 28 },
  statCard: { background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '22px 24px' },
  statVal: { fontSize: 34, fontWeight: 600, color: '#f7f3eb', letterSpacing: 0, fontFamily: 'Newsreader, Cormorant Garamond, serif', marginBottom: 6 },
  statLabel: { fontSize: 10, color: 'rgba(247,243,235,0.28)', letterSpacing: '1.4px', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 11, color: 'rgba(245,245,245,0.2)', letterSpacing: '3px', marginBottom: 16, fontFamily: 'Space Mono, monospace' },
  taskRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(245,245,245,0.04)' },
  taskDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  taskText: { fontSize: 15, color: 'rgba(245,245,245,0.7)' },
  inlineMeta: { marginLeft: 'auto', fontSize: 10, color: 'rgba(247,243,235,0.28)', fontFamily: 'Space Mono, monospace', letterSpacing: 0.8, textTransform: 'uppercase' },
  taskMeta: { fontSize: 11, color: 'rgba(247,243,235,0.28)', marginTop: 5, fontFamily: 'Space Mono, monospace', letterSpacing: 0.8 },
  taskMetaRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 7, fontSize: 10, color: 'rgba(247,243,235,0.3)', fontFamily: 'Space Mono, monospace', letterSpacing: 0.7, textTransform: 'uppercase', flexWrap: 'wrap' },
  priorityPill: { border: '1px solid rgba(247,243,235,0.12)', borderRadius: 999, padding: '3px 8px', lineHeight: 1 },
  reminderPanel: { display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '18px 20px', color: 'rgba(247,243,235,0.62)' },
  reminderPanelTitle: { fontSize: 14, color: '#f7f3eb', fontWeight: 700, marginBottom: 4 },
  reminderPanelText: { fontSize: 13, color: 'rgba(247,243,235,0.42)', lineHeight: 1.5 },
  reminderMeta: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, color: 'rgba(247,243,235,0.34)', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: 0.5, textTransform: 'uppercase' },
  reminderStatus: { borderLeft: '1px solid rgba(247,243,235,0.14)', paddingLeft: 8 },
  inputRow: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 180, background: 'rgba(247,243,235,0.035)', border: '1px solid rgba(247,243,235,0.11)', color: '#f7f3eb', padding: '13px 18px', fontSize: 14, fontFamily: 'Inter, Space Grotesk, sans-serif', borderRadius: 4, caretColor: '#f7f3eb' },
  selectInput: { flex: '0 1 150px', minWidth: 140, background: 'rgba(247,243,235,0.035)', border: '1px solid rgba(247,243,235,0.11)', color: '#f7f3eb', padding: '13px 16px', fontSize: 13, fontFamily: 'Inter, Space Grotesk, sans-serif', borderRadius: 4, cursor: 'pointer' },
  addBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f7f3eb', color: '#0e0e0e', border: 'none', padding: '13px 24px', fontSize: 11, fontWeight: 800, letterSpacing: '1.4px', cursor: 'pointer', fontFamily: 'Inter, Space Grotesk, sans-serif', flexShrink: 0 },
  fullWidthButton: { width: '100%' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: 'rgba(247,243,235,0.52)', border: '1px solid rgba(247,243,235,0.12)', padding: '13px 18px', fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', cursor: 'pointer', fontFamily: 'Inter, Space Grotesk, sans-serif', flexShrink: 0 },
  taskList: { display: 'flex', flexDirection: 'column', gap: 10 },
  taskCard: { display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.06)', padding: '16px 20px', borderRadius: 6 },
  checkbox: { width: 20, height: 20, border: '1px solid rgba(245,245,245,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' },
  deleteBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'rgba(247,243,235,0.25)', fontSize: 18, cursor: 'pointer', padding: '4px', transition: 'color 0.2s', flexShrink: 0 },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 },
  contactCard: { background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '24px', textAlign: 'center' },
  contactAvatar: { width: 44, height: 44, borderRadius: '50%', background: 'rgba(245,245,245,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, margin: '0 auto 14px', color: '#f5f5f5', fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  contactName: { fontSize: 16, fontWeight: 600, color: '#f5f5f5', marginBottom: 4, fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  contactRole: { fontSize: 12, color: 'rgba(245,245,245,0.35)', marginBottom: 4, fontFamily: 'Inter, Space Grotesk, sans-serif' },
  contactCompany: { fontSize: 11, color: 'rgba(245,245,245,0.2)', fontFamily: 'Space Mono, monospace' },
  emptyText: { fontSize: 13, color: 'rgba(245,245,245,0.2)', fontStyle: 'italic', padding: '20px 0', fontFamily: 'Newsreader, Cormorant Garamond, serif' },
  reportHero: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '28px 32px', marginBottom: 18 },
  reportHeroMobile: { padding: '22px', alignItems: 'flex-start', gap: 18 },
  reportTitle: { fontSize: 30, color: '#f7f3eb', fontWeight: 600, fontFamily: 'Newsreader, Cormorant Garamond, serif', marginTop: 10 },
  reportGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 34 },
  reportCard: { background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '22px 24px' },
  reportLabel: { fontSize: 10, color: 'rgba(247,243,235,0.32)', letterSpacing: 1.8, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', marginBottom: 14 },
  reportValue: { fontSize: 30, color: '#f7f3eb', fontWeight: 600, fontFamily: 'Newsreader, Cormorant Garamond, serif', marginBottom: 8 },
  reportText: { fontSize: 13, color: 'rgba(247,243,235,0.48)', lineHeight: 1.65 },
  recommendationRow: { display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(247,243,235,0.68)', background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '18px 20px', fontSize: 14, lineHeight: 1.6 },
  settingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  settingsPanel: { background: 'rgba(247,243,235,0.018)', border: '1px solid rgba(247,243,235,0.07)', borderRadius: 6, padding: '24px' },
  fieldLabel: { display: 'block', fontSize: 13, color: 'rgba(247,243,235,0.62)', fontWeight: 700, marginBottom: 4 },
  toggleRow: { display: 'flex', alignItems: 'center', gap: 11, color: 'rgba(247,243,235,0.68)', fontSize: 14, padding: '10px 0', cursor: 'pointer' },
  settingsNote: { fontSize: 12, color: 'rgba(247,243,235,0.34)', lineHeight: 1.6, marginTop: 12 },
};
