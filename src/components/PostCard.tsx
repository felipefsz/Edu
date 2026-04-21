import {
  Bookmark,
  Heart,
  Languages,
  Maximize2,
  MessageCircle,
  Pin,
  Quote,
  Repeat2,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../app/AppState';
import type { Language, Post } from '../app/types';
import { formatRelativeDate, getPostById, getUserById } from '../utils/selectors';

interface PostCardProps {
  post: Post;
  compact?: boolean;
  forceComments?: boolean;
}

export function PostCard({ post, compact = false, forceComments = false }: PostCardProps) {
  const {
    addComment,
    currentUser,
    deletePost,
    openModal,
    repostPost,
    state,
    t,
    toggleLikePost,
    togglePinPost,
    toggleSavePost,
  } = useApp();
  const [commentBody, setCommentBody] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const author = getUserById(state, post.authorId);
  const sourcePost = getPostById(state, post.sourcePostId);
  const sourceAuthor = getUserById(state, sourcePost?.authorId);
  const liked = currentUser ? post.likeUserIds.includes(currentUser.id) : false;
  const saved = currentUser ? post.savedByUserIds.includes(currentUser.id) : false;
  const canManagePost = Boolean(currentUser && (currentUser.role === 'teacher' || currentUser.id === post.authorId));
  const targetLanguage: Language = state.preferences.language === 'pt' ? 'en' : 'pt';
  const translatedBody = post.bodyTranslations?.[targetLanguage];
  const displayBody = showTranslation && translatedBody ? translatedBody : post.body;
  const commentsVisible = forceComments || showComments;
  const translationLabel = useMemo(
    () =>
      targetLanguage === 'en'
        ? t('translatedFromPortuguese')
        : t('translatedFromEnglish'),
    [t, targetLanguage],
  );

  return (
    <article className={compact ? 'post-card post-card--compact' : 'post-card'} data-feed-card>
      <header className="post-card__header feed-card-head">
        <button type="button" className="post-author" onClick={() => author && openModal({ type: 'profilePreview', userId: author.id })}>
          <span className="avatar-pill" style={{ background: author?.avatarTone ?? '#6374f6' }}>
            {author?.name.slice(0, 1) ?? '?'}
          </span>
          <span>
            <strong>{author?.name ?? 'Usuario'}</strong>
            <small>
              {author?.role === 'teacher'
                ? t('teacherLabel')
                : `${t('classLabel')} ${author?.classroom ?? '-'} / ${formatRelativeDate(post.createdAt)}`}
            </small>
          </span>
        </button>
        <div className="toolbar-cluster">
          {post.pinned ? <span className="status-pill status-pill--accent">{t('pinned')}</span> : null}
          {currentUser?.role === 'teacher' ? (
            <button className="toolbar-button toolbar-button--icon" type="button" onClick={() => togglePinPost(post.id)} title={post.pinned ? 'Desfixar' : 'Fixar'}>
              <Pin size={15} />
            </button>
          ) : null}
          {canManagePost ? (
            <button className="toolbar-button toolbar-button--icon toolbar-button--danger" type="button" onClick={() => deletePost(post.id)} title="Remover">
              <Trash2 size={15} />
            </button>
          ) : null}
          {!compact && !forceComments ? (
            <button
              className="toolbar-button toolbar-button--icon"
              type="button"
              onClick={() => openModal({ type: 'postDetails', postId: post.id })}
              title={state.preferences.language === 'en' ? 'Open post' : 'Abrir publicacao'}
            >
              <Maximize2 size={15} />
            </button>
          ) : null}
        </div>
      </header>

      <div className="post-card__body feed-card-body">
        {post.kind !== 'regular' && sourcePost ? (
          <button className="quoted-post quoted-post--button" type="button" onClick={() => openModal({ type: 'postDetails', postId: sourcePost.id })}>
            <div className="quoted-post__eyebrow">
              {post.kind === 'quote'
                ? state.preferences.language === 'en' ? 'Quoted post' : 'Publicacao comentada'
                : state.preferences.language === 'en' ? 'Reposted post' : 'Publicacao repostada'}
            </div>
            <div className="quoted-post__author">{sourceAuthor?.name ?? 'Autor original'}</div>
            <p>{sourcePost.body}</p>
          </button>
        ) : null}

        {displayBody ? (
          <button className="post-open-body" type="button" onClick={() => openModal({ type: 'postDetails', postId: post.id })}>
            <span className="post-card__text">{displayBody}</span>
          </button>
        ) : null}

        {translatedBody ? (
          <div className="feed-translate-row">
            {showTranslation ? <small className="feed-translate-note">{translationLabel}</small> : <span />}
            <button
              type="button"
              className="ghost-button ghost-button--slim"
              onClick={() => setShowTranslation((value) => !value)}
            >
              <Languages size={15} />
              <span>{showTranslation ? t('seeOriginal') : t('translatePost')}</span>
            </button>
          </div>
        ) : null}

        {post.tags.length ? (
          <div className="tag-list">
            {post.tags.map((tag) => (
              <button key={tag} className="tag-pill tag-pill--button" type="button" onClick={() => openModal({ type: 'postDetails', postId: post.id })}>
                #{tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <footer className="post-card__footer feed-card-actions">
        <button
          type="button"
          className={liked ? 'feed-action feed-action--liked' : 'feed-action'}
          onClick={() => toggleLikePost(post.id)}
          title={t('like')}
        >
          <Heart size={16} />
          <span>{post.likeUserIds.length}</span>
        </button>
        <button
          type="button"
          className={commentsVisible ? 'feed-action feed-action--commented' : 'feed-action'}
          onClick={() => forceComments ? undefined : setShowComments((value) => !value)}
          title={t('comments')}
        >
          <MessageCircle size={16} />
          <span>{post.comments.length}</span>
        </button>
        <button type="button" className="feed-action" onClick={() => repostPost(post.id)} title={t('repost')}>
          <Repeat2 size={16} />
          <span>{post.repostUserIds.length}</span>
        </button>
        <button
          type="button"
          className="feed-action"
          onClick={() => openModal({ type: 'quoteComposer', sourcePostId: post.id })}
          title={t('quote')}
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          className={saved ? 'feed-action feed-action--saved' : 'feed-action'}
          onClick={() => toggleSavePost(post.id)}
          title={t('save')}
        >
          <Bookmark size={16} />
        </button>
      </footer>

      {commentsVisible ? (
        <div className="post-comments">
          {post.comments.map((comment) => {
            const commentAuthor = getUserById(state, comment.authorId);
            return (
              <div key={comment.id} className="comment-row">
                <strong>{commentAuthor?.name ?? 'Usuario'}</strong>
                <p>{comment.body}</p>
              </div>
            );
          })}
          <div className="comment-composer">
            <input
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder={state.preferences.language === 'en' ? 'Write a comment' : 'Escreva um comentario'}
            />
            <button
              type="button"
              className="solid-button"
              onClick={() => {
                addComment(post.id, commentBody);
                setCommentBody('');
              }}
            >
              {t('send')}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
