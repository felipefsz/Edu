import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Quote,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../app/AppState';
import type { Post } from '../app/types';
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
  const author = getUserById(state, post.authorId);
  const sourcePost = getPostById(state, post.sourcePostId);
  const sourceAuthor = getUserById(state, sourcePost?.authorId);
  const liked = currentUser ? post.likeUserIds.includes(currentUser.id) : false;
  const saved = currentUser ? post.savedByUserIds.includes(currentUser.id) : false;

  return (
    <article className={compact ? 'post-card post-card--compact' : 'post-card'} data-feed-card>
      <header className="post-card__header feed-card-head">
        <button type="button" className="post-author" onClick={() => author && openModal({ type: 'profilePreview', userId: author.id })}>
          <span className="avatar-pill" style={{ background: author?.avatarTone ?? '#6374f6' }}>
            {author?.name.slice(0, 1) ?? '?'}
          </span>
          <span>
            <strong>{author?.name ?? 'Unknown user'}</strong>
            <small>
              {author?.role === 'teacher'
                ? 'Teacher'
                : `Class ${author?.classroom ?? '-'} · ${formatRelativeDate(post.createdAt)}`}
            </small>
          </span>
        </button>
        {post.pinned ? <span className="status-pill status-pill--accent">Pinned</span> : null}
      </header>

      <div className="post-card__body feed-card-body">
        {post.kind !== 'regular' && sourcePost ? (
          <div className="quoted-post">
            <div className="quoted-post__eyebrow">
              {post.kind === 'quote' ? 'Quoted post' : 'Reposted post'}
            </div>
            <div className="quoted-post__author">{sourceAuthor?.name ?? 'Original author'}</div>
            <p>{sourcePost.body}</p>
          </div>
        ) : null}

        {post.body ? <p className="post-card__text">{post.body}</p> : null}

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
                <strong>{commentAuthor?.name ?? 'User'}</strong>
                <p>{comment.body}</p>
              </div>
            );
          })}
          <div className="comment-composer">
            <input
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder={t('comments')}
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
