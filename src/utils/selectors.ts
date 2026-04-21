import type {
  AppNotification,
  AppState,
  ChatGroup,
  DirectThread,
  Mission,
  PageKey,
  Post,
  SearchResult,
  Task,
  User,
} from '../app/types';

export function getCurrentUser(state: AppState): User | null {
  return state.users.find((user) => user.id === state.session.currentUserId) ?? null;
}

export function getCurrentRole(state: AppState) {
  return getCurrentUser(state)?.role ?? null;
}

export function getUserById(state: AppState, userId?: string | null) {
  if (!userId) return null;
  return state.users.find((user) => user.id === userId) ?? null;
}

export function getPostById(state: AppState, postId?: string | null) {
  if (!postId) return null;
  return state.posts.find((post) => post.id === postId) ?? null;
}

export function getFeedPosts(state: AppState) {
  return [...state.posts].sort((left, right) => {
    if (left.pinned && !right.pinned) return -1;
    if (!left.pinned && right.pinned) return 1;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function getProfilePosts(state: AppState, userId?: string | null) {
  if (!userId) return [];
  return getFeedPosts(state).filter((post) => post.authorId === userId);
}

export function getFollowSuggestions(state: AppState, currentUser: User | null) {
  if (!currentUser) return [];
  return state.users
    .filter(
      (user) =>
        user.id !== currentUser.id &&
        user.role === 'student' &&
        !currentUser.followingIds.includes(user.id),
    )
    .slice(0, 4);
}

export function getTopStudents(state: AppState) {
  return state.users
    .filter((user) => user.role === 'student')
    .sort((left, right) => getAverageGrade(right) - getAverageGrade(left))
    .slice(0, 4);
}

export function getAverageGrade(user: User) {
  const grades = Object.values(user.gradeBySubject);
  if (!grades.length) return 0;
  return grades.reduce((total, grade) => total + grade, 0) / grades.length;
}

export function getGradeRows(user: User | null) {
  if (!user) return [];
  return Object.entries(user.gradeBySubject)
    .map(([subject, grade]) => ({
      subject,
      grade,
      gapToGoal: Number((grade - user.goalGrade).toFixed(1)),
      status: grade >= user.goalGrade ? 'on-track' : grade >= 7 ? 'attention' : 'risk',
    }))
    .sort((left, right) => right.grade - left.grade);
}

export function getTrendingTags(state: AppState) {
  const counter = new Map<string, number>();

  state.posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      counter.set(normalizedTag, (counter.get(normalizedTag) ?? 0) + 1);
    });
  });

  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count);
}

export function getOpenMissions(state: AppState, currentUser: User | null) {
  if (!currentUser) return [];
  return state.missions.filter(
    (mission) => mission.role === currentUser.role && !mission.doneByUserIds.includes(currentUser.id),
  );
}

export function getMissionsForUser(state: AppState, currentUser: User | null) {
  if (!currentUser) return [];
  return state.missions
    .filter((mission) => mission.role === currentUser.role)
    .map((mission) => ({
      ...mission,
      done: mission.doneByUserIds.includes(currentUser.id),
    }));
}

