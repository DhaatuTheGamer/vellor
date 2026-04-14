import React from 'react';

export const founderStoryParagraphs: React.ReactNode[] = [
  <React.Fragment key="1">For years, my entire "business" ran on flimsy notepads. I would write down class plans, contact numbers, and track who had paid what. But one sudden downpour during a commute, and those pages would be soaked, the ink bleeding into an unreadable mess, taking all my notes and contacts with it. Other days, I'd simply forget the notepad at home.</React.Fragment>,
  <React.Fragment key="2">When I finally upgraded to spreadsheets, the workload somehow got worse. I would still take notes on paper during the day, then come home exhausted, open my laptop, and manually type everything out. It was a massive, soul-sucking drain of hours. It was time I could have spent crafting better study lessons, making custom notes, or just working on my own passion projects.</React.Fragment>,
  <React.Fragment key="3">I built Vellor because I was tired of this irony. I would spend an hour teaching a student the elegance of physics or the beauty of mathematics, only to spend another hour wrestling with administrative overhead that was quietly stealing my joy. And when I looked for software to help? Every "solution" wanted $30 to $50 a month. They wanted my students' data. They wanted a cut of my earnings.</React.Fragment>,
  <React.Fragment key="4">When I finally stopped teaching in the 2024-2025 academic year, after ten long years, I looked back and realized something profound. This deeply underappreciated profession had given me far more than just remuneration. It taught me how to communicate, how to plan, and how to take absolute responsibility. I learned human psychology. I learned how to negotiate, how to talk about money, and how to build reward systems. I made a lot of mistakes, and I learned how to survive and grow from them.</React.Fragment>,
  <React.Fragment key="5">Ten years gave me countless interactions, countless memories, countless treats, countless gifts... and countless punishments (okay, I could actually count those, but it ruins the rhyme!). I started out of financial need, but words aren't enough to express the gratitude I feel today. I tell everyone now: <em className="text-accent font-semibold not-italic">teach at least once in your life</em>. The compounding effect it has on your personal and professional growth is exponential.</React.Fragment>,
  <React.Fragment key="6">Today, equipped with the knowledge of modern tech-stacks and AI, I felt a moral obligation to solve the exact problems I used to face. I wanted to make a contribution to this community with absolutely zero hidden motives. If I am building tools for educators, the tool itself must embody the ethics of education. Knowledge should be free, and the tools to share it should be too.</React.Fragment>,
  <React.Fragment key="7">Vellor is for the independent tutors who are tight on finances but possess massive ambitions. It's for the people who refuse to just be another carbon footprint, who want to do something great, and who are actively shaping a better future. No cloud servers harvesting your data. No subscription traps. Just a tool, built by a tutor, for tutors. Open-source, offline-first, and yours forever.</React.Fragment>,
  <React.Fragment key="8">I may have stepped away from the daily grind, but once a teacher, always a teacher. I still love it. This is just the start, and the story continues...</React.Fragment>
];

export const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Vellor",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android (PWA)",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
      },
      description: "The ultimate operating system for private educators. Zero subscriptions, zero tracking. 100% yours.",
      creator: {
        "@type": "Person",
        name: "Dhaatrik Chowdhury",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "I'm currently using a massive, messy Excel spreadsheet. How hard is it to switch?", acceptedAnswer: { "@type": "Answer", text: "It takes less than two minutes. Vellor includes a built-in CSV import wizard, allowing you to seamlessly migrate your entire student roster and history without manually typing a thing." } },
        { "@type": "Question", name: "Do my students or their parents need to download an app or create accounts?", acceptedAnswer: { "@type": "Answer", text: "Nope! Vellor is your personal command center. To share updates or request payments, you simply generate a beautiful PDF invoice or a secure, read-only web portal link to send them directly." } },
        { "@type": "Question", name: "If everything is stored locally, what happens if I lose my laptop or phone?", acceptedAnswer: { "@type": "Answer", text: "Your peace of mind is built-in. Vellor features a one-click backup system that lets you download a highly secure, encrypted file of your entire database. Just upload that file to a new device, and you're instantly back in business." } },
        { "@type": "Question", name: "Why is this completely free? What's the catch?", acceptedAnswer: { "@type": "Answer", text: "There is no catch. Vellor is an open-source project built by an independent educator, for independent educators. The goal is to provide enterprise-grade tools to solo tutors without the predatory $30/month subscription fees." } },
        { "@type": "Question", name: "Do you take a percentage or transaction fee from my student payments?", acceptedAnswer: { "@type": "Answer", text: "Absolutely not. Vellor is a management and organizational operating system, not a payment processor. You keep 100% of the money you earn through your preferred payment methods (Cash, Zelle, Venmo, UPI, etc.)." } },
        { "@type": "Question", name: "I'm not very tech-savvy. Is there a steep learning curve?", acceptedAnswer: { "@type": "Answer", text: "Not at all. Vellor was designed to feel as intuitive as your favorite smartphone apps. There are no cluttered enterprise menus or complex database setups—just a clean, simple workflow that makes sense for tutoring." } },
        { "@type": "Question", name: "Can I use my own tutoring brand's logo and colors?", acceptedAnswer: { "@type": "Answer", text: "Yes! Vellor gets out of your way. Our white-label customization engine lets you change the application's entire color scheme and branding to match your unique academy aesthetic in seconds." } },
        { "@type": "Question", name: "Will you sell my data or my students' contact info to advertisers?", acceptedAnswer: { "@type": "Answer", text: "Never. Because Vellor is an offline-first application, your data literally never touches our servers. We couldn't look at your student data or financial records even if we wanted to." } },
        { "@type": "Question", name: "Can I manage multiple subjects and different hourly rates?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every tutoring business is different. You can set custom hourly rates, specific learning goals, and distinct subjects for every individual student on your roster." } },
        { "@type": "Question", name: "Does this require a constant internet connection to work?", acceptedAnswer: { "@type": "Answer", text: "No. Whether you are tutoring in a cafe with spotty Wi-Fi or in a student's home with no service, Vellor's offline-first architecture means you can log lessons, generate invoices, and manage your business without skipping a beat." } },
      ],
    },
  ],
};
