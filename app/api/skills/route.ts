import { NextResponse } from "next/server";

export const runtime = "edge";

// Curated list of developer skills based on DevIcon and common technologies
// This provides a comprehensive list without needing an external API
const SKILLS_DATABASE = [
  // Frontend Frameworks & Libraries
  { id: "react", name: "React", category: "Frontend" },
  { id: "nextjs", name: "Next.js", category: "Frontend" },
  { id: "vue", name: "Vue.js", category: "Frontend" },
  { id: "nuxt", name: "Nuxt.js", category: "Frontend" },
  { id: "angular", name: "Angular", category: "Frontend" },
  { id: "svelte", name: "Svelte", category: "Frontend" },
  { id: "solid", name: "SolidJS", category: "Frontend" },
  { id: "astro", name: "Astro", category: "Frontend" },
  { id: "remix", name: "Remix", category: "Frontend" },
  { id: "gatsby", name: "Gatsby", category: "Frontend" },
  { id: "qwik", name: "Qwik", category: "Frontend" },
  
  // Core Languages
  { id: "javascript", name: "JavaScript", category: "Language" },
  { id: "typescript", name: "TypeScript", category: "Language" },
  { id: "python", name: "Python", category: "Language" },
  { id: "java", name: "Java", category: "Language" },
  { id: "csharp", name: "C#", category: "Language" },
  { id: "cpp", name: "C++", category: "Language" },
  { id: "c", name: "C", category: "Language" },
  { id: "go", name: "Go", category: "Language" },
  { id: "rust", name: "Rust", category: "Language" },
  { id: "ruby", name: "Ruby", category: "Language" },
  { id: "php", name: "PHP", category: "Language" },
  { id: "swift", name: "Swift", category: "Language" },
  { id: "kotlin", name: "Kotlin", category: "Language" },
  { id: "scala", name: "Scala", category: "Language" },
  { id: "elixir", name: "Elixir", category: "Language" },
  { id: "haskell", name: "Haskell", category: "Language" },
  { id: "clojure", name: "Clojure", category: "Language" },
  { id: "dart", name: "Dart", category: "Language" },
  { id: "lua", name: "Lua", category: "Language" },
  { id: "zig", name: "Zig", category: "Language" },
  
  // Backend Frameworks
  { id: "nodejs", name: "Node.js", category: "Backend" },
  { id: "express", name: "Express.js", category: "Backend" },
  { id: "fastify", name: "Fastify", category: "Backend" },
  { id: "nestjs", name: "NestJS", category: "Backend" },
  { id: "django", name: "Django", category: "Backend" },
  { id: "flask", name: "Flask", category: "Backend" },
  { id: "fastapi", name: "FastAPI", category: "Backend" },
  { id: "rails", name: "Ruby on Rails", category: "Backend" },
  { id: "laravel", name: "Laravel", category: "Backend" },
  { id: "spring", name: "Spring Boot", category: "Backend" },
  { id: "dotnet", name: ".NET Core", category: "Backend" },
  { id: "phoenix", name: "Phoenix", category: "Backend" },
  { id: "gin", name: "Gin", category: "Backend" },
  { id: "fiber", name: "Fiber", category: "Backend" },
  { id: "actix", name: "Actix", category: "Backend" },
  { id: "hono", name: "Hono", category: "Backend" },
  
  // Databases
  { id: "postgresql", name: "PostgreSQL", category: "Database" },
  { id: "mysql", name: "MySQL", category: "Database" },
  { id: "mongodb", name: "MongoDB", category: "Database" },
  { id: "redis", name: "Redis", category: "Database" },
  { id: "sqlite", name: "SQLite", category: "Database" },
  { id: "supabase", name: "Supabase", category: "Database" },
  { id: "firebase", name: "Firebase", category: "Database" },
  { id: "dynamodb", name: "DynamoDB", category: "Database" },
  { id: "cassandra", name: "Cassandra", category: "Database" },
  { id: "neo4j", name: "Neo4j", category: "Database" },
  { id: "planetscale", name: "PlanetScale", category: "Database" },
  { id: "neon", name: "Neon", category: "Database" },
  { id: "turso", name: "Turso", category: "Database" },
  { id: "cockroachdb", name: "CockroachDB", category: "Database" },
  
  // Mobile
  { id: "reactnative", name: "React Native", category: "Mobile" },
  { id: "flutter", name: "Flutter", category: "Mobile" },
  { id: "swiftui", name: "SwiftUI", category: "Mobile" },
  { id: "jetpackcompose", name: "Jetpack Compose", category: "Mobile" },
  { id: "expo", name: "Expo", category: "Mobile" },
  { id: "ionic", name: "Ionic", category: "Mobile" },
  { id: "capacitor", name: "Capacitor", category: "Mobile" },
  
  // CSS & Styling
  { id: "css", name: "CSS", category: "Styling" },
  { id: "tailwindcss", name: "Tailwind CSS", category: "Styling" },
  { id: "sass", name: "Sass/SCSS", category: "Styling" },
  { id: "styledcomponents", name: "Styled Components", category: "Styling" },
  { id: "emotion", name: "Emotion", category: "Styling" },
  { id: "bootstrap", name: "Bootstrap", category: "Styling" },
  { id: "materialui", name: "Material UI", category: "Styling" },
  { id: "chakraui", name: "Chakra UI", category: "Styling" },
  { id: "shadcn", name: "shadcn/ui", category: "Styling" },
  { id: "radixui", name: "Radix UI", category: "Styling" },
  { id: "antdesign", name: "Ant Design", category: "Styling" },
  
  // DevOps & Cloud
  { id: "docker", name: "Docker", category: "DevOps" },
  { id: "kubernetes", name: "Kubernetes", category: "DevOps" },
  { id: "aws", name: "AWS", category: "Cloud" },
  { id: "gcp", name: "Google Cloud", category: "Cloud" },
  { id: "azure", name: "Azure", category: "Cloud" },
  { id: "vercel", name: "Vercel", category: "Cloud" },
  { id: "cloudflare", name: "Cloudflare", category: "Cloud" },
  { id: "netlify", name: "Netlify", category: "Cloud" },
  { id: "digitalocean", name: "DigitalOcean", category: "Cloud" },
  { id: "railway", name: "Railway", category: "Cloud" },
  { id: "fly", name: "Fly.io", category: "Cloud" },
  { id: "render", name: "Render", category: "Cloud" },
  { id: "terraform", name: "Terraform", category: "DevOps" },
  { id: "ansible", name: "Ansible", category: "DevOps" },
  { id: "jenkins", name: "Jenkins", category: "DevOps" },
  { id: "github-actions", name: "GitHub Actions", category: "DevOps" },
  { id: "gitlab-ci", name: "GitLab CI", category: "DevOps" },
  
  // AI & ML
  { id: "tensorflow", name: "TensorFlow", category: "AI/ML" },
  { id: "pytorch", name: "PyTorch", category: "AI/ML" },
  { id: "scikit-learn", name: "Scikit-learn", category: "AI/ML" },
  { id: "keras", name: "Keras", category: "AI/ML" },
  { id: "openai", name: "OpenAI API", category: "AI/ML" },
  { id: "langchain", name: "LangChain", category: "AI/ML" },
  { id: "huggingface", name: "Hugging Face", category: "AI/ML" },
  { id: "ollama", name: "Ollama", category: "AI/ML" },
  { id: "anthropic", name: "Anthropic Claude", category: "AI/ML" },
  
  // Tools & Others
  { id: "git", name: "Git", category: "Tools" },
  { id: "graphql", name: "GraphQL", category: "API" },
  { id: "rest", name: "REST APIs", category: "API" },
  { id: "trpc", name: "tRPC", category: "API" },
  { id: "prisma", name: "Prisma", category: "ORM" },
  { id: "drizzle", name: "Drizzle ORM", category: "ORM" },
  { id: "sequelize", name: "Sequelize", category: "ORM" },
  { id: "typeorm", name: "TypeORM", category: "ORM" },
  { id: "webpack", name: "Webpack", category: "Build" },
  { id: "vite", name: "Vite", category: "Build" },
  { id: "esbuild", name: "esbuild", category: "Build" },
  { id: "turbopack", name: "Turbopack", category: "Build" },
  { id: "bun", name: "Bun", category: "Runtime" },
  { id: "deno", name: "Deno", category: "Runtime" },
  { id: "nginx", name: "Nginx", category: "Server" },
  { id: "linux", name: "Linux", category: "OS" },
  { id: "vim", name: "Vim/Neovim", category: "Editor" },
  { id: "vscode", name: "VS Code", category: "Editor" },
  { id: "figma", name: "Figma", category: "Design" },
  { id: "framer", name: "Framer", category: "Design" },
  { id: "threejs", name: "Three.js", category: "3D" },
  { id: "webgl", name: "WebGL", category: "3D" },
  { id: "unity", name: "Unity", category: "Game Dev" },
  { id: "unreal", name: "Unreal Engine", category: "Game Dev" },
  { id: "godot", name: "Godot", category: "Game Dev" },
  { id: "stripe", name: "Stripe", category: "Payments" },
  { id: "auth0", name: "Auth0", category: "Auth" },
  { id: "clerk", name: "Clerk", category: "Auth" },
  { id: "nextauth", name: "NextAuth.js", category: "Auth" },
  { id: "socket-io", name: "Socket.IO", category: "Realtime" },
  { id: "websockets", name: "WebSockets", category: "Realtime" },
  { id: "kafka", name: "Kafka", category: "Messaging" },
  { id: "rabbitmq", name: "RabbitMQ", category: "Messaging" },
  { id: "elasticsearch", name: "Elasticsearch", category: "Search" },
  { id: "algolia", name: "Algolia", category: "Search" },
  { id: "meilisearch", name: "Meilisearch", category: "Search" },
];

