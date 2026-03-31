import re

with open("pages/DashboardPage.tsx", "r") as f:
    content = f.read()

# Add label before the input and id to the input
new_content = re.sub(
    r'(<input\s*\n\s*type="number"\s*\n\s*aria-label="Monthly goal")',
    r'<label htmlFor="monthly-goal-input" className="sr-only">Monthly Goal</label>\n                        <input \n                            id="monthly-goal-input"\n                            type="number"\n                            aria-label="Monthly goal"',
    content
)

with open("pages/DashboardPage.tsx", "w") as f:
    f.write(new_content)
