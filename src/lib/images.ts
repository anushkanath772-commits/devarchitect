const TECH_IMAGES = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
];

export function getArticleImage(articleId: string, title: string): string {
  const hash = (articleId + title)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TECH_IMAGES[hash % TECH_IMAGES.length];
}

const SOURCE_LOGOS: Record<string, string> = {
  "Engineering at Meta": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png",
  "Uber Engineering": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/512px-Uber_logo_2018.svg.png",
  "Canva Engineering": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/600px-Canva_icon_2021.svg.png",
  "Google Research": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/512px-Google_2015_logo.svg.png",
  "Spotify Engineering": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/512px-Spotify_icon.svg.png",
  "Anthropic Engineering": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/512px-Anthropic_logo.svg.png",
  "OpenAI Developers": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/512px-OpenAI_Logo.svg.png",
  "Netflix Tech Blog": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/400px-Netflix_2015_N_logo.svg.png",
  "Microsoft Dev Blogs": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png",
};

export function getSourceLogo(sourceName: string): string {
  return SOURCE_LOGOS[sourceName] || "";
}

const SOURCE_COLORS: Record<string, string> = {
  "Engineering at Meta": "#0668E1",
  "Uber Engineering": "#000000",
  "Canva Engineering": "#7D2AE8",
  "Google Research": "#4285F4",
  "Spotify Engineering": "#1DB954",
  "Anthropic Engineering": "#D4A574",
  "OpenAI Developers": "#10A37F",
  "Netflix Tech Blog": "#E50914",
  "Microsoft Dev Blogs": "#0078D4",
};

export function getSourceColor(sourceName: string): string {
  return SOURCE_COLORS[sourceName] || "#6366f1";
}

export function getSourceBadgeStyle(sourceName: string) {
  const color = getSourceColor(sourceName);
  return {
    backgroundColor: `${color}15`,
    color: color,
  };
}
