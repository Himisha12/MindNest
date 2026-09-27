// Data Exporter utility for CSV and JSON format exports (Day 4 Topic)

export const exportToCSV = (posts) => {
  const headers = ['ID', 'Title', 'Status', 'Author', 'Views', 'Likes', 'Tags', 'Created At'];
  
  const rows = posts.map(post => [
    `"${post._id}"`,
    `"${(post.title || '').replace(/"/g, '""')}"`,
    `"${post.status}"`,
    `"${post.author?.name || post.author?.username || 'Unknown'}"`,
    post.views || 0,
    post.likes ? post.likes.length : 0,
    `"${(post.tags || []).join('; ')}"`,
    `"${new Date(post.createdAt).toISOString()}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};
