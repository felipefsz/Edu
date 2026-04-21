export type Role = 'teacher' | 'student';
export type ThemeMode = 'dark' | 'light';
export type Language = 'pt' | 'en';
export type PageKey =
  | 'feed'
  | 'explore'
  | 'messages'
  | 'tasks'
  | 'grades'
  | 'calendar'
  | 'missions'
  | 'notices'
  | 'forum'
  | 'quiz'
  | 'analytics'
  | 'settings';
export type NotificationType = 'social' | 'academic' | 'message' | 'system';
export type PostKind = 'regular' | 'repost' | 'quote';
export type TaskSubmissionStatus = 'pending' | 'submitted' | 'reviewed';

export interface User {
  id: string;
  role: Role;
  username: string;
  name: string;
  age?: number;
  classroom?: string;
  bio: string;
  status: string;
  favoriteSubjects: string[];
  badges: string[];
  followingIds: string[];
  followerIds: string[];
  gradeBySubject: Record<string, number>;
  goalGrade: number;
  streak: number;
  level: number;
  xp: number;
  avatarTone: string;
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  kind: PostKind;
  authorId: string;
  body: string;
  bodyTranslations?: Partial<Record<Language, string>>;
  createdAt: string;
  tags: string[];
  classroom?: string;
  pinned?: boolean;
  sourcePostId?: string;
  likeUserIds: string[];
  savedByUserIds: string[];
  repostUserIds: string[];
  comments: Comment[];
}

export interface MessageAttachment {
  id: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  readByUserIds: string[];
  replyToMessageId?: string;
  attachments: MessageAttachment[];
}

export interface ChatGroup {
  id: string;
  title: string;
  description: string;
  classroom: string;
  members: string[];
  permissions: {
    teacherCanEdit: boolean;
    studentsCanPost: boolean;
    membersVisibleToStudents: boolean;
  };
  messages: ChatMessage[];
}

export interface DirectThread {
  id: string;
  members: [string, string];
  messages: ChatMessage[];
}

export interface TaskSubmission {
  userId: string;
  status: TaskSubmissionStatus;
  submittedAt?: string;
  note: string;
  attachments: string[];
  feedback?: string;
  score?: number;
  reviewedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  classroom?: string;
  deadline: string;
  description: string;
  attachments: string[];
  updatedAt: string;
  authorId: string;
  submissions: TaskSubmission[];
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  pinned: boolean;
  classroom?: string;
}

export interface ForumReply {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  body: string;
  authorId: string;
  classroom?: string;
  tags: string[];
  createdAt: string;
  resolved: boolean;
  replies: ForumReply[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
}

export interface QuizResponse {
  userId: string;
  answers: number[];
  score: number;
  submittedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  classroom?: string;
  closesAt: string;
  questions: QuizQuestion[];
  responses: QuizResponse[];
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  targetPage: PageKey | 'profile';
  targetId?: string;
  readByUserIds: string[];
}

export interface Mission {
  id: string;
  role: Role;
  label: string;
  xp: number;
  doneByUserIds: string[];
}

export interface Preferences {
  theme: ThemeMode;
  language: Language;
  reduceMotion: boolean;
  transparency: 'comfortable' | 'soft' | 'solid';
  feedDensity: 'comfortable' | 'compact';
  chatDensity: 'comfortable' | 'compact';
  notificationChannels: {
    social: boolean;
    message: boolean;
    academic: boolean;
  };
}

export type ModalState =
  | { type: 'notifications' }
  | { type: 'quoteComposer'; sourcePostId: string }
  | { type: 'groupEditor'; groupId: string }
  | { type: 'profilePreview'; userId: string };

export interface UIState {
  modal: ModalState | null;
  activeThreadId: string | null;
  searchOpen: boolean;
  searchQuery: string;
}

export interface SessionState {
  currentUserId: string | null;
}

export interface AppState {
  teacherId: string;
  users: User[];
  posts: Post[];
  chatGroups: ChatGroup[];
  directThreads: DirectThread[];
  tasks: Task[];
  notices: Notice[];
  forumTopics: ForumTopic[];
  quizzes: Quiz[];
  notifications: AppNotification[];
  missions: Mission[];
  preferences: Preferences;
  session: SessionState;
  ui: UIState;
}

export interface SearchResult {
  id: string;
  type: 'user' | 'chat' | 'post' | 'task' | 'notice' | 'forum' | 'quiz';
  title: string;
  subtitle: string;
  targetPage: PageKey | 'profile';
  targetId?: string;
  priority: number;
}
