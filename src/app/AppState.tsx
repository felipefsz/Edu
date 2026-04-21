import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { seedState } from '../data/mockData';
import {
  getCurrentUser,
  getPostById,
  markMissionDone,
  nextNotificationReadState,
} from '../utils/selectors';
import { translate } from './translations';
import type {
  AppNotification,
  AppState,
  ChatGroup,
  MessageAttachment,
  ModalState,
  PageKey,
  Preferences,
  Role,
} from './types';
import type { TranslationKey } from './translations';

const STORAGE_KEY = 'edusocial-react-state';

interface CreateTaskInput {
  title: string;
  subject: string;
  classroom?: string;
  deadline: string;
  description: string;
  attachments: string[];
}

interface CreateNoticeInput {
  title: string;
  body: string;
  classroom?: string;
  pinned?: boolean;
}

interface AppContextValue {
  state: AppState;
  currentUser: ReturnType<typeof getCurrentUser>;
  currentRole: Role | null;
  t: (key: TranslationKey) => string;
  loginAs: (userId: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  updatePreferences: (partial: Partial<Preferences>) => void;
  updateNotificationChannel: (channel: keyof Preferences['notificationChannels'], value: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  selectThread: (threadId: string) => void;
  markNotificationsSeen: () => void;
  createPost: (body: string, options?: { pinned?: boolean }) => void;
  createQuotePost: (sourcePostId: string, body: string) => void;
  repostPost: (sourcePostId: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addComment: (postId: string, body: string) => void;
  sendMessage: (threadId: string, body: string) => void;
  updateGroup: (groupId: string, patch: Partial<ChatGroup>) => void;
  createTask: (input: CreateTaskInput) => void;
  submitTask: (taskId: string, note: string, attachments: string[]) => void;
  reviewTaskSubmission: (taskId: string, userId: string, feedback: string, score?: number) => void;
  createNotice: (input: CreateNoticeInput) => void;
  toggleFollow: (targetUserId: string) => void;
  completeMission: (missionId: string) => void;
  resetDemoState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function hydrateState(): AppState {
  if (typeof window === 'undefined') return seedState;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedState;

  try {
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...seedState,
      ...parsed,
      preferences: {
        ...seedState.preferences,
        ...parsed.preferences,
        notificationChannels: {
          ...seedState.preferences.notificationChannels,
          ...parsed.preferences.notificationChannels,
        },
      },
      ui: {
        ...seedState.ui,
        ...parsed.ui,
      },
      session: {
        ...seedState.session,
        ...parsed.session,
      },
    };
  } catch {
    return seedState;
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;
}

function extractTags(body: string) {
  return [...body.matchAll(/#([a-z0-9-_]+)/gi)].map((match) => match[1].toLowerCase());
}

function createNotification(
  message: string,
  type: AppNotification['type'],
  targetPage: PageKey | 'profile',
  targetId?: string,
): AppNotification {
  return {
    id: makeId('notification'),
    type,
    message,
    createdAt: new Date().toISOString(),
    targetPage,
    targetId,
    readByUserIds: [],
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(() => hydrateState());
  const currentUser = getCurrentUser(state);
  const currentRole = currentUser?.role ?? null;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
    document.documentElement.dataset.reduceMotion = String(state.preferences.reduceMotion);
    document.documentElement.dataset.feedDensity = state.preferences.feedDensity;
    document.documentElement.dataset.chatDensity = state.preferences.chatDensity;
    document.documentElement.dataset.transparency = state.preferences.transparency;
    document.documentElement.lang = state.preferences.language === 'en' ? 'en' : 'pt-BR';
  }, [state.preferences]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      setState((currentState) => {
        if (currentState.ui.modal || currentState.ui.searchOpen) {
          return {
            ...currentState,
            ui: {
              ...currentState.ui,
              modal: null,
              searchOpen: false,
            },
          };
        }
        return currentState;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const t = (key: TranslationKey) =>
    translate(state.preferences.language, key);

  const loginAs = (userId: string) => {
    setState((currentState) => ({
      ...currentState,
      session: {
        currentUserId: userId,
      },
      ui: {
        ...currentState.ui,
        activeThreadId: currentState.chatGroups.find((group) => group.members.includes(userId))?.id ?? 'group-a',
      },
    }));
  };

  const logout = () => {
    setState((currentState) => ({
      ...currentState,
      session: { currentUserId: null },
      ui: {
        ...currentState.ui,
        modal: null,
        searchOpen: false,
        searchQuery: '',
      },
    }));
  };

  const toggleTheme = () => {
    setState((currentState) => ({
      ...currentState,
      preferences: {
        ...currentState.preferences,
        theme: currentState.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  const toggleLanguage = () => {
    setState((currentState) => ({
      ...currentState,
      preferences: {
        ...currentState.preferences,
        language: currentState.preferences.language === 'pt' ? 'en' : 'pt',
      },
    }));
  };

  const updatePreferences = (partial: Partial<Preferences>) => {
    setState((currentState) => ({
      ...currentState,
      preferences: {
        ...currentState.preferences,
        ...partial,
        notificationChannels: {
          ...currentState.preferences.notificationChannels,
          ...partial.notificationChannels,
        },
      },
    }));
  };

  const updateNotificationChannel = (
    channel: keyof Preferences['notificationChannels'],
    value: boolean,
  ) => {
    setState((currentState) => ({
      ...currentState,
      preferences: {
        ...currentState.preferences,
        notificationChannels: {
          ...currentState.preferences.notificationChannels,
          [channel]: value,
        },
      },
    }));
  };

  const setSearchOpen = (open: boolean) => {
    setState((currentState) => ({
      ...currentState,
      ui: {
        ...currentState.ui,
        searchOpen: open,
        searchQuery: open ? currentState.ui.searchQuery : '',
      },
    }));
  };

  const setSearchQuery = (query: string) => {
    setState((currentState) => ({
      ...currentState,
      ui: {
        ...currentState.ui,
        searchQuery: query,
        searchOpen: true,
      },
    }));
  };

  const openModal = (modal: ModalState) => {
    setState((currentState) => ({
      ...currentState,
      ui: {
        ...currentState.ui,
        modal,
      },
    }));
  };

  const closeModal = () => {
    setState((currentState) => ({
      ...currentState,
      ui: {
        ...currentState.ui,
        modal: null,
      },
    }));
  };

  const selectThread = (threadId: string) => {
    setState((currentState) => ({
      ...currentState,
      ui: {
        ...currentState.ui,
        activeThreadId: threadId,
      },
    }));
  };

  const markNotificationsSeen = () => {
    if (!currentUser) return;

    setState((currentState) => ({
      ...currentState,
      notifications: nextNotificationReadState(currentState.notifications, currentUser.id),
    }));
  };

  const createPost = (body: string, options?: { pinned?: boolean }) => {
    if (!currentUser || !body.trim()) return;

    setState((currentState) => ({
      ...currentState,
      posts: [
        {
          id: makeId('post'),
          kind: 'regular',
          authorId: currentUser.id,
          body: body.trim(),
          createdAt: new Date().toISOString(),
          tags: extractTags(body),
          classroom: currentUser.classroom,
          pinned: currentUser.role === 'teacher' ? options?.pinned : false,
          likeUserIds: [],
          savedByUserIds: [],
          repostUserIds: [],
          comments: [],
        },
        ...currentState.posts,
      ],
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `${currentUser.name} published a new post.`
            : `${currentUser.name} publicou uma nova postagem.`,
          'social',
          'feed',
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const createQuotePost = (sourcePostId: string, body: string) => {
    if (!currentUser || !body.trim()) return;

    setState((currentState) => ({
      ...currentState,
      posts: [
        {
          id: makeId('post'),
          kind: 'quote',
          authorId: currentUser.id,
          body: body.trim(),
          createdAt: new Date().toISOString(),
          tags: extractTags(body),
          classroom: currentUser.classroom,
          sourcePostId,
          likeUserIds: [],
          savedByUserIds: [],
          repostUserIds: [],
          comments: [],
        },
        ...currentState.posts.map((post) =>
          post.id !== sourcePostId || post.repostUserIds.includes(currentUser.id)
            ? post
            : {
                ...post,
                repostUserIds: [...post.repostUserIds, currentUser.id],
              },
        ),
      ],
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `${currentUser.name} reposted with comment.`
            : `${currentUser.name} repostou com comentario.`,
          'social',
          'feed',
          sourcePostId,
        ),
        ...currentState.notifications,
      ],
      ui: {
        ...currentState.ui,
        modal: null,
      },
    }));
  };

  const repostPost = (sourcePostId: string) => {
    if (!currentUser) return;
    const sourcePost = getPostById(state, sourcePostId);
    if (!sourcePost) return;

    setState((currentState) => ({
      ...currentState,
      posts: [
        {
          id: makeId('post'),
          kind: 'repost',
          authorId: currentUser.id,
          body: '',
          createdAt: new Date().toISOString(),
          tags: sourcePost.tags,
          classroom: currentUser.classroom,
          sourcePostId,
          likeUserIds: [],
          savedByUserIds: [],
          repostUserIds: [],
          comments: [],
        },
        ...currentState.posts.map((post) =>
          post.id !== sourcePostId || post.repostUserIds.includes(currentUser.id)
            ? post
            : {
                ...post,
                repostUserIds: [...post.repostUserIds, currentUser.id],
              },
        ),
      ],
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `${currentUser.name} reposted a post.`
            : `${currentUser.name} repostou uma publicacao.`,
          'social',
          'feed',
          sourcePostId,
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;

    setState((currentState) => ({
      ...currentState,
      posts: currentState.posts.map((post) => {
        if (post.id !== postId) return post;
        const alreadyLiked = post.likeUserIds.includes(currentUser.id);
        return {
          ...post,
          likeUserIds: alreadyLiked
            ? post.likeUserIds.filter((userId) => userId !== currentUser.id)
            : [...post.likeUserIds, currentUser.id],
        };
      }),
    }));
  };

  const toggleSavePost = (postId: string) => {
    if (!currentUser) return;

    setState((currentState) => ({
      ...currentState,
      posts: currentState.posts.map((post) => {
        if (post.id !== postId) return post;
        const alreadySaved = post.savedByUserIds.includes(currentUser.id);
        return {
          ...post,
          savedByUserIds: alreadySaved
            ? post.savedByUserIds.filter((userId) => userId !== currentUser.id)
            : [...post.savedByUserIds, currentUser.id],
        };
      }),
    }));
  };

  const addComment = (postId: string, body: string) => {
    if (!currentUser || !body.trim()) return;

    setState((currentState) => ({
      ...currentState,
      posts: currentState.posts.map((post) =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: makeId('comment'),
                  authorId: currentUser.id,
                  body: body.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            },
      ),
    }));
  };

  const sendMessage = (threadId: string, body: string) => {
    if (!currentUser || !body.trim()) return;

    const attachmentList: MessageAttachment[] = [];
    const notificationMessage =
      state.preferences.language === 'en'
        ? `${currentUser.name} sent a new message.`
        : `${currentUser.name} enviou uma nova mensagem.`;

    setState((currentState) => ({
      ...currentState,
      chatGroups: currentState.chatGroups.map((group) =>
        group.id !== threadId
          ? group
          : {
              ...group,
              messages: [
                ...group.messages,
                {
                  id: makeId('message'),
                  authorId: currentUser.id,
                  body: body.trim(),
                  createdAt: new Date().toISOString(),
                  readByUserIds: [currentUser.id],
                  attachments: attachmentList,
                },
              ],
            },
      ),
      directThreads: currentState.directThreads.map((thread) =>
        thread.id !== threadId
          ? thread
          : {
              ...thread,
              messages: [
                ...thread.messages,
                {
                  id: makeId('message'),
                  authorId: currentUser.id,
                  body: body.trim(),
                  createdAt: new Date().toISOString(),
                  readByUserIds: [currentUser.id],
                  attachments: attachmentList,
                },
              ],
            },
      ),
      notifications: [
        createNotification(notificationMessage, 'message', 'messages', threadId),
        ...currentState.notifications,
      ],
    }));
  };

  const updateGroup = (groupId: string, patch: Partial<ChatGroup>) => {
    if (!currentUser || currentUser.role !== 'teacher') return;

    setState((currentState) => ({
      ...currentState,
      chatGroups: currentState.chatGroups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              ...patch,
              permissions: {
                ...group.permissions,
                ...patch.permissions,
              },
            },
      ),
      ui: {
        ...currentState.ui,
        modal: null,
      },
    }));
  };

  const createTask = (input: CreateTaskInput) => {
    if (!currentUser || currentUser.role !== 'teacher') return;

    setState((currentState) => ({
      ...currentState,
      tasks: [
        {
          id: makeId('task'),
          title: input.title,
          subject: input.subject,
          classroom: input.classroom,
          deadline: input.deadline,
          description: input.description,
          attachments: input.attachments,
          updatedAt: new Date().toISOString(),
          authorId: currentUser.id,
          submissions: [],
        },
        ...currentState.tasks,
      ],
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `A new task is available: ${input.title}.`
            : `Nova tarefa disponivel: ${input.title}.`,
          'academic',
          'tasks',
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const reviewTaskSubmission = (taskId: string, userId: string, feedback: string, score?: number) => {
    if (!currentUser || currentUser.role !== 'teacher') return;

    setState((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          updatedAt: new Date().toISOString(),
          submissions: task.submissions.map((submission) =>
            submission.userId !== userId
              ? submission
              : {
                  ...submission,
                  status: 'reviewed',
                  feedback: feedback.trim(),
                  score,
                  reviewedAt: new Date().toISOString(),
                },
          ),
        };
      }),
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `A submission review is ready.`
            : `Uma revisao de entrega esta pronta.`,
          'academic',
          'tasks',
          taskId,
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const createNotice = (input: CreateNoticeInput) => {
    if (!currentUser || currentUser.role !== 'teacher' || !input.title.trim() || !input.body.trim()) return;

    setState((currentState) => ({
      ...currentState,
      notices: [
        {
          id: makeId('notice'),
          title: input.title.trim(),
          body: input.body.trim(),
          createdAt: new Date().toISOString(),
          pinned: Boolean(input.pinned),
          classroom: input.classroom,
        },
        ...currentState.notices,
      ],
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `${currentUser.name} posted a new notice.`
            : `${currentUser.name} publicou um novo aviso.`,
          'academic',
          'feed',
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const toggleFollow = (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;

    setState((currentState) => {
      const alreadyFollowing = currentState.users.find((user) => user.id === currentUser.id)?.followingIds.includes(targetUserId);

      return {
        ...currentState,
        users: currentState.users.map((user) => {
          if (user.id === currentUser.id) {
            return {
              ...user,
              followingIds: alreadyFollowing
                ? user.followingIds.filter((userId) => userId !== targetUserId)
                : [...user.followingIds, targetUserId],
            };
          }

          if (user.id === targetUserId) {
            return {
              ...user,
              followerIds: alreadyFollowing
                ? user.followerIds.filter((userId) => userId !== currentUser.id)
                : [...user.followerIds, currentUser.id],
            };
          }

          return user;
        }),
      };
    });
  };

  const completeMission = (missionId: string) => {
    if (!currentUser) return;

    setState((currentState) => ({
      ...currentState,
      missions: markMissionDone(currentState.missions, missionId, currentUser.id),
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `${currentUser.name} completed a mission.`
            : `${currentUser.name} concluiu uma missao.`,
          'system',
          'missions',
          missionId,
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const submitTask = (taskId: string, note: string, attachments: string[]) => {
    if (!currentUser || currentUser.role !== 'student') return;

    setState((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const existingSubmission = task.submissions.find((submission) => submission.userId === currentUser.id);
        const nextSubmission = {
          userId: currentUser.id,
          status: 'submitted' as const,
          submittedAt: new Date().toISOString(),
          note,
          attachments,
        };

        return {
          ...task,
          updatedAt: new Date().toISOString(),
          submissions: existingSubmission
            ? task.submissions.map((submission) =>
                submission.userId === currentUser.id ? nextSubmission : submission,
              )
            : [...task.submissions, nextSubmission],
        };
      }),
      notifications: [
        createNotification(
          state.preferences.language === 'en'
            ? `${currentUser.name} submitted a task delivery.`
            : `${currentUser.name} enviou uma entrega de tarefa.`,
          'academic',
          'tasks',
          taskId,
        ),
        ...currentState.notifications,
      ],
    }));
  };

  const resetDemoState = () => {
    setState(seedState);
  };

  const contextValue: AppContextValue = {
    state,
    currentUser,
    currentRole,
    t,
    loginAs,
    logout,
    toggleTheme,
    toggleLanguage,
    updatePreferences,
    updateNotificationChannel,
    setSearchOpen,
    setSearchQuery,
    openModal,
    closeModal,
    selectThread,
    markNotificationsSeen,
    createPost,
    createQuotePost,
    repostPost,
    toggleLikePost,
    toggleSavePost,
    addComment,
    sendMessage,
    updateGroup,
    createTask,
    submitTask,
    reviewTaskSubmission,
    createNotice,
    toggleFollow,
    completeMission,
    resetDemoState,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
