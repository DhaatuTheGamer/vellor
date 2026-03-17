import React from 'react';
import { Card, Icon } from '../components/ui';
import { motion } from 'framer-motion';

export const TutorAdvicePage: React.FC = () => {
    return (
        <motion.div 
            className="space-y-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
                        <Icon iconName="book-open" className="w-6 h-6 text-accent" />
                    </div>
                    Friendly Advices to be a Great Tutor
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Elevate your teaching quality, build strong relationships with your students, and maximize your impact.</p>
            </div>

            <div className="space-y-6">
                <Card className="p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl hover:border-accent/30 transition-colors group">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <div className="p-2 bg-accent/10 rounded-xl text-accent group-hover:scale-110 transition-transform">
                            <Icon iconName="award" className="w-6 h-6" />
                        </div>
                        1. Implement a Solid Reward System
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        Gamify the learning experience. Create a visible chart (whether physical or through an app) where students earn "stars" or points for submitting homework, participating in class, or scoring well on minor quizzes. Small rewards such as a "homework pass", a sticker, or simple digital badges go a long way in keeping them motivated!
                    </p>
                </Card>

                <Card className="p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl hover:border-blue-500/30 transition-colors group">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                            <Icon iconName="brain" className="w-6 h-6" />
                        </div>
                        2. Use AI to Plan the Course
                    </h2>
                    <ul className="list-disc leading-relaxed text-gray-600 dark:text-gray-300 ml-6 space-y-2">
                        <li><strong>ChatGPT/Claude:</strong> Generate weekly syllabus outlines tailored strictly to your student's timeline and goals.</li>
                        <li><strong>NotebookLM:</strong> Ingest vast amounts of textbook chapters or custom notes. Use NotebookLM's generated podcasts (Audio Overviews) to let students listen to interactive summaries of chapters while commuting.</li>
                        <li><strong>Perplexity:</strong> Generate instantly fact-checked research assignments for your students.</li>
                    </ul>
                </Card>

                <Card className="p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl hover:border-yellow-500/30 transition-colors group">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                            <Icon iconName="sparkles" className="w-6 h-6" />
                        </div>
                        3. Build Interactive Presentations
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        Move beyond static PDFs. Use tools like <strong>Canva</strong> or <strong>Gamma.app</strong> to instantly generate highly engaging, visually stunning presentations. Break dense subjects into digestible visual slides with embedded quizzes to retain your student's attention.
                    </p>
                </Card>

                <Card className="p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl hover:border-green-500/30 transition-colors group">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/10 rounded-xl text-green-500 group-hover:scale-110 transition-transform">
                            <Icon iconName="information-circle" className="w-6 h-6" />
                        </div>
                        4. Maintain Transparent Communication
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        Don't just talk to the student—talk to the parents. Send a quick 2-line summary every two weeks outlining what was covered and where the student is excelling. This builds immense trust, guarantees client retention, and increases the likelihood of highly profitable referrals.
                    </p>
                </Card>

                <Card className="p-8 rounded-3xl border border-white/20 dark:border-white/5 shadow-xl bg-white/60 dark:bg-primary-light/60 backdrop-blur-xl hover:border-purple-500/30 transition-colors group">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                            <Icon iconName="users" className="w-6 h-6" />
                        </div>
                        5. Encourage Peer Learning
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        If you teach multiple students the same subject, consider organizing a free 30-minute monthly "Mastermind" call where they can quiz each other. Teaching someone else is the highest form of learning.
                    </p>
                </Card>
            </div>
        </motion.div>
    );
};
