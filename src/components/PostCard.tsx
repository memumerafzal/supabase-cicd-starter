import type { Post } from '../types'

const STATUS_LABEL: Record<Post['status'], string> = {
  open: 'Open',
  planned: 'Planned',
  in_progress: 'In progress',
  done: 'Done',
}

export default function PostCard({
  post,
  onVote,
}: {
  post: Post
  onVote: (post: Post) => void
}) {
  return (
    <div className="post-card" data-testid="post-card">
      <button
        className={`vote ${post.has_voted ? 'voted' : ''}`}
        onClick={() => onVote(post)}
        aria-label="Toggle vote"
        data-testid="vote-button"
      >
        ▲
        <span className="vote-count" data-testid="vote-count">{post.vote_count}</span>
      </button>
      <div className="post-body">
        <div className="post-head">
          <h3>{post.title}</h3>
          <span className={`status status-${post.status}`}>{STATUS_LABEL[post.status]}</span>
        </div>
        {post.description && <p className="muted">{post.description}</p>}
      </div>
    </div>
  )
}
