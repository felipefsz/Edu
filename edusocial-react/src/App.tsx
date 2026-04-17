import {
  Bell,
  Bookmark,
  Brain,
  Globe2,
  Heart,
  LayoutDashboard,
  MessageSquare,
  MoonStar,
  Quote,
  Repeat2,
  Search,
  Settings,
  SunMedium,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Role = 'teacher' | 'student';
type Theme = 'dark' | 'light';
type Language = 'pt' | 'en';
type Page = 'feed' | 'messages' | 'tasks' | 'analytics' | 'settings' | 'profile';
type Modal = null | { type: 'notifications' } | { type: 'quote'; sourceId: string } | { type: 'profile'; userId: string } | { type: 'group'; groupId: string };

type User = {
  id: string;
  role: Role;
  name: string;
  username: string;
  classroom?: string;
  bio: string;
  status: string;
  streak: number;
  level: number;
  avatarTone: string;
  favorites: string[];
  grades: Record<string, number>;
  following: string[];
};

type Comment = { id: string; authorId: string; body: string; createdAt: string };
type Post = {
  id: string;
  authorId: string;
  kind: 'regular' | 'repost' | 'quote';
  body: string;
  createdAt: string;
  tags: string[];
  sourceId?: string;
  pinned?: boolean;
  likes: string[];
  saves: string[];
  reposts: string[];
  comments: Comment[];
};

type Message = { id: string; authorId: string; body: string; createdAt: string; readBy: string[] };
type ChatGroup = {
  id: string;
  title: string;
  description: string;
  classroom: string;
  members: string[];
  studentsCanPost: boolean;
  membersVisibleToStudents: boolean;
  messages: Message[];
};

type DirectThread = { id: string; members: [string, string]; messages: Message[] };
type Task = {
  id: string;
  title: string;
  subject: string;
  classroom?: string;
  deadline: string;
  description: string;
  attachments: string[];
  submissions: Array<{ userId: string; status: 'pending' | 'submitted' | 'reviewed'; note: string; attachments: string[] }>;
};

type Notification = { id: string; type: 'social' | 'message' | 'academic'; message: string; createdAt: string; readBy: string[] };

const storageKey = 'edusocial-react-compact';

const translations = {
  pt: {
    feed: 'Feed',
    messages: 'Mensagens',
    tasks: 'Tarefas',
    analytics: 'Analytics',
    settings: 'Configurações',
    notifications: 'Notificações',
    search: 'Buscar',
    profile: 'Perfil',
    logout: 'Sair',
    publish: 'Publicar',
    send: 'Enviar',
    save: 'Salvar',
    close: 'Fechar',
  },
  en: {
    feed: 'Feed',
    messages: 'Messages',
    tasks: 'Tasks',
    analytics: 'Analytics',
    settings: 'Settings',
    notifications: 'Notifications',
    search: 'Search',
    profile: 'Profile',
    logout: 'Logout',
    publish: 'Publish',
    send: 'Send',
    save: 'Save',
    close: 'Close',
  },
} as const;

const seed = {
  teacherId: 'teacher',
  page: 'feed' as Page,
  currentUserId: null as string | null,
  selectedProfileId: null as string | null,
  activeThreadId: 'group-a',
  modal: null as Modal,
  searchOpen: false,
  searchQuery: '',
  preferences: {
    theme: 'dark' as Theme,
    language: 'pt' as Language,
    reduceMotion: false,
  },
  users: [
    { id: 'teacher', role: 'teacher' as Role, name: 'Professor Nova Era', username: 'teacher', bio: 'Educador e operador da comunidade escolar.', status: 'Teaching live', streak: 30, level: 10, avatarTone: '#6374f6', favorites: ['Math', 'Science', 'Language'], grades: {}, following: [] },
    { id: 'ana', role: 'student' as Role, name: 'Ana Lima', username: 'ana', classroom: 'A', bio: 'Math lover and study sprint organizer.', status: 'Focused on finals', streak: 6, level: 4, avatarTone: '#8b5cf6', favorites: ['Math', 'Language', 'Science'], grades: { Math: 8.9, Language: 8.2, Science: 9.1, History: 7.6, English: 8.4 }, following: ['teacher', 'diego'] },
    { id: 'bruno', role: 'student' as Role, name: 'Bruno Costa', username: 'bruno', classroom: 'A', bio: 'Robotics, code, and review loops.', status: 'Shipping projects', streak: 3, level: 3, avatarTone: '#10b981', favorites: ['Math', 'English', 'Science'], grades: { Math: 7.2, Language: 6.8, Science: 7.7, History: 6.5, English: 8.1 }, following: ['teacher'] },
    { id: 'carla', role: 'student' as Role, name: 'Carla Dias', username: 'carla', classroom: 'B', bio: 'Writing and visual notes.', status: 'Looking for references', streak: 2, level: 2, avatarTone: '#f59e0b', favorites: ['History', 'Language', 'English'], grades: { Math: 5.9, Language: 7.8, Science: 6.1, History: 8.3, English: 7.5 }, following: ['teacher', 'ana'] },
    { id: 'diego', role: 'student' as Role, name: 'Diego Melo', username: 'diego', classroom: 'B', bio: 'Fast learner and metrics fan.', status: 'On a winning streak', streak: 8, level: 5, avatarTone: '#ef4444', favorites: ['Math', 'Science', 'English'], grades: { Math: 9.6, Language: 8.8, Science: 9.2, History: 8.1, English: 9.0 }, following: ['teacher', 'ana'] },
  ],
  posts: [
    { id: 'post-1', authorId: 'teacher', kind: 'regular' as const, body: 'Math review week is live. Focus on equations, geometry, and reading strategies. #math #review #school', createdAt: '2026-04-16T07:30:00-03:00', tags: ['math', 'review', 'school'], pinned: true, likes: ['ana', 'bruno', 'carla'], saves: ['ana'], reposts: ['diego'], comments: [] },
    { id: 'post-2', authorId: 'ana', kind: 'regular' as const, body: 'I am opening a study sprint for Science and Math tonight. Join if you need a calm place to review. #studygroup #science', createdAt: '2026-04-16T08:05:00-03:00', tags: ['studygroup', 'science'], likes: ['teacher', 'diego'], saves: ['teacher', 'bruno'], reposts: [], comments: [{ id: 'comment-1', authorId: 'bruno', body: 'Count me in. I can bring the geometry notes.', createdAt: '2026-04-16T08:12:00-03:00' }] },
    { id: 'post-3', authorId: 'diego', kind: 'quote' as const, body: 'This is exactly the cadence we need before finals.', createdAt: '2026-04-16T08:40:00-03:00', tags: ['focus', 'review'], sourceId: 'post-1', likes: ['teacher', 'ana'], saves: ['ana'], reposts: [], comments: [] },
  ],
  groups: [
    { id: 'group-a', title: 'Class A', description: 'Planning, quick answers, and classroom operations.', classroom: 'A', members: ['teacher', 'ana', 'bruno'], studentsCanPost: true, membersVisibleToStudents: true, messages: [{ id: 'group-a-1', authorId: 'teacher', body: 'Good morning, Class A. Share blockers for this week here.', createdAt: '2026-04-16T07:10:00-03:00', readBy: ['teacher', 'ana'] }, { id: 'group-a-2', authorId: 'ana', body: 'I need help with the last geometry exercise set.', createdAt: '2026-04-16T07:18:00-03:00', readBy: ['teacher', 'ana'] }] },
    { id: 'group-b', title: 'Class B', description: 'History, science, and assignment follow-up.', classroom: 'B', members: ['teacher', 'carla', 'diego'], studentsCanPost: true, membersVisibleToStudents: true, messages: [{ id: 'group-b-1', authorId: 'teacher', body: 'Remember: the history project outline is due tomorrow.', createdAt: '2026-04-16T06:55:00-03:00', readBy: ['teacher', 'carla', 'diego'] }] },
  ],
  directThreads: [
    { id: 'direct-ana', members: ['teacher', 'ana'] as [string, string], messages: [{ id: 'direct-ana-1', authorId: 'teacher', body: 'Ana, your math streak is excellent. Keep the pacing balanced.', createdAt: '2026-04-15T18:10:00-03:00', readBy: ['teacher', 'ana'] }] },
    { id: 'direct-carla', members: ['teacher', 'carla'] as [string, string], messages: [{ id: 'direct-carla-1', authorId: 'carla', body: 'Can I get an extra reference list for the history task?', createdAt: '2026-04-16T07:45:00-03:00', readBy: ['carla'] }] },
  ],
  tasks: [
    { id: 'task-1', title: 'Math sprint: equations and geometry', subject: 'Math', classroom: 'A', deadline: '2026-04-18', description: 'Finish pages 42-55 and explain where you got stuck.', attachments: ['worksheet-set-a.pdf', 'review-video-link'], submissions: [{ userId: 'ana', status: 'submitted' as const, note: 'Done. I need feedback on exercise 8.', attachments: ['ana-equations-notes.pdf'] }, { userId: 'bruno', status: 'pending' as const, note: '', attachments: [] }] },
    { id: 'task-2', title: 'History outline with references', subject: 'History', classroom: 'B', deadline: '2026-04-17', description: 'Build the first version of the project outline with three references.', attachments: ['history-brief.pdf'], submissions: [{ userId: 'carla', status: 'submitted' as const, note: 'Uploading my first version now.', attachments: ['outline-v1.docx'] }] },
  ],
  notifications: [
    { id: 'notification-1', type: 'academic' as const, message: 'A new math sprint task is ready for Class A.', createdAt: '2026-04-16T07:32:00-03:00', readBy: ['teacher'] },
    { id: 'notification-2', type: 'message' as const, message: 'Carla sent a direct message asking for new references.', createdAt: '2026-04-16T07:45:00-03:00', readBy: ['carla'] },
    { id: 'notification-3', type: 'social' as const, message: 'Diego quoted the teacher post about exam week.', createdAt: '2026-04-16T08:40:00-03:00', readBy: ['diego'] },
  ],
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
}

function extractTags(body: string) {
  return [...body.matchAll(/#([a-z0-9-_]+)/gi)].map((match) => match[1].toLowerCase());
}

export default function App() {
  const [state, setState] = useState(() => {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : seed;
  });
  const [composer, setComposer] = useState('');
  const [quoteBody, setQuoteBody] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', subject: 'Math', classroom: '', deadline: '', description: '', attachments: '' });
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const [taskAttachments, setTaskAttachments] = useState<Record<string, string>>({});
  const [groupDraft, setGroupDraft] = useState({ title: '', description: '', studentsCanPost: true, membersVisibleToStudents: true });

  const currentUser = state.users.find((user: User) => user.id === state.currentUserId) ?? null;
  const t = translations[state.preferences.language];

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
    document.documentElement.dataset.reduceMotion = String(state.preferences.reduceMotion);
    document.documentElement.lang = state.preferences.language === 'en' ? 'en' : 'pt-BR';
  }, [state.preferences]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setState((current: typeof seed) => ({ ...current, modal: null, searchOpen: false, searchQuery: '' }));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (state.modal?.type === 'group') {
      const group = state.groups.find((item: ChatGroup) => item.id === state.modal?.groupId);
      if (group) {
        setGroupDraft({ title: group.title, description: group.description, studentsCanPost: group.studentsCanPost, membersVisibleToStudents: group.membersVisibleToStudents });
      }
    }
    if (state.modal?.type === 'notifications' && currentUser) {
      setState((current: typeof seed) => ({
        ...current,
        notifications: current.notifications.map((notification: Notification) => notification.readBy.includes(currentUser.id) ? notification : { ...notification, readBy: [...notification.readBy, currentUser.id] }),
      }));
    }
  }, [currentUser, state.modal, state.groups]);

  const feedPosts = useMemo(() => [...state.posts].sort((left: Post, right: Post) => Number(Boolean(right.pinned)) - Number(Boolean(left.pinned)) || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()), [state.posts]);
  const trending = useMemo(() => {
    const counter = new Map<string, number>();
    state.posts.forEach((post: Post) => post.tags.forEach((tag) => counter.set(tag, (counter.get(tag) ?? 0) + 1)));
    return [...counter.entries()].map(([tag, count]) => ({ tag, count })).sort((left, right) => right.count - left.count);
  }, [state.posts]);
  const unreadNotifications = currentUser ? state.notifications.filter((notification: Notification) => !notification.readBy.includes(currentUser.id)).length : 0;
  const threadSummaries = useMemo(() => {
    if (!currentUser) return [] as Array<{ id: string; title: string; subtitle: string; unread: number; type: 'group' | 'direct' }>;
    const groups = state.groups.filter((group: ChatGroup) => group.members.includes(currentUser.id)).map((group: ChatGroup) => ({ id: group.id, title: group.title, subtitle: group.description, unread: group.messages.filter((message: Message) => !message.readBy.includes(currentUser.id)).length, type: 'group' as const }));
    const directs = state.directThreads.filter((thread: DirectThread) => thread.members.includes(currentUser.id)).map((thread: DirectThread) => {
      const partner = state.users.find((user: User) => thread.members.includes(user.id) && user.id !== currentUser.id);
      return { id: thread.id, title: partner?.name ?? 'Direct thread', subtitle: partner?.role === 'teacher' ? 'Teacher chat' : `Class ${partner?.classroom ?? '-'}`, unread: thread.messages.filter((message: Message) => !message.readBy.includes(currentUser.id)).length, type: 'direct' as const };
    });
    return [...groups, ...directs];
  }, [currentUser, state.directThreads, state.groups, state.users]);
  const activeThread = state.groups.find((group: ChatGroup) => group.id === state.activeThreadId) ?? state.directThreads.find((thread: DirectThread) => thread.id === state.activeThreadId) ?? null;
  const searchResults = useMemo(() => {
    const query = state.searchQuery.trim().toLowerCase();
    if (query.length < 2) return [] as Array<{ id: string; type: string; title: string; subtitle: string; action: () => void }>;
    const results: Array<{ id: string; type: string; title: string; subtitle: string; action: () => void }> = [];
    state.users.forEach((user: User) => {
      if (user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query)) {
        results.push({ id: `user-${user.id}`, type: 'user', title: user.name, subtitle: user.role === 'teacher' ? 'Teacher' : `Class ${user.classroom}`, action: () => setState((current: typeof seed) => ({ ...current, page: 'profile', selectedProfileId: user.id, searchOpen: false, searchQuery: '' })) });
      }
    });
    state.groups.forEach((group: ChatGroup) => {
      if (group.title.toLowerCase().includes(query) || group.description.toLowerCase().includes(query)) {
        results.push({ id: `group-${group.id}`, type: 'chat', title: group.title, subtitle: group.description, action: () => setState((current: typeof seed) => ({ ...current, page: 'messages', activeThreadId: group.id, searchOpen: false, searchQuery: '' })) });
      }
    });
    state.posts.forEach((post: Post) => {
      if (post.body.toLowerCase().includes(query) || post.tags.some((tag) => tag.includes(query))) {
        const author = state.users.find((user: User) => user.id === post.authorId);
        results.push({ id: `post-${post.id}`, type: 'post', title: author?.name ?? 'Post', subtitle: post.body.slice(0, 72), action: () => setState((current: typeof seed) => ({ ...current, page: 'feed', searchOpen: false, searchQuery: '' })) });
      }
    });
    state.tasks.forEach((task: Task) => {
      if (task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) {
        results.push({ id: `task-${task.id}`, type: 'task', title: task.title, subtitle: `${task.subject} · ${task.deadline}`, action: () => setState((current: typeof seed) => ({ ...current, page: 'tasks', searchOpen: false, searchQuery: '' })) });
      }
    });
    return results;
  }, [state.groups, state.page, state.posts, state.searchQuery, state.tasks, state.users]);

  const profileUser = state.users.find((user: User) => user.id === (state.modal?.type === 'profile' ? state.modal.userId : state.selectedProfileId)) ?? null;
  const profilePosts = profileUser ? feedPosts.filter((post: Post) => post.authorId === profileUser.id) : [];
  const followSuggestions = currentUser ? state.users.filter((user: User) => user.id !== currentUser.id && user.role === 'student' && !currentUser.following.includes(user.id)).slice(0, 4) : [];
  const topStudents = [...state.users.filter((user: User) => user.role === 'student')].sort((left, right) => average(Object.values(right.grades)) - average(Object.values(left.grades))).slice(0, 4);

  const navigation = [
    { key: 'feed' as Page, label: t.feed, icon: LayoutDashboard },
    { key: 'messages' as Page, label: t.messages, icon: MessageSquare },
    { key: 'tasks' as Page, label: t.tasks, icon: Brain },
    { key: 'analytics' as Page, label: t.analytics, icon: Bell },
    { key: 'settings' as Page, label: t.settings, icon: Settings },
  ];

  function setPage(page: Page) {
    setState((current: typeof seed) => ({ ...current, page, searchOpen: false, searchQuery: '' }));
  }

  function loginAs(userId: string) {
    setState((current: typeof seed) => ({ ...current, currentUserId: userId, page: 'feed' }));
  }

  function logout() {
    setState((current: typeof seed) => ({ ...current, currentUserId: null, page: 'feed', modal: null }));
  }

  function createPost() {
    if (!currentUser || !composer.trim()) return;
    setState((current: typeof seed) => ({
      ...current,
      posts: [
        { id: makeId('post'), authorId: currentUser.id, kind: 'regular', body: composer.trim(), createdAt: new Date().toISOString(), tags: extractTags(composer), pinned: currentUser.role === 'teacher', likes: [], saves: [], reposts: [], comments: [] },
        ...current.posts,
      ],
      notifications: [{ id: makeId('notification'), type: 'social', message: `${currentUser.name} published a new post.`, createdAt: new Date().toISOString(), readBy: [] }, ...current.notifications],
    }));
    setComposer('');
  }

  function toggleLike(postId: string) {
    if (!currentUser) return;
    setState((current: typeof seed) => ({
      ...current,
      posts: current.posts.map((post: Post) => post.id !== postId ? post : { ...post, likes: post.likes.includes(currentUser.id) ? post.likes.filter((id) => id !== currentUser.id) : [...post.likes, currentUser.id] }),
    }));
  }

  function toggleSave(postId: string) {
    if (!currentUser) return;
    setState((current: typeof seed) => ({
      ...current,
      posts: current.posts.map((post: Post) => post.id !== postId ? post : { ...post, saves: post.saves.includes(currentUser.id) ? post.saves.filter((id) => id !== currentUser.id) : [...post.saves, currentUser.id] }),
    }));
  }

  function repostPost(postId: string) {
    if (!currentUser) return;
    const source = state.posts.find((post: Post) => post.id === postId);
    if (!source) return;
    setState((current: typeof seed) => ({
      ...current,
      posts: [
        { id: makeId('post'), authorId: currentUser.id, kind: 'repost', body: '', createdAt: new Date().toISOString(), tags: source.tags, sourceId: source.id, likes: [], saves: [], reposts: [], comments: [] },
        ...current.posts.map((post: Post) => post.id !== source.id || post.reposts.includes(currentUser.id) ? post : { ...post, reposts: [...post.reposts, currentUser.id] }),
      ],
    }));
  }

  function createQuote() {
    if (!currentUser || state.modal?.type !== 'quote' || !quoteBody.trim()) return;
    setState((current: typeof seed) => ({
      ...current,
      posts: [
        { id: makeId('post'), authorId: currentUser.id, kind: 'quote', body: quoteBody.trim(), createdAt: new Date().toISOString(), tags: extractTags(quoteBody), sourceId: state.modal?.sourceId, likes: [], saves: [], reposts: [], comments: [] },
        ...current.posts.map((post: Post) => post.id !== state.modal?.sourceId || post.reposts.includes(currentUser.id) ? post : { ...post, reposts: [...post.reposts, currentUser.id] }),
      ],
      modal: null,
    }));
    setQuoteBody('');
  }

  function addComment(postId: string, body: string) {
    if (!currentUser || !body.trim()) return;
    setState((current: typeof seed) => ({ ...current, posts: current.posts.map((post: Post) => post.id !== postId ? post : { ...post, comments: [...post.comments, { id: makeId('comment'), authorId: currentUser.id, body, createdAt: new Date().toISOString() }] }) }));
  }

  function sendMessage() {
    if (!currentUser || !activeThread || !messageBody.trim()) return;
    setState((current: typeof seed) => ({
      ...current,
      groups: current.groups.map((group: ChatGroup) => group.id !== state.activeThreadId ? group : { ...group, messages: [...group.messages, { id: makeId('message'), authorId: currentUser.id, body: messageBody.trim(), createdAt: new Date().toISOString(), readBy: [currentUser.id] }] }),
      directThreads: current.directThreads.map((thread: DirectThread) => thread.id !== state.activeThreadId ? thread : { ...thread, messages: [...thread.messages, { id: makeId('message'), authorId: currentUser.id, body: messageBody.trim(), createdAt: new Date().toISOString(), readBy: [currentUser.id] }] }),
      notifications: [{ id: makeId('notification'), type: 'message', message: `${currentUser.name} sent a new message.`, createdAt: new Date().toISOString(), readBy: [currentUser.id] }, ...current.notifications],
    }));
    setMessageBody('');
  }

  function createTask() {
    if (!currentUser || currentUser.role !== 'teacher' || !taskForm.title.trim()) return;
    setState((current: typeof seed) => ({
      ...current,
      tasks: [{ id: makeId('task'), title: taskForm.title.trim(), subject: taskForm.subject, classroom: taskForm.classroom || undefined, deadline: taskForm.deadline, description: taskForm.description, attachments: taskForm.attachments.split(',').map((item) => item.trim()).filter(Boolean), submissions: [] }, ...current.tasks],
      notifications: [{ id: makeId('notification'), type: 'academic', message: `A new task is available: ${taskForm.title.trim()}.`, createdAt: new Date().toISOString(), readBy: [] }, ...current.notifications],
    }));
    setTaskForm({ title: '', subject: 'Math', classroom: '', deadline: '', description: '', attachments: '' });
  }

  function submitTask(taskId: string) {
    if (!currentUser || currentUser.role !== 'student') return;
    setState((current: typeof seed) => ({
      ...current,
      tasks: current.tasks.map((task: Task) => task.id !== taskId ? task : { ...task, submissions: [...task.submissions.filter((submission) => submission.userId !== currentUser.id), { userId: currentUser.id, status: 'submitted', note: taskNotes[taskId] ?? '', attachments: (taskAttachments[taskId] ?? '').split(',').map((item) => item.trim()).filter(Boolean) }] }),
    }));
  }

  function saveGroup() {
    if (!currentUser || currentUser.role !== 'teacher' || state.modal?.type !== 'group') return;
    setState((current: typeof seed) => ({
      ...current,
      groups: current.groups.map((group: ChatGroup) => group.id !== state.modal?.groupId ? group : { ...group, title: groupDraft.title, description: groupDraft.description, studentsCanPost: groupDraft.studentsCanPost, membersVisibleToStudents: groupDraft.membersVisibleToStudents }),
      modal: null,
    }));
  }

  if (!currentUser) {
    return (
      <div className="landing-shell">
        <section className="landing-card">
          <span className="eyebrow">React migration step 2</span>
          <h1>EduSocial is moving from legacy HTML into a real React product surface.</h1>
          <p>This starter already separates feed, messaging, tasks, analytics, settings, search, notifications, theme, and language into a React flow that can evolve into a real backend.</p>
          <div className="quick-grid">
            {['teacher', 'ana', 'diego'].map((id) => {
              const user = seed.users.find((item) => item.id === id)!;
              return (
                <button key={user.id} className="solid-button" type="button" onClick={() => loginAs(user.id)}>
                  <span>{user.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand">EduSocial</div>
          <div className="eyebrow">{currentUser.role === 'teacher' ? 'Teacher mode' : 'Student mode'}</div>
        </div>
        <nav className="nav-stack">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={state.page === item.key ? 'nav-button nav-button--active' : 'nav-button'} type="button" onClick={() => setPage(item.key)}>
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="profile-chip" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, page: 'profile', selectedProfileId: currentUser.id }))}>
          <span className="avatar" style={{ background: currentUser.avatarTone }}>{currentUser.name.slice(0, 1)}</span>
          <span>
            <strong>{currentUser.name}</strong>
            <small>{currentUser.role === 'teacher' ? 'Teacher' : `Class ${currentUser.classroom}`}</small>
          </span>
        </button>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <div className="eyebrow">{currentUser.role === 'teacher' ? 'Teacher mode' : 'Student mode'}</div>
            <h2>{state.page === 'messages' ? t.messages : state.page === 'tasks' ? t.tasks : state.page === 'analytics' ? t.analytics : state.page === 'settings' ? t.settings : state.page === 'profile' ? t.profile : t.feed}</h2>
          </div>
          <div className="topbar-actions">
            <div className="search-box-wrap">
              <div className={state.searchOpen ? 'search-box search-box--open' : 'search-box'}>
                <button className="icon-button ghost" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, searchOpen: !current.searchOpen }))}><Search size={16} /></button>
                <input value={state.searchQuery} onChange={(event) => setState((current: typeof seed) => ({ ...current, searchQuery: event.target.value, searchOpen: true }))} placeholder={`${t.search}...`} />
                {state.searchQuery ? <button className="icon-button ghost" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, searchQuery: '' }))}>×</button> : null}
              </div>
              {state.searchOpen ? (
                <div className="search-results">
                  {searchResults.length ? searchResults.map((result) => (
                    <button key={result.id} className="search-result" type="button" onClick={result.action}>
                      <strong>{result.title}</strong>
                      <small>{result.subtitle}</small>
                    </button>
                  )) : <div className="empty">{state.searchQuery.length > 1 ? 'No results' : 'Type to search...'}</div>}
                </div>
              ) : null}
            </div>
            <button className="icon-button badge-anchor" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: { type: 'notifications' } }))} title={t.notifications}>
              <Bell size={16} />
              {unreadNotifications ? <span className="badge">{unreadNotifications}</span> : null}
            </button>
            <button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, preferences: { ...current.preferences, theme: current.preferences.theme === 'dark' ? 'light' : 'dark' } }))}>{state.preferences.theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}</button>
            <button className="icon-button pill" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, preferences: { ...current.preferences, language: current.preferences.language === 'pt' ? 'en' : 'pt' } }))}><Globe2 size={16} /><span>{state.preferences.language === 'pt' ? 'EN' : 'PT'}</span></button>
            <button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: { type: 'profile', userId: currentUser.id } }))}><UserRound size={16} /></button>
            <button className="icon-button" type="button" onClick={logout}><X size={16} /></button>
          </div>
        </header>

        <main className="page">
          {state.page === 'feed' ? (
            <div className="grid feed-grid">
              <section className="stack">
                <div className="hero">
                  <div>
                    <div className="eyebrow">{currentUser.role === 'teacher' ? 'Teacher pulse' : 'Student rhythm'}</div>
                    <h1>{currentUser.role === 'teacher' ? 'Run the school community from one surface.' : 'Keep your learning loop visible and social.'}</h1>
                    <p>{currentUser.role === 'teacher' ? 'Track participation, push academic context into the feed, and keep groups aligned.' : 'Post progress, save useful content, and keep tasks, groups, and momentum connected.'}</p>
                  </div>
                </div>

                <section className="card">
                  <div className="eyebrow">Composer</div>
                  <textarea rows={4} value={composer} onChange={(event) => setComposer(event.target.value)} placeholder={currentUser.role === 'teacher' ? 'Share guidance, context, or a school-wide update...' : 'Share a study update, a question, or something useful...'} />
                  <div className="row between">
                    <small className="muted">Use hashtags like #math #review #studygroup</small>
                    <button className="solid-button" type="button" onClick={createPost}>{t.publish}</button>
                  </div>
                </section>

                <section className="stack">
                  {feedPosts.map((post: Post) => {
                    const author = state.users.find((user: User) => user.id === post.authorId);
                    const source = state.posts.find((item: Post) => item.id === post.sourceId);
                    const sourceAuthor = state.users.find((user: User) => user.id === source?.authorId);
                    return (
                      <article key={post.id} className="card post-card">
                        <button className="person-link" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: { type: 'profile', userId: author!.id } }))}>
                          <span className="avatar" style={{ background: author?.avatarTone }}>{author?.name.slice(0, 1)}</span>
                          <span>
                            <strong>{author?.name}</strong>
                            <small>{author?.role === 'teacher' ? 'Teacher' : `Class ${author?.classroom}`}</small>
                          </span>
                        </button>
                        {post.kind !== 'regular' && source ? (
                          <div className="quoted">
                            <div className="eyebrow">{post.kind === 'quote' ? 'Quoted post' : 'Reposted post'}</div>
                            <strong>{sourceAuthor?.name}</strong>
                            <p>{source.body}</p>
                          </div>
                        ) : null}
                        {post.body ? <p className="post-text">{post.body}</p> : null}
                        <div className="tag-list">{post.tags.map((tag) => <span key={tag} className="pill-tag">#{tag}</span>)}</div>
                        <div className="actions-row">
                          <button className={currentUser && post.likes.includes(currentUser.id) ? 'action action--liked' : 'action'} type="button" onClick={() => toggleLike(post.id)}><Heart size={16} /><span>{post.likes.length}</span></button>
                          <button className="action" type="button" onClick={() => addComment(post.id, currentUser.role === 'teacher' ? 'Teacher acknowledged.' : 'Noted, joining the review block.')}><MessageSquare size={16} /><span>{post.comments.length}</span></button>
                          <button className="action" type="button" onClick={() => repostPost(post.id)}><Repeat2 size={16} /></button>
                          <button className="action" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: { type: 'quote', sourceId: post.id } }))}><Quote size={16} /></button>
                          <button className={currentUser && post.saves.includes(currentUser.id) ? 'action action--saved' : 'action'} type="button" onClick={() => toggleSave(post.id)}><Bookmark size={16} /></button>
                        </div>
                      </article>
                    );
                  })}
                </section>
              </section>

              <aside className="stack">
                <section className="card">
                  <div className="eyebrow">{currentUser.role === 'teacher' ? 'Social radar' : 'Weekly focus'}</div>
                  <div className="stack-small">
                    {(currentUser.role === 'teacher' ? trending : [{ tag: 'mission', count: 3 }, { tag: 'focus', count: 2 }]).slice(0, 4).map((item) => (
                      <div key={item.tag} className="mini-card">
                        <strong>#{item.tag}</strong>
                        <small>{currentUser.role === 'teacher' ? `${item.count} posts` : `${item.count * 10} XP available`}</small>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="card">
                  <div className="eyebrow">People to follow</div>
                  <div className="stack-small">
                    {followSuggestions.map((user) => (
                      <button key={user.id} className="person-link" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: { type: 'profile', userId: user.id } }))}>
                        <span className="avatar" style={{ background: user.avatarTone }}>{user.name.slice(0, 1)}</span>
                        <span>
                          <strong>{user.name}</strong>
                          <small>Class {user.classroom}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="card">
                  <div className="eyebrow">Top students</div>
                  <div className="stack-small">
                    {topStudents.map((user, index) => (
                      <div key={user.id} className="person-link static">
                        <span className="rank">{index + 1}</span>
                        <span className="avatar" style={{ background: user.avatarTone }}>{user.name.slice(0, 1)}</span>
                        <span>
                          <strong>{user.name}</strong>
                          <small>{average(Object.values(user.grades)).toFixed(1)} average</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          ) : null}

          {state.page === 'messages' ? (
            <div className="grid messages-grid">
              <section className="card stack-small">
                <div className="eyebrow">Threads</div>
                {threadSummaries.map((thread) => (
                  <button key={thread.id} className={thread.id === state.activeThreadId ? 'thread active-thread' : 'thread'} type="button" onClick={() => setState((current: typeof seed) => ({ ...current, activeThreadId: thread.id }))}>
                    <strong>{thread.title}</strong>
                    <small>{thread.subtitle}</small>
                  </button>
                ))}
              </section>
              <section className="card conversation-card">
                <div className="row between">
                  <div>
                    <div className="eyebrow">Conversation</div>
                    <h3>{'title' in (activeThread ?? {}) ? (activeThread as ChatGroup).title : threadSummaries.find((thread) => thread.id === state.activeThreadId)?.title}</h3>
                  </div>
                  {'title' in (activeThread ?? {}) && currentUser.role === 'teacher' ? <button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: { type: 'group', groupId: (activeThread as ChatGroup).id } }))}><Settings size={16} /></button> : null}
                </div>
                <div className="message-stream">
                  {activeThread ? activeThread.messages.map((message: Message) => {
                    const author = state.users.find((user: User) => user.id === message.authorId)!;
                    return <article key={message.id} className={author.id === currentUser.id ? 'bubble bubble--self' : 'bubble'}><strong>{author.name}</strong><p>{message.body}</p><small>{formatDate(message.createdAt)}</small></article>;
                  }) : <div className="empty">Select a thread.</div>}
                </div>
                <div className="row">
                  <input value={messageBody} onChange={(event) => setMessageBody(event.target.value)} placeholder="Write a message..." />
                  <button className="solid-button" type="button" onClick={sendMessage}>{t.send}</button>
                </div>
              </section>
              <aside className="card stack-small">
                <div className="eyebrow">Group visibility</div>
                {'title' in (activeThread ?? {}) ? (
                  <>
                    <span className="pill-tag">{(activeThread as ChatGroup).studentsCanPost ? 'Students can post' : 'Teacher-only posting'}</span>
                    <span className="pill-tag">{(activeThread as ChatGroup).membersVisibleToStudents ? 'Members visible' : 'Members hidden for students'}</span>
                    {currentUser.role === 'teacher' || (activeThread as ChatGroup).membersVisibleToStudents ? (activeThread as ChatGroup).members.map((memberId: string) => {
                      const member = state.users.find((user: User) => user.id === memberId)!;
                      return <div key={member.id} className="person-link static"><span className="avatar" style={{ background: member.avatarTone }}>{member.name.slice(0, 1)}</span><span><strong>{member.name}</strong><small>{member.role === 'teacher' ? 'Can edit' : 'Read / participate'}</small></span></div>;
                    }) : <div className="empty">Member list hidden for students.</div>}
                  </>
                ) : <div className="empty">Direct thread details appear here.</div>}
              </aside>
            </div>
          ) : null}

          {state.page === 'tasks' ? (
            <div className="stack">
              {currentUser.role === 'teacher' ? (
                <section className="card stack-small">
                  <div className="eyebrow">Create task</div>
                  <div className="form-grid">
                    <input value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} placeholder="Task title" />
                    <input value={taskForm.subject} onChange={(event) => setTaskForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Subject" />
                    <input value={taskForm.classroom} onChange={(event) => setTaskForm((current) => ({ ...current, classroom: event.target.value }))} placeholder="Classroom" />
                    <input type="date" value={taskForm.deadline} onChange={(event) => setTaskForm((current) => ({ ...current, deadline: event.target.value }))} />
                    <textarea rows={4} value={taskForm.description} onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description and rubric" />
                    <input value={taskForm.attachments} onChange={(event) => setTaskForm((current) => ({ ...current, attachments: event.target.value }))} placeholder="Attachments, comma separated" />
                  </div>
                  <div className="row end"><button className="solid-button" type="button" onClick={createTask}>{t.save}</button></div>
                </section>
              ) : null}
              {state.tasks.filter((task: Task) => !currentUser.classroom || !task.classroom || task.classroom === currentUser.classroom).map((task: Task) => {
                const submission = task.submissions.find((item) => item.userId === currentUser.id);
                return (
                  <article key={task.id} className="card stack-small">
                    <div className="row between wrap">
                      <div>
                        <div className="eyebrow">{task.subject}</div>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>
                      </div>
                      <div className="stack-small"><span className="pill-tag">Deadline {task.deadline}</span><small className="muted">{task.attachments.join(', ') || 'No attachments'}</small></div>
                    </div>
                    {currentUser.role === 'teacher' ? (
                      <div className="stack-small">
                        {task.submissions.length ? task.submissions.map((item) => {
                          const student = state.users.find((user: User) => user.id === item.userId)!;
                          return <div key={item.userId} className="mini-card"><strong>{student.name}</strong><small>{item.status}</small><p>{item.note || 'No note yet.'}</p></div>;
                        }) : <div className="empty">No submissions yet.</div>}
                      </div>
                    ) : (
                      <div className="stack-small">
                        <textarea rows={3} value={taskNotes[task.id] ?? submission?.note ?? ''} onChange={(event) => setTaskNotes((current) => ({ ...current, [task.id]: event.target.value }))} placeholder="Write your delivery note" />
                        <input value={taskAttachments[task.id] ?? submission?.attachments.join(', ') ?? ''} onChange={(event) => setTaskAttachments((current) => ({ ...current, [task.id]: event.target.value }))} placeholder="Attachments or links, comma separated" />
                        <div className="row between"><span className="pill-tag">{submission?.status ?? 'pending'}</span><button className="solid-button" type="button" onClick={() => submitTask(task.id)}>Send delivery</button></div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : null}

          {state.page === 'analytics' ? (
            <div className="stack">
              <div className="hero"><div><div className="eyebrow">Analytics layer</div><h1>{currentUser.role === 'teacher' ? 'See feed, tasks, groups, and classroom averages together.' : 'Track your performance without leaving the product flow.'}</h1><p>{currentUser.role === 'teacher' ? 'This page replaces scattered counters with a central teaching dashboard.' : 'Student analytics stay compact but clear: grades, streak, saved content, and message load.'}</p></div></div>
              <div className="metrics-row">
                <div className="metric"><small>Total posts</small><strong>{state.posts.length}</strong></div>
                <div className="metric"><small>Open tasks</small><strong>{state.tasks.length}</strong></div>
                <div className="metric"><small>Unread alerts</small><strong>{unreadNotifications}</strong></div>
                <div className="metric"><small>Top average</small><strong>{average(Object.values(topStudents[0]?.grades ?? {})).toFixed(1)}</strong></div>
              </div>
              <section className="card stack-small">
                <div className="eyebrow">Classroom averages</div>
                {[...new Set(state.users.filter((user: User) => user.role === 'student').map((user: User) => user.classroom))].map((classroom) => {
                  const classroomUsers = state.users.filter((user: User) => user.classroom === classroom);
                  const value = average(classroomUsers.map((user: User) => average(Object.values(user.grades))));
                  return <div key={classroom} className="bar-row"><span>{classroom}</span><div className="bar"><div style={{ width: `${value * 10}%` }} /></div><strong>{value.toFixed(1)}</strong></div>;
                })}
              </section>
            </div>
          ) : null}

          {state.page === 'settings' ? (
            <div className="grid settings-grid">
              <section className="card stack-small">
                <div className="eyebrow">Appearance</div>
                <button className="ghost-button full" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, preferences: { ...current.preferences, theme: current.preferences.theme === 'dark' ? 'light' : 'dark' } }))}>Theme: {state.preferences.theme}</button>
                <button className="ghost-button full" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, preferences: { ...current.preferences, language: current.preferences.language === 'pt' ? 'en' : 'pt' } }))}>Language: {state.preferences.language}</button>
                <label className="checkbox"><input type="checkbox" checked={state.preferences.reduceMotion} onChange={(event) => setState((current: typeof seed) => ({ ...current, preferences: { ...current.preferences, reduceMotion: event.target.checked } }))} /><span>Reduce motion</span></label>
              </section>
              <section className="card stack-small">
                <div className="eyebrow">Demo control</div>
                <p className="muted">The old inline HTML database is gone from the runtime. This React version persists locally and can be replaced by a real backend later.</p>
                <button className="ghost-button full" type="button" onClick={() => setState(seed)}>Reset demo state</button>
              </section>
            </div>
          ) : null}

          {state.page === 'profile' && profileUser ? (
            <div className="stack">
              <section className="card profile-hero-card">
                <div className="cover" />
                <div className="profile-body">
                  <span className="profile-avatar" style={{ background: profileUser.avatarTone }}>{profileUser.name.slice(0, 1)}</span>
                  <div>
                    <div className="eyebrow">{profileUser.role === 'teacher' ? 'Teacher profile' : `Class ${profileUser.classroom}`}</div>
                    <h1>{profileUser.name}</h1>
                    <p>{profileUser.bio}</p>
                    <div className="tag-list">
                      <span className="pill-tag">Average {average(Object.values(profileUser.grades)).toFixed(1)}</span>
                      <span className="pill-tag">Streak {profileUser.streak}</span>
                      <span className="pill-tag">Level {profileUser.level}</span>
                    </div>
                  </div>
                </div>
              </section>
              <div className="grid feed-grid">
                <section className="stack">{profilePosts.map((post: Post) => <article key={post.id} className="card"><p className="post-text">{post.body || 'Reposted a post'}</p></article>)}</section>
                <aside className="card stack-small"><div className="eyebrow">Favorites</div>{profileUser.favorites.map((item) => <span key={item} className="pill-tag">{item}</span>)}<div className="eyebrow">Status</div><p className="muted">{profileUser.status}</p></aside>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {state.modal ? (
        <div className="modal-backdrop" onClick={() => setState((current: typeof seed) => ({ ...current, modal: null }))}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            {state.modal.type === 'notifications' ? (
              <>
                <div className="row between"><div><div className="eyebrow">{t.notifications}</div><h3>Inbox</h3></div><button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: null }))}><X size={16} /></button></div>
                <div className="stack-small">{state.notifications.map((notification: Notification) => <div key={notification.id} className="mini-card"><strong>{notification.message}</strong><small>{formatDate(notification.createdAt)}</small></div>)}</div>
              </>
            ) : null}

            {state.modal.type === 'quote' ? (
              <>
                <div className="row between"><div><div className="eyebrow">Quote post</div><h3>Write your context</h3></div><button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: null }))}><X size={16} /></button></div>
                <textarea rows={5} value={quoteBody} onChange={(event) => setQuoteBody(event.target.value)} placeholder="Add your analysis or recommendation..." />
                <div className="row end"><button className="solid-button" type="button" onClick={createQuote}>{t.save}</button></div>
              </>
            ) : null}

            {state.modal.type === 'group' ? (
              <>
                <div className="row between"><div><div className="eyebrow">Group management</div><h3>Edit group details</h3></div><button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: null }))}><X size={16} /></button></div>
                <input value={groupDraft.title} onChange={(event) => setGroupDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Group title" />
                <textarea rows={4} value={groupDraft.description} onChange={(event) => setGroupDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Group description" />
                <label className="checkbox"><input type="checkbox" checked={groupDraft.studentsCanPost} onChange={(event) => setGroupDraft((current) => ({ ...current, studentsCanPost: event.target.checked }))} /><span>Students can publish</span></label>
                <label className="checkbox"><input type="checkbox" checked={groupDraft.membersVisibleToStudents} onChange={(event) => setGroupDraft((current) => ({ ...current, membersVisibleToStudents: event.target.checked }))} /><span>Members visible to students</span></label>
                <div className="row end"><button className="solid-button" type="button" onClick={saveGroup}>{t.save}</button></div>
              </>
            ) : null}

            {state.modal.type === 'profile' && profileUser ? (
              <>
                <div className="row between"><div><div className="eyebrow">{t.profile}</div><h3>{profileUser.name}</h3></div><div className="modal-actions"><button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, page: 'profile', selectedProfileId: profileUser.id, modal: null }))}><UserRound size={16} /></button><button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: null }))}>←</button><button className="icon-button" type="button" onClick={() => setState((current: typeof seed) => ({ ...current, modal: null }))}><X size={16} /></button></div></div>
                <div className="profile-inline"><span className="profile-avatar small" style={{ background: profileUser.avatarTone }}>{profileUser.name.slice(0, 1)}</span><div><strong>{profileUser.name}</strong><p className="muted">{profileUser.bio}</p><small className="muted">{profileUser.status}</small></div></div>
                <div className="stack-small">{profilePosts.slice(0, 3).map((post: Post, index) => <div key={post.id} className={index > 0 ? 'mini-card preview-extra' : 'mini-card'}><strong>{formatDate(post.createdAt)}</strong><p>{post.body || 'Reposted a post'}</p></div>)}</div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
