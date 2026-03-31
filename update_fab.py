with open("components/ui/FAB.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'onClick={handleLogLesson}\n                className="flex items-center gap-3',
    'onClick={handleLogLesson}\n                aria-label="Quick Log Lesson"\n                className="flex items-center gap-3'
)

content = content.replace(
    'onClick={handleAddStudent}\n                className="flex items-center gap-3',
    'onClick={handleAddStudent}\n                aria-label="Add New Student"\n                className="flex items-center gap-3'
)

with open("components/ui/FAB.tsx", "w") as f:
    f.write(content)
