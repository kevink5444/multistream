
import { useState } from "react";
import {
  Search,
  BookOpen,
  Video,
  Radio,
  Monitor,
  Settings,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Play,
  Layers,
  Activity,
} from "lucide-react";

// ======================================================
// HELP ARTICLES
// ======================================================

const helpArticles = [
  {
    category: "Getting Started",
    title: "Getting Started with MultiStream",
    description:
      "Learn the basics of MultiStream and how to prepare your first streaming session.",
    icon: Play,
    content: [
      "Open the Dashboard to monitor your application status.",
      "Add your video and audio sources through the Sources menu.",
      "Configure your streaming platforms through Destinations.",
      "Create a Live Session and select the sources and destinations you want to use.",
      "Start your streaming session when everything is ready.",
    ],
  },
  {
    category: "Sources",
    title: "How to Add a Stream Source",
    description:
      "Learn how to add cameras, screen captures, video files, and audio sources.",
    icon: Monitor,
    content: [
      "Open the Sources menu from the sidebar.",
      "Click Add Source.",
      "Choose the source type you want to add.",
      "Enter a source name.",
      "Configure the source settings.",
      "Save your source configuration.",
    ],
  },
  {
    category: "Destinations",
    title: "Configure Streaming Destinations",
    description:
      "Connect your streaming platforms and configure destination settings.",
    icon: Radio,
    content: [
      "Open the Destinations page.",
      "Click Add Destination.",
      "Choose your preferred streaming platform.",
      "Enter the RTMP server URL.",
      "Enter your stream key.",
      "Save your destination configuration.",
      "Test the connection before starting your stream.",
    ],
  },
  {
    category: "Live Sessions",
    title: "Create and Start a Live Session",
    description:
      "Learn how to combine multiple sources and destinations into one session.",
    icon: Video,
    content: [
      "Open Live Sessions.",
      "Click Create Session.",
      "Enter a session name.",
      "Select your streaming sources.",
      "Select one or more destinations.",
      "Review your configuration.",
      "Create the session.",
      "Click Start Streaming.",
    ],
  },
  {
    category: "Analytics",
    title: "Understanding Streaming Analytics",
    description:
      "Understand bitrate, FPS, CPU usage, and memory utilization.",
    icon: Activity,
    content: [
      "CPU Usage measures processor utilization.",
      "Memory Usage shows system memory consumption.",
      "Bitrate measures the amount of video data transmitted per second.",
      "FPS indicates how many video frames are transmitted per second.",
      "Monitor these values to identify streaming performance problems.",
    ],
  },
  {
    category: "Settings",
    title: "Configure Video and Audio Settings",
    description:
      "Adjust resolution, frame rate, encoder, bitrate, and audio settings.",
    icon: Settings,
    content: [
      "Open Settings.",
      "Choose the Video tab to configure resolution and FPS.",
      "Select the video encoder and encoding preset.",
      "Adjust the bitrate and keyframe interval.",
      "Open the Audio tab to configure audio bitrate and sample rate.",
      "Open Performance to configure optimization options.",
      "Click Save Changes.",
    ],
  },
];

// ======================================================
// FAQ
// ======================================================

const faqItems = [
  {
    question: "What is MultiStream?",
    answer:
      "MultiStream is an application concept designed to manage streaming sources, destinations, sessions, and performance monitoring from a centralized interface.",
  },
  {
    question: "Can I stream to multiple platforms simultaneously?",
    answer:
      "The application interface is designed to support multiple destinations in one streaming session. Actual simultaneous streaming functionality will be implemented during backend development.",
  },
  {
    question: "Why is my destination connection failing?",
    answer:
      "Check your RTMP server URL, stream key, internet connection, and destination configuration. Make sure the streaming platform is ready to receive your broadcast.",
  },
  {
    question: "What bitrate should I use?",
    answer:
      "The recommended bitrate depends on your output resolution, frame rate, platform requirements, and available upload bandwidth. Avoid using a bitrate that exceeds your stable upload capacity.",
  },
  {
    question: "Why is my CPU usage high?",
    answer:
      "High CPU usage may be caused by encoding settings, multiple active streams, high resolution, high frame rate, or other running applications.",
  },
  {
    question: "What is the difference between FPS and bitrate?",
    answer:
      "FPS measures the number of frames transmitted per second. Bitrate measures the amount of data transmitted per second. Both affect stream quality and bandwidth requirements.",
  },
  {
    question: "Are the current streaming features fully functional?",
    answer:
      "The current project is still in frontend development. Some dashboard metrics, stream controls, and configuration features use simulated data and will be connected to the actual streaming backend later.",
  },
];

// ======================================================
// HELP CARD
// ======================================================

function HelpCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-[#111118] p-5 text-left transition hover:border-white/20 hover:bg-white/[0.03]"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>

      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-white" />
    </button>
  );
}

// ======================================================
// ARTICLE CARD
// ======================================================

function ArticleCard({
  article,
  onClick,
}) {
  const Icon = article.icon;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-xl border border-white/5 bg-black/20 p-4 text-left transition hover:bg-white/[0.03]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
        <Icon className="h-4 w-4 text-indigo-400" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-white">
          {article.title}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          {article.description}
        </p>

        <span className="mt-2 inline-block text-xs text-indigo-400">
          {article.category}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
    </button>
  );
}

// ======================================================
// FAQ ITEM
// ======================================================