// Positions/roles list
const POSITIONS = [
  { id: "frontend-developer", name: "Frontend Developer" },
  { id: "backend-developer", name: "Backend Developer" },
  { id: "fullstack-developer", name: "Full Stack Developer" },
  { id: "mobile-developer", name: "Mobile Developer" },
  { id: "devops-engineer", name: "DevOps Engineer" },
  { id: "data-scientist", name: "Data Scientist" },
  { id: "ml-engineer", name: "ML Engineer" },
  { id: "product-manager", name: "Product Manager" },
  { id: "ui-ux-designer", name: "UI/UX Designer" },
  { id: "software-architect", name: "Software Architect" },
  { id: "engineering-manager", name: "Engineering Manager" },
  { id: "tech-lead", name: "Tech Lead" },
  { id: "cto", name: "CTO" },
  { id: "founder", name: "Founder" },
  { id: "indie-hacker", name: "Indie Hacker" },
  { id: "freelancer", name: "Freelancer" },
  { id: "student", name: "Student" },
  { id: "security-engineer", name: "Security Engineer" },
  { id: "qa-engineer", name: "QA Engineer" },
  { id: "sre", name: "Site Reliability Engineer" },
  { id: "game-developer", name: "Game Developer" },
  { id: "blockchain-developer", name: "Blockchain Developer" },
  { id: "embedded-engineer", name: "Embedded Engineer" },
  { id: "other", name: "Other" },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "skills";
  const query = url.searchParams.get("q")?.toLowerCase() || "";
  const category = url.searchParams.get("category");

  if (type === "positions") {
    let results = POSITIONS;
    if (query) {
      results = results.filter((p) => 
        p.name.toLowerCase().includes(query)
      );
    }
    return NextResponse.json({ positions: results });
  }

  // Default: skills
  let results = SKILLS_DATABASE;

  if (query) {
    results = results.filter((s) =>
      s.name.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query)
    );
  }

  if (category) {
    results = results.filter((s) => 
      s.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get unique categories for filtering
  const categories = [...new Set(SKILLS_DATABASE.map((s) => s.category))];

  return NextResponse.json({ 
    skills: results,
    categories 
  });
}
