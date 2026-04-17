import {
  Bookmark,
  Heart,
  Languages,
  MessageCircle,
  Quote,
  Repeat2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../app/AppState';
import type { Language, Post } from '../app/types';
import { formatRelativeDate, getPostById, getUserById } from '../utils/selectors';

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export function PostCard({ post, compact = false }: PostCardProps) {
  const {
    addComment,
    currentUser,
    openModal,
    repostPost,
    state,
    t,
    toggleLikePost,
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
  const targetLanguage: Language = state.preferences.language === 'pt' ? 'en' : 'pt';
  const translatedBody = post.bodyTranslations?.[targetLanguage];
  const displayBody = showTranslation && translatedBody ? translatedBody : post.body;
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
        {post.pinned ? <span className="status-pill status-pill--accent">{t('pinned')}</span> : null}
      </header>

      <div className="post-card__body feed-card-body">
        {post.kind !== 'regular' && sourcePost ? (
          <div className="quoted-post">
            <div className="quoted-post__eyebrow">
              {post.kind === 'quote'
                ? state.preferences.language === 'en' ? 'Quoted post' : 'Publicacao comentada'
                : state.preferences.language === 'en' ? 'Reposted post' : 'Publicacao repostada'}
            </div>
            <div className="quoted-post__author">{sourceAuthor?.name ?? 'Autor original'}</div>
            <p>{sourcePost.body}</p>
          </div>
        ) : null}

        {displayBody ? <p className="post-card__text">{displayBody}</p> : null}

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
              <span key={tag} className="tag-pill">
                #{tag}
              </span>
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
          className={showComments ? 'feed-action feed-action--commented' : 'feed-action'}
          onClick={() => setShowComments((value) => !value)}
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

      {showComments ? (
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
