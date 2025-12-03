// Minimal, structured slide set demonstrating themes and image placement.
// Fields:
// - theme: "ocean" | "carbon" | "sunset" | "violet" | "forest"
// - image: boolean (if true, app will pick a random image from /src/assets)
// - imageSide: "left" | "right"

export const DEFAULT_SLIDES = [
  {
    theme: "sunset",
    title: "Процесс ба Thread",
    subtitle: "Үндсэн ойлголтууд",
    body: "Процесс = ажиллаж буй програмын жишээ; Thread = нэг хаягийн зайд зэрэгцээ гүйцэтгэх урсгал.",
    bullets: ["Isolation • Scheduling • IPC", "Санах ой, файлын систем, I/O"],
    image: true,
    imageSide: "right"
  },
  {
    theme: "ocean",
    title: "Процесс гэж юу вэ?",
    body: "Процесс нь OS дээр ажиллаж буй програмын runtime төлөв. Тусдаа хаягийн зай, PID, нөөцтэй.",
    bullets: ["Сегментүүд: Code • Data • Heap • Stack", "OS нь PCB-аар хянадаг"],
    image: true,
    imageSide: "left"
  },
  {
    theme: "carbon",
    title: "Процессийн амьдралын мөчлөг",
    bullets: [
      "New → Ready → Running",
      "Running → Waiting → Ready",
      "Running → Terminated"
    ],
    body: "Scheduling ба I/O нь шилжилтийг тодорхойлдог. Context switch нь зардалтай.",
    image: false
  },
  {
    theme: "forest",
    title: "Thread гэж юу вэ?",
    body: "Нэг процесс доторхи хөнгөн гүйцэтгэх нэгж. Код/өгөгдөл хуваалцсан, стек тусдаа.",
    bullets: ["Давуу: солилцоо хурдан", "Сорилт: race, deadlock → sync шаардлагатай"],
    image: true,
    imageSide: "right"
  },
  {
    theme: "violet",
    title: "IPC ба Синхрончлол",
    bullets: [
      "Pipes • Message Queues • Shared Memory • Sockets",
      "Mutex/Semaphore → critical section хамгаалалт"
    ],
    body: "Зөв загварчлалгүй бол deadlock/starvation эрсдэлтэй.",
    image: true,
    imageSide: "left"
  },
  {
    theme: "ocean",
    title: "Хураангуй",
    bullets: [
      "Процесс = тусгаарлалт ба нөөц",
      "Thread = зэрэгцээ гүйцэтгэл",
      "IPC + sync = зөв аюулгүй загвар"
    ],
    body: "Гүйцэтгэл ба найдвартай байдлыг тэнцвэржүүл.",
    image: false
  }
];
