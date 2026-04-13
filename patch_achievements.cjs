const fs = require('fs');
let content = fs.readFileSync('pages/AchievementsPage.tsx', 'utf8');
content = content.replace(/id: 'custom-achievement' as unknown as AchievementId,/g, "id: 'custom-achievement' as AchievementId,");
fs.writeFileSync('pages/AchievementsPage.tsx', content);
