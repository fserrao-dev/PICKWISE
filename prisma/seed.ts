import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PICKWISE database...");

  // ── Badges ────────────────────────────────────────────────────────────────
  const badgeDefs = [
    { name: "First Lesson", description: "Complete your very first lesson", iconUrl: "🎯" },
    { name: "Perfect Score", description: "Score 100% on any quiz", iconUrl: "💯" },
    { name: "Course Champion", description: "Complete an entire course", iconUrl: "🏆" },
    { name: "Top 3", description: "Reach the top 3 on the leaderboard", iconUrl: "🥇" },
  ];

  for (const b of badgeDefs) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
  }
  console.log("✅ Badges seeded");

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin1234!", 12);
  const studentPassword = await bcrypt.hash("Student1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@pickwise.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@pickwise.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student1@pickwise.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "student1@pickwise.com",
      password: studentPassword,
      role: "STUDENT",
      points: 120,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@pickwise.com" },
    update: {},
    create: {
      name: "Bob Martinez",
      email: "student2@pickwise.com",
      password: studentPassword,
      role: "STUDENT",
      points: 80,
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: "student3@pickwise.com" },
    update: {},
    create: {
      name: "Carol Chen",
      email: "student3@pickwise.com",
      password: studentPassword,
      role: "STUDENT",
      points: 50,
    },
  });
  console.log("✅ Users seeded");

  // ── Course 1: Web Development ─────────────────────────────────────────────
  const course1 = await prisma.course.upsert({
    where: { id: "course-web-dev" },
    update: {},
    create: {
      id: "course-web-dev",
      title: "Web Development Fundamentals",
      description:
        "Learn the core building blocks of the web: HTML, CSS, and JavaScript. Perfect for beginners who want to build their first websites.",
      isPublished: true,
    },
  });

  const module1a = await prisma.module.upsert({
    where: { id: "mod-html" },
    update: {},
    create: { id: "mod-html", courseId: course1.id, title: "HTML Basics", order: 1 },
  });

  const module1b = await prisma.module.upsert({
    where: { id: "mod-css" },
    update: {},
    create: { id: "mod-css", courseId: course1.id, title: "CSS Styling", order: 2 },
  });

  // Lessons for Module 1a
  const lesson1 = await prisma.lesson.upsert({
    where: { id: "lesson-html-intro" },
    update: {},
    create: {
      id: "lesson-html-intro",
      moduleId: module1a.id,
      title: "Introduction to HTML",
      youtubeUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
      description: "Understand the structure of web pages using HTML elements and tags.",
      order: 1,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: "lesson-html-forms" },
    update: {},
    create: {
      id: "lesson-html-forms",
      moduleId: module1a.id,
      title: "HTML Forms & Inputs",
      youtubeUrl: "https://www.youtube.com/watch?v=frAGrGN00OA",
      description: "Learn how to collect user data with HTML forms.",
      order: 2,
    },
  });

  // Lessons for Module 1b
  const lesson3 = await prisma.lesson.upsert({
    where: { id: "lesson-css-intro" },
    update: {},
    create: {
      id: "lesson-css-intro",
      moduleId: module1b.id,
      title: "CSS Selectors & Properties",
      youtubeUrl: "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
      description: "Style your HTML pages with CSS selectors and properties.",
      order: 1,
    },
  });

  const lesson4 = await prisma.lesson.upsert({
    where: { id: "lesson-css-flexbox" },
    update: {},
    create: {
      id: "lesson-css-flexbox",
      moduleId: module1b.id,
      title: "CSS Flexbox Layout",
      youtubeUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
      description: "Master flexible box layouts for modern responsive design.",
      order: 2,
    },
  });

  // ── Course 2: JavaScript ──────────────────────────────────────────────────
  const course2 = await prisma.course.upsert({
    where: { id: "course-js" },
    update: {},
    create: {
      id: "course-js",
      title: "JavaScript for Beginners",
      description:
        "Go from zero to coding with JavaScript. Learn variables, functions, arrays, objects, and DOM manipulation.",
      isPublished: true,
    },
  });

  const module2a = await prisma.module.upsert({
    where: { id: "mod-js-basics" },
    update: {},
    create: { id: "mod-js-basics", courseId: course2.id, title: "JS Fundamentals", order: 1 },
  });

  const module2b = await prisma.module.upsert({
    where: { id: "mod-js-dom" },
    update: {},
    create: { id: "mod-js-dom", courseId: course2.id, title: "DOM Manipulation", order: 2 },
  });

  const lesson5 = await prisma.lesson.upsert({
    where: { id: "lesson-js-vars" },
    update: {},
    create: {
      id: "lesson-js-vars",
      moduleId: module2a.id,
      title: "Variables & Data Types",
      youtubeUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
      description: "Learn about var, let, const and JavaScript's primitive data types.",
      order: 1,
    },
  });

  const lesson6 = await prisma.lesson.upsert({
    where: { id: "lesson-js-functions" },
    update: {},
    create: {
      id: "lesson-js-functions",
      moduleId: module2a.id,
      title: "Functions & Scope",
      youtubeUrl: "https://www.youtube.com/watch?v=xUI5Tsl2JpY",
      description: "Understand how to write and call functions in JavaScript.",
      order: 2,
    },
  });

  const lesson7 = await prisma.lesson.upsert({
    where: { id: "lesson-js-dom" },
    update: {},
    create: {
      id: "lesson-js-dom",
      moduleId: module2b.id,
      title: "Selecting DOM Elements",
      youtubeUrl: "https://www.youtube.com/watch?v=0ik6X4DJKCc",
      description: "Use querySelector and getElementById to interact with web pages.",
      order: 1,
    },
  });

  const lesson8 = await prisma.lesson.upsert({
    where: { id: "lesson-js-events" },
    update: {},
    create: {
      id: "lesson-js-events",
      moduleId: module2b.id,
      title: "Event Listeners",
      youtubeUrl: "https://www.youtube.com/watch?v=XF1_MlZ5l6M",
      description: "Respond to user actions like clicks and key presses.",
      order: 2,
    },
  });

  console.log("✅ Courses & lessons seeded");

  // ── Questions ─────────────────────────────────────────────────────────────
  const questionsData: Record<string, any[]> = {
    "lesson-html-intro": [
      { text: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Management Language", "Home Tool Markup Language"], correctIndex: 0, explanation: "HTML stands for HyperText Markup Language." },
      { text: "Which tag is used for the largest heading?", options: ["<h6>", "<head>", "<h1>", "<heading>"], correctIndex: 2, explanation: "<h1> is the largest heading tag in HTML." },
      { text: "What tag creates a paragraph?", options: ["<para>", "<p>", "<pg>", "<text>"], correctIndex: 1, explanation: "The <p> tag defines a paragraph." },
    ],
    "lesson-html-forms": [
      { text: "Which input type creates a checkbox?", options: ["type='check'", "type='box'", "type='checkbox'", "type='tick'"], correctIndex: 2, explanation: "Use type='checkbox' for checkbox inputs." },
      { text: "What attribute is required for a <label> to be associated with an input?", options: ["name", "for", "id", "bind"], correctIndex: 1, explanation: "The 'for' attribute links a label to its input by matching the input's id." },
      { text: "Which element groups form controls?", options: ["<group>", "<section>", "<fieldset>", "<div>"], correctIndex: 2, explanation: "<fieldset> groups related form controls together." },
    ],
    "lesson-css-intro": [
      { text: "Which CSS property changes the text color?", options: ["font-color", "text-color", "color", "foreground"], correctIndex: 2, explanation: "The 'color' property sets the text color in CSS." },
      { text: "How do you select all <p> elements in CSS?", options: ["#p", ".p", "p", "*p"], correctIndex: 2, explanation: "Type selectors select elements by tag name, so 'p' selects all paragraphs." },
      { text: "Which property controls the space inside an element's border?", options: ["margin", "border-spacing", "spacing", "padding"], correctIndex: 3, explanation: "Padding is the space between an element's content and its border." },
    ],
    "lesson-css-flexbox": [
      { text: "Which property turns on flexbox layout?", options: ["display: grid", "display: block", "display: flex", "layout: flex"], correctIndex: 2, explanation: "Setting display: flex on a container enables flexbox." },
      { text: "Which property controls how flex items align on the cross axis?", options: ["justify-content", "align-items", "flex-direction", "flex-wrap"], correctIndex: 1, explanation: "align-items controls cross-axis alignment of flex children." },
      { text: "What value of flex-direction stacks items vertically?", options: ["row", "horizontal", "column", "vertical"], correctIndex: 2, explanation: "flex-direction: column stacks flex items from top to bottom." },
    ],
    "lesson-js-vars": [
      { text: "Which keyword declares a block-scoped variable in modern JS?", options: ["var", "let", "def", "set"], correctIndex: 1, explanation: "let is block-scoped, unlike var which is function-scoped." },
      { text: "What is the type of `null` in JavaScript?", options: ["null", "undefined", "object", "boolean"], correctIndex: 2, explanation: "typeof null === 'object' is a well-known JS quirk." },
      { text: "Which of these is NOT a primitive type?", options: ["string", "number", "array", "boolean"], correctIndex: 2, explanation: "Arrays are objects in JavaScript, not primitives." },
    ],
    "lesson-js-functions": [
      { text: "What keyword defines a function?", options: ["def", "fun", "function", "func"], correctIndex: 2, explanation: "JavaScript uses the 'function' keyword to declare functions." },
      { text: "What does a function return if no return statement is used?", options: ["0", "null", "false", "undefined"], correctIndex: 3, explanation: "Without a return statement, functions return undefined." },
      { text: "Arrow functions were introduced in which ES version?", options: ["ES3", "ES5", "ES6", "ES2020"], correctIndex: 2, explanation: "Arrow functions (=>) were introduced in ES6 (ES2015)." },
    ],
    "lesson-js-dom": [
      { text: "Which method selects an element by its id?", options: ["querySelector", "getElementById", "getElement", "selectById"], correctIndex: 1, explanation: "document.getElementById() selects an element by its id attribute." },
      { text: "What does querySelector return if nothing is found?", options: ["undefined", "false", "null", "[]"], correctIndex: 2, explanation: "querySelector returns null when no matching element is found." },
      { text: "Which property changes an element's text content?", options: ["innerHTML", "textContent", "innerText", "Both B and C"], correctIndex: 3, explanation: "Both textContent and innerText can get/set text content." },
    ],
    "lesson-js-events": [
      { text: "Which method attaches an event listener?", options: ["onEvent", "addListener", "addEventListener", "listenTo"], correctIndex: 2, explanation: "addEventListener is the standard way to attach event handlers." },
      { text: "What event fires when a button is clicked?", options: ["press", "click", "tap", "select"], correctIndex: 1, explanation: "The 'click' event fires on mouse click or keyboard activation." },
      { text: "How do you prevent a form's default submit behaviour?", options: ["event.stop()", "event.preventDefault()", "event.cancel()", "return null"], correctIndex: 1, explanation: "event.preventDefault() stops the browser's default action." },
    ],
  };

  for (const [lessonId, qs] of Object.entries(questionsData)) {
    await prisma.question.deleteMany({ where: { lessonId } });
    await prisma.question.createMany({
      data: qs.map((q) => ({ lessonId, ...q })),
    });
  }
  console.log("✅ Questions seeded");

  // ── Enrollments & progress for student1 ──────────────────────────────────
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student1.id, courseId: course1.id } },
    update: {},
    create: { userId: student1.id, courseId: course1.id },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student2.id, courseId: course1.id } },
    update: {},
    create: { userId: student2.id, courseId: course1.id },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student3.id, courseId: course2.id } },
    update: {},
    create: { userId: student3.id, courseId: course2.id },
  });

  // Give student1 some completed lessons
  for (const lessonId of ["lesson-html-intro", "lesson-html-forms"]) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: student1.id, lessonId } },
      update: {},
      create: { userId: student1.id, lessonId, completed: true, completedAt: new Date() },
    });
  }

  console.log("✅ Enrollments & progress seeded");

  // ── Welcome notifications ─────────────────────────────────────────────────
  for (const user of [student1, student2, student3]) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: "👋 Welcome to PICKWISE! Start exploring courses and earn your first badge.",
      },
    });
  }
  console.log("✅ Notifications seeded");

  console.log("\n🎉 Seed complete! Credentials:");
  console.log("   Admin  : admin@pickwise.com / Admin1234!");
  console.log("   Student: student1@pickwise.com / Student1234!");
  console.log("   Student: student2@pickwise.com / Student1234!");
  console.log("   Student: student3@pickwise.com / Student1234!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