function FAQItem({
  question,
  answer,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">

      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-zinc-300 transition hover:text-white">
          {question}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="pb-4 pr-8">
          <p className="text-sm leading-relaxed text-zinc-500">
            {answer}
          </p>
        </div>
      )}

    </div>
  );
}

// ======================================================
// ARTICLE MODAL
// ======================================================

function ArticleModal({
  article,
  onClose,
}) {
  if (!article) return null;

  const Icon = article.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111118] shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 p-5">

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                {article.title}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                {article.category}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>

        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-5">

          <p className="mb-5 text-sm leading-relaxed text-zinc-400">
            {article.description}
          </p>

          <div className="space-y-3">

            {article.content.map((step, index) => (
              <div
                key={index}
                className="flex gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-400">
                  {index + 1}
                </div>

                <p className="pt-1 text-sm leading-relaxed text-zinc-300">
                  {step}
                </p>
              </div>
            ))}

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 p-4">

          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// HELP CENTER PAGE
// ======================================================

export default function HelpCenter() {
  const [search, setSearch] = useState("");

  const [selectedArticle, setSelectedArticle] = useState(null);

  // ====================================================
  // SEARCH ARTICLES
  // ====================================================

  const filteredArticles = helpArticles.filter((article) => {
    const searchableText = [
      article.title,
      article.description,
      article.category,
      ...article.content,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.toLowerCase());
  });

  // ====================================================
  // NAVIGATE TO CATEGORY
  // ====================================================

  const openCategory = (category) => {
    const article = helpArticles.find(
      (item) => item.category === category
    );

    if (article) {
      setSelectedArticle(article);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div>
        <h1 className="text-2xl font-bold text-white">
          Help Center
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Learn how to use MultiStream and troubleshoot common problems.
        </p>
      </div>

      {/* ================================================== */}
      {/* HERO SEARCH */}
      {/* ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-[#111118] to-[#111118] p-6 sm:p-8">

        <div className="mx-auto max-w-2xl text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
            <CircleHelp className="h-6 w-6 text-indigo-400" />
          </div>

          <h2 className="mt-4 text-xl font-bold text-white sm:text-2xl">
            How can we help you?
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Search guides, tutorials, and frequently asked questions.
          </p>

          <div className="relative mt-6">

            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help..."
              className="w-full rounded-xl border border-white/10 bg-black/30 py-4 pl-12 pr-4 text-sm text-white outline-none transition focus:border-indigo-500/50"
            />

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* QUICK HELP */}
      {/* ================================================== */}

      {!search && (
        <div>

          <h2 className="mb-4 text-lg font-semibold text-white">
            Quick Help
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <HelpCard
              icon={Play}
              title="Getting Started"
              description="Learn how to start using MultiStream."
              color="bg-indigo-500/10 text-indigo-400"
              onClick={() => openCategory("Getting Started")}
            />

            <HelpCard
              icon={Monitor}
              title="Sources"
              description="Configure your cameras and capture devices."
              color="bg-sky-500/10 text-sky-400"
              onClick={() => openCategory("Sources")}
            />

            <HelpCard
              icon={Radio}
              title="Destinations"
              description="Configure your streaming platforms."
              color="bg-emerald-500/10 text-emerald-400"
              onClick={() => openCategory("Destinations")}
            />

            <HelpCard
              icon={Video}
              title="Live Sessions"
              description="Create and manage streaming sessions."
              color="bg-purple-500/10 text-purple-400"
              onClick={() => openCategory("Live Sessions")}
            />

          </div>

        </div>
      )}

      {/* ================================================== */}
      {/* ARTICLES */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            {search ? "Search Results" : "Documentation"}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {search
              ? `${filteredArticles.length} articles found`
              : "Browse our guides and tutorials"}
          </p>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="py-12 text-center">

            <Search className="mx-auto h-8 w-8 text-zinc-600" />

            <p className="mt-3 text-sm font-medium text-white">
              No articles found
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Try searching with different keywords.
            </p>

          </div>
        ) : (
          <div className="space-y-3">

            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.title}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}

          </div>
        )}

      </div>

      {/* ================================================== */}
      {/* FAQ */}
      {/* ================================================== */}

      {!search && (
        <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Frequently Asked Questions
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Answers to common questions.
            </p>
          </div>

          <div>
            {faqItems.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>

        </div>
      )}

      {/* ================================================== */}
      {/* TROUBLESHOOTING */}
      {/* ================================================== */}

      {!search && (
        <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Troubleshooting
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                Experiencing streaming problems? Check your sources,
                destination configuration, network connection, and
                streaming settings before starting a session.
              </p>

            </div>

          </div>

          <div className="mt-4 space-y-2">

            {[
              "Check whether your source is enabled.",
              "Verify your RTMP server URL and stream key.",
              "Check your upload bandwidth.",
              "Reduce bitrate if your connection is unstable.",
              "Monitor CPU and memory usage.",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-zinc-400"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

                {item}
              </div>
            ))}

          </div>

        </div>
      )}

      {/* ================================================== */}
      {/* SUPPORT */}
      {/* ================================================== */}

      <div className="rounded-2xl border border-white/10 bg-[#111118] p-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
              <MessageCircle className="h-5 w-5 text-indigo-400" />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Need More Help?
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                More support options will be available in future releases.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <BookOpen className="h-4 w-4" />

            <span>MultiStream Documentation</span>

            <ExternalLink className="h-3.5 w-3.5" />
          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* ARTICLE MODAL */}
      {/* ================================================== */}

      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

    </div>
  );
}