export interface ThreadSummary {
  id: string;
  type: 'group' | 'direct';
  title: string;
  subtitle: string;
  classroom?: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function getThreadSummaries(state: AppState, currentUser: User | null): ThreadSummary[] {
  if (!currentUser) return [];

  const groups: ThreadSummary[] = state.chatGroups
    .filter((group) => group.members.includes(currentUser.id))
    .map((group) => {
      const lastMessage = group.messages[group.messages.length - 1];
      return {
        id: group.id,
        type: 'group',
        title: group.title,
        subtitle: group.description,
        classroom: group.classroom,
        lastMessageAt: lastMessage?.createdAt ?? '',
        unreadCount: group.messages.filter((message) => !message.readByUserIds.includes(currentUser.id)).length,
      };
    });

  const directs: ThreadSummary[] = state.directThreads
    .filter((thread) => thread.members.includes(currentUser.id))
    .map((thread) => {
      const partnerId = thread.members.find((memberId) => memberId !== currentUser.id) ?? currentUser.id;
      const partner = getUserById(state, partnerId);
      const lastMessage = thread.messages[thread.messages.length - 1];
      return {
        id: thread.id,
        type: 'direct',
        title: partner?.name ?? 'Direct thread',
        subtitle: partner?.role === 'teacher' ? 'Teacher chat' : `Class ${partner?.classroom ?? '-'}`,
        classroom: partner?.classroom,
        lastMessageAt: lastMessage?.createdAt ?? '',
        unreadCount: thread.messages.filter((message) => !message.readByUserIds.includes(currentUser.id)).length,
      };
    });

  return [...groups, ...directs].sort(
    (left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime(),
  );
}

export function getThreadById(state: AppState, threadId?: string | null): ChatGroup | DirectThread | null {
  if (!threadId) return null;
  const group = state.chatGroups.find((item) => item.id === threadId);
  if (group) return group;
  return state.directThreads.find((item) => item.id === threadId) ?? null;
}

export function getThreadMembers(state: AppState, threadId?: string | null) {
  const thread = getThreadById(state, threadId);
  if (!thread) return [];
  const memberIds: string[] = thread.members;
  return memberIds
    .map((memberId: string) => getUserById(state, memberId))
    .filter((member): member is User => Boolean(member));
}

export function isGroupThread(thread: ChatGroup | DirectThread | null): thread is ChatGroup {
  return Boolean(thread && 'title' in thread && 'permissions' in thread);
}

export function getNotificationsForUser(state: AppState, currentUser: User | null) {
  if (!currentUser) return [];
  return state.notifications
    .filter((notification) => {
      if (notification.type === 'social') return state.preferences.notificationChannels.social;
      if (notification.type === 'message') return state.preferences.notificationChannels.message;
      if (notification.type === 'academic') return state.preferences.notificationChannels.academic;
      return true;
    })
    .sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function getUnreadNotificationsCount(state: AppState, currentUser: User | null) {
  if (!currentUser) return 0;
  return getNotificationsForUser(state, currentUser).filter(
    (notification) => !notification.readByUserIds.includes(currentUser.id),
  ).length;
}

export function getVisibleTasks(state: AppState, currentUser: User | null) {
  if (!currentUser) return [];
  if (currentUser.role === 'teacher') return state.tasks;
  return state.tasks.filter((task) => !task.classroom || task.classroom === currentUser.classroom);
}

export function getUpcomingTasks(state: AppState, currentUser: User | null) {
  return getVisibleTasks(state, currentUser)
    .slice()
    .sort((left, right) => new Date(left.deadline).getTime() - new Date(right.deadline).getTime())
    .slice(0, 4);
}

export function getTaskSubmission(task: Task, userId?: string | null) {
  if (!userId) return null;
  return task.submissions.find((submission) => submission.userId === userId) ?? null;
}

export function getTeacherAnalytics(state: AppState) {
  const studentUsers = state.users.filter((user) => user.role === 'student');
  const classrooms = [...new Set(studentUsers.map((user) => user.classroom).filter(Boolean))];
  const totalPostInteractions = state.posts.reduce(
    (total, post) => total + post.likeUserIds.length + post.savedByUserIds.length + post.comments.length + post.repostUserIds.length,
    0,
  );
  const atRiskStudents = studentUsers
    .map((user) => ({
      id: user.id,
      name: user.name,
      classroom: user.classroom,
      average: Number(getAverageGrade(user).toFixed(1)),
      streak: user.streak,
    }))
    .filter((user) => user.average < 7 || user.streak <= 2)
    .sort((left, right) => left.average - right.average)
    .slice(0, 4);
  const missionCompletion = state.missions.map((mission) => ({
    label: mission.label,
    completion: mission.doneByUserIds.length,
    total: studentUsers.filter((user) => user.role === mission.role).length || 1,
  }));

  return {
    totalPosts: state.posts.length,
    totalTasks: state.tasks.length,
    totalNotices: state.notices.length,
    totalForumTopics: state.forumTopics.length,
    totalQuizzes: state.quizzes.length,
    totalQuizResponses: state.quizzes.reduce((total, quiz) => total + quiz.responses.length, 0),
    activeStreaks: studentUsers.filter((user) => user.streak >= 3).length,
    totalPostInteractions,
    averageEngagementPerPost: Number((totalPostInteractions / Math.max(state.posts.length, 1)).toFixed(1)),
    atRiskStudents,
    missionCompletion,
    classroomAverages: classrooms.map((classroom) => {
      const members = studentUsers.filter((user) => user.classroom === classroom);
      const average =
        members.reduce((total, user) => total + getAverageGrade(user), 0) / Math.max(members.length, 1);

      return {
        classroom,
        average: Number(average.toFixed(1)),
      };
    }),
    taskCompletion: state.tasks.map((task) => ({
      title: task.title,
      completion: task.submissions.filter((submission) => submission.status !== 'pending').length,
      total: task.classroom
        ? studentUsers.filter((user) => user.classroom === task.classroom).length
        : studentUsers.length,
    })),
  };
}

export function buildSearchResults(state: AppState, query: string): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 2) return [];

  const results: SearchResult[] = [];

  state.users.forEach((user) => {
    if (
      user.name.toLowerCase().includes(trimmed) ||
      user.username.toLowerCase().includes(trimmed) ||
      user.bio.toLowerCase().includes(trimmed)
    ) {
      results.push({
        id: `user-${user.id}`,
        type: 'user',
        title: user.name,
        subtitle: user.role === 'teacher' ? 'Teacher' : `Class ${user.classroom ?? '-'}`,
        targetPage: 'profile',
        targetId: user.id,
        priority: 1,
      });
    }
  });

  state.chatGroups.forEach((group) => {
    if (
      group.title.toLowerCase().includes(trimmed) ||
      group.description.toLowerCase().includes(trimmed) ||
      group.classroom.toLowerCase().includes(trimmed)
    ) {
      results.push({
        id: `group-${group.id}`,
        type: 'chat',
        title: group.title,
        subtitle: group.description,
        targetPage: 'messages',
        targetId: group.id,
        priority: 2,
      });
    }
  });

  state.directThreads.forEach((thread) => {
    const partner = state.users.find((user) => thread.members.includes(user.id) && user.id !== 'teacher');
    if (partner && partner.name.toLowerCase().includes(trimmed)) {
      results.push({
        id: `direct-${thread.id}`,
        type: 'chat',
        title: partner.name,
        subtitle: 'Direct thread',
        targetPage: 'messages',
        targetId: thread.id,
        priority: 2,
      });
    }
  });

  state.posts.forEach((post) => {
    if (post.body.toLowerCase().includes(trimmed) || post.tags.some((tag) => tag.toLowerCase().includes(trimmed))) {
      const author = getUserById(state, post.authorId);
      results.push({
        id: `post-${post.id}`,
        type: 'post',
        title: author?.name ?? 'Post',
        subtitle: post.body.slice(0, 72),
        targetPage: 'feed',
        targetId: post.id,
        priority: 3,
      });
    }
  });

  state.tasks.forEach((task) => {
    if (
      task.title.toLowerCase().includes(trimmed) ||
      task.subject.toLowerCase().includes(trimmed) ||
      task.description.toLowerCase().includes(trimmed)
    ) {
      results.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        subtitle: `${task.subject} · ${task.deadline}`,
        targetPage: 'tasks',
        targetId: task.id,
        priority: 5,
      });
    }
  });

  state.notices.forEach((notice) => {
    if (notice.title.toLowerCase().includes(trimmed) || notice.body.toLowerCase().includes(trimmed)) {
      results.push({
        id: `notice-${notice.id}`,
        type: 'notice',
        title: notice.title,
        subtitle: notice.body.slice(0, 72),
        targetPage: 'feed',
        targetId: notice.id,
        priority: 6,
      });
    }
  });

  state.forumTopics.forEach((topic) => {
    if (
      topic.title.toLowerCase().includes(trimmed) ||
      topic.body.toLowerCase().includes(trimmed) ||
      topic.tags.some((tag) => tag.toLowerCase().includes(trimmed))
    ) {
      results.push({
        id: `forum-${topic.id}`,
        type: 'forum',
        title: topic.title,
        subtitle: topic.body.slice(0, 72),
        targetPage: 'forum',
        targetId: topic.id,
        priority: 4,
      });
    }
  });

  state.quizzes.forEach((quiz) => {
    if (
      quiz.title.toLowerCase().includes(trimmed) ||
      quiz.subject.toLowerCase().includes(trimmed) ||
      quiz.description.toLowerCase().includes(trimmed)
    ) {
      results.push({
        id: `quiz-${quiz.id}`,
        type: 'quiz',
        title: quiz.title,
        subtitle: `${quiz.subject} · ${quiz.questions.length} questoes`,
        targetPage: 'quiz',
        targetId: quiz.id,
        priority: 5,
      });
    }
  });

  return results.sort((left, right) => left.priority - right.priority);
}

