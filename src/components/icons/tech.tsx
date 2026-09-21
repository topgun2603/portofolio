import type { SVGProps } from "react";

/**
 * Stylised stack marks. Deliberately simplified rather than the official
 * logos - close enough to read at a glance, small enough to stay inline, and
 * free of trademark files in the repo. Swap in real SVGs if you want exact
 * brand marks.
 *
 * Each one keeps its brand colour, because at marquee size the silhouette and
 * the colour are doing the recognising together - the label underneath is what
 * settles any doubt.
 */
type Props = SVGProps<SVGSVGElement>;

const svg = { viewBox: "0 0 40 40", "aria-hidden": true } as const;

/* ---------------------------------------------------------------- frontend */

function ReactMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="20" cy="20" r="3.2" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1.6">
        <ellipse cx="20" cy="20" rx="14" ry="5.4" />
        <ellipse cx="20" cy="20" rx="14" ry="5.4" transform="rotate(60 20 20)" />
        <ellipse cx="20" cy="20" rx="14" ry="5.4" transform="rotate(120 20 20)" />
      </g>
    </svg>
  );
}

function NextMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="20" cy="20" r="15" fill="#fff" />
      <path d="M14 27V13h2.6l10 13.2V13H29" stroke="#000" strokeWidth="2.1" fill="none" />
    </svg>
  );
}

function AngularMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M20 3 35 8.3l-2.3 19.5L20 37 7.3 27.8 5 8.3Z" fill="#DD0031" />
      <path d="M20 3v34l12.7-9.2L35 8.3Z" fill="#C3002F" />
      <path
        d="M20 9.5 12.3 27h2.9l1.55-3.9h6.5L24.8 27h2.9Zm0 4.6 2.35 5.7h-4.7Z"
        fill="#fff"
      />
    </svg>
  );
}

function VueMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M5 8h6.4L20 23.2 28.6 8H35L20 34Z" fill="#41B883" />
      <path d="M11.4 8h5.1L20 14.2 23.5 8h5.1L20 23.2Z" fill="#34495E" />
    </svg>
  );
}

function TypeScriptMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <rect x="5" y="5" width="30" height="30" rx="4" fill="#3178C6" />
      <path
        d="M13 18h9m-4.5 0v10M31 20.6c-.8-1-2-1.6-3.4-1.6-2 0-3.3 1-3.3 2.5 0 3.3 7 2 7 5.4 0 1.7-1.5 2.9-3.8 2.9-1.8 0-3.2-.7-4.1-1.9"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function TailwindMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path
        d="M20 12c-4 0-6.5 2-7.5 6 1.5-2 3.25-2.75 5.25-2.25 1.14.285 1.955 1.112 2.857 2.027C22.077 19.265 23.777 21 27.5 21c4 0 6.5-2 7.5-6-1.5 2-3.25 2.75-5.25 2.25-1.14-.285-1.955-1.112-2.857-2.027C25.423 13.735 23.723 12 20 12ZM12.5 21c-4 0-6.5 2-7.5 6 1.5-2 3.25-2.75 5.25-2.25 1.14.285 1.955 1.112 2.857 2.027C14.577 28.265 16.277 30 20 30c4 0 6.5-2 7.5-6-1.5 2-3.25 2.75-5.25 2.25-1.14-.285-1.955-1.112-2.857-2.027C17.923 22.735 16.223 21 12.5 21Z"
        fill="#38BDF8"
      />
    </svg>
  );
}

function MaterialMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="20" cy="20" r="15" fill="#4285F4" />
      <path d="M20 9 30.5 27h-21Z" fill="#fff" />
      <path d="M20 9 30.5 27H20Z" fill="#BBD5FB" />
    </svg>
  );
}

function ViteMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <rect x="4" y="4" width="32" height="32" rx="7" fill="#646CFF" />
      <path d="M23.5 8 12 22h6.4l-1.9 10L28 18h-6.6Z" fill="#FFD028" />
    </svg>
  );
}

function FlutterMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M24.4 4 8 20.4l5 5L34.4 4Z" fill="#47C5FB" />
      <path d="M24.4 19.4 15.6 28.2 24.4 37h10l-8.8-8.8 8.8-8.8Z" fill="#47C5FB" />
      <path d="m15.6 28.2 5-5 5 5-5 5Z" fill="#00569E" />
    </svg>
  );
}

function ReactNativeMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <rect x="10" y="3" width="20" height="34" rx="4" stroke="#61DAFB" strokeWidth="1.8" />
      <circle cx="20" cy="20" r="2.2" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1.3">
        <ellipse cx="20" cy="20" rx="8.4" ry="3.3" />
        <ellipse cx="20" cy="20" rx="8.4" ry="3.3" transform="rotate(60 20 20)" />
        <ellipse cx="20" cy="20" rx="8.4" ry="3.3" transform="rotate(120 20 20)" />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------- backend */

function NodeMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M20 4.5 34 12.5v15L20 35.5 6 27.5v-15Z" fill="#539E43" />
      <path
        d="M20 25.5c-2.6 0-4.2-1.2-4.2-3.2h2.2c0 .9.6 1.4 2 1.4 1.3 0 1.9-.4 1.9-1.1 0-2-5.8-.6-5.8-4.2 0-1.8 1.5-3 3.9-3 2.5 0 3.9 1.1 3.9 3.1h-2.2c0-.9-.5-1.3-1.7-1.3s-1.7.4-1.7 1c0 1.9 5.8.6 5.8 4.2 0 1.9-1.6 3.1-4.1 3.1Z"
        fill="#fff"
      />
    </svg>
  );
}

function ExpressMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M13 12 5 20l8 8M27 12l8 8-8 8" />
        <path d="M23.5 9 17 31" />
      </g>
    </svg>
  );
}

function FastApiMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="20" cy="20" r="15" fill="#009688" />
      <path d="M21.6 8 12 22h6.2l-1.4 10L28 18h-6.4Z" fill="#fff" />
    </svg>
  );
}

function DjangoMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <rect x="5" y="5" width="30" height="30" rx="5" fill="#0C4B33" />
      <path
        d="M17.4 11v5.1h-2.2a5.6 5.6 0 0 0 0 11.2h5.5V11Zm0 8.1v5.2h-1.9a2.6 2.6 0 0 1 0-5.2Z"
        fill="#fff"
      />
      <path d="M23.4 11h3v3.2h-3zm0 5.1h3v11.2h-3z" fill="#fff" />
    </svg>
  );
}

function GraphQlMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g stroke="#E10098" strokeWidth="1.5">
        <path d="M20 6 32 13v14L20 34 8 27V13Z" />
        <path d="M8 13h24L20 34Z" />
      </g>
      <g fill="#E10098">
        <circle cx="20" cy="6" r="3" />
        <circle cx="32" cy="13" r="3" />
        <circle cx="32" cy="27" r="3" />
        <circle cx="20" cy="34" r="3" />
        <circle cx="8" cy="27" r="3" />
        <circle cx="8" cy="13" r="3" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------- data */

function PostgresMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path
        d="M20 5c-7 0-12 3.4-12 8.6 0 3 .7 6.9 2.1 10.6 1.3 3.3 2.9 5.8 4.6 5.8 1 0 1.4-.7 1.7-1.7l.5-1.7c.6.2 1.3.3 2 .3s1.4-.1 2-.3l.5 1.7c.3 1 .7 1.7 1.7 1.7 1.7 0 3.3-2.5 4.6-5.8C29.3 20.5 30 16.6 30 13.6 30 8.4 25.6 5 20 5Z"
        fill="#336791"
      />
      <path
        d="M15.4 14.4c0 .8-.4 1.4-.9 1.4s-.9-.6-.9-1.4.4-1.4.9-1.4.9.6.9 1.4Zm10.9 0c0 .8-.4 1.4-.9 1.4s-.9-.6-.9-1.4.4-1.4.9-1.4.9.6.9 1.4ZM20 19.5c1.6 0 2.9.7 2.9 1.6 0 .9-1.3 1.6-2.9 1.6s-2.9-.7-2.9-1.6c0-.9 1.3-1.6 2.9-1.6Z"
        fill="#fff"
        opacity=".92"
      />
    </svg>
  );
}

function MySqlMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path
        d="M4 26.5c5.5-11 14-16 25-15.5-3.2 1.2-5.3 3-6.2 5.6 2.8 1.1 4.7 3 5.6 5.8-3.9-2.2-7.9-2.3-12 0-4.4 2.4-8.6 3.5-12.4 4.1Z"
        fill="#00758F"
      />
      <circle cx="25.6" cy="13.4" r="1.2" fill="#fff" />
      <path d="M28 27.5h7M31 24.5v6" stroke="#F29111" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function MongoMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M20 3c5 7.5 8.5 13 8.5 18.2C28.5 27.6 24.7 31.7 20 34c-4.7-2.3-8.5-6.4-8.5-12.8C11.5 16 15 10.5 20 3Z" fill="#4DB33D" />
      <path d="M20 3v31c-4.7-2.3-8.5-6.4-8.5-12.8C11.5 16 15 10.5 20 3Z" fill="#3F9639" />
      <path d="M19.1 33h1.8v4.5h-1.8Z" fill="#B8C4C2" />
    </svg>
  );
}

function RedisMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g fill="#D82C20">
        <path d="M20 5 35 11 20 17 5 11Z" />
        <path d="M20 16 35 22 20 28 5 22Z" opacity=".78" />
        <path d="M20 27 35 33 20 39 5 33Z" opacity=".55" />
      </g>
    </svg>
  );
}

function SqliteMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M7 11c0-3.3 5.8-6 13-6s13 2.7 13 6v18c0 3.3-5.8 6-13 6S7 32.3 7 29Z" fill="#0F80CC" />
      <ellipse cx="20" cy="11" rx="13" ry="6" fill="#57B6E8" />
      <path d="M31 14 21.5 27l-2.7-2.1L28.6 12Z" fill="#fff" opacity=".9" />
    </svg>
  );
}

function FirebaseMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M8 29 14.4 7l4.6 8.4L22 10l10 19Z" fill="#FFA000" />
      <path d="M8 29 14.4 7l4.6 8.4Z" fill="#FFCA28" />
      <path d="M8 29 22 10l10 19Z" fill="#F57C00" opacity=".55" />
    </svg>
  );
}

/* ---------------------------------------------------------------- ai and ml */

function ClaudeMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g stroke="#D97757" strokeWidth="2.8" strokeLinecap="round">
        <path d="M20 5v11M20 24v11M5 20h11M24 20h11" />
        <path d="m9.4 9.4 7.8 7.8M22.8 22.8l7.8 7.8M30.6 9.4l-7.8 7.8M17.2 22.8l-7.8 7.8" />
      </g>
    </svg>
  );
}

function OpenAiMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g stroke="#fff" strokeWidth="1.9" fill="none">
        <ellipse cx="20" cy="20" rx="6.2" ry="13.5" />
        <ellipse cx="20" cy="20" rx="6.2" ry="13.5" transform="rotate(60 20 20)" />
        <ellipse cx="20" cy="20" rx="6.2" ry="13.5" transform="rotate(120 20 20)" />
      </g>
    </svg>
  );
}

function GeminiMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path
        d="M20 3c1.6 8.6 7.8 14.8 16.4 16.4C27.8 21 21.6 27.2 20 35.8 18.4 27.2 12.2 21 3.6 19.4 12.2 17.8 18.4 11.6 20 3Z"
        fill="#4285F4"
      />
    </svg>
  );
}

function TensorFlowMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g fill="#FF6F00">
        <path d="M20 3 5 11.7v7.1l8.3-4.8v17.3l6.7 3.9Z" />
        <path d="M20 3v14.8l6.7-3.9v7.1L20 25v9.2l15-8.7v-7.1l-8.3 4.8v-7.1L35 11.7Z" opacity=".72" />
      </g>
    </svg>
  );
}

function PyTorchMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path
        d="M25.8 6.6 22.9 9.5a11.1 11.1 0 1 1-5.8 0v4.3a7 7 0 1 0 3.9 0V2.7Z"
        fill="#EE4C2C"
      />
      <circle cx="26" cy="12.4" r="1.9" fill="#EE4C2C" />
    </svg>
  );
}

function ScikitMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="15.5" cy="20" r="9" fill="#F89939" opacity=".92" />
      <circle cx="24.5" cy="20" r="9" fill="#3499CD" opacity=".82" />
    </svg>
  );
}

function LangChainMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g stroke="#5BC8A0" strokeWidth="2.4" fill="none">
        <rect x="4" y="14.5" width="17" height="11" rx="5.5" />
        <rect x="19" y="14.5" width="17" height="11" rx="5.5" />
      </g>
    </svg>
  );
}

function HuggingFaceMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="20" cy="20" r="13.5" fill="#FFD21E" />
      <circle cx="15.2" cy="17" r="1.9" fill="#3A3B45" />
      <circle cx="24.8" cy="17" r="1.9" fill="#3A3B45" />
      <path
        d="M12.8 23.6c2 3.4 4.4 5.1 7.2 5.1s5.2-1.7 7.2-5.1"
        stroke="#3A3B45"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* -------------------------------------------------------- cloud and devops */

function AwsMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path
        d="M10.4 20.5 13 12l2.6 8.5M11.4 17.8h3.2M18.6 12l2 8.5 1.9-6 1.9 6 2-8.5M31.6 13.3c-2.2-1.2-4.4-.3-4.4.9 0 2.1 4.6 1.1 4.6 3.4 0 1.3-2.2 2.2-4.4 1"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M5.5 26.5c8.2 5.3 20.8 5.3 29-.4"
        stroke="#FF9900"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="m29.8 23.2 5.6 2.6-4.3 4Z" fill="#FF9900" />
    </svg>
  );
}

function AzureMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M14.8 4 5 25.5h7.2L14.8 4Z" fill="#50E6FF" />
      <path d="M16.4 8 6 32h29L16.4 8Z" fill="#0078D4" />
    </svg>
  );
}

function DockerMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g fill="#2396ED">
        <rect x="10.5" y="18" width="5.2" height="5.2" rx=".6" />
        <rect x="16.6" y="18" width="5.2" height="5.2" rx=".6" />
        <rect x="22.7" y="18" width="5.2" height="5.2" rx=".6" />
        <rect x="16.6" y="12" width="5.2" height="5.2" rx=".6" />
        <path d="M4 25.2h32c-.9 5-6 8.3-13 8.3-9 0-16-3.3-19-8.3Z" />
      </g>
    </svg>
  );
}

function KubernetesMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <path d="M20 3 34.5 10 38 25.5 28 37H12L2 25.5 5.5 10Z" fill="#326CE5" />
      <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="20" cy="20" r="4.6" fill="none" />
        <path d="M20 8v4.4M30.8 15.4l-4.6 3M27.4 30.6l-3.2-4.2M12.6 30.6l3.2-4.2M9.2 15.4l4.6 3" />
      </g>
    </svg>
  );
}

function GithubActionsMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <circle cx="20" cy="20" r="14.5" fill="#2088FF" />
      <path
        d="M20 12.5a7.5 7.5 0 1 0 7.5 7.5"
        stroke="#fff"
        strokeWidth="2.7"
        strokeLinecap="round"
        fill="none"
      />
      <path d="m24.6 9.4 5.2 2.4-4.6 3.3Z" fill="#fff" />
    </svg>
  );
}

function TerraformMark(props: Props) {
  return (
    <svg {...svg} {...props} fill="none">
      <g fill="#7B42BC">
        <path d="M16.2 12.3 7 7v9.9l9.2 5.3Z" />
        <path d="M17.6 13.1v9.9l9.2 5.3v-9.9Z" />
        <path d="M28.2 18.4v9.9l9.2-5.3v-9.9Z" opacity=".8" />
        <path d="M16.2 23.9 7 18.6v9.9l9.2 5.3Z" opacity=".65" />
      </g>
    </svg>
  );
}

export const techMarks = {
  react: { label: "React", Mark: ReactMark },
  nextjs: { label: "Next.js", Mark: NextMark },
  angular: { label: "Angular", Mark: AngularMark },
  vue: { label: "Vue.js", Mark: VueMark },
  typescript: { label: "TypeScript", Mark: TypeScriptMark },
  tailwind: { label: "Tailwind CSS", Mark: TailwindMark },
  material: { label: "Material Design", Mark: MaterialMark },
  vite: { label: "Vite", Mark: ViteMark },
  flutter: { label: "Flutter", Mark: FlutterMark },
  reactnative: { label: "React Native", Mark: ReactNativeMark },

  nodejs: { label: "Node.js", Mark: NodeMark },
  express: { label: "Express.js", Mark: ExpressMark },
  fastapi: { label: "FastAPI", Mark: FastApiMark },
  django: { label: "Django", Mark: DjangoMark },
  graphql: { label: "GraphQL", Mark: GraphQlMark },

  postgres: { label: "PostgreSQL", Mark: PostgresMark },
  mysql: { label: "MySQL", Mark: MySqlMark },
  mongodb: { label: "MongoDB", Mark: MongoMark },
  redis: { label: "Redis", Mark: RedisMark },
  sqlite: { label: "SQLite", Mark: SqliteMark },
  firebase: { label: "Firebase", Mark: FirebaseMark },

  claude: { label: "Claude", Mark: ClaudeMark },
  openai: { label: "OpenAI", Mark: OpenAiMark },
  gemini: { label: "Gemini", Mark: GeminiMark },
  tensorflow: { label: "TensorFlow", Mark: TensorFlowMark },
  pytorch: { label: "PyTorch", Mark: PyTorchMark },
  scikit: { label: "scikit-learn", Mark: ScikitMark },
  langchain: { label: "LangChain", Mark: LangChainMark },
  huggingface: { label: "Hugging Face", Mark: HuggingFaceMark },

  aws: { label: "AWS", Mark: AwsMark },
  azure: { label: "Azure", Mark: AzureMark },
  docker: { label: "Docker", Mark: DockerMark },
  kubernetes: { label: "Kubernetes", Mark: KubernetesMark },
  githubactions: { label: "GitHub Actions", Mark: GithubActionsMark },
  terraform: { label: "Terraform", Mark: TerraformMark },
} as const;

export type TechKey = keyof typeof techMarks;