export function formatRelativeDate(dateValue: string) {
  const date = new Date(dateValue);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNoticeHighlights(state: AppState) {
  return [...state.notices].sort((left, right) => {
    if (left.pinned && !right.pinned) return -1;
    if (!left.pinned && right.pinned) return 1;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function getRelevantNotices(state: AppState, currentUser: User | null) {
  if (!currentUser || currentUser.role === 'teacher') return getNoticeHighlights(state);
  return getNoticeHighlights(state).filter(
    (notice) => !notice.classroom || notice.classroom === currentUser.classroom,
  );
}

export function getVisibleForumTopics(state: AppState, currentUser: User | null) {
  const sortedTopics = [...state.forumTopics].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  if (!currentUser || currentUser.role === 'teacher') return sortedTopics;
  return sortedTopics.filter((topic) => !topic.classroom || topic.classroom === currentUser.classroom);
}

export function getVisibleQuizzes(state: AppState, currentUser: User | null) {
  if (!currentUser || currentUser.role === 'teacher') return state.quizzes;
  return state.quizzes.filter((quiz) => !quiz.classroom || quiz.classroom === currentUser.classroom);
}

export function getCalendarItems(state: AppState, currentUser: User | null) {
  const tasks = getVisibleTasks(state, currentUser).map((task) => ({
    id: `task-${task.id}`,
    type: 'task' as const,
    title: task.title,
    description: task.description,
    date: task.deadline,
    classroom: task.classroom,
  }));

  const notices = getRelevantNotices(state, currentUser).map((notice) => ({
    id: `notice-${notice.id}`,
    type: 'notice' as const,
    title: notice.title,
    description: notice.body,
    date: notice.createdAt.slice(0, 10),
    classroom: notice.classroom,
  }));

  return [...tasks, ...notices].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
}

export function getStudentOverview(state: AppState, currentUser: User | null) {
  if (!currentUser) return null;
  const openTasks = getVisibleTasks(state, currentUser);
  const savedPosts = state.posts.filter((post) => post.savedByUserIds.includes(currentUser.id));
  return {
    averageGrade: getAverageGrade(currentUser),
    openTaskCount: openTasks.length,
    savedPostCount: savedPosts.length,
    unreadMessages: getThreadSummaries(state, currentUser).reduce(
      (total, thread) => total + thread.unreadCount,
      0,
    ),
  };
}

export function buildNavigation(currentUser: User | null) {
  const items: Array<{ key: PageKey; label: string }> = [
    { key: 'feed', label: 'Feed' },
    { key: 'explore', label: 'Explore' },
    { key: 'messages', label: 'Messages' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'grades', label: 'Grades' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'missions', label: 'Missions' },
    { key: 'notices', label: 'Notices' },
    { key: 'forum', label: 'Forum' },
    { key: 'quiz', label: 'Quiz' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
  ];

  if (!currentUser) return items;
  if (currentUser.role === 'teacher') return items;
  return items;
}

export function nextNotificationReadState(
  notifications: AppNotification[],
  currentUserId: string,
): AppNotification[] {
  return notifications.map((notification) =>
    notification.readByUserIds.includes(currentUserId)
      ? notification
      : {
          ...notification,
          readByUserIds: [...notification.readByUserIds, currentUserId],
        },
  );
}

export function markMissionDone(missions: Mission[], missionId: string, currentUserId: string) {
  return missions.map((mission) =>
    mission.id !== missionId || mission.doneByUserIds.includes(currentUserId)
      ? mission
      : {
          ...mission,
          doneByUserIds: [...mission.doneByUserIds, currentUserId],
        },
  );
}
